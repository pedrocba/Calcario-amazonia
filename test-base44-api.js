// Script de teste específico para API do Base44
import 'dotenv/config';
import axios from 'axios';

const BASE44_API_KEY = 'dfc95162310b45a798febaddf09dd9af';

// Configuração do cliente axios para Base44
const base44Client = axios.create({
  headers: {
    'api_key': BASE44_API_KEY,
    'Content-Type': 'application/json'
  }
});

// Lista de endpoints para testar
const TEST_ENDPOINTS = [
  'https://app.base44.com/api/apps/68954c8b2b3cb8a6182efcdb/entities/Company',
  'https://app.base44.com/api/apps/68954c8b2b3cb8a6182efcdb/entities/Product',
  'https://app.base44.com/api/apps/68954c8b2b3cb8a6182efcdb/entities/UserPermission',
  'https://app.base44.com/api/apps/68954c8b2b3cb8a6182efcdb/entities/Vehicle'
];

async function testBase44API() {
  console.log('🧪 Testando conexão com API do Base44...\n');

  for (const endpoint of TEST_ENDPOINTS) {
    try {
      console.log(`📡 Testando: ${endpoint}`);
      const response = await base44Client.get(endpoint);
      
      if (response.data && Array.isArray(response.data)) {
        console.log(`✅ Sucesso! Encontrados ${response.data.length} registros`);
        
        // Mostrar alguns dados de exemplo
        if (response.data.length > 0) {
          const sample = response.data[0];
          console.log(`   📋 Exemplo: ${JSON.stringify(sample, null, 2).substring(0, 200)}...`);
        }
      } else {
        console.log(`⚠️  Resposta inesperada: ${typeof response.data}`);
      }
    } catch (error) {
      console.log(`❌ Erro: ${error.message}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Dados: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    }
    console.log(''); // Linha em branco
  }

  console.log('🎉 Teste da API do Base44 concluído!');
}

// Executar teste
testBase44API().catch(console.error);
