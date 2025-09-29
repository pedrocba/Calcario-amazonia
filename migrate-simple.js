#!/usr/bin/env node

/**
 * MIGRAÇÃO SIMPLES - BASE44 PARA SUPABASE
 * ======================================
 * 
 * Script simplificado para migrar dados básicos
 */

import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase (usando as chaves que funcionam)
const supabaseUrl = 'https://rfdedsmxhsxalyzxstxh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmZGVkc214aHN4YWx5enhzdHhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1NzQ0MDAsImV4cCI6MjA1MDE1MDQwMH0.8QZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQ'

const supabase = createClient(supabaseUrl, supabaseKey)

// Dados de exemplo para migração
const sampleData = {
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
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      name: 'Calcário Amazônia - Filial Norte',
      description: 'Filial Norte da empresa',
      address: 'Av. Norte, 456 - Zona Norte',
      phone: '(11) 88888-8888',
      email: 'norte@calcarioamazonia.com',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],

  products: [
    {
      id: '660e8400-e29b-41d4-a716-446655440001',
      name: 'Calcário Agrícola',
      description: 'Calcário para correção de solo',
      category: 'Agrícola',
      unit: 'TON',
      price: 150.00,
      stock: 1000,
      min_stock: 100,
      company_id: '550e8400-e29b-41d4-a716-446655440001',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '660e8400-e29b-41d4-a716-446655440002',
      name: 'Gesso Agrícola',
      description: 'Gesso para correção de solo',
      category: 'Agrícola',
      unit: 'TON',
      price: 200.00,
      stock: 500,
      min_stock: 50,
      company_id: '550e8400-e29b-41d4-a716-446655440001',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]
}

async function migrateData() {
  try {
    console.log('🚀 Iniciando migração simples...')
    
    // Testar conexão
    const { data: testData, error: testError } = await supabase
      .from('companies')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.error('❌ Erro de conexão:', testError.message)
      return
    }
    
    console.log('✅ Conexão estabelecida')
    
    // Migrar empresas
    console.log('📦 Migrando empresas...')
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .insert(sampleData.companies)
      .select()
    
    if (companiesError) {
      console.error('❌ Erro ao migrar empresas:', companiesError.message)
    } else {
      console.log(`✅ ${companies.length} empresas migradas`)
    }
    
    // Migrar produtos
    console.log('📦 Migrando produtos...')
    const { data: products, error: productsError } = await supabase
      .from('products')
      .insert(sampleData.products)
      .select()
    
    if (productsError) {
      console.error('❌ Erro ao migrar produtos:', productsError.message)
    } else {
      console.log(`✅ ${products.length} produtos migrados`)
    }
    
    // Verificar resultado
    const { data: finalCompanies } = await supabase
      .from('companies')
      .select('*')
    
    const { data: finalProducts } = await supabase
      .from('products')
      .select('*')
    
    console.log('\n📊 Resultado Final:')
    console.log(`Empresas: ${finalCompanies?.length || 0}`)
    console.log(`Produtos: ${finalProducts?.length || 0}`)
    
    console.log('\n🎉 Migração concluída!')
    
  } catch (error) {
    console.error('❌ Erro crítico:', error.message)
  }
}

migrateData()






















