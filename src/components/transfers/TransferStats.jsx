import React, { useMemo } from "react";
import { Send, CheckCircle, Clock, TrendingUp } from "lucide-react";
import StatsCard from "../dashboard/StatsCard";

export default function TransferStats({ transfers, isLoading }) {
  const stats = useMemo(() => {
    const enviadas = transfers.filter(t => t.status === 'enviado').length;
    const recebidas = transfers.filter(t => t.status === 'recebido').length;
    const totalTransfers = transfers.length;
    
    // Transferências dos últimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentTransfers = transfers.filter(t => 
      new Date(t.created_date) >= thirtyDaysAgo
    ).length;
    
    return {
      enviadas,
      recebidas,
      totalTransfers,
      recentTransfers
    };
  }, [transfers]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <StatsCard 
        title="Transferências Enviadas" 
        value={stats.enviadas} 
        icon={Send} 
        color="orange" 
        trend="aguardando confirmação"
        isLoading={isLoading} 
      />
      <StatsCard 
        title="Transferências Recebidas" 
        value={stats.recebidas} 
        icon={CheckCircle} 
        color="green" 
        trend="concluídas com sucesso"
        isLoading={isLoading} 
      />
      <StatsCard 
        title="Total de Transferências" 
        value={stats.totalTransfers} 
        icon={TrendingUp} 
        color="blue" 
        trend="histórico completo"
        isLoading={isLoading} 
      />
      <StatsCard 
        title="Últimos 30 Dias" 
        value={stats.recentTransfers} 
        icon={Clock} 
        color="purple" 
        trend="movimentações recentes"
        isLoading={isLoading} 
      />
    </div>
  );
}