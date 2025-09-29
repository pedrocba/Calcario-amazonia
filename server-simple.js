import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const API_PORT = process.env.API_PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Middleware de autenticação simplificado
const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido' });
  }
  
  // Por enquanto, aceitar qualquer token válido
  req.user = { id: 'user-123' };
  next();
};

// Rota de saúde da API
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API funcionando perfeitamente!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Rota principal do dashboard com dados mockados
app.get('/api/stats/summary', authenticateUser, (req, res) => {
  try {
    const { company_id } = req.query;
    
    if (!company_id) {
      return res.status(400).json({ error: 'company_id é obrigatório' });
    }

    // Dados mockados realistas
    const mockData = {
      active_products: Math.floor(Math.random() * 50) + 10,
      stock_value: Math.floor(Math.random() * 500000) + 100000,
      active_vehicles: Math.floor(Math.random() * 15) + 5,
      pending_transfers: Math.floor(Math.random() * 10),
      recent_activities: [
        {
          id: 1,
          type: 'entrada',
          quantity_available: 100,
          created_date: new Date().toISOString()
        },
        {
          id: 2,
          type: 'saida',
          quantity_available: 50,
          created_date: new Date(Date.now() - 86400000).toISOString()
        }
      ]
    };

    console.log(`📊 Dados mockados enviados para company_id: ${company_id}`);
    res.json(mockData);

  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rotas adicionais para KPIs específicos
app.get('/api/stats/active-products', authenticateUser, (req, res) => {
  const count = Math.floor(Math.random() * 50) + 10;
  res.json({ count });
});

app.get('/api/stats/stock-value', authenticateUser, (req, res) => {
  const value = Math.floor(Math.random() * 500000) + 100000;
  res.json({ value });
});

app.get('/api/stats/active-vehicles', authenticateUser, (req, res) => {
  const count = Math.floor(Math.random() * 15) + 5;
  res.json({ count });
});

app.get('/api/stats/pending-transfers', authenticateUser, (req, res) => {
  const count = Math.floor(Math.random() * 10);
  res.json({ count });
});

app.get('/api/stats/low-stock-items', authenticateUser, (req, res) => {
  const count = Math.floor(Math.random() * 5);
  res.json({ count });
});

// Rota para dados de gráficos
app.get('/api/stats/movement-data', authenticateUser, (req, res) => {
  const movementData = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    movementData.push({
      date: dateStr,
      entradas: Math.floor(Math.random() * 100) + 10,
      transferencias: Math.floor(Math.random() * 20) + 5
    });
  }

  res.json(movementData);
});

// Rota para distribuição do estoque
app.get('/api/stats/stock-by-category', authenticateUser, (req, res) => {
  const categories = [
    { category: 'Cimento', value: Math.floor(Math.random() * 1000) + 500 },
    { category: 'Areia', value: Math.floor(Math.random() * 800) + 300 },
    { category: 'Brita', value: Math.floor(Math.random() * 600) + 200 },
    { category: 'Outros', value: Math.floor(Math.random() * 400) + 100 }
  ];

  res.json(categories);
});

// Rota para resumo financeiro mensal
app.get('/api/stats/monthly-financial-summary', authenticateUser, (req, res) => {
  const revenue = Math.floor(Math.random() * 100000) + 50000;
  const expenses = Math.floor(Math.random() * 80000) + 30000;
  
  res.json({
    revenue,
    expenses,
    profit: revenue - expenses
  });
});

// Rota para atividades recentes
app.get('/api/stats/recent-activities', authenticateUser, (req, res) => {
  const activities = [
    {
      id: 1,
      type: 'entrada',
      description: 'Entrada de Cimento CP-II',
      quantity: 100,
      created_date: new Date().toISOString()
    },
    {
      id: 2,
      type: 'saida',
      description: 'Saída de Areia Grossa',
      quantity: 50,
      created_date: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 3,
      type: 'transferencia',
      description: 'Transferência para Filial Norte',
      quantity: 200,
      created_date: new Date(Date.now() - 7200000).toISOString()
    }
  ];

  res.json(activities);
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro no servidor:', err);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: err.message 
  });
});

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Rota não encontrada',
    path: req.originalUrl 
  });
});

// Iniciar servidor
app.listen(API_PORT, () => {
  console.log('🚀 API Server SIMPLES rodando!');
  console.log(`📊 Porta: ${API_PORT}`);
  console.log(`🔗 Health Check: http://localhost:${API_PORT}/api/health`);
  console.log(`📱 Frontend: ${FRONTEND_URL}`);
  console.log('✅ Sistema funcionando com dados mockados!');
  console.log('💡 Para dados reais, configure o Supabase no .env');
});





















