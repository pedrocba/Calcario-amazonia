/**
 * TESTE FINAL - VERIFICAR CORREÇÃO COMPLETA
 * ========================================
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rfdedsmxhsxalyzxstxh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmZGVkc214aHN4YWx5enhzdHhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjQyMzEsImV4cCI6MjA3MzY0MDIzMX0.YETntgLIODtULiblwg5yFsDJ_kJ-HFWMgWBXf6V-T4g';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFinalFix() {
  console.log('🔍 TESTE FINAL - VERIFICANDO CORREÇÃO COMPLETA...\n');

  try {
    // 1. Verificar empresas reais
    console.log('1️⃣ Empresas reais no Supabase:');
    const { data: companies } = await supabase
      .from('companies')
      .select('*')
      .eq('active', true);
    
    companies.forEach((company, index) => {
      console.log(`   ${index + 1}. ${company.name} - ID: ${company.id}`);
    });

    // 2. Verificar produtos
    console.log('\n2️⃣ Produtos no Supabase:');
    const { data: products } = await supabase
      .from('products')
      .select('*');
    
    products.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} - Company ID: ${product.company_id}`);
    });

    // 3. Testar consulta com ID real da CBA
    const cbaId = '68cacb913d169d191be6c90d';
    console.log(`\n3️⃣ Testando consulta com ID da CBA: ${cbaId}`);
    
    const { data: cbaProducts } = await supabase
      .from('products')
      .select('*')
      .eq('company_id', cbaId);
    
    console.log(`   Produtos da CBA: ${cbaProducts.length}`);
    cbaProducts.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} (${product.code})`);
    });

    console.log('\n🎯 INSTRUÇÕES FINAIS:');
    console.log('1. Abra o console do navegador (F12)');
    console.log('2. Cole e execute este código:');
    console.log('   localStorage.removeItem("selectedCompany");');
    console.log('3. Atualize a página (F5)');
    console.log('4. Selecione "CBA - Santarém (Matriz)"');
    console.log('5. Vá para Produtos - deve aparecer 2 produtos!');

  } catch (error) {
    console.error('💥 Erro:', error);
  }
}

testFinalFix();







