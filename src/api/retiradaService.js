import { supabase } from '../lib/supabaseClient';

class RetiradaService {
  /**
   * Converte string para formato UUID válido
   */
  convertToUUID(idString) {
    if (!idString) return null;
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(idString)) {
      return idString;
    }
    
    if (typeof idString === 'string' && idString.length === 24) {
      const formatted = `${idString.slice(0, 8)}-${idString.slice(8, 12)}-${idString.slice(12, 16)}-${idString.slice(16, 20)}-${idString.slice(20, 24)}`;
      return uuidRegex.test(formatted) ? formatted : this.generateValidUUID(idString);
    }
    
    return idString;
  }

  generateValidUUID(idString) {
    const padded = idString.padEnd(32, '0').slice(0, 32);
    return `${padded.slice(0, 8)}-${padded.slice(8, 12)}-4${padded.slice(13, 16)}-8${padded.slice(17, 20)}-${padded.slice(20, 32)}`;
  }

  /**
   * Cria saldo de produtos após faturamento
   */
  async criarSaldoProdutos(vendaId, itensVenda, companyId, clientId) {
    try {
      const saldoProdutos = [];

      for (const item of itensVenda) {
        const saldoData = {
          venda_id: vendaId,
          cliente_id: this.convertToUUID(clientId),
          produto_id: this.convertToUUID(item.product_id),
          quantidade_total: parseFloat(item.quantity),
          quantidade_retirada: 0,
          quantidade_saldo: parseFloat(item.quantity),
          preco_unitario: parseFloat(item.unit_price),
          valor_total: parseFloat(item.total_price),
          status: 'ativo',
          company_id: this.convertToUUID(companyId)
        };

        saldoProdutos.push(saldoData);
      }

      const { data, error } = await supabase
        .from('saldo_produtos')
        .insert(saldoProdutos)
        .select();

      if (error) throw error;
      return data;

    } catch (error) {
      console.error('Erro ao criar saldo de produtos:', error);
      throw error;
    }
  }

  /**
   * Busca saldo de produtos de uma venda
   */
  async getSaldoByVenda(vendaId) {
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
          )
        `)
        .eq('venda_id', vendaId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;

    } catch (error) {
      console.error('Erro ao buscar saldo de produtos:', error);
      throw error;
    }
  }

  /**
   * Busca saldo de produtos de um cliente
   */
  async getSaldoByCliente(clienteId) {
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
        .eq('status', 'ativo')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;

    } catch (error) {
      console.error('Erro ao buscar saldo do cliente:', error);
      throw error;
    }
  }

  /**
   * Registra uma retirada de produto
   */
  async registrarRetirada(retiradaData) {
    try {
      // Verificar se há saldo suficiente
      const { data: saldo, error: saldoError } = await supabase
        .from('saldo_produtos')
        .select('quantidade_saldo, quantidade_total, quantidade_retirada')
        .eq('id', retiradaData.saldo_produto_id)
        .single();

      if (saldoError) throw saldoError;

      if (parseFloat(saldo.quantidade_saldo) < parseFloat(retiradaData.quantidade_retirada)) {
        throw new Error('Saldo insuficiente para esta retirada');
      }

      // Registrar retirada
      const { data, error } = await supabase
        .from('retiradas')
        .insert([{
          venda_id: retiradaData.venda_id,
          cliente_id: this.convertToUUID(retiradaData.cliente_id),
          saldo_produto_id: retiradaData.saldo_produto_id,
          quantidade_retirada: parseFloat(retiradaData.quantidade_retirada),
          responsavel_retirada: retiradaData.responsavel_retirada,
          observacoes: retiradaData.observacoes,
          company_id: this.convertToUUID(retiradaData.company_id)
        }])
        .select()
        .single();

      if (error) throw error;

      // O trigger vai atualizar automaticamente o saldo
      return data;

    } catch (error) {
      console.error('Erro ao registrar retirada:', error);
      throw error;
    }
  }

  /**
   * Busca histórico de retiradas de uma venda
   */
  async getRetiradasByVenda(vendaId) {
    try {
      const { data, error } = await supabase
        .from('retiradas')
        .select(`
          *,
          saldo_produto:saldo_produtos (
            produto:products (
              id,
              name,
              code,
              unit
            )
          )
        `)
        .eq('venda_id', vendaId)
        .order('data_retirada', { ascending: false });

      if (error) throw error;
      return data;

    } catch (error) {
      console.error('Erro ao buscar retiradas:', error);
      throw error;
    }
  }

  /**
   * Busca histórico de retiradas de um cliente
   */
  async getRetiradasByCliente(clienteId) {
    try {
      const { data, error } = await supabase
        .from('retiradas')
        .select(`
          *,
          saldo_produto:saldo_produtos (
            produto:products (
              id,
              name,
              code,
              unit
            )
          ),
          venda:vendas (
            id,
            date
          )
        `)
        .eq('cliente_id', clienteId)
        .order('data_retirada', { ascending: false });

      if (error) throw error;
      return data;

    } catch (error) {
      console.error('Erro ao buscar retiradas do cliente:', error);
      throw error;
    }
  }

  /**
   * Registra pagamento parcial
   */
  async registrarPagamentoParcial(pagamentoData) {
    try {
      const { data, error } = await supabase
        .from('pagamentos_parciais')
        .insert([{
          venda_id: pagamentoData.venda_id,
          fatura_id: pagamentoData.fatura_id,
          cliente_id: this.convertToUUID(pagamentoData.cliente_id),
          valor_pago: parseFloat(pagamentoData.valor_pago),
          forma_pagamento: pagamentoData.forma_pagamento,
          observacoes: pagamentoData.observacoes,
          company_id: this.convertToUUID(pagamentoData.company_id)
        }])
        .select()
        .single();

      if (error) throw error;
      return data;

    } catch (error) {
      console.error('Erro ao registrar pagamento parcial:', error);
      throw error;
    }
  }

  /**
   * Busca pagamentos parciais de uma venda
   */
  async getPagamentosParciaisByVenda(vendaId) {
    try {
      const { data, error } = await supabase
        .from('pagamentos_parciais')
        .select('*')
        .eq('venda_id', vendaId)
        .order('data_pagamento', { ascending: false });

      if (error) throw error;
      return data;

    } catch (error) {
      console.error('Erro ao buscar pagamentos parciais:', error);
      throw error;
    }
  }

  /**
   * Calcula resumo financeiro de uma venda
   */
  async getResumoFinanceiro(vendaId) {
    try {
      // Buscar dados da venda
      const { data: venda, error: vendaError } = await supabase
        .from('vendas')
        .select('final_amount, discount')
        .eq('id', vendaId)
        .single();

      if (vendaError) throw vendaError;

      // Buscar pagamentos parciais
      const pagamentos = await this.getPagamentosParciaisByVenda(vendaId);
      const totalPago = pagamentos.reduce((sum, p) => sum + parseFloat(p.valor_pago), 0);

      // Calcular saldo devedor
      const valorTotal = parseFloat(venda.final_amount) - (parseFloat(venda.discount) || 0);
      const saldoDevedor = valorTotal - totalPago;

      return {
        valorTotal,
        totalPago,
        saldoDevedor,
        pagamentos,
        percentualPago: valorTotal > 0 ? (totalPago / valorTotal) * 100 : 0
      };

    } catch (error) {
      console.error('Erro ao calcular resumo financeiro:', error);
      throw error;
    }
  }

  /**
   * Cancela uma retirada
   */
  async cancelarRetirada(retiradaId) {
    try {
      // Buscar dados da retirada
      const { data: retirada, error: retiradaError } = await supabase
        .from('retiradas')
        .select('saldo_produto_id, quantidade_retirada')
        .eq('id', retiradaId)
        .single();

      if (retiradaError) throw retiradaError;

      // Cancelar retirada
      const { error: cancelError } = await supabase
        .from('retiradas')
        .update({ 
          status: 'cancelada',
          updated_at: new Date().toISOString()
        })
        .eq('id', retiradaId);

      if (cancelError) throw cancelError;

      // Reverter quantidade retirada no saldo
      const { error: saldoError } = await supabase
        .from('saldo_produtos')
        .update({ 
          quantidade_retirada: saldo_produtos.quantidade_retirada - retirada.quantidade_retirada,
          updated_at: new Date().toISOString()
        })
        .eq('id', retirada.saldo_produto_id);

      if (saldoError) throw saldoError;

      return { success: true };

    } catch (error) {
      console.error('Erro ao cancelar retirada:', error);
      throw error;
    }
  }
}

export default new RetiradaService();
