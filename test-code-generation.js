/**
 * TESTE - GERAÇÃO AUTOMÁTICA DE CÓDIGO DE PRODUTO
 * ==============================================
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rfdedsmxhsxalyzxstxh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmZGVkc214aHN4YWx5enhzdHhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjQyMzEsImV4cCI6MjA3MzY0MDIzMX0.YETntgLIODtULiblwg5yFsDJ_kJ-HFWMgWBXf6V-T4g';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCodeGeneration() {
  console.log('🔧 TESTE - GERAÇÃO AUTOMÁTICA DE CÓDIGO...\n');

  try {
    const companyId = '68cacb913d169d191be6c90d'; // CBA - Santarém (Matriz)
    
    // 1. Verificar produtos existentes
    console.log('1️⃣ Verificando produtos existentes:');
    const { data: products } = await supabase
      .from('products')
      .select('code, created_at')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    
    console.log(`Total de produtos: ${products.length}`);
    products.forEach((product, index) => {
      console.log(`   ${index + 1}. Código: "${product.code}" - Criado: ${product.created_at}`);
    });

    // 2. Simular a lógica de geração de código
    console.log('\n2️⃣ Simulando geração de código:');
    
    let newCode;
    if (products && products.length > 0 && products[0].code) {
      const lastCode = products[0].code;
      console.log('Último código encontrado:', lastCode);
      
      // Extrai a parte numérica do código (ex: "PROD-00010" ou "PROD000010" -> 10)
      const matchWithDash = lastCode.match(/PROD-(\d+)/);
      const matchWithoutDash = lastCode.match(/PROD(\d+)/);
      
      if (matchWithDash) {
        const lastNumber = parseInt(matchWithDash[1], 10);
        const nextNumber = lastNumber + 1;
        newCode = `PROD-${nextNumber.toString().padStart(5, '0')}`;
        console.log(`Formato com traço - Número anterior: ${lastNumber}, Próximo: ${nextNumber}`);
      } else if (matchWithoutDash) {
        const lastNumber = parseInt(matchWithoutDash[1], 10);
        const nextNumber = lastNumber + 1;
        newCode = `PROD-${nextNumber.toString().padStart(5, '0')}`;
        console.log(`Formato sem traço - Número anterior: ${lastNumber}, Próximo: ${nextNumber}`);
      } else {
        // Se o formato não for reconhecido, começa do 1
        newCode = 'PROD-00001';
        console.log('Formato não reconhecido, começando do 1');
      }
    } else {
      // Se não há produtos para a filial, começa do 1
      newCode = 'PROD-00001';
      console.log('Nenhum produto encontrado, começando do 1');
    }

    console.log(`Novo código gerado: ${newCode}`);

    // 3. Verificar se o código já existe
    console.log('\n3️⃣ Verificando se o código já existe:');
    const { data: existingProduct } = await supabase
      .from('products')
      .select('id')
      .eq('company_id', companyId)
      .eq('code', newCode)
      .single();
    
    if (existingProduct) {
      console.log('❌ Código já existe! Precisa ajustar a lógica.');
    } else {
      console.log('✅ Código é único! Pode ser usado.');
    }

    console.log('\n🎯 RESULTADO:');
    console.log('✅ Lógica de geração de código implementada!');
    console.log('🔧 Agora teste no frontend:');
    console.log('   1. Clique em "Novo Produto"');
    console.log('   2. O campo código deve aparecer preenchido e bloqueado');
    console.log('   3. Preencha os outros campos e salve');

  } catch (error) {
    console.error('💥 Erro:', error);
  }
}

testCodeGeneration();
