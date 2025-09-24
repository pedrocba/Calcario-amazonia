import { supabase } from '../lib/supabaseClient';

/**
 * Serviço para gerenciar saldo das contas financeiras
 */
class AccountBalanceService {
  /**
   * Converte string para formato UUID válido
   */
  convertToUUID(idString) {
    console.log('🔧 convertToUUID - Input:', idString, 'Length:', idString?.length);
    if (!idString) return null;
    if (typeof idString !== 'string') return idString;
    
    // Se já tem hífens, retorna como está
    if (idString.includes('-')) {
      console.log('🔧 convertToUUID - Already has hyphens:', idString);
      return idString;
    }
    
    // Se tem 32 caracteres, adiciona hífens
    if (idString.length === 32) {
      const formatted = `${idString.slice(0, 8)}-${idString.slice(8, 12)}-${idString.slice(12, 16)}-${idString.slice(16, 20)}-${idString.slice(20, 32)}`;
      console.log('🔧 convertToUUID - 32 chars formatted:', formatted);
      return formatted;
    }
    
    // Se tem 24 caracteres, adiciona hífens no formato correto
    if (idString.length === 24) {
      // Para 24 caracteres, precisamos adicionar 12 caracteres para completar o UUID
      const paddedUuid = idString + '000000000000'; // Adiciona 12 zeros
      const formatted = `${paddedUuid.slice(0, 8)}-${paddedUuid.slice(8, 12)}-${paddedUuid.slice(12, 16)}-${paddedUuid.slice(16, 20)}-${paddedUuid.slice(20, 32)}`;
      console.log('🔧 convertToUUID - 24 chars formatted:', formatted);
      return formatted;
    }
    
    console.log('🔧 convertToUUID - No conversion needed:', idString);
    return idString;
  }

  /**
   * Busca saldo atual de uma conta
   */
  async getAccountBalance(accountId) {
    try {
      const { data, error } = await supabase
        .from('financial_accounts')
        .select('balance, name, type')
        .eq('id', accountId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Erro ao buscar saldo da conta:', error);
      throw error;
    }
  }

  /**
   * Atualiza saldo de uma conta após pagamento
   */
  async updateAccountBalance(accountId, amount, operation = 'debit') {
    try {
      // Buscar saldo atual
      const currentBalance = await this.getAccountBalance(accountId);
      
      if (!currentBalance) {
        throw new Error('Conta não encontrada');
      }

      // Calcular novo saldo
      let newBalance = parseFloat(currentBalance.balance);
      
      if (operation === 'debit') {
        newBalance -= Math.abs(amount); // Debitar (sair dinheiro)
      } else if (operation === 'credit') {
        newBalance += Math.abs(amount); // Creditar (entrar dinheiro)
      }

      // Atualizar saldo na conta
      const { error } = await supabase
        .from('financial_accounts')
        .update({ 
          balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('id', accountId);

      if (error) throw error;

      console.log(`✅ Saldo da conta atualizado: ${currentBalance.balance} → ${newBalance}`);
      
      return {
        previousBalance: currentBalance.balance,
        newBalance: newBalance,
        amount: Math.abs(amount),
        operation
      };
    } catch (error) {
      console.error('❌ Erro ao atualizar saldo da conta:', error);
      throw error;
    }
  }

  /**
   * Processa pagamento de conta a pagar
   */
  async processPayment(transactionId, paymentData, companyId) {
    try {
      console.log('💳 Processando pagamento:', { transactionId, paymentData });

      // 1. Buscar dados da transação
      const { data: transaction, error: transactionError } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (transactionError) throw transactionError;
      if (!transaction) throw new Error('Transação não encontrada');

      // 2. Verificar se a conta de pagamento foi especificada
      if (!paymentData.payment_account_id) {
        throw new Error('Conta de pagamento não especificada');
      }

      // 3. Verificar saldo da conta de pagamento
      const accountBalance = await this.getAccountBalance(paymentData.payment_account_id);
      const paymentAmount = Math.abs(parseFloat(paymentData.amount));
      
      console.log('💰 Saldo atual da conta:', accountBalance.balance);
      console.log('💸 Valor do pagamento:', paymentAmount);

      // 4. Atualizar status da transação
      const { error: updateError } = await supabase
        .from('financial_transactions')
        .update({
          status: 'pago',
          payment_date: paymentData.payment_date || new Date().toISOString().split('T')[0],
          valor_pago: paymentAmount,
          notes: paymentData.notes || null,
          metadata: {
            payment_method: paymentData.payment_method,
            payment_account_id: paymentData.payment_account_id,
            payment_processed_at: new Date().toISOString()
          }
        })
        .eq('id', transactionId);

      if (updateError) throw updateError;

      // 5. Atualizar saldo da conta (debitar)
      const balanceUpdate = await this.updateAccountBalance(
        paymentData.payment_account_id, 
        paymentAmount, 
        'debit'
      );

      // 6. Registrar movimento de caixa
      await this.recordCashMovement({
        account_id: paymentData.payment_account_id,
        type: 'saida',
        amount: -paymentAmount, // Negativo para saída
        description: `Pagamento: ${transaction.description}`,
        reference: transactionId,
        payment_method: paymentData.payment_method,
        company_id: companyId,
        metadata: {
          transaction_id: transactionId,
          payment_type: 'conta_a_pagar'
        }
      });

      console.log('✅ Pagamento processado com sucesso');
      
      return {
        success: true,
        transaction: transaction,
        balanceUpdate: balanceUpdate,
        message: 'Pagamento processado com sucesso!'
      };

    } catch (error) {
      console.error('❌ Erro ao processar pagamento:', error);
      throw error;
    }
  }

  /**
   * Registra movimento de caixa
   */
  async recordCashMovement(movementData) {
    try {
      const { data, error } = await supabase
        .from('financial_transactions')
        .insert([{
          account_id: this.convertToUUID(movementData.account_id),
          type: movementData.type,
          amount: movementData.amount,
          description: movementData.description,
          reference: movementData.reference,
          status: 'pago',
          payment_date: new Date().toISOString().split('T')[0],
          valor_pago: Math.abs(movementData.amount),
          category: 'movimentacao_caixa',
          notes: movementData.notes || null,
          metadata: movementData.metadata || {},
          company_id: this.convertToUUID(movementData.company_id),
          date: new Date().toISOString().split('T')[0]
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Erro ao registrar movimento de caixa:', error);
      throw error;
    }
  }

  /**
   * Busca todas as contas financeiras
   */
  async getAccounts(companyId) {
    try {
      const formattedCompanyId = this.convertToUUID(companyId);
      const { data, error } = await supabase
        .from('financial_accounts')
        .select('*')
        .eq('company_id', formattedCompanyId)
        .eq('active', true)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erro ao buscar contas:', error);
      return [];
    }
  }

  /**
   * Cria nova conta financeira
   */
  async createAccount(accountData, companyId) {
    try {
      console.log('🔧 createAccount - Input:', { accountData, companyId });
      
      const formattedCompanyId = this.convertToUUID(companyId);
      console.log('🔧 createAccount - Formatted Company ID:', formattedCompanyId);
      
      const insertData = {
        company_id: formattedCompanyId,
        name: accountData.name,
        type: accountData.type || 'caixa',
        balance: parseFloat(accountData.balance) || 0,
        description: accountData.description || null,
        active: true
      };
      
      console.log('🔧 createAccount - Insert data:', insertData);
      
      const { data, error } = await supabase
        .from('financial_accounts')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('❌ Erro do Supabase:', error);
        throw error;
      }
      
      console.log('✅ createAccount - Success:', data);
      return data;
    } catch (error) {
      console.error('❌ Erro ao criar conta:', error);
      throw error;
    }
  }

  /**
   * Atualiza conta financeira
   */
  async updateAccount(accountId, accountData) {
    try {
      const formattedAccountId = this.convertToUUID(accountId);
      const { data, error } = await supabase
        .from('financial_accounts')
        .update({
          name: accountData.name,
          type: accountData.type,
          description: accountData.description,
          active: accountData.active
        })
        .eq('id', formattedAccountId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Erro ao atualizar conta:', error);
      throw error;
    }
  }

  /**
   * Busca movimentações de uma conta
   */
  async getAccountTransactions(accountId, filters = {}) {
    try {
      const formattedAccountId = this.convertToUUID(accountId);
      let query = supabase
        .from('financial_transactions')
        .select('*')
        .eq('account_id', formattedAccountId);

      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      if (filters.date_from) {
        query = query.gte('date', filters.date_from);
      }
      if (filters.date_to) {
        query = query.lte('date', filters.date_to);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erro ao buscar movimentações:', error);
      return [];
    }
  }

  /**
   * Busca resumo financeiro da empresa
   */
  async getFinancialSummary(companyId) {
    try {
      const formattedCompanyId = this.convertToUUID(companyId);
      
      // Buscar todas as contas
      const accounts = await this.getAccounts(companyId);
      
      // Calcular totais
      const totalBalance = accounts.reduce((sum, account) => sum + parseFloat(account.balance), 0);
      const totalAccounts = accounts.length;
      const accountsWithNegativeBalance = accounts.filter(account => parseFloat(account.balance) < 0).length;

      // Buscar movimentações do mês atual
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      const { data: transactions, error: transError } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('company_id', formattedCompanyId)
        .gte('date', firstDay.toISOString().split('T')[0])
        .lte('date', lastDay.toISOString().split('T')[0])
        .eq('status', 'pago');

      if (transError) throw transError;

      const entradas = transactions
        .filter(t => t.type === 'entrada')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      const saidas = transactions
        .filter(t => t.type === 'saida')
        .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0);

      return {
        totalBalance,
        totalAccounts,
        accountsWithNegativeBalance,
        accounts,
        monthlyEntradas: entradas,
        monthlySaidas: saidas,
        monthlySaldo: entradas - saidas
      };
    } catch (error) {
      console.error('❌ Erro ao buscar resumo financeiro:', error);
      throw error;
    }
  }

  /**
   * Busca tipos de conta disponíveis
   */
  getAccountTypes() {
    return [
      { value: 'caixa', label: 'Caixa' },
      { value: 'banco', label: 'Conta Bancária' },
      { value: 'investimento', label: 'Investimento' },
      { value: 'outros', label: 'Outros' }
    ];
  }

  /**
   * Busca métodos de pagamento disponíveis
   */
  getPaymentMethods() {
    return [
      { value: 'dinheiro', label: 'Dinheiro' },
      { value: 'pix', label: 'PIX' },
      { value: 'transferencia', label: 'Transferência' },
      { value: 'cheque', label: 'Cheque' },
      { value: 'cartao_debito', label: 'Cartão de Débito' },
      { value: 'cartao_credito', label: 'Cartão de Crédito' }
    ];
  }
}

export default new AccountBalanceService();
