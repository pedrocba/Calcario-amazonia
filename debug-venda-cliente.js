// Script para debugar se a venda tem cliente associado
// Execute: node debug-venda-cliente.js

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase (substitua pelos seus valores)
const supabaseUrl = 'https://your-project.supabase.co'; // Substitua pela sua URL
const supabaseKey = 'your-anon-key'; // Substitua pela sua chave anon

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugVendaCliente() {
  console.log('🔍 Verificando vendas e clientes...');
  
  try {
    // Buscar vendas com clientes
    const { data: vendas, error } = await supabase
      .from('vendas')
      .select(`
        id,
        client_id,
        status,
        final_amount,
        client:contacts!client_id (
          id,
          name,
          email
        )
      `)
      .limit(5);

    if (error) {
      console.error('❌ Erro ao buscar vendas:', error);
      return;
    }

    console.log('📊 Vendas encontradas:');
    vendas.forEach((venda, index) => {
      console.log(`\n${index + 1}. Venda ID: ${venda.id}`);
      console.log(`   Client ID: ${venda.client_id}`);
      console.log(`   Status: ${venda.status}`);
      console.log(`   Valor: R$ ${venda.final_amount}`);
      console.log(`   Cliente: ${venda.client ? venda.client.name : 'N/A'}`);
      console.log(`   Tem cliente? ${venda.client_id ? '✅' : '❌'}`);
    });

    // Verificar se há vendas sem cliente
    const vendasSemCliente = vendas.filter(v => !v.client_id);
    if (vendasSemCliente.length > 0) {
      console.log(`\n⚠️  ${vendasSemCliente.length} venda(s) sem cliente associado!`);
    } else {
      console.log('\n✅ Todas as vendas têm cliente associado');
    }

  } catch (error) {
    console.error('❌ Erro durante debug:', error);
  }
}

debugVendaCliente();











