/**
 * TESTE DE AUTENTICAÇÃO COM ANON KEY
 * ==================================
 * Este script testa se a chave anon está funcionando para autenticação
 */

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase com anon key
const supabaseUrl = 'https://rfdedsmxhsxalyzxstxh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmZGVkc214aHN4YWx5enhzdHhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2NzQ4MDAsImV4cCI6MjA1MDI1MDgwMH0.8QZqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  console.log('🔐 TESTANDO AUTENTICAÇÃO COM ANON KEY...\n');

  try {
    // 1. Testar login com credenciais de teste
    console.log('1️⃣ Testando login...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'superadmin@calcarioamazonia.com',
      password: 'admin123'
    });

    if (authError) {
      console.error('❌ Erro de autenticação:', authError);
      
      // 2. Verificar se o usuário existe
      console.log('\n2️⃣ Verificando usuários no banco...');
      const { data: users, error: usersError } = await supabase
        .from('auth.users')
        .select('*');
      
      if (usersError) {
        console.log('⚠️ Não foi possível verificar usuários:', usersError.message);
      } else {
        console.log(`✅ Usuários encontrados: ${users.length}`);
      }

      // 3. Tentar criar usuário de teste
      console.log('\n3️⃣ Tentando criar usuário de teste...');
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: 'teste@calcarioamazonia.com',
        password: 'teste123'
      });

      if (signUpError) {
        console.error('❌ Erro ao criar usuário:', signUpError);
      } else {
        console.log('✅ Usuário criado com sucesso:', signUpData);
      }

    } else {
      console.log('✅ Login realizado com sucesso:', authData);
    }

    // 4. Testar consulta de produtos (sem autenticação)
    console.log('\n4️⃣ Testando consulta de produtos...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*');

    if (productsError) {
      console.error('❌ Erro ao buscar produtos:', productsError);
    } else {
      console.log(`✅ Produtos encontrados: ${products.length}`);
    }

  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

// Executar o teste
testAuth();





