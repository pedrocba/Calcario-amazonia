import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Truck, CheckCircle, Clock, AlertTriangle } from "lucide-react";

export default function VehicleStatus({ vehicles, weighingTrips, isLoading }) {
  const getVehicleStats = () => {
    const activeVehicles = vehicles.filter(v => v.status === 'ativo').length;
    const inMaintenance = vehicles.filter(v => v.status === 'manutencao').length;
    const stopped = vehicles.filter(v => v.status === 'parado').length;
    
    const recentTrips = weighingTrips.slice(0, 5);
    
    return {
      activeVehicles,
      inMaintenance,
      stopped,
      recentTrips
    };
  };

  const stats = getVehicleStats();

  const getStatusColor = (status) => {
    switch(status) {
      case 'concluida': return 'bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/20';
      case 'aguardando_tara': return 'bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/20';
      case 'aguardando_bruto': return 'bg-[var(--color-info)]/10 text-[var(--color-info)] border-[var(--color-info)]/20';
      default: return 'bg-[var(--color-muted)]/10 text-[var(--color-muted)] border-[var(--color-muted)]/20';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'concluida': return <CheckCircle className="w-3 h-3" />;
      case 'aguardando_tara': 
      case 'aguardando_bruto': return <Clock className="w-3 h-3" />;
      default: return <AlertTriangle className="w-3 h-3" />;
    }
  };

  return (
    <Card className="bg-[var(--color-surface)]/80 backdrop-blur border-0 shadow-xl h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-[var(--color-foreground)]">
          <Truck className="w-5 h-5 text-[var(--color-primary)]" />
          Status da Frota
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 mb-6">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="text-center p-3 rounded-lg bg-[var(--color-bg)]/50">
                  <Skeleton className="h-6 w-8 mx-auto mb-1" />
                  <Skeleton className="h-3 w-12 mx-auto" />
                </div>
              ))}
            </div>
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Fleet Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-3 rounded-lg bg-[var(--color-success)]/10 border border-[var(--color-success)]/20">
                <div className="text-2xl font-bold text-[var(--color-success)]">{stats.activeVehicles}</div>
                <div className="text-xs text-[var(--color-muted)]">Ativos</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/20">
                <div className="text-2xl font-bold text-[var(--color-warning)]">{stats.inMaintenance}</div>
                <div className="text-xs text-[var(--color-muted)]">Manutenção</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20">
                <div className="text-2xl font-bold text-[var(--color-danger)]">{stats.stopped}</div>
                <div className="text-xs text-[var(--color-muted)]">Parados</div>
              </div>
            </div>

            {/* Recent Trips */}
            <div>
              <h4 className="font-medium text-[var(--color-foreground)] mb-3">Viagens Recentes</h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {stats.recentTrips.map((trip) => {
                  const vehicle = vehicles.find(v => v.id === trip.vehicle_id);
                  return (
                    <div 
                      key={trip.id} 
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-[var(--color-bg)]/50 transition-colors duration-200"
                    >
                      <div className="w-10 h-10 bg-[var(--color-info)]/10 rounded-full flex items-center justify-center">
                        <Truck className="w-5 h-5 text-[var(--color-info)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[var(--color-foreground)] truncate">
                          {vehicle?.plate || 'N/A'} - {vehicle?.model || 'Modelo desconhecido'}
                        </p>
                        <p className="text-sm text-[var(--color-muted)]">
                          {trip.origin} → {trip.destination}
                        </p>
                        {trip.net_weight && (
                          <p className="text-xs text-[var(--color-muted)]">
                            {(trip.net_weight / 1000).toFixed(1)}t líquido
                          </p>
                        )}
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`${getStatusColor(trip.status)} flex items-center gap-1`}
                      >
                        {getStatusIcon(trip.status)}
                        {trip.status === 'concluida' ? 'Concluída' : 
                         trip.status === 'aguardando_tara' ? 'Aguard. Tara' :
                         trip.status === 'aguardando_bruto' ? 'Aguard. Bruto' : trip.status}
                      </Badge>
                    </div>
                  );
                })}
                {stats.recentTrips.length === 0 && (
                  <div className="text-center py-6 text-[var(--color-muted)]">
                    <Truck className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="text-sm">Nenhuma viagem recente</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}