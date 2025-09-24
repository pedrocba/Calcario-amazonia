import React, { useState, useEffect, useCallback } from 'react';
import { useCompany } from './CompanyContext';

// Cache inteligente global
const dataCache = new Map();
const CACHE_DURATION = 60000; // 1 minuto

export const useOptimizedData = (entityName, filter = {}, sortBy = '-created_date', limit = null) => {
  const { currentCompany } = useCompany();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const cacheKey = `${entityName}_${currentCompany?.id}_${JSON.stringify(filter)}_${sortBy}_${limit}`;

  const loadData = useCallback(async () => {
    if (!currentCompany) {
      setData([]);
      setIsLoading(false);
      return;
    }

    // Verificar cache primeiro
    const cached = dataCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setData(cached.data);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Importação dinâmica da entidade
      const { [entityName]: Entity } = await import(`@/api/entities/${entityName}`);
      
      const companyFilter = { ...filter, company_id: currentCompany.id };
      
      let result;
      if (limit) {
        result = await Entity.filter(companyFilter, sortBy, limit);
      } else {
        result = await Entity.filter(companyFilter, sortBy);
      }

      const finalData = result || [];
      
      // Salvar no cache
      dataCache.set(cacheKey, {
        data: finalData,
        timestamp: Date.now()
      });
      
      setData(finalData);
      setError(null);
    } catch (err) {
      console.error(`Erro ao carregar ${entityName}:`, err);
      setError(err.message);
      setData([]);
    }
    setIsLoading(false);
  }, [entityName, currentCompany, cacheKey, filter, sortBy, limit]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const invalidateCache = useCallback(() => {
    dataCache.delete(cacheKey);
    loadData();
  }, [cacheKey, loadData]);

  return { data, isLoading, error, reload: invalidateCache };
};

// Hook para limpeza automática do cache
export const useCacheCleanup = () => {
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, value] of dataCache.entries()) {
        if (now - value.timestamp > CACHE_DURATION * 2) {
          dataCache.delete(key);
        }
      }
    }, CACHE_DURATION);

    return () => clearInterval(cleanupInterval);
  }, []);
};