// Script para debugar o formato do company_id
// Execute: node debug-company-id.js

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase (substitua pelos seus valores)
const supabaseUrl = 'https://your-project.supabase.co'; // Substitua pela sua URL
const supabaseKey = 'your-anon-key'; // Substitua pela sua chave anon

const supabase = createClient(supabaseUrl, supabaseKey);

function validateUUID(uuidString) {
  if (!uuidString) return null;
  
  // Se já é um UUID válido, retorna
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(uuidString)) {
    return uuidString;
  }
  
  // Se é uma string sem hífens, tenta converter para UUID
  if (typeof uuidString === 'string' && uuidString.length === 24) {
    // Adiciona hífens para formar UUID válido
    const formatted = `${uuidString.slice(0, 8)}-${uuidString.slice(8, 12)}-${uuidString.slice(12, 16)}-${uuidString.slice(16, 20)}-${uuidString.slice(20, 24)}`;
    if (uuidRegex.test(formatted)) {
      return formatted;
    }
  }
  
  return null;
}

async function debugCompanyId() {
  console.log('🔍 Verificando formato do company_id...');
  
  try {
    // Buscar profiles para ver o formato do company_id
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('company_id')
      .limit(5);

    if (error) {
      console.error('❌ Erro ao buscar profiles:', error);
      return;
    }

    console.log('📊 Company IDs encontrados:');
    profiles.forEach((profile, index) => {
      const original = profile.company_id;
      const validated = validateUUID(original);
      
      console.log(`\n${index + 1}. Original: "${original}"`);
      console.log(`   Tipo: ${typeof original}`);
      console.log(`   Tamanho: ${original?.length || 0}`);
      console.log(`   Válido: ${validated ? '✅' : '❌'}`);
      if (validated) {
        console.log(`   Convertido: "${validated}"`);
      }
    });

    // Testar com o ID específico do erro
    const testId = "68cacb913d169d191be6c90d";
    console.log(`\n🧪 Testando ID do erro: "${testId}"`);
    const result = validateUUID(testId);
    console.log(`   Resultado: ${result ? `"${result}"` : 'null'}`);

  } catch (error) {
    console.error('❌ Erro durante debug:', error);
  }
}

debugCompanyId();











