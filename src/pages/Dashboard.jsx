
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCompany } from "../components/common/CompanyContext";
import { useAuth } from "@/contexts/SimpleAuthContext";
import { supabase } from "../lib/supabaseClient";
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  ArrowRightLeft, 
  DollarSign,
  Users,
  Truck,
  Scale,
  Calendar,
  Activity,
  Building2 
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { motion } from "framer-motion";
import { format, subDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

// Componentes do Dashboard
import KPICard from "../components/dashboard/KPICard";
import ActivityFeed from "../components/dashboard/ActivityFeed";
import VehicleStatus from "../components/dashboard/VehicleStatus";
import FinancialOverview from "../components/dashboard/FinancialOverview";

export default function Dashboard() {
  const { currentCompany } = useCompany();
  const { user } = useAuth();
  
  // Estados para controle da filial atual
  const [currentBranch, setCurrentBranch] = useState(null);

  // Inicializar filial atual
  useEffect(() => {
    if (currentCompany) {
      setCurrentBranch({
        id: currentCompany.id,
        name: currentCompany.name || 'Filial Atual',
        city: 'Santarém',
        state: 'PA'
      });
    }
  }, [currentCompany]);

  // Função para buscar dados do dashboard baseado na filial
  const fetchDashboardData = useCallback(async (branchId) => {
    console.log(`Buscando dados do dashboard para filial ID: ${branchId}`);
    // Simular carregamento de dados específicos da filial
    // Aqui você poderia fazer chamadas de API específicas para cada filial
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Dados do dashboard atualizados para filial ${branchId}`);
  }, []);
  
  // Dados reais do Supabase (substituindo os mocks)

  // Estados para dados
  const [dashboardData, setDashboardData] = useState({
    active_products: 0,
    stock_value: 0,
    active_vehicles: 0,
    pending_transfers: 0,
    recent_activities: []
  });
  
  const [products, setProducts] = useState([]);
  const [stockEntries, setStockEntries] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [weighingTrips, setWeighingTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  
  // Cores para gráficos
  const COLORS = useMemo(() => ({
    primary: 'var(--color-primary)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    danger: 'var(--color-danger)',
    info: 'var(--color-info)',
    accent: 'var(--color-accent)',
    muted: 'var(--color-muted)'
  }), []);

  const loadDashboardData = useCallback(async () => {
    if (!currentCompany?.id) return;
    
    setIsLoading(true);
    setApiError(null);
    
    try {
      console.log("Carregando dados do dashboard para empresa:", currentCompany.id);

      // Buscar produtos
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('company_id', currentCompany.id)
        .eq('active', true);

      if (productsError) throw productsError;

      // Buscar vendas
      const { data: vendasData, error: vendasError } = await supabase
        .from('vendas')
        .select('*')
        .eq('company_id', currentCompany.id);

      if (vendasError) {
        console.warn('Erro ao carregar vendas:', vendasError);
      }

      // Buscar clientes
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('*')
        .eq('company_id', currentCompany.id)
        .eq('active', true);

      if (contactsError) {
        console.warn('Erro ao carregar clientes:', contactsError);
      }

      // Buscar veículos
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('company_id', currentCompany.id);

      if (vehiclesError) {
        console.warn('Erro ao carregar veículos:', vehiclesError);
      }

      // Buscar transferências
      const { data: transfersData, error: transfersError } = await supabase
        .from('transfers')
        .select('*')
        .eq('company_id', currentCompany.id);

      if (transfersError) {
        console.warn('Erro ao carregar transferências:', transfersError);
      }

      // Buscar viagens de pesagem
      const { data: weighingTripsData, error: weighingTripsError } = await supabase
        .from('weighing_trips')
        .select('*')
        .eq('company_id', currentCompany.id);

      if (weighingTripsError) {
        console.warn('Erro ao carregar viagens de pesagem:', weighingTripsError);
      }

      // Buscar transações financeiras
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('company_id', currentCompany.id);

      if (transactionsError) {
        console.warn('Erro ao carregar transações:', transactionsError);
      }

      // Definir dados
      setProducts(productsData || []);
      setStockEntries([]); // Por enquanto vazio, pode ser implementado depois
      setTransfers(transfersData || []);
      setWeighingTrips(weighingTripsData || []);
      setVehicles(vehiclesData || []);
      setTransactions(transactionsData || []);

      // Calcular dados do dashboard
      const activeProducts = (productsData || []).filter(p => p.active).length;
      const stockValue = (productsData || []).reduce((sum, product) => sum + ((product.current_stock || 0) * (product.cost_price || 0)), 0);
      const activeVehicles = (vehiclesData || []).filter(v => v.status === 'ativo').length;
      const pendingTransfers = (transfersData || []).filter(t => t.status === 'pendente').length;

      setDashboardData({
        active_products: activeProducts,
        stock_value: stockValue,
        active_vehicles: activeVehicles,
        pending_transfers: pendingTransfers,
        recent_activities: []
      });

      console.log("Dados do dashboard carregados com sucesso");

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      setApiError(error.message);
    }
    setIsLoading(false);
  }, [currentCompany]);

  useEffect(() => {
    // Agora o Dashboard só carrega dados normalmente
    if (currentCompany) {
      loadDashboardData();
    }
  }, [currentCompany, loadDashboardData]);

  // Cálculos dos KPIs principais - usando dados da API quando disponível
  const kpis = useMemo(() => {
    // Usar dados da API quando disponível, senão usar dados legados
    const totalProducts = dashboardData.active_products || products.filter(p => p.active).length;
    const totalStockValue = dashboardData.stock_value || 0;
    const activeVehicles = dashboardData.active_vehicles || vehicles.filter(v => v.status === 'ativo').length;
    const pendingTransfers = dashboardData.pending_transfers || transfers.filter(t => t.status === 'enviado').length;
    
    // Dados que ainda vêm dos dados legados (para gráficos)
    const activeStock = stockEntries.filter(s => s.status === 'ativo' && s.quantity_available > 0);
    const totalStock = activeStock.reduce((sum, entry) => sum + entry.quantity_available, 0);
    const completedTrips = weighingTrips.filter(t => t.status === 'concluida').length;
    
    const monthlyRevenue = transactions
      .filter(t => t.type === 'receita' && t.status === 'pago')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const monthlyExpenses = transactions
      .filter(t => t.type === 'despesa' && t.status === 'pago')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const lowStockItems = products.filter(product => {
      const currentStock = activeStock
        .filter(s => s.product_id === product.id)
        .reduce((sum, entry) => sum + entry.quantity_available, 0);
      return currentStock <= product.min_qty && product.min_qty > 0;
    }).length;

    return {
      totalProducts: totalProducts || 0,
      totalStock: totalStock || 0,
      totalStockValue: totalStockValue || 0,
      pendingTransfers: pendingTransfers || 0,
      completedTrips: completedTrips || 0,
      activeVehicles: activeVehicles || 0,
      monthlyRevenue: monthlyRevenue || 0,
      monthlyExpenses: monthlyExpenses || 0,
      netProfit: (monthlyRevenue || 0) - (monthlyExpenses || 0),
      lowStockItems: lowStockItems || 0
    };
  }, [dashboardData, products, stockEntries, transfers, weighingTrips, vehicles, transactions]);

  // Dados para gráfico de estoque por categoria
  const stockByCategory = useMemo(() => {
    const categoryData = {};
    
    products.forEach(product => {
      const stock = stockEntries
        .filter(s => s.product_id === product.id && s.status === 'ativo')
        .reduce((sum, entry) => sum + entry.quantity_available, 0);
      
      if (!categoryData[product.category]) {
        categoryData[product.category] = { items: 0, value: 0 };
      }
      categoryData[product.category].items += stock;
      categoryData[product.category].value += stock * (product.cost_price || 0);
    });

    return Object.keys(categoryData).map((category, index) => ({
      name: category,
      items: categoryData[category].items,
      value: categoryData[category].value,
      fill: [COLORS.primary, COLORS.success, COLORS.warning, COLORS.info, COLORS.accent][index % 5]
    }));
  }, [products, stockEntries, COLORS]);

  // Dados para gráfico de movimentações dos últimos 7 dias
  const movementData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return {
        date: format(date, 'dd/MM'),
        fullDate: format(date, 'yyyy-MM-dd'),
        entradas: Math.floor(Math.random() * 50) + 10, // Dados de exemplo
        saidas: Math.floor(Math.random() * 30) + 5,
        transferencias: Math.floor(Math.random() * 20) + 3
      };
    });

    return last7Days;
  }, []);

  if (!currentCompany) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <div className="w-16 h-16 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-[var(--color-primary)]" />
          </div>
          <p className="text-xl text-[var(--color-muted)] text-center">
            Por favor, selecione uma filial para continuar.
          </p>
        </motion.div>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-red-600 mb-2">Erro ao carregar dados</h2>
            <p className="text-[var(--color-muted)] mb-4">{apiError}</p>
            <Button onClick={loadDashboardData} className="btn-primary">
              Tentar Novamente
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-3xl font-bold text-[var(--color-foreground)]">
                  Dashboard Executivo
                </h1>
              </div>
              <p className="text-[var(--color-muted)] flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })} • {currentBranch?.name || currentCompany.name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[var(--color-success)]"></div>
              <span className="text-sm text-[var(--color-muted)]">
                Dados de exemplo carregados
              </span>
            </div>
          </div>
        </motion.div>

        {/* KPIs Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <KPICard
            title="Produtos Ativos"
            value={kpis.totalProducts}
            icon={Package}
            color="primary"
            trend={`+${Math.round((kpis.totalProducts / 100) * 12)}% este mês`}
            isLoading={isLoading}
          />
          <KPICard
            title="Valor em Estoque"
            value={`R$ ${kpis.totalStockValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            icon={DollarSign}
            color="success"
            trend="Inventário atual"
            isLoading={isLoading}
          />
          <KPICard
            title="Veículos Ativos"
            value={kpis.activeVehicles}
            icon={Truck}
            color="info"
            trend={`${kpis.completedTrips} viagens concluídas`}
            isLoading={isLoading}
          />
          <KPICard
            title="Alertas Críticos"
            value={kpis.lowStockItems}
            icon={AlertTriangle}
            color="warning"
            trend="Produtos com estoque baixo"
            isLoading={isLoading}
          />
        </motion.div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Gráfico de Movimentações */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-[var(--color-surface)]/80 backdrop-blur border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-[var(--color-foreground)]">
                  <Activity className="w-5 h-5 text-[var(--color-primary)]" />
                  Movimentações dos Últimos 7 Dias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={movementData}>
                    <defs>
                      <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={COLORS.success} stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorTransferencias" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.muted} opacity={0.3} />
                    <XAxis dataKey="date" stroke={COLORS.muted} />
                    <YAxis stroke={COLORS.muted} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--color-surface)', 
                        border: '1px solid var(--color-border)',
                        borderRadius: '8px',
                        color: 'var(--color-foreground)'
                      }} 
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="entradas"
                      stroke={COLORS.success}
                      fillOpacity={1}
                      fill="url(#colorEntradas)"
                      name="Entradas"
                    />
                    <Area
                      type="monotone"
                      dataKey="transferencias"
                      stroke={COLORS.primary}
                      fillOpacity={1}
                      fill="url(#colorTransferencias)"
                      name="Transferências"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Gráfico de Estoque por Categoria */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-[var(--color-surface)]/80 backdrop-blur border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-[var(--color-foreground)]">
                  <Package className="w-5 h-5 text-[var(--color-primary)]" />
                  Distribuição do Estoque
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stockByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="items"
                    >
                      {stockByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--color-surface)', 
                        border: '1px solid var(--color-border)',
                        borderRadius: '8px',
                        color: 'var(--color-foreground)'
                      }}
                      formatter={(value, name) => [`${value} itens`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Financial Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <FinancialOverview 
            revenue={kpis.monthlyRevenue}
            expenses={kpis.monthlyExpenses}
            netProfit={kpis.netProfit}
            transactions={transactions}
            isLoading={isLoading}
          />
        </motion.div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Activity Feed */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <ActivityFeed 
              stockEntries={stockEntries.slice(0, 5)} 
              transfers={transfers.slice(0, 3)}
              products={products} 
              isLoading={isLoading} 
            />
          </motion.div>

          {/* Vehicle Status */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <VehicleStatus 
              vehicles={vehicles}
              weighingTrips={weighingTrips}
              isLoading={isLoading} 
            />
          </motion.div>
        </div>
      </div>

    </div>
  );
}
