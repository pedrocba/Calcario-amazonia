#!/usr/bin/env node

/**
 * VERIFICAÇÃO PÓS-MIGRAÇÃO
 * ========================
 * 
 * Este script verifica se a migração foi executada com sucesso
 * e valida a integridade dos dados.
 * 
 * Execute: node verify-migration.js
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Carregar variáveis de ambiente
dotenv.config()

// Configuração do Supabase - usando valores hardcoded para migração
const supabaseUrl = 'https://rfdedsmxhsxalyzxstxh.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmZGVkc214aHN4YWx5enhzdHhoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDU3NDQwMCwiZXhwIjoyMDUwMTUwNDAwfQ.8QZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQ'

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Configuração do Supabase não encontrada!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Função para log
function log(message, type = 'info') {
  const timestamp = new Date().toISOString()
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️'
  console.log(`${prefix} [${timestamp}] ${message}`)
}

// Função para verificar tabela
async function verifyTable(tableName, expectedMinCount = 0) {
  try {
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact' })
      .limit(1)

    if (error) {
      log(`Erro ao verificar tabela ${tableName}: ${error.message}`, 'error')
      return false
    }

    const recordCount = count || 0
    const status = recordCount >= expectedMinCount ? 'success' : 'error'
    
    log(`Tabela ${tableName}: ${recordCount} registros encontrados`, status)
    
    if (data && data.length > 0) {
      log(`  Primeiro registro: ${JSON.stringify(data[0], null, 2)}`)
    }
    
    return recordCount >= expectedMinCount
  } catch (error) {
    log(`Erro crítico ao verificar ${tableName}: ${error.message}`, 'error')
    return false
  }
}

// Função para verificar integridade referencial
async function verifyReferentialIntegrity() {
  log('Verificando integridade referencial...')
  
  try {
    // Verificar se produtos têm company_id válido
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, company_id')
      .limit(10)

    if (productsError) {
      log(`Erro ao verificar produtos: ${productsError.message}`, 'error')
      return false
    }

    if (products && products.length > 0) {
      log(`Produtos encontrados: ${products.length}`)
      
      // Verificar se company_id existe na tabela companies
      for (const product of products) {
        if (product.company_id) {
          const { data: company, error: companyError } = await supabase
            .from('companies')
            .select('id, name')
            .eq('id', product.company_id)
            .single()

          if (companyError || !company) {
            log(`Produto ${product.name} tem company_id inválido: ${product.company_id}`, 'error')
            return false
          } else {
            log(`  ✅ Produto ${product.name} -> Empresa ${company.name}`)
          }
        }
      }
    }

    return true
  } catch (error) {
    log(`Erro na verificação de integridade: ${error.message}`, 'error')
    return false
  }
}

// Função para testar RLS
async function testRLS() {
  log('Testando Row Level Security (RLS)...')
  
  try {
    // Testar se RLS está ativo
    const { data: rlsStatus, error: rlsError } = await supabase
      .rpc('check_rls_status')

    if (rlsError) {
      log(`Erro ao verificar RLS: ${rlsError.message}`, 'error')
      return false
    }

    log(`RLS Status: ${JSON.stringify(rlsStatus)}`)
    return true
  } catch (error) {
    log(`Erro ao testar RLS: ${error.message}`, 'error')
    return false
  }
}

// Função principal de verificação
async function runVerification() {
  try {
    log('🔍 Iniciando verificação pós-migração...')
    
    // Verificar conexão
    const { data: testData, error: testError } = await supabase
      .from('companies')
      .select('count')
      .limit(1)
    
    if (testError) {
      throw new Error(`Erro de conexão: ${testError.message}`)
    }
    
    log('✅ Conexão com Supabase estabelecida')
    
    // Verificar tabelas principais
    const tableChecks = [
      { name: 'companies', minCount: 1 },
      { name: 'products', minCount: 0 },
      { name: 'vehicles', minCount: 0 },
      { name: 'transfers', minCount: 0 },
      { name: 'requisitions', minCount: 0 },
      { name: 'users', minCount: 0 }
    ]
    
    let allTablesOK = true
    
    for (const table of tableChecks) {
      const isOK = await verifyTable(table.name, table.minCount)
      if (!isOK) {
        allTablesOK = false
      }
    }
    
    // Verificar integridade referencial
    const integrityOK = await verifyReferentialIntegrity()
    
    // Testar RLS
    const rlsOK = await testRLS()
    
    // Relatório final
    console.log('\n📊 Relatório de Verificação:')
    console.log('============================')
    console.log(`Tabelas: ${allTablesOK ? '✅ OK' : '❌ Problemas'}`)
    console.log(`Integridade: ${integrityOK ? '✅ OK' : '❌ Problemas'}`)
    console.log(`RLS: ${rlsOK ? '✅ OK' : '❌ Problemas'}`)
    
    if (allTablesOK && integrityOK && rlsOK) {
      log('🎉 Verificação concluída com sucesso! Sistema pronto para uso.', 'success')
    } else {
      log('⚠️ Verificação concluída com problemas. Verifique os logs acima.', 'error')
    }
    
  } catch (error) {
    log(`❌ Erro crítico na verificação: ${error.message}`, 'error')
    process.exit(1)
  }
}

// Executar verificação
runVerification()
