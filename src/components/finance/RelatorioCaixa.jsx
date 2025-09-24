import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  DollarSign,
  PieChart
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';

export default function RelatorioCaixa({ companyId, accounts }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    date_from: new Date().toISOString().split('T')[0],
    date_to: new Date().toISOString().split('T')[0],
    account_id: '',
    type: ''
  });
  const [relatorio, setRelatorio] = useState({
    resumo: {
      total_entradas: 0,
      total_saidas: 0,
      saldo_periodo: 0,
      total_movimentacoes: 0
    },
    por_conta: [],
    por_dia: [],
    por_tipo: []
  });

  useEffect(() => {
    loadRelatorio();
  }, [companyId, filtros]);

  const loadRelatorio = async () => {
    setLoading(true);
    try {
      // Buscar movimentações do período
      let query = supabase
        .from('financial_transactions')
        .select(`
          *,
          account:financial_accounts (
            id,
            name,
            type
          )
        `)
        .eq('company_id', companyId)
        .gte('date', filtros.date_from)
        .lte('date', filtros.date_to);

      if (filtros.account_id) {
        query = query.eq('account_id', filtros.account_id);
      }

      if (filtros.type) {
        query = query.eq('type', filtros.type);
      }

      const { data: movimentacoes, error } = await query;
      if (error) throw error;

      // Processar dados do relatório
      const resumo = calcularResumo(movimentacoes || []);
      const porConta = calcularPorConta(movimentacoes || []);
      const porDia = calcularPorDia(movimentacoes || []);
      const porTipo = calcularPorTipo(movimentacoes || []);

      setRelatorio({
        resumo,
        por_conta: porConta,
        por_dia: porDia,
        por_tipo: porTipo
      });

    } catch (err) {
      console.error('Erro ao carregar relatório:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calcularResumo = (movimentacoes) => {
    const entradas = movimentacoes
      .filter(m => m.type === 'entrada')
      .reduce((sum, m) => sum + Math.abs(parseFloat(m.amount)), 0);
    
    const saidas = movimentacoes
      .filter(m => m.type === 'saida')
      .reduce((sum, m) => sum + Math.abs(parseFloat(m.amount)), 0);

    return {
      total_entradas: entradas,
      total_saidas: saidas,
      saldo_periodo: entradas - saidas,
      total_movimentacoes: movimentacoes.length
    };
  };

  const calcularPorConta = (movimentacoes) => {
    const contasMap = new Map();
    
    movimentacoes.forEach(mov => {
      const accountId = mov.account_id;
      const accountName = mov.account?.name || 'Conta não encontrada';
      
      if (!contasMap.has(accountId)) {
        contasMap.set(accountId, {
          id: accountId,
          name: accountName,
          entradas: 0,
          saidas: 0,
          saldo: 0
        });
      }
      
      const conta = contasMap.get(accountId);
      if (mov.type === 'entrada') {
        conta.entradas += Math.abs(parseFloat(mov.amount));
      } else {
        conta.saidas += Math.abs(parseFloat(mov.amount));
      }
      conta.saldo = conta.entradas - conta.saidas;
    });
    
    return Array.from(contasMap.values());
  };

  const calcularPorDia = (movimentacoes) => {
    const diasMap = new Map();
    
    movimentacoes.forEach(mov => {
      const data = mov.date;
      
      if (!diasMap.has(data)) {
        diasMap.set(data, {
          data,
          entradas: 0,
          saidas: 0,
          saldo: 0
        });
      }
      
      const dia = diasMap.get(data);
      if (mov.type === 'entrada') {
        dia.entradas += Math.abs(parseFloat(mov.amount));
      } else {
        dia.saidas += Math.abs(parseFloat(mov.amount));
      }
      dia.saldo = dia.entradas - dia.saidas;
    });
    
    return Array.from(diasMap.values()).sort((a, b) => new Date(a.data) - new Date(b.data));
  };

  const calcularPorTipo = (movimentacoes) => {
    const tiposMap = new Map();
    
    movimentacoes.forEach(mov => {
      const tipo = mov.category || 'outros';
      
      if (!tiposMap.has(tipo)) {
        tiposMap.set(tipo, {
          tipo,
          entradas: 0,
          saidas: 0,
          total: 0
        });
      }
      
      const tipoData = tiposMap.get(tipo);
      if (mov.type === 'entrada') {
        tipoData.entradas += Math.abs(parseFloat(mov.amount));
      } else {
        tipoData.saidas += Math.abs(parseFloat(mov.amount));
      }
      tipoData.total = tipoData.entradas + tipoData.saidas;
    });
    
    return Array.from(tiposMap.values()).sort((a, b) => b.total - a.total);
  };

  const exportarRelatorio = () => {
    // Implementar exportação para Excel/PDF
    console.log('Exportando relatório...');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Gerando relatório...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label>Data Início</Label>
              <Input
                type="date"
                value={filtros.date_from}
                onChange={(e) => setFiltros(prev => ({ ...prev, date_from: e.target.value }))}
              />
            </div>
            <div>
              <Label>Data Fim</Label>
              <Input
                type="date"
                value={filtros.date_to}
                onChange={(e) => setFiltros(prev => ({ ...prev, date_to: e.target.value }))}
              />
            </div>
            <div>
              <Label>Conta</Label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={filtros.account_id}
                onChange={(e) => setFiltros(prev => ({ ...prev, account_id: e.target.value }))}
              >
                <option value="">Todas</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Tipo</Label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={filtros.type}
                onChange={(e) => setFiltros(prev => ({ ...prev, type: e.target.value }))}
              >
                <option value="">Todos</option>
                <option value="entrada">Entrada</option>
                <option value="saida">Saída</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={loadRelatorio} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Entradas</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(relatorio.resumo.total_entradas)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Saídas</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(relatorio.resumo.total_saidas)}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Saldo do Período</p>
                <p className={`text-2xl font-bold ${
                  relatorio.resumo.saldo_periodo >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(relatorio.resumo.saldo_periodo)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Movimentações</p>
                <p className="text-2xl font-bold text-blue-600">
                  {relatorio.resumo.total_movimentacoes}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Relatórios Detalhados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Por Conta */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Movimentações por Conta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {relatorio.por_conta.map((conta) => (
                <div key={conta.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{conta.name}</h4>
                    <span className={`text-lg font-bold ${
                      conta.saldo >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(conta.saldo)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Entradas:</p>
                      <p className="font-medium text-green-600">
                        {formatCurrency(conta.entradas)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Saídas:</p>
                      <p className="font-medium text-red-600">
                        {formatCurrency(conta.saidas)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Por Dia */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Movimentações por Dia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {relatorio.por_dia.map((dia) => (
                <div key={dia.data} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">
                      {new Date(dia.data).toLocaleDateString('pt-BR')}
                    </h4>
                    <span className={`font-bold ${
                      dia.saldo >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(dia.saldo)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Entradas:</p>
                      <p className="font-medium text-green-600">
                        {formatCurrency(dia.entradas)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Saídas:</p>
                      <p className="font-medium text-red-600">
                        {formatCurrency(dia.saidas)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Por Tipo/Categoria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Movimentações por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatorio.por_tipo.map((tipo) => (
              <div key={tipo.tipo} className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2 capitalize">{tipo.tipo}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-medium">
                      {formatCurrency(tipo.total)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Entradas:</span>
                    <span className="text-green-600">
                      {formatCurrency(tipo.entradas)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Saídas:</span>
                    <span className="text-red-600">
                      {formatCurrency(tipo.saidas)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Botão de Exportação */}
      <div className="flex justify-end">
        <Button onClick={exportarRelatorio}>
          <Download className="w-4 h-4 mr-2" />
          Exportar Relatório
        </Button>
      </div>
    </div>
  );
}

