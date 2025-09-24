/**
 * TESTE DE CONEXÃO FRONTEND
 * =========================
 * Este script testa se o frontend está funcionando corretamente
 */

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://rfdedsmxhsxalyzxstxh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmZGVkc214aHN4YWx5enhzdHhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2NzQ4MDAsImV4cCI6MjA1MDI1MDgwMH0.8QZqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFrontendConnection() {
  console.log('🧪 TESTANDO CONEXÃO FRONTEND...\n');

  try {
    // 1. Testar conexão básica
    console.log('1️⃣ Testando conexão básica...');
    const { data: testData, error: testError } = await supabase
      .from('products')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Erro de conexão:', testError);
      return;
    }
    
    console.log('✅ Conexão com Supabase funcionando');

    // 2. Verificar produtos
    console.log('\n2️⃣ Verificando produtos...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*');
    
    if (productsError) {
      console.error('❌ Erro ao buscar produtos:', productsError);
    } else {
      console.log(`✅ Produtos encontrados: ${products.length}`);
      products.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} (${product.code})`);
      });
    }

    // 3. Verificar empresas
    console.log('\n3️⃣ Verificando empresas...');
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*');
    
    if (companiesError) {
      console.error('❌ Erro ao buscar empresas:', companiesError);
    } else {
      console.log(`✅ Empresas encontradas: ${companies.length}`);
      companies.forEach((company, index) => {
        console.log(`   ${index + 1}. ${company.name} (${company.id})`);
      });
    }

    // 4. Verificar perfis
    console.log('\n4️⃣ Verificando perfis...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
    
    if (profilesError) {
      console.error('❌ Erro ao buscar perfis:', profilesError);
    } else {
      console.log(`✅ Perfis encontrados: ${profiles.length}`);
      profiles.forEach((profile, index) => {
        console.log(`   ${index + 1}. ${profile.full_name} - Company: ${profile.company_id}`);
      });
    }

    console.log('\n🎉 TESTE CONCLUÍDO!');
    console.log('Se todos os testes passaram, o problema pode ser no frontend React.');
    console.log('Verifique o console do navegador para erros JavaScript.');

  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

// Executar o teste
testFrontendConnection();