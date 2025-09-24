/**
 * SERVIÇO DE API - DASHBOARD
 * ==========================
 * Serviço para consumir os endpoints da API do dashboard
 * com filtragem por filial (company_id).
 */

import axios from 'axios';
import supabase from '@/lib/supabaseClient';

// Configuração base da API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Cliente axios configurado
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Interceptor para adicionar autenticação automaticamente
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Usuário não autenticado');
      }

      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      };
      
      return config;
    } catch (error) {
      console.error('Erro ao adicionar autenticação:', error);
      throw error;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratamento de erros
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      console.error('Token de autenticação inválido');
      // Aqui você pode redirecionar para login ou renovar o token
    }
    return Promise.reject(error);
  }
);

/**
 * Serviço de estatísticas do dashboard
 */
export const dashboardService = {
  /**
   * Busca estatísticas consolidadas do dashboard
   * @param {string} companyId - ID da filial
   * @returns {Promise<Object>} Estatísticas do dashboard
   */
  async getDashboardSummary(companyId) {
    try {
      const response = await apiClient.get('/api/stats/dashboard-summary', {
        params: { company_id: companyId }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar resumo do dashboard:', error);
      throw new Error('Erro ao carregar dados do dashboard');
    }
  },

  /**
   * Busca número de produtos ativos
   * @param {string} companyId - ID da filial
   * @returns {Promise<number>} Número de produtos ativos
   */
  async getActiveProducts(companyId) {
    try {
      const response = await apiClient.get('/api/stats/active-products', {
        params: { company_id: companyId }
      });
      return response.data.data.active_products;
    } catch (error) {
      console.error('Erro ao buscar produtos ativos:', error);
      return 0;
    }
  },

  /**
   * Busca valor total do estoque
   * @param {string} companyId - ID da filial
   * @returns {Promise<number>} Valor total do estoque
   */
  async getStockValue(companyId) {
    try {
      const response = await apiClient.get('/api/stats/stock-value', {
        params: { company_id: companyId }
      });
      return response.data.data.stock_value;
    } catch (error) {
      console.error('Erro ao buscar valor do estoque:', error);
      return 0;
    }
  },

  /**
   * Busca número de veículos ativos
   * @param {string} companyId - ID da filial
   * @returns {Promise<number>} Número de veículos ativos
   */
  async getActiveVehicles(companyId) {
    try {
      const response = await apiClient.get('/api/stats/active-vehicles', {
        params: { company_id: companyId }
      });
      return response.data.data.active_vehicles;
    } catch (error) {
      console.error('Erro ao buscar veículos ativos:', error);
      return 0;
    }
  },

  /**
   * Busca número de transferências pendentes
   * @param {string} companyId - ID da filial
   * @returns {Promise<number>} Número de transferências pendentes
   */
  async getPendingTransfers(companyId) {
    try {
      const response = await apiClient.get('/api/stats/pending-transfers', {
        params: { company_id: companyId }
      });
      return response.data.data.pending_transfers;
    } catch (error) {
      console.error('Erro ao buscar transferências pendentes:', error);
      return 0;
    }
  },

  /**
   * Busca atividades recentes
   * @param {string} companyId - ID da filial
   * @param {number} limit - Limite de atividades (padrão: 10)
   * @returns {Promise<Array>} Lista de atividades recentes
   */
  async getRecentActivities(companyId, limit = 10) {
    try {
      const response = await apiClient.get('/api/stats/recent-activities', {
        params: { 
          company_id: companyId,
          limit: limit
        }
      });
      return response.data.data.recent_activities;
    } catch (error) {
      console.error('Erro ao buscar atividades recentes:', error);
      return [];
    }
  },

  /**
   * Verifica se a API está funcionando
   * @returns {Promise<boolean>} Status da API
   */
  async checkHealth() {
    try {
      const response = await apiClient.get('/api/health');
      return response.data.success;
    } catch (error) {
      console.error('API não está funcionando:', error);
      return false;
    }
  }
};

export default dashboardService;
