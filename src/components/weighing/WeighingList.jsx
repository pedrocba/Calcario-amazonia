
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button"; // Added Button import
import { Truck, Calendar, Scale, Printer } from "lucide-react"; // Added Printer import
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusColors = {
  aguardando_tara: 'bg-orange-100 text-orange-800 border-orange-200',
  aguardando_bruto: 'bg-blue-100 text-blue-800 border-blue-200',
  concluida: 'bg-green-100 text-green-800 border-green-200',
  cancelada: 'bg-red-100 text-red-800 border-red-200'
};

const statusLabels = {
  aguardando_tara: 'Aguardando Tara',
  aguardando_bruto: 'Aguardando Bruto',
  concluida: 'Concluída',
  cancelada: 'Cancelada'
};

export default function WeighingList({ trips, vehicles, products, isLoading, showDetails = false, title, onPrintTicket }) {
  const getVehicleInfo = (vehicleId) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.plate} - ${vehicle.driver_name}` : 'Veículo não encontrado';
  };

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Produto não encontrado';
  };

  const formatWeight = (weight) => {
    return weight ? (weight / 1000).toFixed(3) : '-';
  };

  return (
    <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <Truck className="w-5 h-5 text-blue-600" />
          {title || `Viagens (${isLoading ? '...' : trips.length})`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-100">
                <TableHead>Viagem</TableHead>
                <TableHead>Veículo</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Origem → Destino</TableHead>
                <TableHead>Status</TableHead>
                {showDetails && <TableHead>Tara (t)</TableHead>}
                {showDetails && <TableHead>Bruto (t)</TableHead>}
                {showDetails && <TableHead>Líquido (t)</TableHead>}
                {showDetails && <TableHead>Valor Total</TableHead>}
                <TableHead>Data</TableHead>
                <TableHead>Ações</TableHead> {/* Added Ações TableHead */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    {showDetails && <TableCell><Skeleton className="h-4 w-16" /></TableCell>}
                    {showDetails && <TableCell><Skeleton className="h-4 w-16" /></TableCell>}
                    {showDetails && <TableCell><Skeleton className="h-4 w-16" /></TableCell>}
                    {showDetails && <TableCell><Skeleton className="h-4 w-20" /></TableCell>}
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-20" /></TableCell> {/* Skeleton for Actions */}
                  </TableRow>
                ))
              ) : (
                trips.map((trip) => (
                  <TableRow key={trip.id} className="hover:bg-slate-50">
                    <TableCell className="font-mono text-sm font-medium">
                      {trip.trip_number}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900">{getVehicleInfo(trip.vehicle_id)}</p>
                        {trip.client_name && (
                          <p className="text-sm text-slate-500">Cliente: {trip.client_name}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {getProductName(trip.product_id)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="capitalize">{trip.origin}</span>
                        <span className="text-slate-400">→</span>
                        <span className="capitalize">{trip.destination}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[trip.status]}>
                        {statusLabels[trip.status]}
                      </Badge>
                    </TableCell>
                    {showDetails && (
                      <>
                        <TableCell className="font-mono">
                          {formatWeight(trip.tare_weight)}
                        </TableCell>
                        <TableCell className="font-mono">
                          {formatWeight(trip.gross_weight)}
                        </TableCell>
                        <TableCell className="font-mono font-medium text-green-700">
                          {formatWeight(trip.net_weight)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {trip.total_value > 0 ? `R$ ${trip.total_value.toFixed(2)}` : '-'}
                        </TableCell>
                      </>
                    )}
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {format(new Date(trip.created_date), 'dd/MM/yyyy', { locale: ptBR })}
                      </div>
                    </TableCell>
                    <TableCell> {/* Added Actions TableCell */}
                      {trip.status === 'concluida' && (
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => onPrintTicket(trip)}
                          className="hover:bg-blue-50 hover:text-blue-700"
                          title="Imprimir Ticket"
                        >
                          <Printer className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {!isLoading && trips.length === 0 && (
            <div className="text-center py-12">
              <Scale className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhuma viagem encontrada</h3>
              <p className="text-slate-500">Não há viagens para exibir.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
