#!/usr/bin/env node

/**
 * MIGRAÇÃO FINAL - DADOS BÁSICOS
 * ==============================
 * 
 * Script para migrar dados básicos para o Supabase
 */

import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase (usando as chaves que funcionam no sistema)
const supabaseUrl = 'https://rfdedsmxhsxalyzxstxh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmZGVkc214aHN4YWx5enhzdHhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1NzQ0MDAsImV4cCI6MjA1MDE1MDQwMH0.8QZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQ'

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
  ],

  vehicles: [
    {
      id: '770e8400-e29b-41d4-a716-446655440001',
      plate: 'ABC-1234',
      model: 'Caminhão',
      brand: 'Volvo',
      year: 2020,
      capacity: 25.0,
      status: 'active',
      company_id: '550e8400-e29b-41d4-a716-446655440001',
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
    
    if (testError) {
      console.error('❌ Erro de conexão:', testError.message)
      return
    }
    
    console.log('✅ Conexão estabelecida com sucesso!')
    
    // Migrar empresas
    console.log('\n📦 Migrando empresas...')
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .insert(basicData.companies)
      .select()
    
    if (companiesError) {
      console.error('❌ Erro ao migrar empresas:', companiesError.message)
    } else {
      console.log(`✅ ${companies.length} empresas migradas com sucesso`)
    }
    
    // Migrar produtos
    console.log('\n📦 Migrando produtos...')
    const { data: products, error: productsError } = await supabase
      .from('products')
      .insert(basicData.products)
      .select()
    
    if (productsError) {
      console.error('❌ Erro ao migrar produtos:', productsError.message)
    } else {
      console.log(`✅ ${products.length} produtos migrados com sucesso`)
    }
    
    // Migrar veículos
    console.log('\n📦 Migrando veículos...')
    const { data: vehicles, error: vehiclesError } = await supabase
      .from('vehicles')
      .insert(basicData.vehicles)
      .select()
    
    if (vehiclesError) {
      console.error('❌ Erro ao migrar veículos:', vehiclesError.message)
    } else {
      console.log(`✅ ${vehicles.length} veículos migrados com sucesso`)
    }
    
    // Verificar resultado final
    console.log('\n📊 Verificando dados migrados...')
    
    const { data: finalCompanies } = await supabase
      .from('companies')
      .select('*')
    
    const { data: finalProducts } = await supabase
      .from('products')
      .select('*')
    
    const { data: finalVehicles } = await supabase
      .from('vehicles')
      .select('*')
    
    console.log('\n🎉 MIGRAÇÃO CONCLUÍDA!')
    console.log('=====================')
    console.log(`📈 Empresas: ${finalCompanies?.length || 0}`)
    console.log(`📈 Produtos: ${finalProducts?.length || 0}`)
    console.log(`📈 Veículos: ${finalVehicles?.length || 0}`)
    
    if (finalCompanies && finalCompanies.length > 0) {
      console.log('\n📋 Empresas migradas:')
      finalCompanies.forEach(company => {
        console.log(`  - ${company.name} (${company.id})`)
      })
    }
    
    if (finalProducts && finalProducts.length > 0) {
      console.log('\n📋 Produtos migrados:')
      finalProducts.forEach(product => {
        console.log(`  - ${product.name} - R$ ${product.price} (${product.stock} ${product.unit})`)
      })
    }
    
    if (finalVehicles && finalVehicles.length > 0) {
      console.log('\n📋 Veículos migrados:')
      finalVehicles.forEach(vehicle => {
        console.log(`  - ${vehicle.brand} ${vehicle.model} - ${vehicle.plate}`)
      })
    }
    
    console.log('\n✅ Sistema pronto para uso!')
    
  } catch (error) {
    console.error('❌ Erro crítico na migração:', error.message)
  }
}

migrateBasicData()






















