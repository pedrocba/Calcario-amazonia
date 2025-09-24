/**
 * DEBUG - VERIFICAR MISMATCH DE COMPANY_ID
 * =======================================
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rfdedsmxhsxalyzxstxh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmZGVkc214aHN4YWx5enhzdHhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjQyMzEsImV4cCI6MjA3MzY0MDIzMX0.YETntgLIODtULiblwg5yFsDJ_kJ-HFWMgWBXf6V-T4g';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugCompanyMismatch() {
  console.log('🔍 DEBUG - VERIFICANDO MISMATCH DE COMPANY_ID...\n');

  try {
    // 1. Verificar empresas reais no banco
    console.log('1️⃣ Empresas reais no banco:');
    const { data: companies } = await supabase
      .from('companies')
      .select('*')
      .eq('active', true);
    
    companies.forEach((company, index) => {
      console.log(`   ${index + 1}. ${company.name} - ID: ${company.id}`);
    });

    // 2. Verificar produtos e seus company_id
    console.log('\n2️⃣ Produtos e seus company_id:');
    const { data: products } = await supabase
      .from('products')
      .select('*');
    
    products.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} - Company ID: ${product.company_id}`);
    });

    // 3. Testar filtro com ID real da empresa
    if (companies.length > 0) {
      const realCompany = companies[0];
      console.log(`\n3️⃣ Testando filtro com ID real: ${realCompany.id}`);
      
      const { data: filteredProducts } = await supabase
        .from('products')
        .select('*')
        .eq('company_id', realCompany.id);
      
      console.log(`   Produtos encontrados: ${filteredProducts.length}`);
      filteredProducts.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name}`);
      });
    }

    // 4. Testar filtro com ID de teste (que o frontend está usando)
    console.log('\n4️⃣ Testando filtro com ID de teste: 00000000-0000-0000-0000-000000000001');
    const { data: testFilteredProducts } = await supabase
      .from('products')
      .select('*')
      .eq('company_id', '00000000-0000-0000-0000-000000000001');
    
    console.log(`   Produtos encontrados: ${testFilteredProducts.length}`);

    console.log('\n🎯 DIAGNÓSTICO:');
    console.log('❌ O frontend está usando ID de empresa de teste, mas os produtos têm IDs reais.');
    console.log('🔧 SOLUÇÃO: O CompanySelector precisa carregar as empresas reais do Supabase.');

  } catch (error) {
    console.error('💥 Erro:', error);
  }
}

debugCompanyMismatch();







