import { supabase } from '../lib/supabaseClient';

/**
 * Serviço para integrar vendas com o sistema financeiro
 */
class FinancialIntegrationService {
  /**
   * Converte string para formato UUID válido
   * @param {string} idString - String que deve ser convertida para UUID
   * @returns {string} UUID válido
   */
  convertToUUID(idString) {
    if (!idString) return null;
    if (typeof idString !== 'string') return idString;
    
    // Se já é um UUID válido, retorna como está
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(idString)) {
      return idString;
    }
    
    // Se é um UUID sem hífens, adiciona os hífens
    if (idString.length === 32) {
      return `${idString.slice(0, 8)}-${idString.slice(8, 12)}-${idString.slice(12, 16)}-${idString.slice(16, 20)}-${idString.slice(20, 32)}`;
    }
    
    return idString;
  }

  /**
   * Cria transações financeiras para uma fatura
   * @param {string} faturaId - ID da fatura
   * @param {Object} faturaData - Dados da fatura
   * @param {Array} parcelas - Array de parcelas
   * @param {string} companyId - ID da empresa
   * @param {string} userId - ID do usuário
   */
  async createFinancialTransactions(faturaId, faturaData, parcelas, companyId, userId) {
    try {
      console.log('💰 Criando transações financeiras para fatura:', faturaId);

      // Buscar conta de receitas padrão
      const { data: revenueAccount, error: accountError } = await supabase
        .from('financial_accounts')
        .select('id, name')
        .eq('company_id', companyId)
        .eq('type', 'receita')
        .eq('active', true)
        .single();

      if (accountError || !revenueAccount) {
        console.warn('⚠️ Conta de receitas não encontrada, criando transação sem conta específica');
      }

      const transactions = [];

      // Se for à vista, criar uma transação única
      if (faturaData.payment_conditions === 'a_vista') {
        const transaction = {
          account_id: revenueAccount?.id || null,
          type: 'receita',
          amount: Math.abs(faturaData.final_value),
          description: `Venda à vista - Cliente: ${faturaData.customer_name || 'N/A'}`,
          reference: faturaId,
          due_date: faturaData.due_date || new Date().toISOString().split('T')[0],
          status: faturaData.status === 'paid' ? 'pago' : 'pendente',
          payment_date: faturaData.status === 'paid' ? new Date().toISOString().split('T')[0] : null,
          category: 'venda_produto',
          metadata: {
            payment_method: faturaData.payment_method,
            source: 'venda',
            venda_id: faturaData.venda_id,
            customer_id: faturaData.customer_id
          },
          company_id: this.convertToUUID(companyId),
          created_by: this.convertToUUID(userId)
        };

        transactions.push(transaction);
      } else {
        // Se for à prazo, criar transações para cada parcela
        for (const parcela of parcelas) {
          const transaction = {
            account_id: revenueAccount?.id || null,
            type: 'receita',
            amount: Math.abs(parcela.value),
            description: `Parcela ${parcela.installment_number}/${parcelas.length} - Cliente: ${faturaData.customer_name || 'N/A'}`,
            reference: faturaId,
            due_date: parcela.due_date,
            status: parcela.status === 'paid' ? 'pago' : 'pendente',
            payment_date: parcela.status === 'paid' ? parcela.paid_at : null,
            category: 'venda_produto',
            metadata: {
              payment_method: parcela.payment_method || faturaData.payment_method,
              source: 'venda',
              venda_id: faturaData.venda_id,
              customer_id: faturaData.customer_id,
              parcela_id: parcela.id,
              installment_number: parcela.installment_number
            },
            company_id: this.convertToUUID(companyId),
            created_by: this.convertToUUID(userId)
          };

          transactions.push(transaction);
        }
      }

      // Inserir todas as transações
      if (transactions.length > 0) {
        const { data, error } = await supabase
          .from('financial_transactions')
          .insert(transactions)
          .select();

        if (error) throw error;

        console.log('✅ Transações financeiras criadas:', data.length);
        return data;
      }

      return [];
    } catch (error) {
      console.error('❌ Erro ao criar transações financeiras:', error);
      throw error;
    }
  }

  /**
   * Atualiza status de transações financeiras quando uma parcela é paga
   * @param {string} parcelaId - ID da parcela
   * @param {Object} paymentData - Dados do pagamento
   */
  async updateTransactionStatus(parcelaId, paymentData) {
    try {
      console.log('🔄 Atualizando status da transação para parcela:', parcelaId);

      // Buscar transação relacionada à parcela
      const { data: transaction, error: findError } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('metadata->>parcela_id', parcelaId)
        .single();

      if (findError || !transaction) {
        console.warn('⚠️ Transação financeira não encontrada para parcela:', parcelaId);
        return;
      }

      // Atualizar status da transação
      const { error: updateError } = await supabase
        .from('financial_transactions')
        .update({
          status: 'pago',
          payment_date: paymentData.data_pagamento || new Date().toISOString().split('T')[0],
          notes: transaction.notes ? 
            `${transaction.notes}\n--- Pagamento ${new Date().toLocaleDateString('pt-BR')} ---\nR$ ${paymentData.valor_pago} via ${paymentData.meio_pagamento}` :
            `Pagamento ${new Date().toLocaleDateString('pt-BR')}: R$ ${paymentData.valor_pago} via ${paymentData.meio_pagamento}`
        })
        .eq('id', transaction.id);

      if (updateError) throw updateError;

      console.log('✅ Status da transação atualizado');
    } catch (error) {
      console.error('❌ Erro ao atualizar status da transação:', error);
      throw error;
    }
  }

  /**
   * Busca transações financeiras de uma venda
   * @param {string} vendaId - ID da venda
   */
  async getTransactionsBySale(vendaId) {
    try {
      const { data, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('metadata->>venda_id', vendaId)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erro ao buscar transações da venda:', error);
      throw error;
    }
  }

  /**
   * Busca saldo de produtos de um cliente
   * @param {string} clienteId - ID do cliente
   * @param {string} companyId - ID da empresa
   */
  async getClientProductBalance(clienteId, companyId) {
    try {
      const { data, error } = await supabase
        .from('saldo_produtos')
        .select(`
          *,
          produto:products (
            id,
            name,
            code,
            unit
          ),
          venda:vendas (
            id,
            date,
            final_amount
          )
        `)
        .eq('cliente_id', clienteId)
        .eq('company_id', companyId)
        .eq('status', 'ativo')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erro ao buscar saldo do cliente:', error);
      throw error;
    }
  }

  /**
   * Calcula resumo financeiro de um cliente
   * @param {string} clienteId - ID do cliente
   * @param {string} companyId - ID da empresa
   */
  async getClientFinancialSummary(clienteId, companyId) {
    try {
      // Buscar transações do cliente
      const { data: transactions, error: transError } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('metadata->>customer_id', clienteId)
        .eq('company_id', companyId)
        .eq('type', 'receita');

      if (transError) throw transError;

      // Calcular totais
      const totalVendas = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
      const totalPago = transactions
        .filter(t => t.status === 'pago')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      const totalPendente = totalVendas - totalPago;

      // Buscar saldo de produtos
      const saldoProdutos = await this.getClientProductBalance(clienteId, companyId);
      const totalSaldoProdutos = saldoProdutos.reduce((sum, s) => sum + parseFloat(s.quantidade_saldo), 0);

      return {
        totalVendas,
        totalPago,
        totalPendente,
        totalSaldoProdutos,
        saldoProdutos: saldoProdutos.length,
        ultimaVenda: transactions.length > 0 ? transactions[0].created_at : null
      };
    } catch (error) {
      console.error('❌ Erro ao calcular resumo financeiro:', error);
      throw error;
    }
  }
}

export default new FinancialIntegrationService();
