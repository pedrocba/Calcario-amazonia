/**
 * TESTE - VERIFICAR SE A CORREÇÃO DO COMPANY_ID FUNCIONOU
 * =====================================================
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rfdedsmxhsxalyzxstxh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmZGVkc214aHN4YWx5enhzdHhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjQyMzEsImV4cCI6MjA3MzY0MDIzMX0.YETntgLIODtULiblwg5yFsDJ_kJ-HFWMgWBXf6V-T4g';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFixCompanyId() {
  console.log('🔍 TESTE - VERIFICANDO CORREÇÃO DO COMPANY_ID...\n');

  try {
    // Simular a consulta que o frontend fará agora
    const companyId = '68cacb913d169d191be6c90d'; // ID real da CBA - Santarém (Matriz)
    
    console.log(`1️⃣ Testando consulta com ID real: ${companyId}`);
    
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('company_id', companyId);
    
    if (error) {
      console.error('❌ Erro:', error);
      return;
    }
    
    console.log(`✅ SUCESSO! ${products.length} produtos encontrados:`);
    products.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} (${product.code})`);
    });

    console.log('\n🎯 RESULTADO:');
    if (products.length > 0) {
      console.log('✅ CORREÇÃO FUNCIONOU! Os produtos devem aparecer no frontend agora.');
      console.log('🔧 Atualize a página do frontend (F5) para ver os produtos!');
    } else {
      console.log('❌ Ainda há problema. Verifique se o ID da empresa está correto.');
    }

  } catch (error) {
    console.error('💥 Erro:', error);
  }
}

testFixCompanyId();














