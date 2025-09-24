import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Building2, TrendingUp, DollarSign } from "lucide-react";
import StatsCard from "../dashboard/StatsCard";

export default function StockStats({ stockEntries, products, isLoading }) {
  const stats = useMemo(() => {
    const activeStock = stockEntries.filter(s => s.status === 'ativo' && s.quantity_available > 0);
    
    const santaremStock = activeStock.filter(s => s.setor === 'santarem').reduce((sum, entry) => sum + entry.quantity_available, 0);
    const fazendaStock = activeStock.filter(s => s.setor === 'fazenda').reduce((sum, entry) => sum + entry.quantity_available, 0);
    const totalStock = santaremStock + fazendaStock;
    
    const totalValue = activeStock.reduce((sum, entry) => sum + (entry.quantity_available * (entry.unit_cost || 0)), 0);
    
    const uniqueProducts = new Set(activeStock.map(entry => entry.product_id)).size;
    
    return {
      totalStock,
      santaremStock,
      fazendaStock,
      totalValue,
      uniqueProducts
    };
  }, [stockEntries]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <StatsCard 
        title="Produtos Únicos" 
        value={stats.uniqueProducts} 
        icon={Package} 
        color="blue" 
        trend="produtos cadastrados"
        isLoading={isLoading} 
      />
      <StatsCard 
        title="Estoque Total" 
        value={`${stats.totalStock.toFixed(0)} UN`} 
        icon={TrendingUp} 
        color="green" 
        trend="disponível nos setores"
        isLoading={isLoading} 
      />
      <StatsCard 
        title="Valor do Estoque" 
        value={`R$ ${stats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
        icon={DollarSign} 
        color="purple" 
        trend="valor total em estoque"
        isLoading={isLoading} 
      />
      <StatsCard 
        title="Distribuição" 
        value={`${stats.santaremStock.toFixed(0)} / ${stats.fazendaStock.toFixed(0)}`} 
        icon={Building2} 
        color="orange" 
        trend="Santarém / Fazenda"
        isLoading={isLoading} 
      />
    </div>
  );
}