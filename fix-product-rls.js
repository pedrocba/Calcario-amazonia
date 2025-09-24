/**
 * SCRIPT PARA CORRIGIR POLÍTICAS RLS DE PRODUTOS
 * ==============================================
 * Este script corrige as políticas RLS que estão bloqueando a visualização de produtos
 */

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://rfdedsmxhsxalyzxstxh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmZGVkc214aHN4YWx5enhzdHhoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY3NDgwMCwiZXhwIjoyMDUwMjUwODAwfQ.8QZqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixProductRLS() {
  console.log('🔧 CORRIGINDO POLÍTICAS RLS DE PRODUTOS...\n');

  try {
    // 1. Remover políticas existentes
    console.log('1️⃣ Removendo políticas existentes...');
    
    const policiesToRemove = [
      'Users can view products from their own company',
      'Users can create products in their own company', 
      'Users can update products from their own company',
      'Users can delete products from their own company',
      'Authenticated users can view products',
      'Admins and warehouse can manage products'
    ];

    for (const policyName of policiesToRemove) {
      try {
        await supabase.rpc('sql', {
          query: `DROP POLICY IF EXISTS "${policyName}" ON products;`
        });
        console.log(`✅ Política removida: ${policyName}`);
      } catch (error) {
        console.log(`⚠️ Política não encontrada: ${policyName}`);
      }
    }

    // 2. Criar políticas permissivas temporárias
    console.log('\n2️⃣ Criando políticas permissivas...');
    
    const newPolicies = [
      {
        name: 'Allow all authenticated users to view products',
        query: `CREATE POLICY "Allow all authenticated users to view products" ON products
                FOR SELECT USING (auth.role() = 'authenticated');`
      },
      {
        name: 'Allow all authenticated users to manage products',
        query: `CREATE POLICY "Allow all authenticated users to manage products" ON products
                FOR ALL USING (auth.role() = 'authenticated');`
      }
    ];

    for (const policy of newPolicies) {
      try {
        await supabase.rpc('sql', { query: policy.query });
        console.log(`✅ Política criada: ${policy.name}`);
      } catch (error) {
        console.error(`❌ Erro ao criar política ${policy.name}:`, error.message);
      }
    }

    // 3. Verificar se há produtos na tabela
    console.log('\n3️⃣ Verificando produtos na tabela...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*');
    
    if (productsError) {
      console.error('❌ Erro ao buscar produtos:', productsError);
    } else {
      console.log(`✅ Total de produtos encontrados: ${products.length}`);
      products.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} (${product.code}) - Company: ${product.company_id || 'null'}`);
      });
    }

    // 4. Testar inserção de produto
    console.log('\n4️⃣ Testando inserção de produto...');
    const testProduct = {
      name: 'Produto Teste RLS Fix',
      code: 'TESTE-RLS-' + Date.now(),
      description: 'Produto criado para testar correção RLS',
      company_id: '68cacb913d169d191be6c90d', // CBA - Santarém
      active: true,
      condition: 'novo',
      cost_price: 100,
      sale_price: 200
    };

    const { data: insertedProduct, error: insertError } = await supabase
      .from('products')
      .insert([testProduct])
      .select();

    if (insertError) {
      console.error('❌ Erro ao inserir produto de teste:', insertError);
    } else {
      console.log('✅ Produto de teste inserido com sucesso:', insertedProduct[0]);
    }

    console.log('\n🎉 CORREÇÃO CONCLUÍDA!');
    console.log('Agora teste no frontend: http://localhost:5173/Products');

  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

// Executar a correção
fixProductRLS();





