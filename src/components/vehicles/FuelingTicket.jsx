
import React from 'react';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function FuelingTicket({ record, vehicle }) {
  if (!record || !vehicle) return null;

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    return format(new Date(dateStr), "dd/MM/yy HH:mm", { locale: ptBR });
  };

  const getFuelTypeLabel = (type) => {
    switch (type) {
      case 'diesel_s10': return 'Diesel S10';
      case 'diesel_s500': return 'Diesel S500';
      case 'arla_32': return 'Arla 32';
      case 'gasolina_comum': return 'Gasolina Comum';
      case 'gasolina_aditivada': return 'Gasolina Aditivada';
      default: return type;
    }
  };

  return (
    <div className="font-mono text-xs bg-white p-2 font-bold" style={{ width: '72mm' }}>
      <div className="text-center">
        <h1 className="font-extrabold">CBA MINERACAO</h1>
        <p>COMPROVANTE DE ABASTECIMENTO</p>
      </div>
      <div className="my-1 text-center">----------------------------------</div>
      <p>Data/Hora: {formatDateTime(record.date)}</p>
      <p>Veiculo...: {vehicle.plate} - {vehicle.brand} {vehicle.model}</p>
      <p>Motorista.: {vehicle.driver_name}</p>
      <p>Hodometro.: {(record.odometer_at_fueling || 0).toLocaleString('pt-BR')} km</p>
      <div className="my-1 text-center">----------------------------------</div>
      <p>Combustivel: {getFuelTypeLabel(record.fuel_type)}</p>
      <p>Litros.....: {(record.liters || 0).toFixed(2)} L</p>
      <p>Custo Total: R$ {(record.total_cost || 0).toFixed(2)}</p>
      <p>Fornecedor.: {record.supplier || 'Interno'}</p>
      <div className="my-1 text-center">----------------------------------</div>
      <p>Responsavel: {record.responsavel_abastecimento}</p>
      <div className="mt-6 mb-4">
        <div className="border-b border-black border-dotted w-full"></div>
        <p className="text-center text-xs mt-1">Assinatura</p>
      </div>
    </div>
  );
}
