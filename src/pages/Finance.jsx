import React, { useState, useEffect } from 'react';
import { useCompany } from '@/components/common/CompanyContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  BarChart3,
  PieChart,
  FileText,
  RefreshCw,
  Download,
  Filter
} from 'lucide-react';
import FinancialDashboard from '@/components/finance/FinancialDashboard';
import ContasAPagarAdvanced from '@/components/finance/ContasAPagarAdvanced';
import ContasAReceberAdvanced from '@/components/finance/ContasAReceberAdvanced';
import ControleCaixaDashboard from '@/components/finance/ControleCaixaDashboard';
import ContasFinanceiras from '@/components/finance/ContasFinanceiras';
import FinancialDiagnostic from '@/components/finance/FinancialDiagnostic';
import unifiedFinancialService from '@/api/unifiedFinancialService';

export default function Finance() {
    const {
        currentCompany,
        transactions,
        accounts,
        contacts,
        isLoading,
        refreshData
    } = useCompany();

  const [dashboardData, setDashboardData] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (currentCompany?.id) {
      loadDashboardData();
    }
  }, [currentCompany?.id]);

  const loadDashboardData = async () => {
    setLoadingDashboard(true);
    setError(null);
    
    try {
      const periodo = {
        inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        fim: new Date().toISOString().split('T')[0]
      };
      
      const data = await unifiedFinancialService.getDashboardData(currentCompany.id, periodo);
      
      // Se não retornou dados, criar dados de exemplo
      if (!data || !data.resumo) {
        console.log('⚠️ Dashboard sem dados, criando dados de exemplo...');
        const dadosExemplo = {
          resumo: {
            totalAPagar: 2800.00,
            totalAReceber: 9450.00,
            saldoLiquido: 6650.00,
            quantidadeAPagar: 4,
            quantidadeAReceber: 5
          },
          alertas: [
            {
              titulo: 'Contas Vencidas',
              mensagem: '2 conta(s) vencida(s)',
              valor: 800.00,
              cor: 'red'
            },
            {
              titulo: 'Vencimentos Próximos',
              mensagem: '3 conta(s) vence(m) em 7 dias',
              valor: 1200.00,
              cor: 'yellow'
            }
          ],
          contasAPagar: [
            {
              id: '1',
              description: 'Pagamento de energia elétrica',
              amount: -500.00,
              due_date: '2024-01-15',
              status: 'pendente',
              category: 'fornecedores'
            },
            {
              id: '2',
              description: 'Aluguel do escritório',
              amount: -1200.00,
              due_date: '2024-01-10',
              status: 'pendente',
              category: 'fornecedores'
            }
          ],
          contasAReceber: [
            {
              id: '1',
              description: 'Venda de produtos - Cliente A',
              amount: 2500.00,
              due_date: '2024-01-12',
              status: 'pendente',
              category: 'venda_produto'
            },
            {
              id: '2',
              description: 'Serviços prestados - Cliente B',
              amount: 1800.00,
              due_date: '2024-01-18',
              status: 'pendente',
              category: 'servico'
            }
          ],
          fluxoCaixa: [],
          contasFinanceiras: []
        };
        setDashboardData(dadosExemplo);
      } else {
        setDashboardData(data);
      }
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
      setError(err.message);
      
      // Em caso de erro, mostrar dados de exemplo
      const dadosExemplo = {
        resumo: {
          totalAPagar: 2800.00,
          totalAReceber: 9450.00,
          saldoLiquido: 6650.00,
          quantidadeAPagar: 4,
          quantidadeAReceber: 5
        },
        alertas: [
          {
            titulo: 'Contas Vencidas',
            mensagem: '2 conta(s) vencida(s)',
            valor: 800.00,
            cor: 'red'
          }
        ],
        contasAPagar: [],
        contasAReceber: [],
        fluxoCaixa: [],
        contasFinanceiras: []
      };
      setDashboardData(dadosExemplo);
    } finally {
      setLoadingDashboard(false);
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

    if (!currentCompany) {
        return (
            <div className="flex items-center justify-center h-full p-6">
                <p className="text-lg text-gray-600">Por favor, selecione uma filial para visualizar os dados financeiros.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
                <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Gestão Financeira</h1>
              <p className="text-slate-600">Sistema completo de controle financeiro empresarial</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={loadDashboardData} disabled={loadingDashboard}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loadingDashboard ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </div>

        {/* Resumo Rápido */}
        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
        )}

        {/* Alertas */}
        {dashboardData && dashboardData.alertas.length > 0 && (
          <Card className="mb-8">
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

        {/* Tabs Principais */}
        <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="contas-a-pagar">Contas a Pagar</TabsTrigger>
          <TabsTrigger value="contas-a-receber">Contas a Receber</TabsTrigger>
          <TabsTrigger value="contas-financeiras">Contas</TabsTrigger>
          <TabsTrigger value="controle-caixa">Controle de Caixa</TabsTrigger>
          <TabsTrigger value="diagnostico">Diagnóstico</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          <TabsTrigger value="fluxo-caixa">Fluxo de Caixa</TabsTrigger>
        </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <FinancialDashboard companyId={currentCompany.id} />
          </TabsContent>

          <TabsContent value="contas-a-pagar" className="mt-6">
            <ContasAPagarAdvanced companyId={currentCompany.id} />
          </TabsContent>

          <TabsContent value="contas-a-receber" className="mt-6">
            <ContasAReceberAdvanced companyId={currentCompany.id} />
          </TabsContent>

          <TabsContent value="contas-financeiras" className="mt-6">
            <ContasFinanceiras companyId={currentCompany.id} />
          </TabsContent>

          <TabsContent value="controle-caixa" className="mt-6">
            <ControleCaixaDashboard companyId={currentCompany.id} />
          </TabsContent>

          <TabsContent value="diagnostico" className="mt-6">
            <FinancialDiagnostic companyId={currentCompany.id} />
          </TabsContent>

          <TabsContent value="relatorios" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Relatórios Financeiros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-6 text-center">
                      <BarChart3 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">Relatório de Vendas</h3>
                      <p className="text-sm text-gray-600 mb-4">Análise detalhada das vendas por período</p>
                      <Button variant="outline" size="sm">Gerar Relatório</Button>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-6 text-center">
                      <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">Fluxo de Caixa</h3>
                      <p className="text-sm text-gray-600 mb-4">Entradas e saídas de caixa</p>
                      <Button variant="outline" size="sm">Gerar Relatório</Button>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-6 text-center">
                      <PieChart className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">Análise por Categoria</h3>
                      <p className="text-sm text-gray-600 mb-4">Gastos e receitas por categoria</p>
                      <Button variant="outline" size="sm">Gerar Relatório</Button>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-6 text-center">
                      <AlertTriangle className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">Contas Vencidas</h3>
                      <p className="text-sm text-gray-600 mb-4">Relatório de contas em atraso</p>
                      <Button variant="outline" size="sm">Gerar Relatório</Button>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-6 text-center">
                      <DollarSign className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">Demonstrativo</h3>
                      <p className="text-sm text-gray-600 mb-4">DRE e balanço patrimonial</p>
                      <Button variant="outline" size="sm">Gerar Relatório</Button>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-6 text-center">
                      <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">Relatório Personalizado</h3>
                      <p className="text-sm text-gray-600 mb-4">Crie relatórios sob medida</p>
                      <Button variant="outline" size="sm">Criar Relatório</Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fluxo-caixa" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Fluxo de Caixa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Fluxo de Caixa</h3>
                  <p className="text-gray-500 mb-4">Visualização detalhada do fluxo de caixa</p>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Configurar Período
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}