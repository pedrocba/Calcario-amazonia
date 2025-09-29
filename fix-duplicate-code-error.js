/**
 * CORREÇÃO - ERRO DE CÓDIGO DUPLICADO
 * ==================================
 * Este script verifica e corrige o problema de códigos duplicados.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rfdedsmxhsxalyzxstxh.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmZGVkc214aHN4YWx5enhzdHhoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODA2NDIzMSwiZXhwIjoyMDczNjQwMjMxfQ.h5q1pNdcVerUXPlHGoTL07wkIBDkIzlW9w_h-sDtciM';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixDuplicateCodeError() {
  console.log('🔧 CORREÇÃO - ERRO DE CÓDIGO DUPLICADO...\n');

  try {
    // 1. Verificar produtos existentes
    console.log('1️⃣ Verificando produtos existentes:');
    const { data: products } = await supabase
      .from('products')
      .select('*')
      .eq('company_id', '68cacb913d169d191be6c90d');
    
    products.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} - Código: "${product.code}"`);
    });

    // 2. Verificar constraint atual
    console.log('\n2️⃣ Verificando constraint atual...');
    const { data: constraints } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT 
            conname as constraint_name,
            contype as constraint_type,
            pg_get_constraintdef(oid) as definition
          FROM pg_constraint 
          WHERE conrelid = 'products'::regclass 
          AND conname LIKE '%code%';
        `
      });
    
    if (constraints && constraints.length > 0) {
      console.log('Constraints encontradas:');
      constraints.forEach(constraint => {
        console.log(`   - ${constraint.constraint_name}: ${constraint.definition}`);
      });
    }

    // 3. Sugerir códigos únicos
    console.log('\n3️⃣ Sugestões de códigos únicos:');
    const existingCodes = products.map(p => p.code).filter(code => code && code !== 'EMPTY');
    console.log('Códigos existentes:', existingCodes);
    
    const suggestions = [];
    for (let i = 1; i <= 10; i++) {
      const code = `PROD${i.toString().padStart(3, '0')}`;
      if (!existingCodes.includes(code)) {
        suggestions.push(code);
      }
    }
    
    console.log('Códigos sugeridos:', suggestions.slice(0, 5));

    console.log('\n🎯 SOLUÇÕES:');
    console.log('1. Use um código diferente (ex: PROD001, PROD002, etc.)');
    console.log('2. Deixe o campo código vazio');
    console.log('3. Use códigos com prefixo diferente (ex: TESTE001)');

  } catch (error) {
    console.error('💥 Erro:', error);
  }
}

fixDuplicateCodeError();














