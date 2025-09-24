/**
 * TESTE DEFINITIVO - VERIFICAR CORREÇÃO FINAL
 * ==========================================
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rfdedsmxhsxalyzxstxh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmZGVkc214aHN4YWx5enhzdHhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjQyMzEsImV4cCI6MjA3MzY0MDIzMX0.YETntgLIODtULiblwg5yFsDJ_kJ-HFWMgWBXf6V-T4g';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDefinitiveFix() {
  console.log('🔧 TESTE DEFINITIVO - VERIFICANDO CORREÇÃO FINAL...\n');

  try {
    // ID real da CBA que o frontend vai usar agora
    const cbaId = '68cacb913d169d191be6c90d';
    
    console.log(`1️⃣ Testando consulta com ID da CBA: ${cbaId}`);
    
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('company_id', cbaId);
    
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
      console.log('✅ CORREÇÃO DEFINITIVA FUNCIONOU!');
      console.log('🔧 Agora atualize a página (F5) - os produtos DEVEM aparecer!');
      console.log('📋 Você deve ver 2 produtos na lista.');
    } else {
      console.log('❌ Ainda há problema. Verificando dados...');
      
      // Verificar todos os produtos
      const { data: allProducts } = await supabase.from('products').select('*');
      console.log(`Total de produtos no banco: ${allProducts.length}`);
      allProducts.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} - Company: ${product.company_id}`);
      });
    }

  } catch (error) {
    console.error('💥 Erro:', error);
  }
}

testDefinitiveFix();







