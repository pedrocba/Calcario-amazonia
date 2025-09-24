// Script para configurar as tabelas de faturamento no Supabase
// Execute este script no terminal: node setup-billing-tables.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  console.error('Certifique-se de que VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão definidas no arquivo .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupBillingTables() {
  console.log('🚀 Iniciando configuração das tabelas de faturamento...');

  try {
    // Ler o arquivo SQL
    const sqlContent = fs.readFileSync('create-faturamento-tables.sql', 'utf8');

    // Executar o SQL
    const { error } = await supabase.rpc('exec_sql', { sql: sqlContent });

    if (error) {
      console.error('❌ Erro ao executar SQL:', error);
      return;
    }

    console.log('✅ Tabelas de faturamento criadas com sucesso!');
    console.log('');
    console.log('📋 Tabelas criadas:');
    console.log('  - faturas');
    console.log('  - parcelas');
    console.log('  - contas_bancarias');
    console.log('  - caixas');
    console.log('  - movimentacoes_caixa');
    console.log('  - movimentacoes_bancarias');
    console.log('');
    console.log('🔒 Políticas RLS aplicadas');
    console.log('📊 Índices criados para performance');
    console.log('');
    console.log('🎉 Sistema de faturamento pronto para uso!');

  } catch (error) {
    console.error('❌ Erro durante a configuração:', error);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  setupBillingTables();
}

export { setupBillingTables };
