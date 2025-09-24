import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Eye, Truck } from "lucide-react";

export default function VehicleList({ vehicles, isLoading, onEdit, onViewDetails }) {
  const getStatus = (status) => {
    switch (status) {
      case 'ativo': return { label: 'Ativo', color: 'bg-green-100 text-green-800' };
      case 'parado': return { label: 'Parado', color: 'bg-yellow-100 text-yellow-800' };
      case 'manutencao': return { label: 'Manutenção', color: 'bg-red-100 text-red-800' };
      default: return { label: status, color: 'bg-gray-100 text-gray-800' };
    }
  };

  return (
    <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <Truck className="w-5 h-5 text-blue-600" />
          Lista de Veículos ({isLoading ? '...' : vehicles.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Mobile View */}
        <div className="md:hidden">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="mb-4 p-4 border rounded-lg bg-white">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-3" />
                <Skeleton className="h-4 w-1/4" />
                <div className="mt-4 flex justify-end">
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            ))
          ) : (
            vehicles.map(vehicle => (
              <div key={vehicle.id} className="mb-4 p-4 border rounded-lg bg-white shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-lg text-slate-800">{vehicle.plate}</p>
                    <p className="text-sm text-slate-600">{vehicle.brand} {vehicle.model}</p>
                  </div>
                  <Badge className={getStatus(vehicle.status).color}>
                    {getStatus(vehicle.status).label}
                  </Badge>
                </div>
                <div className="mt-3 text-sm text-slate-500">
                  <p>Motorista: <span className="font-medium text-slate-700">{vehicle.driver_name || 'N/A'}</span></p>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => onViewDetails(vehicle)}>
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-100">
                <TableHead>Placa</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Motorista</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                  </TableRow>
                ))
              ) : (
                vehicles.map((vehicle) => (
                  <TableRow key={vehicle.id} className="hover:bg-slate-50">
                    <TableCell className="font-semibold text-blue-600">{vehicle.plate}</TableCell>
                    <TableCell>{vehicle.brand} {vehicle.model}</TableCell>
                    <TableCell>{vehicle.driver_name || 'Não informado'}</TableCell>
                    <TableCell>
                      <Badge className={getStatus(vehicle.status).color}>
                        {getStatus(vehicle.status).label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => onViewDetails(vehicle)} className="hover:bg-blue-50 hover:text-blue-700">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => onEdit(vehicle)} className="hover:bg-blue-50 hover:text-blue-700">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {!isLoading && vehicles.length === 0 && (
          <div className="text-center py-12">
            <Truck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhum veículo encontrado</h3>
            <p className="text-slate-500">Cadastre um novo veículo para começar.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}