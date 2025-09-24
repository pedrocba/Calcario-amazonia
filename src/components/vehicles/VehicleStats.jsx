import React, { useMemo } from "react";
import { Truck, CheckCircle, AlertTriangle, Radio } from "lucide-react";
import StatsCard from "../dashboard/StatsCard";

export default function VehicleStats({ vehicles, isLoading }) {
  const stats = useMemo(() => {
    const totalVehicles = vehicles.length;
    const activeVehicles = vehicles.filter(v => v.active).length;
    const withRFID = vehicles.filter(v => v.rfid_tag).length;
    const withQR = vehicles.filter(v => v.qr_code).length;
    const totalCapacity = vehicles
      .filter(v => v.active)
      .reduce((sum, vehicle) => sum + vehicle.capacity, 0);
    
    return {
      totalVehicles,
      activeVehicles,
      withRFID,
      withQR,
      totalCapacity
    };
  }, [vehicles]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <StatsCard 
        title="Total de Veículos" 
        value={stats.totalVehicles} 
        icon={Truck} 
        color="blue" 
        trend="frota cadastrada"
        isLoading={isLoading} 
      />
      <StatsCard 
        title="Veículos Ativos" 
        value={stats.activeVehicles} 
        icon={CheckCircle} 
        color="green" 
        trend="em operação"
        isLoading={isLoading} 
      />
      <StatsCard 
        title="Com Identificação" 
        value={`${stats.withRFID + stats.withQR}`} 
        icon={Radio} 
        color="purple" 
        trend={`${stats.withRFID} RFID | ${stats.withQR} QR`}
        isLoading={isLoading} 
      />
      <StatsCard 
        title="Capacidade Total" 
        value={`${stats.totalCapacity.toFixed(1)} t`} 
        icon={AlertTriangle} 
        color="orange" 
        trend="frota ativa"
        isLoading={isLoading} 
      />
    </div>
  );
}