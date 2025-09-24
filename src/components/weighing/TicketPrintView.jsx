import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Truck, Package, Scale } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function TicketPrintView({ trip, vehicle, product }) {
  if (!trip || !vehicle || !product) {
    return null;
  }

  const formatWeight = (weight) => (weight / 1000).toFixed(3);
  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    return format(new Date(dateStr), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR });
  };

  return (
    <div className="fixed inset-0 bg-white z-[100] p-8 flex justify-center items-start overflow-auto font-bold">
      <Card className="w-full max-w-2xl border-2 border-slate-800 shadow-none">
        <CardContent className="p-8">
          <header className="text-center mb-6">
            <h1 className="text-2xl font-extrabold text-slate-900">CBA MINERAÇÃO</h1>
            <p className="text-lg font-extrabold text-slate-700">TICKET DE PESAGEM</p>
          </header>

          <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-6 text-sm">
            <div><span className="font-extrabold">Nº Ticket:</span> {trip.trip_number}</div>
            <div><span className="font-extrabold">Data Emissão:</span> {format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}</div>
            <div><span className="font-extrabold">Balança:</span> WT3000-i</div>
            <div><span className="font-extrabold">Operador:</span> {trip.scale_operator || "Sistema"}</div>
          </div>

          <Separator className="my-6 border-slate-400" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-extrabold mb-3 flex items-center gap-2"><Truck className="w-5 h-5"/>VEÍCULO</h3>
              <p><span className="font-extrabold">Placa:</span> {vehicle.plate}</p>
              <p><span className="font-extrabold">Motorista:</span> {vehicle.driver_name}</p>
              <p><span className="font-extrabold">Modelo:</span> {vehicle.brand} {vehicle.model}</p>
            </div>
            <div>
              <h3 className="text-lg font-extrabold mb-3 flex items-center gap-2"><Package className="w-5 h-5"/>PRODUTO</h3>
              <p><span className="font-extrabold">Produto:</span> {product.name}</p>
              <p><span className="font-extrabold">Origem:</span> {trip.origin}</p>
              <p><span className="font-extrabold">Destino:</span> {trip.destination}</p>
            </div>
          </div>

          <Separator className="my-6 border-slate-400 border-dashed" />

          <div>
            <h3 className="text-lg font-extrabold mb-4 flex items-center gap-2"><Scale className="w-5 h-5"/>PESAGEM</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-baseline p-3 bg-slate-100 rounded-lg">
                <span className="font-extrabold text-slate-600">Peso Bruto:</span>
                <div className="text-right">
                  <p className="text-xl font-extrabold">{formatWeight(trip.gross_weight)} t</p>
                  <p className="text-xs text-slate-500">{formatDateTime(trip.gross_datetime)}</p>
                </div>
              </div>
              <div className="flex justify-between items-baseline p-3 bg-slate-100 rounded-lg">
                <span className="font-extrabold text-slate-600">Tara:</span>
                 <div className="text-right">
                  <p className="text-xl font-extrabold">{formatWeight(trip.tare_weight)} t</p>
                  <p className="text-xs text-slate-500">{formatDateTime(trip.tare_datetime)}</p>
                </div>
              </div>
              <div className="flex justify-between items-baseline p-4 bg-blue-100 rounded-lg border-l-4 border-blue-500">
                <span className="font-extrabold text-blue-800 text-lg">PESO LÍQUIDO:</span>
                <p className="text-3xl font-extrabold text-blue-900">{formatWeight(trip.net_weight)} t</p>
              </div>
            </div>
          </div>
          
          {trip.total_value > 0 && (
            <>
              <Separator className="my-6 border-slate-400" />
              <div className="text-right">
                 <p className="text-sm text-slate-600">Valor Unitário: R$ {trip.unit_price.toFixed(2)} / t</p>
                 <p className="text-lg font-extrabold">Valor Total: R$ {trip.total_value.toFixed(2)}</p>
              </div>
            </>
          )}

          <div className="mt-16 text-center">
            <div className="w-64 h-1 border-b-2 border-slate-800 border-dotted mx-auto"></div>
            <p className="mt-2 text-sm">Assinatura do Motorista</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}