/**
 * TESTE COM SERVICE ROLE - VERIFICAR DADOS REAIS
 * =============================================
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rfdedsmxhsxalyzxstxh.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmZGVkc214aHN4YWx5enhzdHhoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODA2NDIzMSwiZXhwIjoyMDczNjQwMjMxfQ.h5q1pNdcVerUXPlHGoTL07wkIBDkIzlW9w_h-sDtciM';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testWithServiceRole() {
  console.log('🔍 TESTE COM SERVICE ROLE (BYPASS RLS)...\n');

  try {
    // 1. Verificar produtos (bypass RLS)
    console.log('1️⃣ Verificando produtos (bypass RLS)...');
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

    // 2. Verificar empresas
    console.log('\n2️⃣ Verificando empresas...');
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*');
    
    if (companiesError) {
      console.error('❌ Erro ao buscar empresas:', companiesError);
      return;
    }
    
    console.log(`✅ Encontradas ${companies.length} empresas:`);
    companies.forEach((company, index) => {
      console.log(`   ${index + 1}. ${company.name} (ID: ${company.id})`);
    });

    // 3. Verificar perfis
    console.log('\n3️⃣ Verificando perfis...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
    
    if (profilesError) {
      console.error('❌ Erro ao buscar perfis:', profilesError);
      return;
    }
    
    console.log(`✅ Encontrados ${profiles.length} perfis:`);
    profiles.forEach((profile, index) => {
      console.log(`   ${index + 1}. ${profile.full_name || 'Sem nome'} - Company: ${profile.company_id}`);
    });

    console.log('\n🎯 CONCLUSÃO:');
    if (products.length > 0) {
      console.log('✅ Os produtos existem no banco, mas as políticas RLS estão bloqueando o acesso.');
      console.log('🔧 SOLUÇÃO: Ajustar as políticas RLS ou criar um perfil de usuário.');
    } else {
      console.log('❌ Não há produtos no banco. Precisa criar alguns produtos de teste.');
    }

  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

testWithServiceRole();














