// Script de teste para verificar configuração antes da migração
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { createClient as createBase44Client } from '@base44/sdk';

console.log('🧪 Testando configuração antes da migração...\n');

// Verificar variáveis de ambiente
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const base44AppId = process.env.BASE44_APP_ID;
const base44ApiKey = process.env.BASE44_API_KEY;

console.log('📋 Verificando variáveis de ambiente:');
console.log(`✅ VITE_SUPABASE_URL: ${supabaseUrl ? 'Configurada' : '❌ Não encontrada'}`);
console.log(`✅ SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? 'Configurada' : '❌ Não encontrada'}`);
console.log(`✅ BASE44_APP_ID: ${base44AppId ? 'Configurada' : '❌ Não encontrada'}`);
console.log(`✅ BASE44_API_KEY: ${base44ApiKey ? 'Configurada' : '❌ Não encontrada'}\n`);

if (!supabaseUrl || !supabaseServiceKey || !base44AppId || !base44ApiKey) {
  console.log('❌ ERRO: Algumas variáveis de ambiente não estão configuradas.');
  console.log('   Verifique seu arquivo .env e tente novamente.');
  process.exit(1);
}

// Testar conexão com Supabase
console.log('🔗 Testando conexão com Supabase...');
try {
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // Testar listagem de tabelas
  const { data: tables, error: tablesError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public');

  if (tablesError) {
    console.log('❌ Erro ao conectar com Supabase:', tablesError.message);
  } else {
    console.log(`✅ Conexão com Supabase OK! Encontradas ${tables.length} tabelas.`);
    
    // Verificar se as tabelas principais existem
    const expectedTables = ['companies', 'profiles', 'products', 'vehicles'];
    const existingTables = tables.map(t => t.table_name);
    
    console.log('\n📊 Verificando tabelas principais:');
    expectedTables.forEach(table => {
      const exists = existingTables.includes(table);
      console.log(`${exists ? '✅' : '❌'} ${table}: ${exists ? 'Existe' : 'Não encontrada'}`);
    });
  }
} catch (error) {
  console.log('❌ Erro ao conectar com Supabase:', error.message);
}

// Testar conexão com Base44
console.log('\n🔗 Testando conexão com Base44...');
try {
  const axios = require('axios');
  const base44Client = axios.create({
    headers: {
      'api_key': 'dfc95162310b45a798febaddf09dd9af',
      'Content-Type': 'application/json'
    }
  });

  // Testar listagem de empresas
  const response = await base44Client.get('https://app.base44.com/api/apps/68954c8b2b3cb8a6182efcdb/entities/Company');
  const companies = response.data;
  
  console.log(`✅ Conexão com Base44 OK! Encontradas ${companies.length} empresas.`);
  
  if (companies.length > 0) {
    console.log('📋 Empresas encontradas:');
    companies.forEach(company => {
      console.log(`   - ${company.name} (${company.code})`);
    });
  }
} catch (error) {
  console.log('❌ Erro ao conectar com Base44:', error.message);
}

console.log('\n🎉 Teste de configuração concluído!');
console.log('   Se todos os testes passaram, você pode executar a migração completa.');
