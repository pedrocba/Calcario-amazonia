/**
 * TESTE FINAL - VERIFICAR SE O PROBLEMA FOI RESOLVIDO
 * =================================================
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rfdedsmxhsxalyzxstxh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmZGVkc214aHN4YWx5enhzdHhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjQyMzEsImV4cCI6MjA3MzY0MDIzMX0.YETntgLIODtULiblwg5yFsDJ_kJ-HFWMgWBXf6V-T4g';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFinalSolution() {
  console.log('🔍 TESTE FINAL - VERIFICANDO SOLUÇÃO...\n');

  try {
    // 1. Verificar empresas
    console.log('1️⃣ Verificando empresas...');
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .eq('active', true);
    
    if (companiesError) {
      console.error('❌ Erro ao buscar empresas:', companiesError);
      return;
    }
    
    console.log(`✅ Encontradas ${companies.length} empresas:`);
    companies.forEach((company, index) => {
      console.log(`   ${index + 1}. ${company.name} (ID: ${company.id})`);
    });

    // 2. Verificar produtos
    console.log('\n2️⃣ Verificando produtos...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*');
    
    if (productsError) {
      console.error('❌ Erro ao buscar produtos:', productsError);
      return;
    }
    
    console.log(`✅ Encontrados ${products.length} produtos:`);
    products.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} (${product.code}) - Company: ${product.company_id}`);
    });

    // 3. Testar filtro por empresa específica
    if (companies.length > 0) {
      const firstCompany = companies[0];
      console.log(`\n3️⃣ Testando filtro por empresa: ${firstCompany.name} (${firstCompany.id})`);
      
      const { data: filteredProducts, error: filteredError } = await supabase
        .from('products')
        .select('*')
        .eq('company_id', firstCompany.id);
      
      if (filteredError) {
        console.error('❌ Erro ao filtrar produtos:', filteredError);
      } else {
        console.log(`✅ Produtos filtrados por empresa: ${filteredProducts.length}`);
        filteredProducts.forEach((product, index) => {
          console.log(`   ${index + 1}. ${product.name} (${product.code})`);
        });
      }
    }

    // 4. Verificar perfis
    console.log('\n4️⃣ Verificando perfis...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
    
    if (profilesError) {
      console.error('❌ Erro ao buscar perfis:', profilesError);
    } else {
      console.log(`✅ Encontrados ${profiles.length} perfis:`);
      profiles.forEach((profile, index) => {
        console.log(`   ${index + 1}. ${profile.full_name || 'Sem nome'} - Company: ${profile.company_id}`);
      });
    }

    console.log('\n🎯 DIAGNÓSTICO:');
    console.log(`- Empresas: ${companies.length}`);
    console.log(`- Produtos: ${products.length}`);
    console.log(`- Perfis: ${profiles.length}`);
    
    if (companies.length > 0 && products.length > 0) {
      console.log('\n✅ SISTEMA FUNCIONANDO! As empresas e produtos estão no banco.');
      console.log('🔧 PRÓXIMO PASSO: Testar no frontend para ver se os produtos aparecem.');
    } else {
      console.log('\n❌ PROBLEMA: Faltam dados no banco.');
    }

  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

testFinalSolution();














