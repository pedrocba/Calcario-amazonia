/**
 * TESTE COM SERVICE ROLE - VERIFICAR PRODUTOS NO SUPABASE
 * =====================================================
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rfdedsmxhsxalyzxstxh.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmZGVkc214aHN4YWx5enhzdHhoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODA2NDIzMSwiZXhwIjoyMDczNjQwMjMxfQ.h5q1pNdcVerUXPlHGoTL07wkIBDkIzlW9w_h-sDtciM';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testProductsAdmin() {
  console.log('🔍 Testando produtos com SERVICE ROLE...\n');

  try {
    // Buscar todos os produtos (bypass RLS)
    const { data: products, error } = await supabase
      .from('products')
      .select('*');
    
    if (error) {
      console.error('❌ Erro:', error);
      return;
    }
    
    console.log(`✅ Encontrados ${products.length} produtos:`);
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} (${product.code}) - Company: ${product.company_id}`);
    });

    // Verificar se há empresas
    console.log('\n🏢 Verificando empresas...');
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*');
    
    if (companiesError) {
      console.error('❌ Erro ao buscar empresas:', companiesError);
    } else {
      console.log(`✅ Encontradas ${companies.length} empresas:`);
      companies.forEach((company, index) => {
        console.log(`${index + 1}. ${company.name} (${company.id})`);
      });
    }

    // Verificar se há perfis
    console.log('\n👤 Verificando perfis...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
    
    if (profilesError) {
      console.error('❌ Erro ao buscar perfis:', profilesError);
    } else {
      console.log(`✅ Encontrados ${profiles.length} perfis:`);
      profiles.forEach((profile, index) => {
        console.log(`${index + 1}. ${profile.full_name} - Company: ${profile.company_id}`);
      });
    }

  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

testProductsAdmin();







