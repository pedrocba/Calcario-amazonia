import React from "react";
import StatsCard from "../dashboard/StatsCard";
import { Clock, ArrowRight, ArrowLeft, AlertTriangle, X } from "lucide-react";

export default function RetiradaStats({ stats, isLoading }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
      <StatsCard 
        title="Aguardando" 
        value={stats.aguardandoEntrega} 
        icon={Clock} 
        color="orange" 
        trend="Para entregar"
        isLoading={isLoading} 
      />
      <StatsCard 
        title="Entregues" 
        value={stats.entregues} 
        icon={ArrowRight} 
        color="blue" 
        trend="Em uso"
        isLoading={isLoading} 
      />
      <StatsCard 
        title="Devolvidos" 
        value={stats.devolvidos} 
        icon={ArrowLeft} 
        color="green" 
        trend="Concluídos"
        isLoading={isLoading} 
      />
      <StatsCard 
        title="Atrasados" 
        value={stats.atrasados} 
        icon={AlertTriangle} 
        color="purple" 
        trend="Vencidos"
        isLoading={isLoading} 
      />
      <StatsCard 
        title="Extraviados" 
        value={stats.extraviados} 
        icon={X} 
        color="red" 
        trend="Perdidos"
        isLoading={isLoading} 
      />
    </div>
  );
}