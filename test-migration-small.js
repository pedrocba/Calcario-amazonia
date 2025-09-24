// Script de teste de migração com apenas algumas entidades
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const base44ApiKey = 'dfc95162310b45a798febaddf09dd9af';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

// Cliente Supabase
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Cliente Base44
const base44Client = axios.create({
  headers: {
    'api_key': base44ApiKey,
    'Content-Type': 'application/json'
  }
});

// Entidades para testar (apenas algumas)
const TEST_ENTITIES = [
  { name: 'Company', table: 'companies' },
  { name: 'Product', table: 'products' },
  { name: 'UserPermission', table: 'user_permissions' }
];

const BASE44_ENDPOINTS = {
  'Company': 'https://app.base44.com/api/apps/68954c8b2b3cb8a6182efcdb/entities/Company',
  'Product': 'https://app.base44.com/api/apps/68954c8b2b3cb8a6182efcdb/entities/Product',
  'UserPermission': 'https://app.base44.com/api/apps/68954c8b2b3cb8a6182efcdb/entities/UserPermission'
};

async function testMigration() {
  console.log('🧪 Testando migração com entidades limitadas...\n');

  for (const entity of TEST_ENTITIES) {
    try {
      console.log(`\n🔄 Testando ${entity.name}...`);
      
      // Buscar dados do Base44
      const endpoint = BASE44_ENDPOINTS[entity.name];
      console.log(`📡 Fazendo requisição para: ${endpoint}`);
      
      const response = await base44Client.get(endpoint);
      
      if (!response.data || !Array.isArray(response.data)) {
        console.log(`⚠️  Nenhum dado encontrado para ${entity.name}`);
        continue;
      }

      const data = response.data;
      console.log(`📊 Encontrados ${data.length} registros de ${entity.name}`);

      // Mostrar alguns dados de exemplo
      if (data.length > 0) {
        console.log(`📋 Exemplo de dados:`);
        console.log(JSON.stringify(data[0], null, 2));
      }

      // Tentar inserir no Supabase (apenas 1 registro para teste)
      if (data.length > 0) {
        console.log(`💾 Tentando inserir 1 registro no Supabase...`);
        
        const testRecord = data[0];
        const { error } = await supabase
          .from(entity.table)
          .insert([testRecord]);

        if (error) {
          console.log(`❌ Erro ao inserir no Supabase:`, error.message);
        } else {
          console.log(`✅ Registro inserido com sucesso no Supabase!`);
        }
      }

    } catch (error) {
      console.log(`❌ Erro ao testar ${entity.name}:`, error.message);
    }
  }

  console.log('\n🎉 Teste de migração concluído!');
}

// Executar teste
testMigration().catch(console.error);
