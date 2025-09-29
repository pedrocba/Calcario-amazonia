// Script para corrigir inconsistências de status no banco de dados
// Execute: node fix-status-inconsistency.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixStatusInconsistency() {
  console.log('🔍 Verificando inconsistências de status...');

  try {
    // Verificar status atuais na tabela vendas
    const { data: vendas, error: vendasError } = await supabase
      .from('vendas')
      .select('id, status')
      .limit(10);

    if (vendasError) {
      console.error('❌ Erro ao buscar vendas:', vendasError);
      return;
    }

    console.log('📊 Status encontrados:');
    const statusCounts = {};
    vendas.forEach(venda => {
      statusCounts[venda.status] = (statusCounts[venda.status] || 0) + 1;
    });

    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  - "${status}": ${count} vendas`);
    });

    // Verificar se há inconsistências
    const hasInconsistency = Object.keys(statusCounts).some(status => 
      status !== status.toLowerCase()
    );

    if (hasInconsistency) {
      console.log('\n🔧 Corrigindo inconsistências...');
      
      // Normalizar todos os status para minúsculo
      const { error: updateError } = await supabase
        .from('vendas')
        .update({ status: 'pendente' })
        .eq('status', 'Pendente');

      if (updateError) {
        console.error('❌ Erro ao corrigir status:', updateError);
      } else {
        console.log('✅ Status "Pendente" corrigido para "pendente"');
      }

      // Corrigir outros status se necessário
      const statusMappings = {
        'Faturada': 'faturada',
        'Cancelada': 'cancelada',
        'Concluida': 'concluida',
        'Pago': 'pago'
      };

      for (const [oldStatus, newStatus] of Object.entries(statusMappings)) {
        const { error } = await supabase
          .from('vendas')
          .update({ status: newStatus })
          .eq('status', oldStatus);

        if (error) {
          console.error(`❌ Erro ao corrigir status "${oldStatus}":`, error);
        } else {
          console.log(`✅ Status "${oldStatus}" corrigido para "${newStatus}"`);
        }
      }
    } else {
      console.log('✅ Nenhuma inconsistência encontrada!');
    }

    console.log('\n🎉 Verificação concluída!');
    console.log('\n💡 Dica: Agora você pode tentar faturar a venda novamente.');

  } catch (error) {
    console.error('❌ Erro durante a verificação:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  fixStatusInconsistency();
}

module.exports = { fixStatusInconsistency };











