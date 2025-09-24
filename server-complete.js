import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const API_PORT = process.env.API_PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Configuração do Supabase não encontrada!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Middleware de autenticação
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autenticação não fornecido' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Erro de autenticação:', error);
    return res.status(401).json({ error: 'Erro de autenticação' });
  }
};

// Rota de saúde da API
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API funcionando perfeitamente!',
    timestamp: new Date().toISOString()
  });
});

// Rota principal do dashboard
app.get('/api/stats/summary', authenticateUser, async (req, res) => {
  try {
    const { company_id } = req.query;
    
    if (!company_id) {
      return res.status(400).json({ error: 'company_id é obrigatório' });
    }

    // Buscar dados reais do Supabase
    const [
      productsResult,
      stockResult,
      vehiclesResult,
      transfersResult
    ] = await Promise.all([
      supabase
        .from('products')
        .select('id, active')
        .eq('company_id', company_id)
        .eq('active', true),
      
      supabase
        .from('stock_entries')
        .select('quantity_available, unit_price')
        .eq('company_id', company_id)
        .eq('status', 'ativo'),
      
      supabase
        .from('vehicles')
        .select('id, status')
        .eq('company_id', company_id)
        .eq('status', 'ativo'),
      
      supabase
        .from('transfers')
        .select('id, status')
        .eq('company_id', company_id)
        .eq('status', 'enviado')
    ]);

    // Calcular totais
    const activeProducts = productsResult.data?.length || 0;
    const stockValue = stockResult.data?.reduce((sum, entry) => 
      sum + (entry.quantity_available * (entry.unit_price || 0)), 0) || 0;
    const activeVehicles = vehiclesResult.data?.length || 0;
    const pendingTransfers = transfersResult.data?.length || 0;

    // Buscar atividades recentes
    const { data: recentActivities } = await supabase
      .from('stock_entries')
      .select('id, created_date, type, quantity_available')
      .eq('company_id', company_id)
      .order('created_date', { ascending: false })
      .limit(5);

    res.json({
      active_products: activeProducts,
      stock_value: stockValue,
      active_vehicles: activeVehicles,
      pending_transfers: pendingTransfers,
      recent_activities: recentActivities || []
    });

  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rotas adicionais para KPIs específicos
app.get('/api/stats/active-products', authenticateUser, async (req, res) => {
  try {
    const { company_id } = req.query;
    const { data, error } = await supabase
      .from('products')
      .select('id')
      .eq('company_id', company_id)
      .eq('active', true);

    if (error) throw error;

    res.json({ count: data?.length || 0 });
  } catch (error) {
    console.error('Erro ao buscar produtos ativos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/stats/stock-value', authenticateUser, async (req, res) => {
  try {
    const { company_id } = req.query;
    const { data, error } = await supabase
      .from('stock_entries')
      .select('quantity_available, unit_price')
      .eq('company_id', company_id)
      .eq('status', 'ativo');

    if (error) throw error;

    const value = data?.reduce((sum, entry) => 
      sum + (entry.quantity_available * (entry.unit_price || 0)), 0) || 0;

    res.json({ value });
  } catch (error) {
    console.error('Erro ao buscar valor do estoque:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/stats/active-vehicles', authenticateUser, async (req, res) => {
  try {
    const { company_id } = req.query;
    const { data, error } = await supabase
      .from('vehicles')
      .select('id')
      .eq('company_id', company_id)
      .eq('status', 'ativo');

    if (error) throw error;

    res.json({ count: data?.length || 0 });
  } catch (error) {
    console.error('Erro ao buscar veículos ativos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/stats/pending-transfers', authenticateUser, async (req, res) => {
  try {
    const { company_id } = req.query;
    const { data, error } = await supabase
      .from('transfers')
      .select('id')
      .eq('company_id', company_id)
      .eq('status', 'enviado');

    if (error) throw error;

    res.json({ count: data?.length || 0 });
  } catch (error) {
    console.error('Erro ao buscar transferências pendentes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para dados de gráficos
app.get('/api/stats/movement-data', authenticateUser, async (req, res) => {
  try {
    const { company_id } = req.query;
    
    // Dados dos últimos 7 dias
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const { data: entries } = await supabase
      .from('stock_entries')
      .select('created_date, type, quantity_available')
      .eq('company_id', company_id)
      .gte('created_date', startDate.toISOString())
      .lte('created_date', endDate.toISOString());

    const { data: transfers } = await supabase
      .from('transfers')
      .select('created_date, status')
      .eq('company_id', company_id)
      .gte('created_date', startDate.toISOString())
      .lte('created_date', endDate.toISOString());

    // Processar dados para gráfico
    const movementData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayEntries = entries?.filter(e => 
        e.created_date.startsWith(dateStr)
      ) || [];
      
      const dayTransfers = transfers?.filter(t => 
        t.created_date.startsWith(dateStr)
      ) || [];

      movementData.push({
        date: dateStr,
        entradas: dayEntries.reduce((sum, e) => sum + e.quantity_available, 0),
        transferencias: dayTransfers.length
      });
    }

    res.json(movementData);
  } catch (error) {
    console.error('Erro ao buscar dados de movimentação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para distribuição do estoque
app.get('/api/stats/stock-by-category', authenticateUser, async (req, res) => {
  try {
    const { company_id } = req.query;
    
    const { data, error } = await supabase
      .from('products')
      .select(`
        category,
        stock_entries!inner(quantity_available)
      `)
      .eq('company_id', company_id)
      .eq('active', true);

    if (error) throw error;

    // Processar dados por categoria
    const categoryData = {};
    data?.forEach(product => {
      const category = product.category || 'Sem Categoria';
      const stock = product.stock_entries?.reduce((sum, entry) => 
        sum + entry.quantity_available, 0) || 0;
      
      if (!categoryData[category]) {
        categoryData[category] = 0;
      }
      categoryData[category] += stock;
    });

    const result = Object.entries(categoryData).map(([category, value]) => ({
      category,
      value
    }));

    res.json(result);
  } catch (error) {
    console.error('Erro ao buscar distribuição por categoria:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Iniciar servidor
app.listen(API_PORT, () => {
  console.log(`🚀 API Server rodando na porta ${API_PORT}`);
  console.log(`📊 Dashboard: ${FRONTEND_URL}/dashboard`);
  console.log(`🔗 Health Check: http://localhost:${API_PORT}/api/health`);
  console.log(`✅ Sistema funcionando completamente!`);
});














