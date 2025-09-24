import { supabase } from '../lib/supabaseClient';

/**
 * Serviço Financeiro Profissional
 * Sistema completo de gestão financeira
 */
class FinancialService {
  constructor() {
    this.isProcessing = false;
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

  // ========================================
  // CONTAS A PAGAR
  // ========================================

  /**
   * Busca contas a pagar com filtros avançados
   */
  async getContasAPagar(companyId, filters = {}) {
    try {
      console.log('🔍 Buscando contas a pagar...');
      console.log('🏢 Company ID:', companyId);
      console.log('🔍 Filtros:', filters);

      // Primeiro, tentar buscar com company_id
      let query = supabase
        .from('financial_transactions')
        .select('*')
        .eq('type', 'saida')
        .order('created_at', { ascending: false });

      // Se companyId for fornecido, filtrar por ele
      if (companyId) {
        query = query.eq('company_id', companyId);
      }

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
      
      if (filters.contactId) {
        query = query.eq('contact_id', filters.contactId);
      }

      if (filters.search) {
        query = query.ilike('description', `%${filters.search}%`);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('❌ Erro na query:', error);
        throw error;
      }

      console.log('✅ Contas a pagar encontradas:', data?.length || 0);
      console.log('📊 Dados retornados:', data);

      // Se não encontrou nada com company_id, buscar sem filtro de company
      if ((!data || data.length === 0) && companyId) {
        console.log('🔄 Tentando buscar sem filtro de company_id...');
        
        const { data: allData, error: allError } = await supabase
          .from('financial_transactions')
          .select('*')
          .eq('type', 'saida')
          .order('created_at', { ascending: false });

        if (allError) {
          console.error('❌ Erro na query sem company_id:', allError);
          throw allError;
        }

        console.log('✅ Contas encontradas sem filtro de company:', allData?.length || 0);
        return allData || [];
      }

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
      // Criar objeto básico com apenas campos essenciais
      const transactionData = {
        type: 'saida',
        amount: -Math.abs(contaData.amount), // Sempre negativo para despesas
        description: contaData.description,
        status: 'pendente',
        company_id: this.convertToUUID(companyId),
        date: new Date().toISOString().split('T')[0] // Data atual no formato YYYY-MM-DD
      };

      // Adicionar campos opcionais apenas se existirem e forem fornecidos
      if (contaData.account_id) {
        transactionData.account_id = contaData.account_id;
      }
      
      if (contaData.reference) {
        transactionData.reference = contaData.reference;
      }
      
      if (contaData.due_date) {
        transactionData.due_date = contaData.due_date;
      }
      
      if (contaData.notes) {
        transactionData.notes = contaData.notes;
      }
      
      if (contaData.contact_id) {
        transactionData.contact_id = contaData.contact_id;
      }
      
      if (contaData.category) {
        transactionData.category = contaData.category;
      }
      
      if (contaData.created_by) {
        transactionData.created_by = contaData.created_by;
      }
      
      if (contaData.metadata) {
        transactionData.metadata = {
          source: 'manual',
          created_by: userId,
          ...contaData.metadata
        };
      }

      const { data, error } = await supabase
        .from('financial_transactions')
        .insert([transactionData])
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Conta a pagar criada:', data.id);
      return data;
    } catch (error) {
      console.error('❌ Erro ao criar conta a pagar:', error);
      throw error;
    }
  }

  /**
   * Marca conta a pagar como paga
   */
  async pagarConta(transactionId, paymentData, companyId, userId) {
    try {
      const { error } = await supabase
        .from('financial_transactions')
        .update({
          status: 'pago',
          payment_date: paymentData.payment_date || new Date().toISOString().split('T')[0],
          valor_pago: Math.abs(paymentData.amount),
          notes: paymentData.notes || null,
          metadata: {
            payment_method: paymentData.payment_method,
            payment_account: paymentData.payment_account,
            paid_by: userId
          }
        })
        .eq('id', transactionId)
        .eq('company_id', companyId);

      if (error) throw error;

      console.log('✅ Conta marcada como paga:', transactionId);
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
   * Busca contas a receber com filtros avançados
   */
  async getContasAReceber(companyId, filters = {}) {
    try {
      console.log('🔍 Buscando contas a receber para companyId:', companyId);
      console.log('🔍 Filtros aplicados:', filters);

      let query = supabase
        .from('financial_transactions')
        .select(`
          *,
          contact:contacts (
            id,
            name,
            email,
            phone
          ),
          account:financial_accounts (
            id,
            name,
            type
          )
        `)
        .eq('company_id', companyId)
        .eq('type', 'entrada')
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
      
      if (filters.contactId) {
        query = query.eq('contact_id', filters.contactId);
      }

      if (filters.search) {
        query = query.ilike('description', `%${filters.search}%`);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('❌ Erro na query:', error);
        throw error;
      }

      console.log('✅ Contas a receber encontradas:', data?.length || 0);
      console.log('📊 Dados retornados:', data);

      return data || [];
    } catch (error) {
      console.error('❌ Erro ao buscar contas a receber:', error);
      throw error;
    }
  }

  /**
   * Marca conta a receber como recebida
   */
  async receberConta(transactionId, paymentData, companyId, userId) {
    try {
      const { error } = await supabase
        .from('financial_transactions')
        .update({
          status: 'pago',
          payment_date: paymentData.payment_date || new Date().toISOString().split('T')[0],
          valor_pago: Math.abs(paymentData.amount),
          notes: paymentData.notes || null,
          metadata: {
            payment_method: paymentData.payment_method,
            payment_account: paymentData.payment_account,
            received_by: userId
          }
        })
        .eq('id', transactionId)
        .eq('company_id', companyId);

      if (error) throw error;

      console.log('✅ Conta marcada como recebida:', transactionId);
      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao receber conta:', error);
      throw error;
    }
  }

  // ========================================
  // RELATÓRIOS FINANCEIROS
  // ========================================

  /**
   * Gera relatório de fluxo de caixa
   */
  async getFluxoCaixa(companyId, periodo) {
    try {
      const { data, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('company_id', companyId)
        .gte('date', periodo.inicio)
        .lte('date', periodo.fim)
        .order('date', { ascending: true });

      if (error) throw error;

      // Processar dados para fluxo de caixa
      const fluxo = this.processarFluxoCaixa(data || []);
      return fluxo;
    } catch (error) {
      console.error('❌ Erro ao gerar fluxo de caixa:', error);
      throw error;
    }
  }

  /**
   * Processa dados para fluxo de caixa
   */
  processarFluxoCaixa(transactions) {
    const fluxo = {};
    let saldoInicial = 0;

    transactions.forEach(transaction => {
      const data = transaction.date || transaction.due_date;
      const chave = data.split('T')[0];

      if (!fluxo[chave]) {
        fluxo[chave] = {
          data: chave,
          entradas: 0,
          saidas: 0,
          saldo: 0,
          transacoes: []
        };
      }

      const valor = Math.abs(transaction.amount);
      
      if (transaction.type === 'entrada') {
        fluxo[chave].entradas += valor;
        saldoInicial += valor;
      } else {
        fluxo[chave].saidas += valor;
        saldoInicial -= valor;
      }

      fluxo[chave].saldo = saldoInicial;
      fluxo[chave].transacoes.push(transaction);
    });

    return Object.values(fluxo).sort((a, b) => new Date(a.data) - new Date(b.data));
  }

  /**
   * Gera relatório de vendas por período
   */
  async getRelatorioVendas(companyId, periodo) {
    try {
      const { data, error } = await supabase
        .from('financial_transactions')
        .select(`
          *,
          contact:contacts (name)
        `)
        .eq('company_id', companyId)
        .eq('type', 'entrada')
        .eq('category', 'venda_produto')
        .gte('date', periodo.inicio)
        .lte('date', periodo.fim)
        .order('date', { ascending: false });

      if (error) throw error;

      return this.processarRelatorioVendas(data || []);
    } catch (error) {
      console.error('❌ Erro ao gerar relatório de vendas:', error);
      throw error;
    }
  }

  /**
   * Processa dados do relatório de vendas
   */
  processarRelatorioVendas(transactions) {
    const totalVendas = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const vendasPagas = transactions.filter(t => t.status === 'pago');
    const vendasPendentes = transactions.filter(t => t.status === 'pendente');
    
    const totalPago = vendasPagas.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const totalPendente = vendasPendentes.reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return {
      totalVendas,
      totalPago,
      totalPendente,
      quantidadeVendas: transactions.length,
      vendasPagas: vendasPagas.length,
      vendasPendentes: vendasPendentes.length,
      percentualPago: totalVendas > 0 ? (totalPago / totalVendas) * 100 : 0,
      transacoes: transactions
    };
  }

  // ========================================
  // DASHBOARD FINANCEIRO
  // ========================================

  /**
   * Busca dados para dashboard financeiro
   */
  async getDashboardData(companyId, periodo) {
    try {
      const [contasAPagar, contasAReceber, fluxoCaixa] = await Promise.all([
        this.getContasAPagar(companyId, { status: 'pendente' }),
        this.getContasAReceber(companyId, { status: 'pendente' }),
        this.getFluxoCaixa(companyId, periodo)
      ]);

      const dashboard = {
        resumo: this.calcularResumoFinanceiro(contasAPagar, contasAReceber),
        contasAPagar: contasAPagar.slice(0, 5), // Últimas 5
        contasAReceber: contasAReceber.slice(0, 5), // Últimas 5
        fluxoCaixa: fluxoCaixa.slice(-30), // Últimos 30 dias
        alertas: this.gerarAlertas(contasAPagar, contasAReceber)
      };

      return dashboard;
    } catch (error) {
      console.error('❌ Erro ao buscar dados do dashboard:', error);
      throw error;
    }
  }

  /**
   * Calcula resumo financeiro
   */
  calcularResumoFinanceiro(contasAPagar, contasAReceber) {
    const totalAPagar = contasAPagar.reduce((sum, c) => sum + Math.abs(c.amount), 0);
    const totalAReceber = contasAReceber.reduce((sum, c) => sum + Math.abs(c.amount), 0);
    const saldoLiquido = totalAReceber - totalAPagar;

    return {
      totalAPagar,
      totalAReceber,
      saldoLiquido,
      quantidadeAPagar: contasAPagar.length,
      quantidadeAReceber: contasAReceber.length
    };
  }

  /**
   * Gera alertas financeiros
   */
  gerarAlertas(contasAPagar, contasAReceber) {
    const alertas = [];
    const hoje = new Date();

    // Contas a pagar vencidas
    const vencidas = contasAPagar.filter(c => 
      c.due_date && new Date(c.due_date) < hoje
    );
    
    if (vencidas.length > 0) {
      alertas.push({
        tipo: 'vencidas',
        titulo: 'Contas Vencidas',
        mensagem: `${vencidas.length} conta(s) vencida(s)`,
        cor: 'red',
        valor: vencidas.reduce((sum, c) => sum + Math.abs(c.amount), 0)
      });
    }

    // Contas próximas do vencimento (7 dias)
    const proximasVencimento = contasAPagar.filter(c => {
      if (!c.due_date) return false;
      const diasParaVencimento = Math.ceil((new Date(c.due_date) - hoje) / (1000 * 60 * 60 * 24));
      return diasParaVencimento <= 7 && diasParaVencimento >= 0;
    });

    if (proximasVencimento.length > 0) {
      alertas.push({
        tipo: 'proximas_vencimento',
        titulo: 'Próximas do Vencimento',
        mensagem: `${proximasVencimento.length} conta(s) vence(m) em 7 dias`,
        cor: 'yellow',
        valor: proximasVencimento.reduce((sum, c) => sum + Math.abs(c.amount), 0)
      });
    }

    return alertas;
  }

  // ========================================
  // CATEGORIAS E CONTAS
  // ========================================

  /**
   * Busca categorias financeiras
   */
  async getCategorias(companyId) {
    try {
      const { data, error } = await supabase
        .from('financial_categories')
        .select('*')
        .eq('company_id', companyId)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erro ao buscar categorias:', error);
      return [];
    }
  }

  /**
   * Busca contas financeiras
   */
  async getContas(companyId) {
    try {
      const { data, error } = await supabase
        .from('financial_accounts')
        .select('*')
        .eq('company_id', companyId)
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
   * Busca contatos da empresa
   */
  async getContatos(companyId) {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('id, name, email, phone, document')
        .eq('company_id', companyId)
        .eq('active', true)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erro ao buscar contatos:', error);
      return [];
    }
  }

  /**
   * Cria nova conta a receber
   */
  async createContaAReceber(contaData, companyId, userId) {
    try {
      // Criar objeto básico com apenas campos essenciais
      const transactionData = {
        type: 'entrada',
        amount: Math.abs(contaData.amount), // Sempre positivo para receitas
        description: contaData.description,
        status: 'pendente',
        company_id: this.convertToUUID(companyId),
        date: new Date().toISOString().split('T')[0] // Data atual no formato YYYY-MM-DD
      };

      // Adicionar campos opcionais apenas se existirem e forem fornecidos
      if (contaData.account_id) {
        transactionData.account_id = contaData.account_id;
      }
      
      if (contaData.reference) {
        transactionData.reference = contaData.reference;
      }
      
      if (contaData.due_date) {
        transactionData.due_date = contaData.due_date;
      }
      
      if (contaData.notes) {
        transactionData.notes = contaData.notes;
      }
      
      if (contaData.contact_id) {
        transactionData.contact_id = contaData.contact_id;
      }
      
      if (contaData.category) {
        transactionData.category = contaData.category;
      }
      
      if (contaData.created_by) {
        transactionData.created_by = contaData.created_by;
      }
      
      if (contaData.metadata) {
        transactionData.metadata = {
          source: 'manual',
          created_by: userId,
          ...contaData.metadata
        };
      }

      const { data, error } = await supabase
        .from('financial_transactions')
        .insert([transactionData])
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Conta a receber criada:', data.id);
      return data;
    } catch (error) {
      console.error('❌ Erro ao criar conta a receber:', error);
      throw error;
    }
  }

  /**
   * Atualiza status de uma transação
   */
  async updateTransactionStatus(transactionId, status, companyId) {
    try {
      const { error } = await supabase
        .from('financial_transactions')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId)
        .eq('company_id', companyId);

      if (error) throw error;

      console.log('✅ Status da transação atualizado:', transactionId);
      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao atualizar status:', error);
      throw error;
    }
  }

  /**
   * Deleta uma transação
   */
  async deleteTransaction(transactionId, companyId) {
    try {
      const { error } = await supabase
        .from('financial_transactions')
        .delete()
        .eq('id', transactionId)
        .eq('company_id', companyId);

      if (error) throw error;

      console.log('✅ Transação deletada:', transactionId);
      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao deletar transação:', error);
      throw error;
    }
  }

  /**
   * Busca transações por período
   */
  async getTransactionsByPeriod(companyId, periodo, filters = {}) {
    try {
      let query = supabase
        .from('financial_transactions')
        .select(`
          *,
          contact:contacts (
            id,
            name,
            email,
            phone
          ),
          account:financial_accounts (
            id,
            name,
            type
          )
        `)
        .eq('company_id', companyId)
        .gte('created_at', periodo.inicio)
        .lte('created_at', periodo.fim)
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('❌ Erro ao buscar transações por período:', error);
      throw error;
    }
  }
}

export default new FinancialService();
