#!/usr/bin/env node

/**
 * MIGRAÇÃO DEBUG - COM LOGS DETALHADOS
 * ====================================
 * 
 * Script para migrar dados com logs extremamente detalhados
 */

import { createClient } from '@supabase/supabase-js'

// Usar as variáveis de ambiente do sistema
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://rfdedsmxhsxalyzxstxh.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmZGVkc214aHN4YWx5enhzdHhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1NzQ0MDAsImV4cCI6MjA1MDE1MDQwMH0.8QZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQ'

console.log('🔧 CONFIGURAÇÃO DO SCRIPT:')
console.log(`URL: ${supabaseUrl}`)
console.log(`Key: ${supabaseKey.substring(0, 20)}...`)
console.log('================================')

const supabase = createClient(supabaseUrl, supabaseKey)

// Dados básicos para migração
const basicData = {
  companies: [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Calcário Amazônia - Matriz',
      description: 'Matriz da empresa Calcário Amazônia',
      address: 'Rua Principal, 123 - Centro',
      phone: '(11) 99999-9999',
      email: 'contato@calcarioamazonia.com',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]
}

async function migrateBasicData() {
  try {
    console.log('🚀 Iniciando migração de dados básicos...')
    
    // Testar conexão
    console.log('🔌 Testando conexão com Supabase...')
    const { data: testData, error: testError } = await supabase
      .from('companies')
      .select('count')
      .limit(1)
    
    console.log('🔍 DEBUG - Resultado do teste de conexão:')
    console.log('Data:', testData)
    console.log('Error:', testError)
    
    if (testError) {
      console.error('❌ Erro de conexão:', testError)
      return
    }
    
    console.log('✅ Conexão estabelecida com sucesso!')
    
    // Migrar empresas
    console.log('\n📦 Migrando empresas...')
    console.log('🔍 DEBUG - Dados a serem inseridos:', basicData.companies)
    
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .insert(basicData.companies)
      .select()
    
    console.log('🔍 DEBUG - Resultado da inserção:')
    console.log('Data:', companies)
    console.log('Error:', companiesError)
    
    if (companiesError) {
      console.error('❌ Erro ao migrar empresas:', companiesError)
    } else {
      console.log(`✅ ${companies.length} empresas migradas com sucesso`)
    }
    
    // Verificar resultado final
    console.log('\n📊 Verificando dados migrados...')
    
    const { data: finalCompanies } = await supabase
      .from('companies')
      .select('*')
    
    console.log('\n🎉 MIGRAÇÃO CONCLUÍDA!')
    console.log('=====================')
    console.log(`📈 Empresas: ${finalCompanies?.length || 0}`)
    
    if (finalCompanies && finalCompanies.length > 0) {
      console.log('\n📋 Empresas migradas:')
      finalCompanies.forEach(company => {
        console.log(`  - ${company.name} (${company.id})`)
      })
    }
    
    console.log('\n✅ Sistema pronto para uso!')
    
  } catch (error) {
    console.error('❌ Erro crítico na migração:', error)
    console.error('Stack:', error.stack)
  }
}

migrateBasicData()















