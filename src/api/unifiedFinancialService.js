import { supabase } from '../lib/supabaseClient';

/**
 * SERVIÇO FINANCEIRO UNIFICADO E ROBUSTO
 * Sistema completo de gestão financeira profissional
 */
class UnifiedFinancialService {
  constructor() {
    this.isProcessing = false;
  }

  /**
   * Converte string para formato UUID válido
   */
  convertToUUID(idString) {
    if (!idString) return null;
    if (typeof idString !== 'string') return idString;
    
    // Se já tem hífens, retorna como está
    if (idString.includes('-')) {
      return idString;
    }
    
    // Se tem 32 caracteres, adiciona hífens
    if (idString.length === 32) {
      return `${idString.slice(0, 8)}-${idString.slice(8, 12)}-${idString.slice(12, 16)}-${idString.slice(16, 20)}-${idString.slice(20, 32)}`;
    }
    
    // Se tem 24 caracteres, adiciona hífens no formato correto
    if (idString.length === 24) {
      return `${idString.slice(0, 8)}-${idString.slice(8, 12)}-${idString.slice(12, 16)}-${idString.slice(16, 20)}-${idString.slice(20, 24)}`;
    }
    
    return idString;
  }

  // ========================================
  // DASHBOARD FINANCEIRO
  // ========================================

  /**
   * Busca dados completos do dashboard financeiro
   */
  async getDashboardData(companyId, periodo = {}) {
    try {
      console.log('📊 Carregando dados do dashboard...', { companyId, periodo });

      const companyIdFormatted = this.convertToUUID(companyId);
      
      // Buscar contas a pagar
      const { data: contasAPagar, error: errorAPagar } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('type', 'saida')
        .eq('company_id', companyIdFormatted)
        .order('created_at', { ascending: false });

      if (errorAPagar) {
        console.warn('⚠️ Erro ao buscar contas a pagar:', errorAPagar);
      }

      // Buscar contas a receber
      const { data: contasAReceber, error: errorAReceber } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('type', 'entrada')
        .eq('company_id', companyIdFormatted)
        .order('created_at', { ascending: false });

      if (errorAReceber) {
        console.warn('⚠️ Erro ao buscar contas a receber:', errorAReceber);
      }

      // Buscar contas financeiras
      const { data: contasFinanceiras, error: errorContas } = await supabase
        .from('financial_accounts')
        .select('*')
        .eq('company_id', companyIdFormatted)
        .eq('active', true);

      if (errorContas) {
        console.warn('⚠️ Erro ao buscar contas financeiras:', errorContas);
      }

      // Calcular resumo financeiro
      const resumo = this.calcularResumoFinanceiro(contasAPagar || [], contasAReceber || []);

      // Gerar alertas
      const alertas = this.gerarAlertas(contasAPagar || [], contasAReceber || []);

      // Gerar fluxo de caixa (últimos 30 dias)
      const fluxoCaixa = await this.gerarFluxoCaixa(companyIdFormatted);

      const dashboardData = {
        resumo,
        alertas,
        contasAPagar: (contasAPagar || []).slice(0, 5), // Últimas 5
        contasAReceber: (contasAReceber || []).slice(0, 5), // Últimas 5
        fluxoCaixa,
        contasFinanceiras: contasFinanceiras || []
      };

      console.log('✅ Dashboard carregado com sucesso:', dashboardData);
      return dashboardData;

    } catch (error) {
      console.error('❌ Erro ao carregar dashboard:', error);
      throw error;
    }
  }

  /**
   * Calcula resumo financeiro
   */
  calcularResumoFinanceiro(contasAPagar, contasAReceber) {
    const totalAPagar = contasAPagar
      .filter(conta => conta.status === 'pendente')
      .reduce((sum, conta) => sum + Math.abs(conta.amount), 0);

    const totalAReceber = contasAReceber
      .filter(conta => conta.status === 'pendente')
      .reduce((sum, conta) => sum + Math.abs(conta.amount), 0);

    return {
      totalAPagar,
      totalAReceber,
      saldoLiquido: totalAReceber - totalAPagar,
      quantidadeAPagar: contasAPagar.filter(conta => conta.status === 'pendente').length,
      quantidadeAReceber: contasAReceber.filter(conta => conta.status === 'pendente').length
    };
  }

  /**
   * Gera alertas financeiros
   */
  gerarAlertas(contasAPagar, contasAReceber) {
    const alertas = [];
    const hoje = new Date();

    // Contas vencidas
    const contasVencidas = contasAPagar.filter(conta => 
      conta.due_date && new Date(conta.due_date) < hoje && conta.status === 'pendente'
    );

    if (contasVencidas.length > 0) {
      const totalVencido = contasVencidas.reduce((sum, conta) => sum + Math.abs(conta.amount), 0);
      alertas.push({
        titulo: 'Contas Vencidas',
        mensagem: `${contasVencidas.length} conta(s) vencida(s)`,
        valor: totalVencido,
        cor: 'red'
      });
    }

    // Contas próximas do vencimento (7 dias)
    const proximoVencimento = new Date();
    proximoVencimento.setDate(proximoVencimento.getDate() + 7);

    const contasProximas = contasAPagar.filter(conta => 
      conta.due_date && 
      new Date(conta.due_date) <= proximoVencimento && 
      new Date(conta.due_date) >= hoje && 
      conta.status === 'pendente'
    );

    if (contasProximas.length > 0) {
      const totalProximo = contasProximas.reduce((sum, conta) => sum + Math.abs(conta.amount), 0);
      alertas.push({
        titulo: 'Vencimentos Próximos',
        mensagem: `${contasProximas.length} conta(s) vence(m) em 7 dias`,
        valor: totalProximo,
        cor: 'yellow'
      });
    }

    return alertas;
  }

  /**
   * Gera fluxo de caixa dos últimos 30 dias
   */
  async gerarFluxoCaixa(companyId) {
    try {
      const hoje = new Date();
      const trintaDiasAtras = new Date();
      trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);

      const { data: movimentacoes, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('company_id', companyId)
        .gte('date', trintaDiasAtras.toISOString().split('T')[0])
        .lte('date', hoje.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) {
        console.warn('⚠️ Erro ao buscar fluxo de caixa:', error);
        return [];
      }

      // Agrupar por data
      const fluxoPorDia = {};
      (movimentacoes || []).forEach(mov => {
        const data = mov.date;
        if (!fluxoPorDia[data]) {
          fluxoPorDia[data] = { entradas: 0, saidas: 0, saldo: 0 };
        }

        if (mov.type === 'entrada') {
          fluxoPorDia[data].entradas += Math.abs(mov.amount);
        } else {
          fluxoPorDia[data].saidas += Math.abs(mov.amount);
        }
      });

      // Converter para array e calcular saldo acumulado
      const fluxoArray = Object.entries(fluxoPorDia).map(([data, valores]) => ({
        data,
        entradas: valores.entradas,
        saidas: valores.saidas,
        saldo: valores.entradas - valores.saidas
      }));

      return fluxoArray;

    } catch (error) {
      console.error('❌ Erro ao gerar fluxo de caixa:', error);
      return [];
    }
  }

  // ========================================
  // CONTAS A PAGAR
  // ========================================

  /**
   * Busca contas a pagar com filtros
   */
  async getContasAPagar(companyId, filters = {}) {
    try {
      console.log('🔍 Buscando contas a pagar...', { companyId, filters });

      const companyIdFormatted = this.convertToUUID(companyId);
      
      let query = supabase
        .from('financial_transactions')
        .select('*')
        .eq('type', 'saida')
        .eq('company_id', companyIdFormatted)
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      
      if (filters.dateFrom) {
        query = query.gte('date', filters.dateFrom);
      }
      
      if (filters.dateTo) {
        query = query.lte('date', filters.dateTo);
      }

      if (filters.search) {
        query = query.ilike('description', `%${filters.search}%`);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('❌ Erro ao buscar contas a pagar:', error);
        throw error;
      }

      console.log('✅ Contas a pagar encontradas:', data?.length || 0);
      return data || [];

    } catch (error) {
      console.error('❌ Erro ao buscar contas a pagar:', error);
      throw error;
    }
  }

  /**
   * Cria nova conta a pagar
   */
  async createContaAPagar(contaData, companyId, userId) {
    try {
      console.log('➕ Criando conta a pagar...', { contaData, companyId });

      const companyIdFormatted = this.convertToUUID(companyId);
      const userIdFormatted = this.convertToUUID(userId);

      const transactionData = {
        type: 'saida',
        amount: -Math.abs(contaData.amount),
        description: contaData.description,
        status: 'pendente',
        company_id: companyIdFormatted,
        date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Campos opcionais
      if (contaData.account_id) transactionData.account_id = contaData.account_id;
      if (contaData.reference) transactionData.reference = contaData.reference;
      if (contaData.due_date) transactionData.due_date = contaData.due_date;
      if (contaData.notes) transactionData.notes = contaData.notes;
      if (contaData.contact_id) transactionData.contact_id = contaData.contact_id;
      if (contaData.category) transactionData.category = contaData.category;
      if (userIdFormatted) transactionData.created_by = userIdFormatted;

      const { data, error } = await supabase
        .from('financial_transactions')
        .insert([transactionData])
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao criar conta a pagar:', error);
        throw error;
      }

      console.log('✅ Conta a pagar criada com sucesso:', data);
      return data;

    } catch (error) {
      console.error('❌ Erro ao criar conta a pagar:', error);
      throw error;
    }
  }

  /**
   * Paga uma conta
   */
  async pagarConta(contaId, paymentData, companyId) {
    try {
      console.log('💳 Pagando conta...', { contaId, paymentData });

      const companyIdFormatted = this.convertToUUID(companyId);

      // Atualizar status da conta
      const { error: updateError } = await supabase
        .from('financial_transactions')
        .update({
          status: 'pago',
          payment_date: paymentData.payment_date || new Date().toISOString().split('T')[0],
          valor_pago: Math.abs(paymentData.amount),
          notes: paymentData.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', contaId)
        .eq('company_id', companyIdFormatted);

      if (updateError) {
        console.error('❌ Erro ao atualizar conta:', updateError);
        throw updateError;
      }

      // Se foi especificada uma conta de pagamento, debitar dela
      if (paymentData.payment_account_id) {
        await this.debitarConta(paymentData.payment_account_id, paymentData.amount, 'Pagamento de conta');
      }

      console.log('✅ Conta paga com sucesso');
      return { success: true };

    } catch (error) {
      console.error('❌ Erro ao pagar conta:', error);
      throw error;
    }
  }

  // ========================================
  // CONTAS A RECEBER
  // ========================================

  /**
   * Busca contas a receber com filtros
   */
  async getContasAReceber(companyId, filters = {}) {
    try {
      console.log('🔍 Buscando contas a receber...', { companyId, filters });

      const companyIdFormatted = this.convertToUUID(companyId);
      
      let query = supabase
        .from('financial_transactions')
        .select('*')
        .eq('type', 'entrada')
        .eq('company_id', companyIdFormatted)
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      
      if (filters.dateFrom) {
        query = query.gte('date', filters.dateFrom);
      }
      
      if (filters.dateTo) {
        query = query.lte('date', filters.dateTo);
      }

      if (filters.search) {
        query = query.ilike('description', `%${filters.search}%`);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('❌ Erro ao buscar contas a receber:', error);
        throw error;
      }

      console.log('✅ Contas a receber encontradas:', data?.length || 0);
      return data || [];

    } catch (error) {
      console.error('❌ Erro ao buscar contas a receber:', error);
      throw error;
    }
  }

  /**
   * Recebe uma conta
   */
  async receberConta(contaId, paymentData, companyId) {
    try {
      console.log('💰 Recebendo conta...', { contaId, paymentData });

      const companyIdFormatted = this.convertToUUID(companyId);

      // Atualizar status da conta
      const { error: updateError } = await supabase
        .from('financial_transactions')
        .update({
          status: 'pago',
          payment_date: paymentData.payment_date || new Date().toISOString().split('T')[0],
          valor_pago: Math.abs(paymentData.amount),
          notes: paymentData.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', contaId)
        .eq('company_id', companyIdFormatted);

      if (updateError) {
        console.error('❌ Erro ao atualizar conta:', updateError);
        throw updateError;
      }

      // Se foi especificada uma conta de recebimento, creditar nela
      if (paymentData.payment_account_id) {
        await this.creditarConta(paymentData.payment_account_id, paymentData.amount, 'Recebimento de conta');
      }

      console.log('✅ Conta recebida com sucesso');
      return { success: true };

    } catch (error) {
      console.error('❌ Erro ao receber conta:', error);
      throw error;
    }
  }

  // ========================================
  // CONTAS FINANCEIRAS
  // ========================================

  /**
   * Busca contas financeiras
   */
  async getContasFinanceiras(companyId) {
    try {
      console.log('🏦 Buscando contas financeiras...', { companyId });

      const companyIdFormatted = this.convertToUUID(companyId);
      
      const { data, error } = await supabase
        .from('financial_accounts')
        .select('*')
        .eq('company_id', companyIdFormatted)
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar contas financeiras:', error);
        throw error;
      }

      console.log('✅ Contas financeiras encontradas:', data?.length || 0);
      return data || [];

    } catch (error) {
      console.error('❌ Erro ao buscar contas financeiras:', error);
      throw error;
    }
  }

  /**
   * Cria nova conta financeira
   */
  async createContaFinanceira(contaData, companyId) {
    try {
      console.log('➕ Criando conta financeira...', { contaData, companyId });

      // Usar companyId como string diretamente (não converter para UUID)
      const companyIdFormatted = companyId;

      // Primeiro, verificar se a empresa existe
      const { data: empresa, error: empresaError } = await supabase
        .from('companies')
        .select('id')
        .eq('id', companyIdFormatted)
        .single();

      if (empresaError || !empresa) {
        console.log('⚠️ Empresa não encontrada, criando empresa padrão...');
        
        // Criar empresa se não existir
        const { error: createEmpresaError } = await supabase
          .from('companies')
          .insert([{
            id: companyIdFormatted,
            name: 'Empresa Principal',
            email: 'contato@empresa.com',
            phone: '(11) 99999-9999',
            address: 'Endereço da Empresa'
          }]);

        if (createEmpresaError) {
          console.error('❌ Erro ao criar empresa:', createEmpresaError);
          throw new Error('Erro ao criar empresa: ' + createEmpresaError.message);
        }
        
        console.log('✅ Empresa criada com sucesso');
      }

      const accountData = {
        company_id: companyIdFormatted,
        name: contaData.name,
        type: contaData.type,
        balance: parseFloat(contaData.balance) || 0,
        description: contaData.description || '',
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('financial_accounts')
        .insert([accountData])
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao criar conta financeira:', error);
        throw new Error('Erro ao criar conta financeira: ' + error.message);
      }

      console.log('✅ Conta financeira criada com sucesso:', data);
      return data;

    } catch (error) {
      console.error('❌ Erro ao criar conta financeira:', error);
      throw error;
    }
  }

  /**
   * Atualiza conta financeira
   */
  async updateContaFinanceira(contaId, contaData, companyId) {
    try {
      console.log('✏️ Atualizando conta financeira...', { contaId, contaData });

      const companyIdFormatted = this.convertToUUID(companyId);

      const updateData = {
        name: contaData.name,
        type: contaData.type,
        description: contaData.description || '',
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('financial_accounts')
        .update(updateData)
        .eq('id', contaId)
        .eq('company_id', companyIdFormatted)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao atualizar conta financeira:', error);
        throw error;
      }

      console.log('✅ Conta financeira atualizada com sucesso:', data);
      return data;

    } catch (error) {
      console.error('❌ Erro ao atualizar conta financeira:', error);
      throw error;
    }
  }

  // ========================================
  // MOVIMENTAÇÕES DE CONTA
  // ========================================

  /**
   * Debita valor de uma conta
   */
  async debitarConta(accountId, amount, description) {
    try {
      console.log('💸 Debitando conta...', { accountId, amount, description });

      // Buscar saldo atual
      const { data: account, error: fetchError } = await supabase
        .from('financial_accounts')
        .select('balance')
        .eq('id', accountId)
        .single();

      if (fetchError) {
        console.error('❌ Erro ao buscar conta:', fetchError);
        throw fetchError;
      }

      // Calcular novo saldo
      const newBalance = parseFloat(account.balance) - Math.abs(amount);

      // Atualizar saldo
      const { error: updateError } = await supabase
        .from('financial_accounts')
        .update({ 
          balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('id', accountId);

      if (updateError) {
        console.error('❌ Erro ao atualizar saldo:', updateError);
        throw updateError;
      }

      console.log(`✅ Conta debitada: ${account.balance} → ${newBalance}`);
      return { success: true, newBalance };

    } catch (error) {
      console.error('❌ Erro ao debitar conta:', error);
      throw error;
    }
  }

  /**
   * Credita valor em uma conta
   */
  async creditarConta(accountId, amount, description) {
    try {
      console.log('💰 Creditando conta...', { accountId, amount, description });

      // Buscar saldo atual
      const { data: account, error: fetchError } = await supabase
        .from('financial_accounts')
        .select('balance')
        .eq('id', accountId)
        .single();

      if (fetchError) {
        console.error('❌ Erro ao buscar conta:', fetchError);
        throw fetchError;
      }

      // Calcular novo saldo
      const newBalance = parseFloat(account.balance) + Math.abs(amount);

      // Atualizar saldo
      const { error: updateError } = await supabase
        .from('financial_accounts')
        .update({ 
          balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('id', accountId);

      if (updateError) {
        console.error('❌ Erro ao atualizar saldo:', updateError);
        throw updateError;
      }

      console.log(`✅ Conta creditada: ${account.balance} → ${newBalance}`);
      return { success: true, newBalance };

    } catch (error) {
      console.error('❌ Erro ao creditar conta:', error);
      throw error;
    }
  }

  // ========================================
  // CONTROLE DE CAIXA
  // ========================================

  /**
   * Abre sessão de caixa
   */
  async abrirCaixa(companyId, valorInicial) {
    try {
      console.log('🏦 Abrindo caixa...', { companyId, valorInicial });

      const companyIdFormatted = this.convertToUUID(companyId);

      const sessaoData = {
        company_id: companyIdFormatted,
        data_abertura: new Date().toISOString(),
        valor_inicial: parseFloat(valorInicial) || 0,
        status: 'aberta',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('sessoes_caixa')
        .insert([sessaoData])
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao abrir caixa:', error);
        throw error;
      }

      console.log('✅ Caixa aberto com sucesso:', data);
      return data;

    } catch (error) {
      console.error('❌ Erro ao abrir caixa:', error);
      throw error;
    }
  }

  /**
   * Fecha sessão de caixa
   */
  async fecharCaixa(sessaoId, valorFinal) {
    try {
      console.log('🔒 Fechando caixa...', { sessaoId, valorFinal });

      const { data, error } = await supabase
        .from('sessoes_caixa')
        .update({
          data_fechamento: new Date().toISOString(),
          valor_final: parseFloat(valorFinal) || 0,
          status: 'fechada',
          updated_at: new Date().toISOString()
        })
        .eq('id', sessaoId)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao fechar caixa:', error);
        throw error;
      }

      console.log('✅ Caixa fechado com sucesso:', data);
      return data;

    } catch (error) {
      console.error('❌ Erro ao fechar caixa:', error);
      throw error;
    }
  }

  /**
   * Busca sessões de caixa
   */
  async getSessoesCaixa(companyId) {
    try {
      console.log('📋 Buscando sessões de caixa...', { companyId });

      const companyIdFormatted = this.convertToUUID(companyId);
      
      const { data, error } = await supabase
        .from('sessoes_caixa')
        .select('*')
        .eq('company_id', companyIdFormatted)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar sessões de caixa:', error);
        throw error;
      }

      console.log('✅ Sessões de caixa encontradas:', data?.length || 0);
      return data || [];

    } catch (error) {
      console.error('❌ Erro ao buscar sessões de caixa:', error);
      throw error;
    }
  }

  // ========================================
  // DIAGNÓSTICO DO SISTEMA
  // ========================================

  /**
   * Executa diagnóstico completo do sistema financeiro
   */
  async diagnosticarSistema(companyId) {
    try {
      console.log('🔍 Executando diagnóstico do sistema financeiro...');

      const companyIdFormatted = this.convertToUUID(companyId);
      const diagnosticos = [];

      // 1. Verificar tabelas essenciais
      const tabelas = ['financial_transactions', 'financial_accounts', 'sessoes_caixa', 'companies'];
      
      for (const tabela of tabelas) {
        try {
          const { data, error } = await supabase
            .from(tabela)
            .select('id')
            .limit(1);
          
          if (error) {
            diagnosticos.push({
              tipo: 'erro',
              modulo: 'Banco de Dados',
              mensagem: `Tabela ${tabela} não acessível: ${error.message}`,
              solucao: `Verificar se a tabela ${tabela} existe e tem as permissões corretas`
            });
          } else {
            diagnosticos.push({
              tipo: 'sucesso',
              modulo: 'Banco de Dados',
              mensagem: `Tabela ${tabela} acessível`,
              solucao: null
            });
          }
        } catch (err) {
          diagnosticos.push({
            tipo: 'erro',
            modulo: 'Banco de Dados',
            mensagem: `Erro ao acessar tabela ${tabela}: ${err.message}`,
            solucao: `Verificar conexão com o banco de dados`
          });
        }
      }

      // 2. Verificar dados da empresa
      try {
        const { data: empresa, error } = await supabase
          .from('companies')
          .select('*')
          .eq('id', companyIdFormatted)
          .single();

        if (error || !empresa) {
          diagnosticos.push({
            tipo: 'erro',
            modulo: 'Empresa',
            mensagem: `Empresa não encontrada: ${error?.message || 'ID inválido'}`,
            solucao: 'Verificar se a empresa existe no banco de dados'
          });
        } else {
          diagnosticos.push({
            tipo: 'sucesso',
            modulo: 'Empresa',
            mensagem: `Empresa encontrada: ${empresa.name}`,
            solucao: null
          });
        }
      } catch (err) {
        diagnosticos.push({
          tipo: 'erro',
          modulo: 'Empresa',
          mensagem: `Erro ao buscar empresa: ${err.message}`,
          solucao: 'Verificar conexão com o banco de dados'
        });
      }

      // 3. Verificar contas financeiras
      try {
        const contas = await this.getContasFinanceiras(companyId);
        diagnosticos.push({
          tipo: 'info',
          modulo: 'Contas Financeiras',
          mensagem: `${contas.length} conta(s) financeira(s) encontrada(s)`,
          solucao: contas.length === 0 ? 'Criar pelo menos uma conta financeira' : null
        });
      } catch (err) {
        diagnosticos.push({
          tipo: 'erro',
          modulo: 'Contas Financeiras',
          mensagem: `Erro ao buscar contas: ${err.message}`,
          solucao: 'Verificar permissões da tabela financial_accounts'
        });
      }

      // 4. Verificar transações financeiras
      try {
        const contasAPagar = await this.getContasAPagar(companyId);
        const contasAReceber = await this.getContasAReceber(companyId);
        
        diagnosticos.push({
          tipo: 'info',
          modulo: 'Transações',
          mensagem: `${contasAPagar.length} conta(s) a pagar, ${contasAReceber.length} conta(s) a receber`,
          solucao: null
        });
      } catch (err) {
        diagnosticos.push({
          tipo: 'erro',
          modulo: 'Transações',
          mensagem: `Erro ao buscar transações: ${err.message}`,
          solucao: 'Verificar permissões da tabela financial_transactions'
        });
      }

      console.log('✅ Diagnóstico concluído:', diagnosticos);
      return diagnosticos;

    } catch (error) {
      console.error('❌ Erro no diagnóstico:', error);
      return [{
        tipo: 'erro',
        modulo: 'Sistema',
        mensagem: `Erro geral no diagnóstico: ${error.message}`,
        solucao: 'Verificar logs do console para mais detalhes'
      }];
    }
  }
}

export default new UnifiedFinancialService();
