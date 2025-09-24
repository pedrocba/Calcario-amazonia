import { supabase } from '../lib/supabaseClient';

/**
 * Serviço Profissional de Sincronização Financeira
 * Garante que vendas faturadas apareçam corretamente em Contas a Receber
 */
class FinancialSyncService {
  constructor() {
    this.isProcessing = false;
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1 segundo
  }

  /**
   * Converte string para formato UUID válido
   */
  convertToUUID(idString) {
    if (!idString) return null;
    if (typeof idString !== 'string') return idString;
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(idString)) {
      return idString;
    }
    
    if (idString.length === 32) {
      return `${idString.slice(0, 8)}-${idString.slice(8, 12)}-${idString.slice(12, 16)}-${idString.slice(16, 20)}-${idString.slice(20, 32)}`;
    }
    
    return idString;
  }

  /**
   * Sincroniza TODAS as vendas faturadas com o sistema financeiro
   * Método principal para garantir integridade dos dados
   */
  async syncAllFaturamentoWithFinance(companyId) {
    try {
      console.log('🔄 Iniciando sincronização completa de faturamento com financeiro...');
      
      // 1. Buscar todas as faturas da empresa
      const { data: faturas, error: faturasError } = await supabase
        .from('faturas')
        .select(`
          *,
          venda:vendas (
            id,
            client_id,
            final_amount,
            client:contacts (
              id,
              name,
              email
            )
          )
        `)
        .eq('company_id', companyId);

      if (faturasError) throw faturasError;

      console.log(`📊 Encontradas ${faturas?.length || 0} faturas para sincronizar`);

      // 2. Para cada fatura, verificar se já existe transação financeira
      for (const fatura of faturas || []) {
        await this.syncFaturaWithFinance(fatura, companyId);
      }

      // 3. Buscar parcelas pendentes
      const { data: parcelas, error: parcelasError } = await supabase
        .from('parcelas')
        .select(`
          *,
          fatura:faturas (
            id,
            venda_id,
            customer_id,
            venda:vendas (
              client:contacts (
                id,
                name,
                email
              )
            )
          )
        `)
        .eq('company_id', companyId)
        .eq('status', 'pending');

      if (parcelasError) throw parcelasError;

      console.log(`📊 Encontradas ${parcelas?.length || 0} parcelas para sincronizar`);

      // 4. Para cada parcela, verificar se já existe transação financeira
      for (const parcela of parcelas || []) {
        await this.syncParcelaWithFinance(parcela, companyId);
      }

      console.log('✅ Sincronização completa finalizada com sucesso!');
      return { success: true, message: 'Sincronização completa realizada' };

    } catch (error) {
      console.error('❌ Erro na sincronização completa:', error);
      throw new Error(`Erro na sincronização: ${error.message}`);
    }
  }

  /**
   * Sincroniza uma fatura específica com o sistema financeiro
   */
  async syncFaturaWithFinance(fatura, companyId) {
    try {
      // Verificar se já existe transação para esta fatura
      const { data: existingTransaction, error: checkError } = await supabase
        .from('financial_transactions')
        .select('id')
        .eq('reference', fatura.id)
        .eq('company_id', companyId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      // Se já existe, pular
      if (existingTransaction) {
        console.log(`⏭️ Transação já existe para fatura ${fatura.id}`);
        return;
      }

      // Buscar conta de receitas
      const { data: revenueAccount, error: accountError } = await supabase
        .from('financial_accounts')
        .select('id')
        .eq('company_id', companyId)
        .eq('type', 'receita')
        .eq('active', true)
        .single();

      if (accountError && accountError.code !== 'PGRST116') {
        console.warn('⚠️ Conta de receitas não encontrada, criando transação sem conta específica');
      }

      // Criar transação financeira
      const transactionData = {
        account_id: revenueAccount?.id || null,
        type: 'entrada',
        amount: Math.abs(fatura.final_value),
        description: `Venda ${fatura.payment_conditions === 'a_vista' ? 'à vista' : 'à prazo'} - ${fatura.venda?.client?.name || 'Cliente'}`,
        reference: fatura.id,
        due_date: fatura.due_date || new Date().toISOString().split('T')[0],
        status: fatura.status === 'paid' ? 'pago' : 'pendente',
        payment_date: fatura.status === 'paid' ? new Date().toISOString().split('T')[0] : null,
        category: 'venda_produto',
        metadata: {
          payment_method: fatura.payment_method,
          source: 'venda',
          venda_id: fatura.venda_id,
          customer_id: fatura.customer_id,
          fatura_id: fatura.id,
          payment_conditions: fatura.payment_conditions
        },
        contact_id: fatura.venda?.client_id,
        company_id: this.convertToUUID(companyId)
      };

      const { data: newTransaction, error: insertError } = await supabase
        .from('financial_transactions')
        .insert([transactionData])
        .select()
        .single();

      if (insertError) throw insertError;

      console.log(`✅ Transação criada para fatura ${fatura.id}: R$ ${fatura.final_value}`);

    } catch (error) {
      console.error(`❌ Erro ao sincronizar fatura ${fatura.id}:`, error);
      // Não falha o processo por causa de uma fatura específica
    }
  }

  /**
   * Sincroniza uma parcela específica com o sistema financeiro
   */
  async syncParcelaWithFinance(parcela, companyId) {
    try {
      // Verificar se já existe transação para esta parcela
      const { data: existingTransaction, error: checkError } = await supabase
        .from('financial_transactions')
        .select('id')
        .eq('metadata->>parcela_id', parcela.id)
        .eq('company_id', companyId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      // Se já existe, pular
      if (existingTransaction) {
        console.log(`⏭️ Transação já existe para parcela ${parcela.id}`);
        return;
      }

      // Buscar conta de receitas
      const { data: revenueAccount, error: accountError } = await supabase
        .from('financial_accounts')
        .select('id')
        .eq('company_id', companyId)
        .eq('type', 'receita')
        .eq('active', true)
        .single();

      if (accountError && accountError.code !== 'PGRST116') {
        console.warn('⚠️ Conta de receitas não encontrada, criando transação sem conta específica');
      }

      // Criar transação financeira para a parcela
      const transactionData = {
        account_id: revenueAccount?.id || null,
        type: 'entrada',
        amount: Math.abs(parcela.value),
        description: `Parcela ${parcela.installment_number} - ${parcela.fatura?.venda?.client?.name || 'Cliente'}`,
        reference: parcela.fatura_id,
        due_date: parcela.due_date,
        status: parcela.status === 'paid' ? 'pago' : 'pendente',
        payment_date: parcela.status === 'paid' ? parcela.paid_at : null,
        category: 'venda_produto',
        metadata: {
          payment_method: parcela.payment_method || 'dinheiro',
          source: 'venda',
          venda_id: parcela.fatura?.venda_id,
          customer_id: parcela.customer_id,
          fatura_id: parcela.fatura_id,
          parcela_id: parcela.id,
          installment_number: parcela.installment_number
        },
        contact_id: parcela.customer_id,
        company_id: this.convertToUUID(companyId)
      };

      const { data: newTransaction, error: insertError } = await supabase
        .from('financial_transactions')
        .insert([transactionData])
        .select()
        .single();

      if (insertError) throw insertError;

      console.log(`✅ Transação criada para parcela ${parcela.id}: R$ ${parcela.value}`);

    } catch (error) {
      console.error(`❌ Erro ao sincronizar parcela ${parcela.id}:`, error);
      // Não falha o processo por causa de uma parcela específica
    }
  }

  /**
   * Busca transações financeiras para Contas a Receber
   * Método otimizado para performance
   */
  async getContasAReceber(companyId) {
    try {
      const { data, error } = await supabase
        .from('financial_transactions')
        .select(`
          *,
          contact:contacts (
            id,
            name,
            email,
            phone
          )
        `)
        .eq('company_id', companyId)
        .eq('type', 'entrada')
        .in('status', ['pendente', 'parcial'])
        .order('due_date', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('❌ Erro ao buscar contas a receber:', error);
      throw error;
    }
  }

  /**
   * Atualiza status de uma transação quando recebida
   */
  async marcarComoRecebido(transactionId, paymentData) {
    try {
      const { error } = await supabase
        .from('financial_transactions')
        .update({
          status: 'pago',
          payment_date: paymentData.data_pagamento || new Date().toISOString().split('T')[0],
          valor_pago: paymentData.valor_pago,
          notes: paymentData.observacoes || null
        })
        .eq('id', transactionId);

      if (error) throw error;

      console.log(`✅ Transação ${transactionId} marcada como recebida`);
      return { success: true };

    } catch (error) {
      console.error('❌ Erro ao marcar como recebido:', error);
      throw error;
    }
  }

  /**
   * Força sincronização de uma venda específica
   */
  async forceSyncVenda(vendaId, companyId) {
    try {
      console.log(`🔄 Forçando sincronização da venda ${vendaId}...`);

      // Buscar fatura da venda
      const { data: fatura, error: faturaError } = await supabase
        .from('faturas')
        .select(`
          *,
          venda:vendas (
            id,
            client_id,
            final_amount,
            client:contacts (
              id,
              name,
              email
            )
          )
        `)
        .eq('venda_id', vendaId)
        .eq('company_id', companyId)
        .single();

      if (faturaError) throw faturaError;

      // Sincronizar fatura
      await this.syncFaturaWithFinance(fatura, companyId);

      // Buscar parcelas da venda
      const { data: parcelas, error: parcelasError } = await supabase
        .from('parcelas')
        .select(`
          *,
          fatura:faturas (
            id,
            venda_id,
            customer_id,
            venda:vendas (
              client:contacts (
                id,
                name,
                email
              )
            )
          )
        `)
        .eq('venda_id', vendaId)
        .eq('company_id', companyId);

      if (parcelasError) throw parcelasError;

      // Sincronizar parcelas
      for (const parcela of parcelas || []) {
        await this.syncParcelaWithFinance(parcela, companyId);
      }

      console.log(`✅ Venda ${vendaId} sincronizada com sucesso!`);
      return { success: true };

    } catch (error) {
      console.error(`❌ Erro ao sincronizar venda ${vendaId}:`, error);
      throw error;
    }
  }

  /**
   * Verifica integridade dos dados financeiros
   */
  async verificarIntegridade(companyId) {
    try {
      console.log('🔍 Verificando integridade dos dados financeiros...');

      // Buscar faturas sem transações
      const { data: faturasSemTransacao, error: faturasError } = await supabase
        .from('faturas')
        .select('id, final_value, status')
        .eq('company_id', companyId)
        .not('id', 'in', 
          supabase
            .from('financial_transactions')
            .select('reference')
            .eq('company_id', companyId)
            .eq('type', 'entrada')
        );

      if (faturasError) throw faturasError;

      // Buscar parcelas sem transações
      const { data: parcelasSemTransacao, error: parcelasError } = await supabase
        .from('parcelas')
        .select('id, value, status')
        .eq('company_id', companyId)
        .not('id', 'in',
          supabase
            .from('financial_transactions')
            .select('metadata->>parcela_id')
            .eq('company_id', companyId)
            .eq('type', 'entrada')
        );

      if (parcelasError) throw parcelasError;

      const resultado = {
        faturasSemTransacao: faturasSemTransacao?.length || 0,
        parcelasSemTransacao: parcelasSemTransacao?.length || 0,
        totalProblemas: (faturasSemTransacao?.length || 0) + (parcelasSemTransacao?.length || 0)
      };

      console.log('📊 Resultado da verificação:', resultado);
      return resultado;

    } catch (error) {
      console.error('❌ Erro na verificação de integridade:', error);
      throw error;
    }
  }
}

export default new FinancialSyncService();

