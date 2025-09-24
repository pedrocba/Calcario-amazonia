import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Calendar,
  RefreshCw,
  Plus,
  Eye,
  Download
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';
import unifiedFinancialService from '@/api/unifiedFinancialService';
import MovimentacoesCaixa from './MovimentacoesCaixa';
import AberturaFechamentoCaixa from './AberturaFechamentoCaixa';
import RelatorioCaixa from './RelatorioCaixa';

export default function ControleCaixaDashboard({ companyId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [resumo, setResumo] = useState({
    saldoTotal: 0,
    entradasHoje: 0,
    saidasHoje: 0,
    saldoInicial: 0,
    movimentacoesHoje: 0
  });

  useEffect(() => {
    loadData();
  }, [companyId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Carregar contas
      const accountsData = await unifiedFinancialService.getContasFinanceiras(companyId);
      setAccounts(accountsData);

      // Carregar movimentações do dia
      await loadMovimentacoesHoje();

      // Calcular resumo
      calculateResumo(accountsData);

    } catch (err) {
      console.error('Erro ao carregar dados do caixa:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMovimentacoesHoje = async () => {
    try {
      const hoje = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('company_id', companyId)
        .eq('date', hoje)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMovimentacoes(data || []);
    } catch (err) {
      console.error('Erro ao carregar movimentações:', err);
    }
  };

  const calculateResumo = (accountsData) => {
    const saldoTotal = accountsData.reduce((sum, account) => sum + parseFloat(account.balance), 0);
    
    const hoje = new Date().toISOString().split('T')[0];
    const movimentacoesHoje = movimentacoes.filter(m => m.date === hoje);
    
    const entradasHoje = movimentacoesHoje
      .filter(m => m.type === 'entrada')
      .reduce((sum, m) => sum + Math.abs(parseFloat(m.amount)), 0);
    
    const saidasHoje = movimentacoesHoje
      .filter(m => m.type === 'saida')
      .reduce((sum, m) => sum + Math.abs(parseFloat(m.amount)), 0);

    setResumo({
      saldoTotal,
      entradasHoje,
      saidasHoje,
      saldoInicial: saldoTotal - entradasHoje + saidasHoje,
      movimentacoesHoje: movimentacoesHoje.length
    });
  };

  const getStatusCaixa = () => {
    if (resumo.saldoTotal > 0) {
      return { status: 'positivo', color: 'text-green-600', icon: CheckCircle };
    } else if (resumo.saldoTotal < 0) {
      return { status: 'negativo', color: 'text-red-600', icon: AlertTriangle };
    } else {
      return { status: 'zerado', color: 'text-yellow-600', icon: Clock };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Carregando dados do caixa...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-600 mb-2">Erro ao carregar dados</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={loadData} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Tentar Novamente
        </Button>
      </div>
    );
  }

  const statusInfo = getStatusCaixa();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Controle de Caixa</h2>
          <p className="text-gray-600">Sistema completo de gestão financeira e controle de caixa</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Resumo Principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Saldo Total</p>
                <p className={`text-2xl font-bold ${statusInfo.color}`}>
                  {formatCurrency(resumo.saldoTotal)}
                </p>
              </div>
              <StatusIcon className={`w-8 h-8 ${statusInfo.color}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Entradas Hoje</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(resumo.entradasHoje)}
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
                <p className="text-sm font-medium text-gray-600">Saídas Hoje</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(resumo.saidasHoje)}
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
                <p className="text-sm font-medium text-gray-600">Movimentações</p>
                <p className="text-2xl font-bold text-blue-600">
                  {resumo.movimentacoesHoje}
                </p>
                <p className="text-xs text-gray-500">hoje</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contas Financeiras */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Contas Financeiras
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((account) => (
              <div key={account.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{account.name}</h4>
                  <span className="text-sm text-gray-500 capitalize">{account.type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">
                    {formatCurrency(parseFloat(account.balance))}
                  </span>
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Funcionalidades */}
      <Tabs defaultValue="movimentacoes" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="movimentacoes">Movimentações</TabsTrigger>
          <TabsTrigger value="abertura-fechamento">Abertura/Fechamento</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="movimentacoes" className="mt-6">
          <MovimentacoesCaixa 
            companyId={companyId} 
            accounts={accounts}
            onRefresh={loadData}
          />
        </TabsContent>

        <TabsContent value="abertura-fechamento" className="mt-6">
          <AberturaFechamentoCaixa 
            companyId={companyId}
            accounts={accounts}
            onRefresh={loadData}
          />
        </TabsContent>

        <TabsContent value="relatorios" className="mt-6">
          <RelatorioCaixa 
            companyId={companyId}
            accounts={accounts}
          />
        </TabsContent>

        <TabsContent value="configuracoes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Caixa</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Configurações avançadas do sistema de caixa em desenvolvimento...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
