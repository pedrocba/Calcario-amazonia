// Script para verificar o formato do company_id no banco
// Execute: node check-company-id.js

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase (substitua pelos seus valores)
const supabaseUrl = 'https://your-project.supabase.co'; // Substitua pela sua URL
const supabaseKey = 'your-anon-key'; // Substitua pela sua chave anon

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCompanyId() {
  console.log('🔍 Verificando formato do company_id no banco...');
  
  try {
    // Buscar profiles para ver o formato do company_id
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('company_id, user_id')
      .limit(5);

    if (error) {
      console.error('❌ Erro ao buscar profiles:', error);
      return;
    }

    console.log('📊 Profiles encontrados:');
    profiles.forEach((profile, index) => {
      console.log(`\n${index + 1}. User ID: ${profile.user_id}`);
      console.log(`   Company ID: "${profile.company_id}"`);
      console.log(`   Tipo: ${typeof profile.company_id}`);
      console.log(`   Tamanho: ${profile.company_id?.length || 0}`);
    });

    // Verificar se existe na tabela companies
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name')
      .limit(5);

    if (companiesError) {
      console.error('❌ Erro ao buscar companies:', companiesError);
    } else {
      console.log('\n🏢 Companies encontradas:');
      companies.forEach((company, index) => {
        console.log(`\n${index + 1}. ID: "${company.id}"`);
        console.log(`   Nome: ${company.name}`);
        console.log(`   Tipo: ${typeof company.id}`);
        console.log(`   Tamanho: ${company.id?.length || 0}`);
      });
    }

  } catch (error) {
    console.error('❌ Erro durante verificação:', error);
  }
}

checkCompanyId();




