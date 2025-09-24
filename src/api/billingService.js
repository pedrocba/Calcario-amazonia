import { supabase } from '../lib/supabaseClient';
import retiradaService from './retiradaService';
import financialIntegrationService from './financialIntegrationService';
import financialSyncService from './financialSyncService';

class BillingService {
  /**
   * Converte string para formato UUID válido
   * @param {string} idString - String que deve ser convertida para UUID
   * @returns {string} UUID válido
   */
  convertToUUID(idString) {
    if (!idString) return null;
    
    // Se já é um UUID válido, retorna
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(idString)) {
      return idString;
    }
    
    // Se é uma string de 24 caracteres sem hífens, converte para UUID
    if (typeof idString === 'string' && idString.length === 24) {
      // Formato correto: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
      const formatted = `${idString.slice(0, 8)}-${idString.slice(8, 12)}-${idString.slice(12, 16)}-${idString.slice(16, 20)}-${idString.slice(20, 24)}`;
      console.log(`🔄 Convertendo ID: "${idString}" → "${formatted}"`);
      
      // Verificar se o UUID convertido é válido
      if (uuidRegex.test(formatted)) {
        return formatted;
      } else {
        console.warn(`⚠️  UUID convertido não é válido: "${formatted}"`);
        // Tentar gerar um UUID válido a partir da string
        return this.generateValidUUID(idString);
      }
    }
    
    // Se não conseguiu converter, retorna o valor original
    console.warn(`⚠️  Não foi possível converter para UUID: "${idString}"`);
    return idString;
  }

  /**
   * Gera um UUID válido a partir de uma string
   * @param {string} idString - String base para gerar UUID
   * @returns {string} UUID válido
   */
  generateValidUUID(idString) {
    // Usar a string como base para gerar um UUID válido
    const padded = idString.padEnd(32, '0').slice(0, 32);
    const formatted = `${padded.slice(0, 8)}-${padded.slice(8, 12)}-4${padded.slice(13, 16)}-8${padded.slice(17, 20)}-${padded.slice(20, 32)}`;
    console.log(`🔧 Gerando UUID válido: "${idString}" → "${formatted}"`);
    return formatted;
  }

  /**
   * Verifica se as tabelas de faturamento existem e as cria se necessário
   */
  async ensureBillingTables() {
    try {
      // Verificar se a tabela faturas existe
      const { error: faturasError } = await supabase
        .from('faturas')
        .select('id')
        .limit(1);

      if (faturasError && faturasError.code === 'PGRST116') {
        console.log('📋 Criando tabelas de faturamento...');
        await this.createBillingTables();
      }
    } catch (error) {
      console.error('Erro ao verificar tabelas:', error);
    }
  }

  /**
   * Cria as tabelas de faturamento
   */
  async createBillingTables() {
    const createTablesSQL = `
      -- Tabela de Faturas
      CREATE TABLE IF NOT EXISTS faturas (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        venda_id UUID NOT NULL REFERENCES vendas(id) ON DELETE CASCADE,
        customer_id UUID NOT NULL,
        total_value DECIMAL(10,2) NOT NULL DEFAULT 0,
        discount DECIMAL(10,2) NOT NULL DEFAULT 0,
        additional_charges DECIMAL(10,2) NOT NULL DEFAULT 0,
        final_value DECIMAL(10,2) NOT NULL DEFAULT 0,
        payment_method VARCHAR(50) NOT NULL,
        payment_conditions VARCHAR(20) NOT NULL CHECK (payment_conditions IN ('a_vista', 'a_prazo')),
        due_date DATE,
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
        notes TEXT,
        company_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Tabela de Parcelas
      CREATE TABLE IF NOT EXISTS parcelas (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        fatura_id UUID NOT NULL REFERENCES faturas(id) ON DELETE CASCADE,
        venda_id UUID NOT NULL REFERENCES vendas(id) ON DELETE CASCADE,
        customer_id UUID NOT NULL,
        installment_number INTEGER NOT NULL,
        due_date DATE NOT NULL,
        value DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
        payment_method VARCHAR(50),
        paid_at TIMESTAMP WITH TIME ZONE,
        paid_value DECIMAL(10,2),
        company_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Índices
      CREATE INDEX IF NOT EXISTS idx_faturas_venda_id ON faturas(venda_id);
      CREATE INDEX IF NOT EXISTS idx_faturas_customer_id ON faturas(customer_id);
      CREATE INDEX IF NOT EXISTS idx_faturas_status ON faturas(status);
      CREATE INDEX IF NOT EXISTS idx_parcelas_fatura_id ON parcelas(fatura_id);
      CREATE INDEX IF NOT EXISTS idx_parcelas_due_date ON parcelas(due_date);
      CREATE INDEX IF NOT EXISTS idx_parcelas_status ON parcelas(status);

      -- RLS
      ALTER TABLE faturas ENABLE ROW LEVEL SECURITY;
      ALTER TABLE parcelas ENABLE ROW LEVEL SECURITY;
    `;

    // Executar SQL via RPC (se disponível) ou mostrar instruções
    console.log('⚠️  Execute o SQL abaixo no Supabase Dashboard > SQL Editor:');
    console.log(createTablesSQL);
    
    // Tentar executar via RPC
    try {
      const { error } = await supabase.rpc('exec', { sql: createTablesSQL });
      if (error) {
        console.log('❌ Não foi possível executar automaticamente. Execute manualmente no Supabase Dashboard.');
      } else {
        console.log('✅ Tabelas criadas automaticamente!');
      }
    } catch (error) {
      console.log('❌ Execute o SQL manualmente no Supabase Dashboard > SQL Editor');
    }
  }

  /**
   * Processa o faturamento de uma venda
   * @param {string} vendaId - ID da venda
   * @param {Object} billingData - Dados do faturamento
   * @returns {Promise<Object>} Resultado do faturamento
   */
  async processBilling(vendaId, billingData) {
    try {
      // Verificar e criar tabelas se necessário
      await this.ensureBillingTables();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.company_id) throw new Error('Empresa não encontrada');

      // Converter company_id para formato UUID se necessário
      const companyId = this.convertToUUID(profile.company_id);
      console.log('🏢 Company ID encontrado:', profile.company_id, 'Convertido para:', companyId);

      // Buscar dados da venda
      const { data: venda, error: vendaError } = await supabase
        .from('vendas')
        .select(`
          *,
          client:contacts!client_id (
            id,
            name,
            email,
            phone,
            document
          )
        `)
        .eq('id', vendaId)
        .single();

      console.log('📊 Dados da venda encontrados:', {
        id: venda?.id,
        client_id: venda?.client_id,
        status: venda?.status,
        final_amount: venda?.final_amount,
        client: venda?.client
      });

      if (vendaError) throw vendaError;
      if (!venda) throw new Error('Venda não encontrada');

      // Verificar se a venda pode ser faturada
      console.log('🔍 Status da venda:', venda.status, 'Tipo:', typeof venda.status);
      
      // Permitir faturamento se a venda estiver pendente ou concluída (para refaturamento)
      const statusPermitidos = ['pendente', 'Pendente', 'concluida', 'Concluida'];
      if (venda.status && !statusPermitidos.includes(venda.status)) {
        console.log('❌ Venda não pode ser faturada. Status atual:', venda.status);
        throw new Error(`Esta venda não pode ser faturada. Status atual: ${venda.status}`);
      }

      // Validar se tem cliente associado
      if (!venda.client_id) {
        throw new Error('Venda não possui cliente associado. Não é possível faturar.');
      }

      console.log('👤 Cliente da venda:', venda.client_id, 'Tipo:', typeof venda.client_id);
      const totalValue = venda.final_amount + (parseFloat(billingData.additional_charges) || 0);

      // Criar fatura
      const faturaData = {
        venda_id: vendaId,
        customer_id: this.convertToUUID(venda.client_id),
        total_value: venda.final_amount,
        discount: venda.discount || 0,
        additional_charges: parseFloat(billingData.additional_charges) || 0,
        final_value: totalValue,
        payment_method: billingData.payment_method,
        payment_conditions: billingData.payment_conditions,
        due_date: billingData.payment_conditions === 'a_prazo' 
          ? this.calculateDueDate(billingData.installments) 
          : null,
        status: billingData.payment_conditions === 'a_vista' ? 'paid' : 'pending',
        notes: billingData.notes || '',
        company_id: companyId
      };

      const { data: fatura, error: faturaError } = await supabase
        .from('faturas')
        .insert([faturaData])
        .select()
        .single();

      if (faturaError) throw faturaError;

      // Criar parcelas se for à prazo
      let parcelas = [];
      if (billingData.payment_conditions === 'a_prazo' && billingData.installments > 1) {
        const entrada = parseFloat(billingData.entrada) || 0;
        const valorRestante = totalValue - entrada;
        const numInstallments = parseInt(billingData.installments) || 1;
        
        if (valorRestante > 0 && numInstallments > 0) {
          parcelas = await this.createInstallments(fatura.id, vendaId, venda.client_id, valorRestante, numInstallments, companyId);
        }
      }

      // Atualizar status da venda baseado no tipo de pagamento
      // Usar valores que são permitidos pela constraint atual
      const newStatus = billingData.payment_conditions === 'a_vista' ? 'concluida' : 'concluida';
      const { error: updateError } = await supabase
        .from('vendas')
        .update({ 
          status: newStatus,
          payment_method: billingData.payment_method,
          updated_at: new Date().toISOString()
        })
        .eq('id', vendaId);

      if (updateError) throw updateError;

      // Registrar movimentação financeira se for à vista ou se houver entrada
      if (billingData.payment_conditions === 'a_vista') {
        await this.recordFinancialTransaction(fatura.id, totalValue, billingData.payment_method, companyId, user.id);
      } else if (billingData.payment_conditions === 'a_prazo' && billingData.entrada > 0) {
        // Registrar entrada como pagamento parcial
        await this.recordFinancialTransaction(fatura.id, billingData.entrada, billingData.payment_method, companyId, user.id);
        
        // Registrar pagamento parcial
        await retiradaService.registrarPagamentoParcial({
          venda_id: vendaId,
          fatura_id: fatura.id,
          cliente_id: venda.client_id,
          valor_pago: billingData.entrada,
          forma_pagamento: billingData.payment_method,
          observacoes: 'Entrada do pagamento à prazo',
          company_id: companyId
        });
      }

      // Criar saldo de produtos para retirada
      const itensVenda = await this.getItensVenda(vendaId);
      if (itensVenda && itensVenda.length > 0) {
        await retiradaService.criarSaldoProdutos(vendaId, itensVenda, companyId, venda.client_id);
      }

      // Integrar com sistema financeiro usando serviço profissional
      try {
        // Sincronizar fatura com sistema financeiro
        await financialSyncService.syncFaturaWithFinance(fatura, companyId);
        
        // Sincronizar parcelas com sistema financeiro
        for (const parcela of parcelas || []) {
          await financialSyncService.syncParcelaWithFinance(parcela, companyId);
        }
        
        console.log('✅ Transações financeiras sincronizadas com sucesso');
      } catch (financeError) {
        console.warn('⚠️ Erro ao sincronizar transações financeiras (não crítico):', financeError);
        // Não falha o faturamento por causa disso
      }

      return {
        success: true,
        fatura,
        parcelas,
        vendaStatus: newStatus,
        message: billingData.payment_conditions === 'a_vista' 
          ? 'Venda faturada e concluída com sucesso!'
          : `Venda faturada com ${billingData.installments} parcelas!`
      };

    } catch (error) {
      console.error('Erro ao processar faturamento:', error);
      throw new Error(`Erro ao processar faturamento: ${error.message}`);
    }
  }

  /**
   * Cria parcelas para pagamento à prazo
   */
  async createInstallments(faturaId, vendaId, customerId, totalValue, numInstallments, companyId) {
    const validInstallments = parseInt(numInstallments) || 1;
    const validTotalValue = parseFloat(totalValue) || 0;
    
    if (validInstallments <= 0 || validTotalValue <= 0) {
      console.warn('Parâmetros inválidos para criação de parcelas:', { numInstallments, totalValue });
      return [];
    }

    const installmentValue = validTotalValue / validInstallments;
    const today = new Date();
    const parcelas = [];

    for (let i = 0; i < validInstallments; i++) {
      const dueDate = new Date(today);
      dueDate.setMonth(dueDate.getMonth() + i);

      parcelas.push({
        fatura_id: faturaId,
        venda_id: vendaId,
        customer_id: this.convertToUUID(customerId),
        installment_number: i + 1,
        due_date: dueDate.toISOString().split('T')[0],
        value: installmentValue,
        status: 'pending',
        company_id: companyId
      });
    }

    const { data, error } = await supabase
      .from('parcelas')
      .insert(parcelas)
      .select();

    if (error) throw error;
    return data;
  }

  /**
   * Calcula data de vencimento para pagamento à prazo
   */
  calculateDueDate(installments) {
    const today = new Date();
    const dueDate = new Date(today);
    const numInstallments = parseInt(installments) || 1;
    dueDate.setMonth(dueDate.getMonth() + (numInstallments - 1));
    return dueDate.toISOString().split('T')[0];
  }

  /**
   * Registra transação financeira para pagamento à vista
   */
  async recordFinancialTransaction(faturaId, amount, paymentMethod, companyId, userId) {
    try {
      // Buscar conta de receitas
      const { data: revenueAccount, error: accountError } = await supabase
        .from('financial_accounts')
        .select('id')
        .eq('company_id', companyId)
        .eq('type', 'receita')
        .eq('active', true)
        .single();

      if (accountError || !revenueAccount) {
        console.warn('Conta de receitas não encontrada, pulando registro financeiro');
        return;
      }

      const transactionData = {
        account_id: revenueAccount.id,
        type: 'entrada',
        amount: amount,
        description: `Receita de venda - Fatura ${faturaId}`,
        reference: faturaId,
        date: new Date().toISOString().split('T')[0],
        status: 'confirmado',
        metadata: {
          payment_method: paymentMethod,
          source: 'venda'
        },
        company_id: companyId,
        created_by: userId
      };

      const { error } = await supabase
        .from('financial_transactions')
        .insert([transactionData]);

      if (error) throw error;

    } catch (error) {
      console.error('Erro ao registrar transação financeira:', error);
      // Não falha o faturamento por causa disso
    }
  }

  /**
   * Busca faturas de uma venda
   */
  async getBillingBySale(vendaId) {
    try {
      const { data, error } = await supabase
        .from('faturas')
        .select(`
          *,
          parcelas (
            id,
            installment_number,
            due_date,
            value,
            status,
            paid_at,
            paid_value
          )
        `)
        .eq('venda_id', vendaId);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar faturamento:', error);
      throw error;
    }
  }

  /**
   * Cancela uma fatura
   */
  async cancelBilling(faturaId) {
    try {
      const { error } = await supabase
        .from('faturas')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', faturaId);

      if (error) throw error;

      // Cancelar parcelas pendentes
      await supabase
        .from('parcelas')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('fatura_id', faturaId)
        .eq('status', 'pending');

      // Atualizar status da venda para cancelada
      await this.syncVendaStatus(faturaId);

      return { success: true };
    } catch (error) {
      console.error('Erro ao cancelar fatura:', error);
      throw error;
    }
  }

  /**
   * Sincroniza o status da venda com o status da fatura
   */
  async syncVendaStatus(faturaId) {
    try {
      // Buscar a fatura
      const { data: fatura, error: faturaError } = await supabase
        .from('faturas')
        .select('venda_id, status, payment_conditions')
        .eq('id', faturaId)
        .single();

      if (faturaError || !fatura) {
        console.warn('Fatura não encontrada para sincronização');
        return;
      }

      // Determinar o status da venda baseado no status da fatura
      let vendaStatus;
      switch (fatura.status) {
        case 'paid':
          vendaStatus = 'pago';
          break;
        case 'pending':
          vendaStatus = 'faturada';
          break;
        case 'cancelled':
          vendaStatus = 'cancelada';
          break;
        case 'overdue':
          vendaStatus = 'faturada'; // Mantém como faturada mesmo vencida
          break;
        default:
          vendaStatus = 'faturada';
      }

      // Atualizar status da venda
      const { error: updateError } = await supabase
        .from('vendas')
        .update({ 
          status: vendaStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', fatura.venda_id);

      if (updateError) {
        console.error('Erro ao sincronizar status da venda:', updateError);
      } else {
        console.log(`✅ Status da venda ${fatura.venda_id} sincronizado para: ${vendaStatus}`);
      }

    } catch (error) {
      console.error('Erro ao sincronizar status da venda:', error);
    }
  }

  /**
   * Atualiza o status de uma fatura e sincroniza com a venda
   */
  async updateFaturaStatus(faturaId, newStatus) {
    try {
      // Atualizar status da fatura
      const { error: faturaError } = await supabase
        .from('faturas')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', faturaId);

      if (faturaError) throw faturaError;

      // Sincronizar status da venda
      await this.syncVendaStatus(faturaId);

      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar status da fatura:', error);
      throw error;
    }
  }

  /**
   * Busca itens de uma venda
   */
  async getItensVenda(vendaId) {
    try {
      const { data, error } = await supabase
        .from('itens_venda')
        .select(`
          *,
          product:products (
            id,
            name,
            code,
            unit
          )
        `)
        .eq('venda_id', vendaId);

      if (error) throw error;
      return data;

    } catch (error) {
      console.error('Erro ao buscar itens da venda:', error);
      throw error;
    }
  }
}

export default new BillingService();
