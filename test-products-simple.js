/**
 * TESTE SIMPLES - VERIFICAR PRODUTOS NO SUPABASE
 * =============================================
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rfdedsmxhsxalyzxstxh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmZGVkc214aHN4YWx5enhzdHhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjQyMzEsImV4cCI6MjA3MzY0MDIzMX0.YETntgLIODtULiblwg5yFsDJ_kJ-HFWMgWBXf6V-T4g';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testProducts() {
  console.log('🔍 Testando produtos no Supabase...\n');

  try {
    // Buscar todos os produtos
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

  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

testProducts();
