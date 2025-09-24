import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { MIGRATION_CONFIG, transformDataForSupabase } from '../lib/migration-config.js';

// Configuração dos clientes
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const base44ApiKey = 'dfc95162310b45a798febaddf09dd9af';

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Variáveis de ambiente do Supabase não encontradas. Verifique seu arquivo .env');
}

// Cliente Supabase com service role (para migração)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Configuração do axios para Base44
const base44Client = axios.create({
  headers: {
    'api_key': base44ApiKey,
    'Content-Type': 'application/json'
  }
});

// Lista de endpoints do Base44
const BASE44_ENDPOINTS = {
  'Product': 'https://app.base44.com/api/apps/68954c8b2b3cb8a6182efcdb/entities/Product',
  'StockEntry': 'https://app.base44.com/api/apps/68954c8b2b3cb8a6182efcdb/entities/StockEntry',
  'Transfer': 'https://app.base44.com/api/apps/68954c8b2b3cb8a6182efcdb/entities/transfer',
  'Vehicle': 'https://app.base44.com/api/apps/68954c8b2b3cb8a6182efcdb/entities/Vehicle',
  'WeighingTrip': 'https://app.base44.com/api/apps/68954c8b2b3cb8a6182efcdb/entities/WeighingTrip',
  'ScaleReading': 'https://app.base44.com/api/apps/68954c8b2b3cb8a6182efcdb/entities/ScaleReading',
  'ActivityLog': 'https://app.base44.com/api/apps/68954c8b2b3cb8a6182efcdb/entities/ActivityLo',
  'FinancialAccount': 'https://app.base44.com/api/apps/68954c8b2b3cb8a6182efcdb/entities/FinancialAccount',
  'FinancialTransaction': 'https://app.base44.com/api/apps/68954c8b2b3cb8a6182efcdb/entities/FinancialTransaction',
  'Contact': 'https://app.base44.com/api/apps/68954c8b2b3cb8a6182efcdb/entities/Contact',
  'FuelingRecord': 'https://app.base44.com/api/apps/68954c8b2b3cb8a6182efcdb/entities/FuelingRecord',
  'VehicleExpense': 'https://app.base44.com/api/apps/68954c8b2b3cb8a6182efcdb/entities/VehicleExpense',
  'WeightReading': 'https://app.base44.com/api/apps/68954c8b2b3cb8a6182efcdb/entities/WeightReading',
  'RequisicaoDeSaida': 'https://app.base44.com/api/apps/68954c8b2b3cb8a6182efcdb/entities/RequisicaoDeSaida',
  'ItemDaRequisicao': 'https://app.base44.com/api/apps/68954c8b2b3cb8a6182efcdb/entities/ItemDaRequisicao',
  'RetiradaDeMaterial': 'https://app.base44.com/api/apps/68954c8b2b3cb8a6182efcdb/entities/RetiradaDeMaterial',
  'MovimentacaoEstoque': 'https://app.base44.com/api/apps/68954c8b2b3cb8a6182efcdb/entities/MovimentacaoEstoque',
  'RetiradaDeItem': 'https://app.base44.com/api/apps/68954c8b2b3cb8a6182efcdb/entities/RetiradaDeItem',
  'ItemRetirado': 'https://app.base44.com/api/apps/68954c8b2b3cb8a6182efcdb/entities/ItemRetirado',
  'UserPermission': 'https://app.base44.com/api/apps/68954c8b2b3cb8a6182efcdb/entities/UserPermission',
  'AccessLog': 'https://app.base44.com/api/apps/68954c8b2b3cb8a6182efcdb/entities/AccessLog',
  'Company': 'https://app.base44.com/api/apps/68954c8b2b3cb8a6182efcdb/entities/Company',
  'ProdutosAlmoxarifado': 'https://app.base44.com/api/apps/68954c8b2b3cb8a6182efcdb/entities/ProdutosAlmoxarifado',
  'MovimentacoesProduto': 'https://app.base44.com/api/apps/68954c8b2b3cb8a6182efcdb/entities/MovimentacoesProduto',
  'EPI': 'https://app.base44.com/api/apps/68954c8b2b3cb8a6182efcdb/entities/EPI',
  'Funcionario': 'https://app.base44.com/api/apps/68954c8b2b3cb8a6182efcdb/entities/Funcionario',
  'EntregaEPI': 'https://app.base44.com/api/apps/68954c8b2b3cb8a6182efcdb/entities/EntregaEPI',
  'TransferenciaSimples': 'https://app.base44.com/api/apps/68954c8b2b3cb8a6182efcdb/entities/TransferenciaSimples',
  'Remessa': 'https://app.base44.com/api/apps/68954c8b2b3cb8a6182efcdb/entities/Remessa',
  'AtivoTI': 'https://app.base44.com/api/apps/68954c8b2b3cb8a6182efcdb/entities/AtivoTI',
  'PostoCombustivel': 'https://app.base44.com/api/apps/68954c8b2b3cb8a6182efcdb/entities/PostoCombustivel',
  'EntradaCombustivel': 'https://app.base44.com/api/apps/68954c8b2b3cb8a6182efcdb/entities/EntradaCombustivel',
  'AjusteEstoqueLog': 'https://app.base44.com/api/apps/68954c8b2b3cb8a6182efcdb/entities/AjusteEstoqueLog',
  'RecurringCost': 'https://app.base44.com/api/apps/68954c8b2b3cb8a6182efcdb/entities/RecurringCost',
  'Venda': 'https://app.base44.com/api/apps/68954c8b2b3cb8a6182efcdb/entities/Venda',
  'ItemDaVenda': 'https://app.base44.com/api/apps/68954c8b2b3cb8a6182efcdb/entities/ItemDaVenda',
  'CreditoCliente': 'https://app.base44.com/api/apps/68954c8b2b3cb8a6182efcdb/entities/CreditoCliente',
  'ProductCategory': 'https://app.base44.com/api/apps/68954c8b2b3cb8a6182efcdb/entities/ProductCategory',
  'OperacaoCaixa': 'https://app.base44.com/api/apps/68954c8b2b3cb8a6182efcdb/entities/OperacaoCaixa'
};

// Mapeamento de entidades para tabelas do Supabase
const ENTITY_TO_TABLE = {
  'Product': 'products',
  'StockEntry': 'stock_entries',
  'Transfer': 'transfers',
  'Vehicle': 'vehicles',
  'WeighingTrip': 'weighing_trips',
  'ScaleReading': 'scale_readings',
  'ActivityLog': 'activity_logs',
  'FinancialAccount': 'financial_accounts',
  'FinancialTransaction': 'financial_transactions',
  'Contact': 'contacts',
  'FuelingRecord': 'fueling_records',
  'VehicleExpense': 'vehicle_expenses',
  'WeightReading': 'weight_readings',
  'RequisicaoDeSaida': 'requisicoes_saida',
  'ItemDaRequisicao': 'itens_requisicao',
  'RetiradaDeMaterial': 'retiradas_material',
  'MovimentacaoEstoque': 'movimentacoes_estoque',
  'RetiradaDeItem': 'retiradas_item',
  'ItemRetirado': 'itens_retirados',
  'UserPermission': 'user_permissions',
  'AccessLog': 'access_logs',
  'Company': 'companies',
  'ProdutosAlmoxarifado': 'produtos_almoxarifado',
  'MovimentacoesProduto': 'movimentacoes_produto',
  'EPI': 'epis',
  'Funcionario': 'funcionarios',
  'EntregaEPI': 'entregas_epi',
  'TransferenciaSimples': 'transferencias_simples',
  'Remessa': 'remessas',
  'AtivoTI': 'ativos_ti',
  'PostoCombustivel': 'postos_combustivel',
  'EntradaCombustivel': 'entradas_combustivel',
  'AjusteEstoqueLog': 'ajustes_estoque_log',
  'RecurringCost': 'recurring_costs',
  'Venda': 'vendas',
  'ItemDaVenda': 'itens_venda',
  'CreditoCliente': 'creditos_cliente',
  'ProductCategory': 'product_categories',
  'OperacaoCaixa': 'operacoes_caixa'
};

// Função para migrar dados de uma entidade
async function migrateEntity(entityName, supabaseTableName) {
  console.log(`\n🔄 Migrando ${entityName} para ${supabaseTableName}...`);
  
  try {
    // Buscar dados do Base44 via HTTP
    const endpoint = BASE44_ENDPOINTS[entityName];
    if (!endpoint) {
      console.log(`⚠️  Endpoint não encontrado para ${entityName}`);
      return { success: true, count: 0 };
    }

    console.log(`📡 Fazendo requisição para: ${endpoint}`);
    const response = await base44Client.get(endpoint);
    
    if (!response.data || !Array.isArray(response.data)) {
      console.log(`⚠️  Nenhum dado encontrado para ${entityName}`);
      return { success: true, count: 0 };
    }

    const data = response.data;
    console.log(`📊 Encontrados ${data.length} registros de ${entityName}`);

    // Processar em lotes
    const batchSize = MIGRATION_CONFIG.batchSize;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      const transformedBatch = batch.map(item => transformDataForSupabase(item, entityName));

      try {
        const { error } = await supabase
          .from(supabaseTableName)
          .insert(transformedBatch);

        if (error) {
          console.error(`❌ Erro no lote ${Math.floor(i / batchSize) + 1}:`, error);
          errorCount += batch.length;
        } else {
          successCount += batch.length;
          console.log(`✅ Lote ${Math.floor(i / batchSize) + 1} migrado com sucesso (${batch.length} registros)`);
        }
      } catch (batchError) {
        console.error(`❌ Erro no lote ${Math.floor(i / batchSize) + 1}:`, batchError);
        errorCount += batch.length;
      }

      // Delay entre lotes para não sobrecarregar o servidor
      if (i + batchSize < data.length) {
        await new Promise(resolve => setTimeout(resolve, MIGRATION_CONFIG.delayBetweenBatches));
      }
    }

    console.log(`✅ Migração de ${entityName} concluída: ${successCount} sucessos, ${errorCount} erros`);
    return { success: true, count: successCount, errors: errorCount };

  } catch (error) {
    console.error(`❌ Erro ao migrar ${entityName}:`, error.message);
    return { success: false, error: error.message };
  }
}

// Função para criar usuários no Supabase Auth
async function migrateUsers() {
  console.log('\n🔄 Migrando usuários para Supabase Auth...');
  
  try {
    // Buscar permissões de usuário do Base44 via HTTP
    const endpoint = BASE44_ENDPOINTS['UserPermission'];
    const response = await base44Client.get(endpoint);
    
    if (!response.data || !Array.isArray(response.data)) {
      console.log('⚠️  Nenhum usuário encontrado para migrar');
      return { success: true, count: 0 };
    }

    const userPermissions = response.data;
    console.log(`📊 Encontrados ${userPermissions.length} usuários para migrar`);

    let successCount = 0;
    let errorCount = 0;

    for (const userPerm of userPermissions) {
      try {
        // Criar usuário no Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: userPerm.user_email,
          password: 'temp_password_123', // Senha temporária
          email_confirm: true,
          user_metadata: {
            full_name: userPerm.user_name,
            role: userPerm.role || 'usuario_padrao'
          }
        });

        if (authError) {
          console.error(`❌ Erro ao criar usuário ${userPerm.user_email}:`, authError);
          errorCount++;
          continue;
        }

        // Criar perfil na tabela profiles
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: userPerm.user_email,
            full_name: userPerm.user_name,
            role: userPerm.role || 'usuario_padrao',
            company_id: userPerm.company_id,
            permissions: userPerm.permissions || {},
            status: userPerm.status || 'ativo',
            last_login: userPerm.last_login
          });

        if (profileError) {
          console.error(`❌ Erro ao criar perfil para ${userPerm.user_email}:`, profileError);
          errorCount++;
        } else {
          successCount++;
          console.log(`✅ Usuário ${userPerm.user_email} migrado com sucesso`);
        }

      } catch (error) {
        console.error(`❌ Erro ao migrar usuário ${userPerm.user_email}:`, error);
        errorCount++;
      }
    }

    console.log(`✅ Migração de usuários concluída: ${successCount} sucessos, ${errorCount} erros`);
    return { success: true, count: successCount, errors: errorCount };

  } catch (error) {
    console.error('❌ Erro ao migrar usuários:', error);
    return { success: false, error: error.message };
  }
}

// Função principal de migração
async function runMigration() {
  console.log('🚀 Iniciando migração do Base44 para Supabase...');
  console.log('================================================');

  const results = {};

  try {
    // 1. Migrar usuários primeiro (para ter as referências)
    results.users = await migrateUsers();

    // 2. Migrar empresas
    results.companies = await migrateEntity('Company', 'companies');

    // 3. Migrar categorias de produtos
    results.productCategories = await migrateEntity('ProductCategory', 'product_categories');

    // 4. Migrar produtos
    results.products = await migrateEntity('Product', 'products');

    // 5. Migrar veículos
    results.vehicles = await migrateEntity('Vehicle', 'vehicles');

    // 6. Migrar contas financeiras
    results.financialAccounts = await migrateEntity('FinancialAccount', 'financial_accounts');

    // 7. Migrar transações financeiras
    results.financialTransactions = await migrateEntity('FinancialTransaction', 'financial_transactions');

    // 8. Migrar contatos
    results.contacts = await migrateEntity('Contact', 'contacts');

    // 9. Migrar entradas de estoque
    results.stockEntries = await migrateEntity('StockEntry', 'stock_entries');

    // 10. Migrar transferências
    results.transfers = await migrateEntity('Transfer', 'transfers');

    // 11. Migrar viagens de pesagem
    results.weighingTrips = await migrateEntity('WeighingTrip', 'weighing_trips');

    // 12. Migrar leituras de balança
    results.scaleReadings = await migrateEntity('ScaleReading', 'scale_readings');

    // 13. Migrar registros de abastecimento
    results.fuelingRecords = await migrateEntity('FuelingRecord', 'fueling_records');

    // 14. Migrar despesas de veículos
    results.vehicleExpenses = await migrateEntity('VehicleExpense', 'vehicle_expenses');

    // 15. Migrar requisições de saída
    results.requisicoesSaida = await migrateEntity('RequisicaoDeSaida', 'requisicoes_saida');

    // 16. Migrar itens de requisição
    results.itensRequisicao = await migrateEntity('ItemDaRequisicao', 'itens_requisicao');

    // 17. Migrar movimentações de estoque
    results.movimentacoesEstoque = await migrateEntity('MovimentacaoEstoque', 'movimentacoes_estoque');

    // 18. Migrar EPIs
    results.epis = await migrateEntity('EPI', 'epis');

    // 19. Migrar funcionários
    results.funcionarios = await migrateEntity('Funcionario', 'funcionarios');

    // 20. Migrar entregas de EPI
    results.entregasEpi = await migrateEntity('EntregaEPI', 'entregas_epi');

    // 21. Migrar transferências simples
    results.transferenciasSimples = await migrateEntity('TransferenciaSimples', 'transferencias_simples');

    // 22. Migrar remessas
    results.remessas = await migrateEntity('Remessa', 'remessas');

    // 23. Migrar ativos de TI
    results.ativosTi = await migrateEntity('AtivoTI', 'ativos_ti');

    // 24. Migrar postos de combustível
    results.postosCombustivel = await migrateEntity('PostoCombustivel', 'postos_combustivel');

    // 25. Migrar entradas de combustível
    results.entradasCombustivel = await migrateEntity('EntradaCombustivel', 'entradas_combustivel');

    // 26. Migrar ajustes de estoque
    results.ajustesEstoque = await migrateEntity('AjusteEstoqueLog', 'ajustes_estoque_log');

    // 27. Migrar custos recorrentes
    results.recurringCosts = await migrateEntity('RecurringCost', 'recurring_costs');

    // 28. Migrar vendas
    results.vendas = await migrateEntity('Venda', 'vendas');

    // 29. Migrar itens de venda
    results.itensVenda = await migrateEntity('ItemDaVenda', 'itens_venda');

    // 30. Migrar créditos de cliente
    results.creditosCliente = await migrateEntity('CreditoCliente', 'creditos_cliente');

    // 31. Migrar operações de caixa
    results.operacoesCaixa = await migrateEntity('OperacaoCaixa', 'operacoes_caixa');

    // 32. Migrar logs de acesso
    results.accessLogs = await migrateEntity('AccessLog', 'access_logs');

    // 33. Migrar logs de atividade
    results.activityLogs = await migrateEntity('ActivityLog', 'activity_logs');

    // Relatório final
    console.log('\n📊 RELATÓRIO FINAL DA MIGRAÇÃO');
    console.log('================================');
    
    let totalSuccess = 0;
    let totalErrors = 0;

    Object.entries(results).forEach(([entity, result]) => {
      if (result.success) {
        console.log(`✅ ${entity}: ${result.count || 0} registros migrados`);
        totalSuccess += result.count || 0;
        if (result.errors) totalErrors += result.errors;
      } else {
        console.log(`❌ ${entity}: ERRO - ${result.error}`);
        totalErrors++;
      }
    });

    console.log(`\n🎉 MIGRAÇÃO CONCLUÍDA!`);
    console.log(`📈 Total de registros migrados: ${totalSuccess}`);
    console.log(`❌ Total de erros: ${totalErrors}`);

    if (totalErrors > 0) {
      console.log('\n⚠️  ATENÇÃO: Alguns erros ocorreram durante a migração.');
      console.log('  Verifique os logs acima para mais detalhes.');
    }

  } catch (error) {
    console.error('💥 Erro fatal durante a migração:', error);
    process.exit(1);
  }
}

// Executar migração se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration().catch(console.error);
}

export { runMigration, migrateEntity, migrateUsers };