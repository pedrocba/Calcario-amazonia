import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Calendar,
  CreditCard,
  Wallet,
  BarChart3,
  PieChart,
  FileText,
  RefreshCw
} from 'lucide-react';
import unifiedFinancialService from '@/api/unifiedFinancialService';

export default function FinancialDashboard({ companyId }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [periodo, setPeriodo] = useState({
    inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    fim: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (companyId) {
      loadDashboardData();
    }
  }, [companyId, periodo]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await unifiedFinancialService.getDashboardData(companyId, periodo);
      setDashboardData(data);
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pago':
        return 'bg-green-100 text-green-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pago':
        return 'Pago';
      case 'pendente':
        return 'Pendente';
      case 'overdue':
        return 'Vencido';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 mb-4">Erro ao carregar dados: {error}</p>
        <Button onClick={loadDashboardData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar Novamente
        </Button>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nenhum dado financeiro encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total a Receber</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(dashboardData.resumo.totalAReceber)}
                </p>
                <p className="text-xs text-gray-500">
                  {dashboardData.resumo.quantidadeAReceber} conta(s)
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total a Pagar</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(dashboardData.resumo.totalAPagar)}
                </p>
                <p className="text-xs text-gray-500">
                  {dashboardData.resumo.quantidadeAPagar} conta(s)
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Saldo Líquido</p>
                <p className={`text-2xl font-bold ${
                  dashboardData.resumo.saldoLiquido >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(dashboardData.resumo.saldoLiquido)}
                </p>
                <p className="text-xs text-gray-500">
                  {dashboardData.resumo.saldoLiquido >= 0 ? 'Positivo' : 'Negativo'}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alertas</p>
                <p className="text-2xl font-bold text-orange-600">
                  {dashboardData.alertas.length}
                </p>
                <p className="text-xs text-gray-500">
                  Atenção necessária
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {dashboardData.alertas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Alertas Financeiros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.alertas.map((alerta, index) => (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${
                  alerta.cor === 'red' ? 'border-red-500 bg-red-50' :
                  alerta.cor === 'yellow' ? 'border-yellow-500 bg-yellow-50' :
                  'border-blue-500 bg-blue-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{alerta.titulo}</h4>
                      <p className="text-sm text-gray-600">{alerta.mensagem}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(alerta.valor)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contas a Pagar Recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Contas a Pagar Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dashboardData.contasAPagar.length === 0 ? (
            <p className="text-center text-gray-500 py-4">Nenhuma conta a pagar pendente</p>
          ) : (
            <div className="space-y-3">
              {dashboardData.contasAPagar.map((conta) => (
                <div key={conta.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{conta.description}</p>
                    <p className="text-sm text-gray-500">
                      {conta.contact?.name || 'Fornecedor não identificado'} • 
                      Vencimento: {formatDate(conta.due_date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">
                      {formatCurrency(Math.abs(conta.amount))}
                    </p>
                    <Badge className={getStatusColor(conta.status)}>
                      {getStatusLabel(conta.status)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contas a Receber Recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Contas a Receber Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dashboardData.contasAReceber.length === 0 ? (
            <p className="text-center text-gray-500 py-4">Nenhuma conta a receber pendente</p>
          ) : (
            <div className="space-y-3">
              {dashboardData.contasAReceber.map((conta) => (
                <div key={conta.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{conta.description}</p>
                    <p className="text-sm text-gray-500">
                      {conta.contact?.name || 'Cliente não identificado'} • 
                      Vencimento: {formatDate(conta.due_date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      {formatCurrency(Math.abs(conta.amount))}
                    </p>
                    <Badge className={getStatusColor(conta.status)}>
                      {getStatusLabel(conta.status)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fluxo de Caixa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Fluxo de Caixa (Últimos 30 dias)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dashboardData.fluxoCaixa.length === 0 ? (
            <p className="text-center text-gray-500 py-4">Nenhum movimento no período</p>
          ) : (
            <div className="space-y-2">
              {dashboardData.fluxoCaixa.slice(-10).map((dia, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{formatDate(dia.data)}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-sm text-green-600">Entradas</p>
                      <p className="font-bold text-green-600">
                        {formatCurrency(dia.entradas)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-red-600">Saídas</p>
                      <p className="font-bold text-red-600">
                        {formatCurrency(dia.saidas)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Saldo</p>
                      <p className={`font-bold ${
                        dia.saldo >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(dia.saldo)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

