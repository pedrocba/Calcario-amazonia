// Script para analisar diferenças de schema entre Base44 e Supabase
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

// Lista de entidades para analisar
const ENTITIES = [
  { name: 'Company', table: 'companies' },
  { name: 'Product', table: 'products' },
  { name: 'UserPermission', table: 'user_permissions' }
];

// Endpoints do Base44
const BASE44_ENDPOINTS = {
  'Company': 'https://app.base44.com/api/apps/68954c8b2b3cb8a6182efcdb/entities/Company',
  'Product': 'https://app.base44.com/api/apps/68954c8b2b3cb8a6182efcdb/entities/Product',
  'UserPermission': 'https://app.base44.com/api/apps/68954c8b2b3cb8a6182efcdb/entities/UserPermission'
};

// Função para detectar tipo de dado baseado no valor
function detectDataType(value) {
  if (value === null || value === undefined) {
    return 'TEXT'; // Valor nulo, usar TEXT como padrão
  }
  
  if (typeof value === 'boolean') {
    return 'BOOLEAN';
  }
  
  if (typeof value === 'number') {
    return 'NUMERIC';
  }
  
  if (typeof value === 'string') {
    // Verificar se é uma data/timestamp
    const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
    if (dateRegex.test(value)) {
      return 'TIMESTAMPTZ';
    }
    
    // Verificar se é um UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(value)) {
      return 'UUID';
    }
    
    // Verificar se é um email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(value)) {
      return 'TEXT';
    }
    
    // Verificar se é um JSON (começa com { ou [)
    if ((value.startsWith('{') && value.endsWith('}')) || 
        (value.startsWith('[') && value.endsWith(']'))) {
      return 'JSONB';
    }
    
    return 'TEXT';
  }
  
  if (typeof value === 'object') {
    return 'JSONB';
  }
  
  return 'TEXT'; // Padrão
}

// Função para obter colunas existentes no Supabase
async function getExistingColumns(tableName) {
  try {
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', tableName)
      .eq('table_schema', 'public');
    
    if (error) {
      console.error(`❌ Erro ao consultar colunas da tabela ${tableName}:`, error);
      return [];
    }
    
    return data.map(row => row.column_name);
  } catch (error) {
    console.error(`❌ Erro ao consultar colunas da tabela ${tableName}:`, error);
    return [];
  }
}

// Função para obter amostra de dados do Base44
async function getSampleData(entityName) {
  try {
    const endpoint = BASE44_ENDPOINTS[entityName];
    if (!endpoint) {
      console.log(`⚠️  Endpoint não encontrado para ${entityName}`);
      return null;
    }
    
    const response = await base44Client.get(endpoint);
    
    if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
      console.log(`⚠️  Nenhum dado encontrado para ${entityName}`);
      return null;
    }
    
    return response.data[0]; // Retorna apenas o primeiro registro
  } catch (error) {
    console.error(`❌ Erro ao buscar dados de ${entityName}:`, error.message);
    return null;
  }
}

// Função principal
async function analyzeSchemaDiff() {
  console.log('🔍 Analisando diferenças de schema entre Base44 e Supabase...\n');
  
  const allAlterCommands = [];
  
  for (const entity of ENTITIES) {
    console.log(`\n📊 Analisando ${entity.name} (tabela: ${entity.table})...`);
    
    // 1. Obter amostra de dados do Base44
    const sampleData = await getSampleData(entity.name);
    if (!sampleData) {
      console.log(`⚠️  Pulando ${entity.name} - sem dados`);
      continue;
    }
    
    console.log(`✅ Amostra obtida: ${Object.keys(sampleData).length} campos`);
    
    // 2. Obter colunas existentes no Supabase
    const existingColumns = await getExistingColumns(entity.table);
    console.log(`✅ Colunas existentes no Supabase: ${existingColumns.length}`);
    
    // 3. Comparar e gerar comandos ALTER TABLE
    const base44Fields = Object.keys(sampleData);
    const missingColumns = base44Fields.filter(field => !existingColumns.includes(field));
    
    if (missingColumns.length === 0) {
      console.log(`✅ ${entity.name} - Schema está sincronizado!`);
      continue;
    }
    
    console.log(`🔧 Campos faltantes: ${missingColumns.length}`);
    
    // Gerar comandos ALTER TABLE para campos faltantes
    for (const field of missingColumns) {
      const value = sampleData[field];
      const dataType = detectDataType(value);
      
      const alterCommand = `ALTER TABLE ${entity.table} ADD COLUMN ${field} ${dataType};`;
      allAlterCommands.push(alterCommand);
      
      console.log(`   📝 ${field} -> ${dataType} (valor: ${JSON.stringify(value).substring(0, 50)}...)`);
    }
  }
  
  // 4. Imprimir todos os comandos SQL
  console.log('\n' + '='.repeat(80));
  console.log('📋 COMANDOS SQL PARA CORRIGIR O SCHEMA');
  console.log('='.repeat(80));
  console.log('-- Execute estes comandos no SQL Editor do Supabase:');
  console.log('');
  
  if (allAlterCommands.length === 0) {
    console.log('-- ✅ Nenhum comando necessário - Schema já está sincronizado!');
  } else {
    allAlterCommands.forEach(command => {
      console.log(command);
    });
  }
  
  console.log('');
  console.log('='.repeat(80));
  console.log(`🎉 Análise concluída! ${allAlterCommands.length} comandos SQL gerados.`);
  console.log('='.repeat(80));
}

// Executar análise
analyzeSchemaDiff().catch(console.error);


















