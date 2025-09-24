import React, { useMemo } from "react";
import { Truck, Scale, CheckCircle, Clock } from "lucide-react";
import StatsCard from "../dashboard/StatsCard";

export default function WeighingStats({ trips, isLoading }) {
  const stats = useMemo(() => {
    const totalTrips = trips.length;
    const completedTrips = trips.filter(t => t.status === 'concluida').length;
    const pendingTrips = trips.filter(t => t.status !== 'concluida' && t.status !== 'cancelada').length;
    
    const totalWeight = trips
      .filter(t => t.net_weight > 0)
      .reduce((sum, trip) => sum + trip.net_weight, 0) / 1000; // Converter para toneladas
    
    const totalValue = trips
      .filter(t => t.total_value > 0)
      .reduce((sum, trip) => sum + trip.total_value, 0);
    
    return {
      totalTrips,
      completedTrips,
      pendingTrips,
      totalWeight,
      totalValue
    };
  }, [trips]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <StatsCard 
        title="Total de Viagens" 
        value={stats.totalTrips} 
        icon={Truck} 
        color="blue" 
        trend="todas as viagens registradas"
        isLoading={isLoading} 
      />
      <StatsCard 
        title="Viagens Concluídas" 
        value={stats.completedTrips} 
        icon={CheckCircle} 
        color="green" 
        trend="pesagens finalizadas"
        isLoading={isLoading} 
      />
      <StatsCard 
        title="Viagens Pendentes" 
        value={stats.pendingTrips} 
        icon={Clock} 
        color="orange" 
        trend="aguardando pesagem"
        isLoading={isLoading} 
      />
      <StatsCard 
        title="Total Pesado" 
        value={`${stats.totalWeight.toFixed(1)} t`} 
        icon={Scale} 
        color="purple" 
        trend="peso líquido total"
        isLoading={isLoading} 
      />
    </div>
  );
}