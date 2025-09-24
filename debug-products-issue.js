/**
 * SCRIPT DE DEBUG - PROBLEMA DE PRODUTOS NÃO APARECENDO
 * =====================================================
 * Este script testa a conexão com Supabase e verifica por que os produtos
 * não estão aparecendo no frontend.
 */

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://rfdedsmxhsxalyzxstxh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmZGVkc214aHN4YWx5enhzdHhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2NzQ4MDAsImV4cCI6MjA1MDI1MDgwMH0.8QZqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugProductsIssue() {
  console.log('🔍 INICIANDO DEBUG DO PROBLEMA DE PRODUTOS...\n');

  try {
    // 1. Verificar se há produtos na tabela
    console.log('1️⃣ Verificando produtos na tabela...');
    const { data: allProducts, error: allProductsError } = await supabase
      .from('products')
      .select('*');
    
    if (allProductsError) {
      console.error('❌ Erro ao buscar produtos:', allProductsError);
      return;
    }
    
    console.log(`✅ Total de produtos na tabela: ${allProducts.length}`);
    console.log('📋 Produtos encontrados:', allProducts);

    // 2. Verificar se há usuários autenticados
    console.log('\n2️⃣ Verificando autenticação...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('❌ Erro ao verificar usuário:', userError);
      return;
    }
    
    if (!user) {
      console.log('⚠️ Nenhum usuário autenticado');
      return;
    }
    
    console.log('✅ Usuário autenticado:', user.id);

    // 3. Verificar perfil do usuário
    console.log('\n3️⃣ Verificando perfil do usuário...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError);
      return;
    }
    
    if (!profile) {
      console.log('⚠️ Perfil não encontrado para o usuário');
      return;
    }
    
    console.log('✅ Perfil encontrado:', profile);

    // 4. Verificar produtos filtrados por company_id
    console.log('\n4️⃣ Verificando produtos filtrados por company_id...');
    const { data: filteredProducts, error: filteredError } = await supabase
      .from('products')
      .select('*')
      .eq('company_id', profile.company_id);
    
    if (filteredError) {
      console.error('❌ Erro ao buscar produtos filtrados:', filteredError);
      return;
    }
    
    console.log(`✅ Produtos filtrados por company_id (${profile.company_id}): ${filteredProducts.length}`);
    console.log('📋 Produtos filtrados:', filteredProducts);

    // 5. Verificar políticas RLS
    console.log('\n5️⃣ Verificando políticas RLS...');
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_table_policies', { table_name: 'products' });
    
    if (policiesError) {
      console.log('⚠️ Não foi possível verificar políticas RLS:', policiesError.message);
    } else {
      console.log('✅ Políticas RLS:', policies);
    }

    // 6. Testar inserção de produto de teste
    console.log('\n6️⃣ Testando inserção de produto de teste...');
    const testProduct = {
      id: 'test-product-' + Date.now(),
      name: 'Produto Teste Debug',
      code: 'TESTE-DEBUG',
      description: 'Produto criado para teste de debug',
      company_id: profile.company_id,
      active: true,
      condition: 'novo'
    };

    const { data: insertedProduct, error: insertError } = await supabase
      .from('products')
      .insert([testProduct])
      .select();

    if (insertError) {
      console.error('❌ Erro ao inserir produto de teste:', insertError);
    } else {
      console.log('✅ Produto de teste inserido:', insertedProduct);
    }

    // 7. Verificar se o produto de teste aparece na consulta filtrada
    console.log('\n7️⃣ Verificando se produto de teste aparece...');
    const { data: testProducts, error: testError } = await supabase
      .from('products')
      .select('*')
      .eq('company_id', profile.company_id);
    
    if (testError) {
      console.error('❌ Erro ao verificar produto de teste:', testError);
    } else {
      console.log(`✅ Produtos após inserção: ${testProducts.length}`);
      const testProductFound = testProducts.find(p => p.code === 'TESTE-DEBUG');
      if (testProductFound) {
        console.log('✅ Produto de teste encontrado na consulta!');
      } else {
        console.log('❌ Produto de teste NÃO encontrado na consulta!');
      }
    }

  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

// Executar o debug
debugProductsIssue();








