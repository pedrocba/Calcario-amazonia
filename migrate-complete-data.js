#!/usr/bin/env node

/**
 * MIGRAÇÃO COMPLETA DE DADOS - BASE44 PARA SUPABASE
 * =================================================
 * * Este script executa a migração completa de todos os dados
 * do sistema Base44 para o Supabase.
 * * Busca dados REAIS da API do Base44 e os migra para o Supabase.
 * * Execute: node migrate-complete-data.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';

// Carregar variáveis de ambiente
dotenv.config();

// Configuração do Supabase - LENDO DO ARQUIVO .env CORRETAMENTE
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Configuração do Base44
const BASE44_API_KEY = 'dfc95162310b45a798febaddf09dd9af';

console.log('🔧 CONFIGURAÇÃO DO SCRIPT:');
console.log(`URL: ${supabaseUrl}`);
console.log(`Key: ${supabaseServiceKey ? supabaseServiceKey.substring(0, 20) + '...' : 'NÃO ENCONTRADA'}`);
console.log('================================');

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Configuração do Supabase não encontrada no arquivo .env! Verifique as variáveis SUPABASE_URL e SUPABASE_SERVICE_KEY.');
    process.exit(1);
}

// Cliente Supabase com service role key
console.log('🔌 Criando cliente Supabase...');
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
console.log('✅ Cliente Supabase criado com sucesso!');

// Cliente Base44
const base44Client = axios.create({
  headers: {
    'api_key': BASE44_API_KEY,
    'Content-Type': 'application/json'
  }
});
console.log('✅ Cliente Base44 configurado com sucesso!');

// Endpoints do Base44 para migração
const BASE44_ENDPOINTS = {
  'Company': 'https://app.base44.com/api/apps/68954c8b2b3cb8a6182efcdb/entities/Company',
  'Product': 'https://app.base44.com/api/apps/68954c8b2b3cb8a6182efcdb/entities/Product',
  'Vehicle': 'https://app.base44.com/api/apps/68954c8b2b3cb8a6182efcdb/entities/Vehicle',
  'UserPermission': 'https://app.base44.com/api/apps/68954c8b2b3cb8a6182efcdb/entities/UserPermission',
  'Transfer': 'https://app.base44.com/api/apps/68954c8b2b3cb8a6182efcdb/entities/transfer',
  'RequisicaoDeSaida': 'https://app.base44.com/api/apps/68954c8b2b3cb8a6182efcdb/entities/RequisicaoDeSaida'
};

// ===============================================
// FUNÇÃO AUXILIAR DE LOG RESTAURADA
// ===============================================
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
}
// ===============================================


// Funções de transformação de dados CORRIGIDAS E COMPLETAS
const transformFunctions = {
    companies: (record) => ({
      id: record.id,
      name: record.name,
      code: record.code,
      full_name: record.full_name,
      cnpj: record.cnpj,
      address: record.address,
      city: record.city,
      state: record.state,
      phone: record.phone,
      email: record.email,
      type: record.type,
      active: record.active,
      database_config: record.database_config,
      created_date: record.created_date,
      updated_date: record.updated_date,
      created_by_id: record.created_by_id,
      created_by: record.created_by,
      is_sample: record.is_sample,
      description: record.description
    }),

    products: (record) => ({
      id: record.id,
      company_id: record.company_id,
      company_name: record.company_name,
      code: record.code,
      name: record.name,
      description: record.description,
      category: record.category,
      condition: record.condition,
      size: record.size,
      unit_of_measure: record.unit_of_measure,
      cost_price: record.cost_price,
      sale_price: record.sale_price,
      profit_margin: record.profit_margin,
      min_qty: record.min_qty,
      max_qty: record.max_qty,
      active: record.active,
      created_date: record.created_date,
      updated_date: record.updated_date,
      created_by_id: record.created_by_id,
      created_by: record.created_by,
      is_sample: record.is_sample,
      price: record.price,
      stock: record.stock,
      unit: record.unit,
      min_stock: record.min_stock
    }),

    vehicles: (record) => ({
      id: record.id,
      plate: record.plate,
      model: record.model,
      brand: record.brand,
      year: record.year,
      capacity: record.capacity,
      status: record.status,
      company_id: record.company_id,
      created_at: record.created_at,
      updated_at: record.updated_at
    }),
    
    transfers: (record) => record,
    requisitions: (record) => record,
    users: (record) => record,
};


// Mapeamento simplificado para a função principal
const ENTITY_TO_TABLE_MAP = {
    'companies': 'companies',
    'products': 'products',
    'vehicles': 'vehicles',
    'users': 'users'
};

// Mapeamento de entidades do Base44 para chaves de dados
const BASE44_ENTITY_MAP = {
    'Company': 'companies',
    'Product': 'products',
    'Vehicle': 'vehicles',
    'UserPermission': 'users',
    'Transfer': 'transfers',
    'RequisicaoDeSaida': 'requisitions'
};

// Função para buscar dados reais do Base44
async function fetchBase44Data() {
    log('🔄 Iniciando busca de dados do Base44...');
    
    const fetchedData = {};
    const errors = [];
    
    // Criar array de promessas para buscar todos os endpoints
    const fetchPromises = Object.entries(BASE44_ENDPOINTS).map(async ([entityName, endpoint]) => {
        try {
            log(`📡 Buscando dados de ${entityName}...`);
            const response = await base44Client.get(endpoint);
            
            if (response.data && Array.isArray(response.data)) {
                const dataKey = BASE44_ENTITY_MAP[entityName];
                if (dataKey) {
                    fetchedData[dataKey] = response.data;
                    log(`✅ ${entityName}: ${response.data.length} registros encontrados`, 'success');
                } else {
                    log(`⚠️  ${entityName}: Entidade não mapeada, ignorando...`);
                }
            } else {
                log(`⚠️  ${entityName}: Resposta inesperada da API`);
            }
        } catch (error) {
            const errorMsg = `Erro ao buscar ${entityName}: ${error.message}`;
            log(errorMsg, 'error');
            errors.push(errorMsg);
        }
    });
    
    // Aguardar todas as requisições
    await Promise.all(fetchPromises);
    
    if (errors.length > 0) {
        log(`⚠️  ${errors.length} erros encontrados durante a busca de dados:`, 'error');
        errors.forEach(error => log(`   - ${error}`, 'error'));
    }
    
    log(`🎯 Dados coletados: ${Object.keys(fetchedData).join(', ')}`);
    return fetchedData;
}

async function migrateData(tableName, data, transformFn) {
    log(`Iniciando migração para a tabela: ${tableName}`);
    if (!data || data.length === 0) {
        log(`Nenhum dado para migrar para ${tableName}.`);
        return;
    }

    const transformedData = data.map(transformFn);

    const { error } = await supabase.from(tableName).insert(transformedData);

    if (error) {
        log(`Erro ao inserir dados na tabela ${tableName}: ${error.message}`, 'error');
        console.error('Detalhes do Erro:', error);
    } else {
        log(`✅ ${data.length} registros inseridos com sucesso na tabela ${tableName}!`, 'success');
    }
}

// Função principal de migração
async function runMigration() {
    try {
        log('🚀 Iniciando migração de dados REAIS do Base44...');
        
        // Verificar conexão com Supabase
        const { error: connectionError } = await supabase.from('companies').select('id').limit(1);
        if (connectionError) {
             console.error("Erro de conexão detalhado:", connectionError);
             throw new Error(`Erro de conexão com Supabase: ${connectionError.message}`);
        }
        log('✅ Conexão com Supabase estabelecida');

        // Buscar dados reais do Base44
        const realData = await fetchBase44Data();
        
        if (Object.keys(realData).length === 0) {
            log('⚠️  Nenhum dado foi coletado do Base44. Verifique a conectividade e configurações.', 'error');
            return;
        }

        const migrationOrder = ['companies', 'products', 'vehicles', 'users', 'transfers', 'requisitions'];
        
        for (const tableName of migrationOrder) {
            const tableKey = ENTITY_TO_TABLE_MAP[tableName] || tableName;
            const dataToMigrate = realData[tableKey];
            const transformFn = transformFunctions[tableKey];

            if (dataToMigrate && dataToMigrate.length > 0) {
                await migrateData(tableName, dataToMigrate, transformFn);
            } else {
                log(`Tabela ${tableName} não possui dados para migrar.`);
            }
        }
        log('🎉 Migração de DADOS REAIS do Base44 concluída com sucesso!', 'success');

    } catch (error) {
        log(`❌ Erro crítico na migração: ${error.message}`, 'error');
        console.error("Objeto de erro completo:", error);
        process.exit(1);
    }
}

runMigration();