#!/usr/bin/env node

/**
 * SERVIDOR API - DASHBOARD CBA MINERAÇÃO
 * ======================================
 * Servidor Node.js/Express para fornecer dados do dashboard
 * com filtragem por filial (company_id).
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 3001;

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Configuração do Supabase não encontrada!');
    console.error('Verifique as variáveis SUPABASE_URL e SUPABASE_SERVICE_KEY no arquivo .env');
    process.exit(1);
}

// Cliente Supabase com service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());

// Middleware de autenticação
const authenticateUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Token de autorização não fornecido' });
        }

        const token = authHeader.substring(7);
        
        // Verificar token com Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (error || !user) {
            return res.status(401).json({ error: 'Token inválido ou expirado' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Erro na autenticação:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// Middleware para validar company_id
const validateCompanyId = (req, res, next) => {
    const { company_id } = req.query;
    
    if (!company_id) {
        return res.status(400).json({ error: 'company_id é obrigatório' });
    }

    // Validar formato do UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(company_id)) {
        return res.status(400).json({ error: 'company_id deve ser um UUID válido' });
    }

    next();
};

// ===============================================
// ENDPOINTS DE ESTATÍSTICAS DO DASHBOARD
// ===============================================

/**
 * GET /api/stats/active-products
 * Retorna o número de produtos ativos para uma filial
 */
app.get('/api/stats/active-products', authenticateUser, validateCompanyId, async (req, res) => {
    try {
        const { company_id } = req.query;

        const { count, error } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', company_id)
            .eq('active', true);

        if (error) {
            console.error('Erro ao buscar produtos ativos:', error);
            return res.status(500).json({ error: 'Erro ao buscar produtos ativos' });
        }

        res.json({ 
            success: true, 
            data: { 
                active_products: count || 0 
            } 
        });
    } catch (error) {
        console.error('Erro no endpoint active-products:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

/**
 * GET /api/stats/stock-value
 * Retorna o valor total do estoque para uma filial
 */
app.get('/api/stats/stock-value', authenticateUser, validateCompanyId, async (req, res) => {
    try {
        const { company_id } = req.query;

        const { data, error } = await supabase
            .from('products')
            .select('cost_price, stock')
            .eq('company_id', company_id)
            .eq('active', true);

        if (error) {
            console.error('Erro ao buscar valor do estoque:', error);
            return res.status(500).json({ error: 'Erro ao buscar valor do estoque' });
        }

        const totalValue = data?.reduce((sum, product) => {
            const costPrice = parseFloat(product.cost_price) || 0;
            const stock = parseFloat(product.stock) || 0;
            return sum + (costPrice * stock);
        }, 0) || 0;

        res.json({ 
            success: true, 
            data: { 
                stock_value: totalValue 
            } 
        });
    } catch (error) {
        console.error('Erro no endpoint stock-value:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

/**
 * GET /api/stats/active-vehicles
 * Retorna o número de veículos ativos para uma filial
 */
app.get('/api/stats/active-vehicles', authenticateUser, validateCompanyId, async (req, res) => {
    try {
        const { company_id } = req.query;

        const { count, error } = await supabase
            .from('vehicles')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', company_id)
            .eq('status', 'active');

        if (error) {
            console.error('Erro ao buscar veículos ativos:', error);
            return res.status(500).json({ error: 'Erro ao buscar veículos ativos' });
        }

        res.json({ 
            success: true, 
            data: { 
                active_vehicles: count || 0 
            } 
        });
    } catch (error) {
        console.error('Erro no endpoint active-vehicles:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

/**
 * GET /api/stats/pending-transfers
 * Retorna o número de transferências pendentes para uma filial
 */
app.get('/api/stats/pending-transfers', authenticateUser, validateCompanyId, async (req, res) => {
    try {
        const { company_id } = req.query;

        const { count, error } = await supabase
            .from('transfers')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', company_id)
            .eq('status', 'pending');

        if (error) {
            console.error('Erro ao buscar transferências pendentes:', error);
            return res.status(500).json({ error: 'Erro ao buscar transferências pendentes' });
        }

        res.json({ 
            success: true, 
            data: { 
                pending_transfers: count || 0 
            } 
        });
    } catch (error) {
        console.error('Erro no endpoint pending-transfers:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

/**
 * GET /api/stats/recent-activities
 * Retorna as atividades recentes para uma filial
 */
app.get('/api/stats/recent-activities', authenticateUser, validateCompanyId, async (req, res) => {
    try {
        const { company_id } = req.query;
        const limit = parseInt(req.query.limit) || 10;

        const { data, error } = await supabase
            .from('activity_logs')
            .select('*')
            .eq('company_id', company_id)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Erro ao buscar atividades recentes:', error);
            return res.status(500).json({ error: 'Erro ao buscar atividades recentes' });
        }

        res.json({ 
            success: true, 
            data: { 
                recent_activities: data || [] 
            } 
        });
    } catch (error) {
        console.error('Erro no endpoint recent-activities:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

/**
 * GET /api/stats/dashboard-summary
 * Endpoint consolidado que retorna todas as estatísticas do dashboard
 */
app.get('/api/stats/dashboard-summary', authenticateUser, validateCompanyId, async (req, res) => {
    try {
        const { company_id } = req.query;

        // Buscar todas as estatísticas em paralelo
        const [
            productsResult,
            stockValueResult,
            vehiclesResult,
            transfersResult,
            activitiesResult
        ] = await Promise.all([
            supabase
                .from('products')
                .select('*', { count: 'exact', head: true })
                .eq('company_id', company_id)
                .eq('active', true),
            
            supabase
                .from('products')
                .select('cost_price, stock')
                .eq('company_id', company_id)
                .eq('active', true),
            
            supabase
                .from('vehicles')
                .select('*', { count: 'exact', head: true })
                .eq('company_id', company_id)
                .eq('status', 'active'),
            
            supabase
                .from('transfers')
                .select('*', { count: 'exact', head: true })
                .eq('company_id', company_id)
                .eq('status', 'pending'),
            
            supabase
                .from('activity_logs')
                .select('*')
                .eq('company_id', company_id)
                .order('created_at', { ascending: false })
                .limit(5)
        ]);

        // Verificar erros
        const errors = [productsResult.error, stockValueResult.error, vehiclesResult.error, transfersResult.error, activitiesResult.error].filter(Boolean);
        if (errors.length > 0) {
            console.error('Erros ao buscar estatísticas:', errors);
            return res.status(500).json({ error: 'Erro ao buscar estatísticas do dashboard' });
        }

        // Calcular valor total do estoque
        const totalStockValue = stockValueResult.data?.reduce((sum, product) => {
            const costPrice = parseFloat(product.cost_price) || 0;
            const stock = parseFloat(product.stock) || 0;
            return sum + (costPrice * stock);
        }, 0) || 0;

        res.json({
            success: true,
            data: {
                active_products: productsResult.count || 0,
                stock_value: totalStockValue,
                active_vehicles: vehiclesResult.count || 0,
                pending_transfers: transfersResult.count || 0,
                recent_activities: activitiesResult.data || []
            }
        });
    } catch (error) {
        console.error('Erro no endpoint dashboard-summary:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ===============================================
// ENDPOINT DE HEALTH CHECK
// ===============================================

app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'API do Dashboard CBA Mineração está funcionando!',
        timestamp: new Date().toISOString()
    });
});

// ===============================================
// MIDDLEWARE DE TRATAMENTO DE ERROS
// ===============================================

app.use((err, req, res, next) => {
    console.error('Erro não tratado:', err);
    res.status(500).json({ 
        error: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
    });
});

// ===============================================
// INICIAR SERVIDOR
// ===============================================

app.listen(PORT, () => {
    console.log('🚀 Servidor API iniciado!');
    console.log(`📡 Porta: ${PORT}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
    console.log('================================');
});

export default app;





















