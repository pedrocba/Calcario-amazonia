import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Package, ArrowRight, ArrowLeft, Activity } from "lucide-react";

export default function ActivityFeed({ stockEntries, transfers, products, isLoading }) {
  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Produto Desconhecido';
  };

  const activities = [
    ...stockEntries.map(entry => ({
      id: `stock-${entry.id}`,
      type: 'stock',
      title: `Nova entrada: ${getProductName(entry.product_id)}`,
      description: `${entry.quantity_received} UN recebidos`,
      time: entry.created_date,
      icon: ArrowRight,
      color: 'text-[var(--color-success)]',
      bgColor: 'bg-[var(--color-success)]/10'
    })),
    ...transfers.map(transfer => ({
      id: `transfer-${transfer.id}`,
      type: 'transfer',
      title: `Transferência: ${getProductName(transfer.product_id)}`,
      description: `${transfer.quantity_sent} UN • ${transfer.setor_origem} → ${transfer.setor_destino}`,
      time: transfer.sent_date || transfer.created_date,
      icon: ArrowLeft,
      color: 'text-[var(--color-primary)]',
      bgColor: 'bg-[var(--color-primary)]/10'
    }))
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8);

  return (
    <Card className="bg-[var(--color-surface)]/80 backdrop-blur border-0 shadow-xl h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-[var(--color-foreground)]">
          <Activity className="w-5 h-5 text-[var(--color-primary)]" />
          Atividades Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-48 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activities.map((activity) => (
              <div 
                key={activity.id} 
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-[var(--color-bg)]/50 transition-colors duration-200 group"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activity.bgColor} group-hover:scale-110 transition-transform duration-200`}>
                  <activity.icon className={`w-5 h-5 ${activity.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--color-foreground)] truncate">
                    {activity.title}
                  </p>
                  <p className="text-sm text-[var(--color-muted)] truncate">
                    {activity.description}
                  </p>
                  <p className="text-xs text-[var(--color-muted)] mt-1">
                    {format(new Date(activity.time), 'HH:mm • dd/MM', { locale: ptBR })}
                  </p>
                </div>
                <Badge variant="outline" className={`${activity.color} border-current`}>
                  {activity.type === 'stock' ? 'Entrada' : 'Transfer.'}
                </Badge>
              </div>
            ))}
            {activities.length === 0 && (
              <div className="text-center py-8 text-[var(--color-muted)]">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>Nenhuma atividade recente encontrada</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}