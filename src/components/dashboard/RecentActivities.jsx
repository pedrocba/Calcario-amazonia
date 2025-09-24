
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Package, ArrowRight, ArrowLeft } from "lucide-react";

export default function RecentActivities({ stockEntries, products, isLoading }) {
  const recentEntries = stockEntries.slice(0, 5);

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Produto Desconhecido';
  };

  const getSectorColor = (setor) => {
    return setor === 'santarem' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const getStatusColor = (origem) => {
    switch(origem) {
      case 'compra': return 'bg-[var(--color-info)]/10 text-[var(--color-info)]';
      case 'transferencia': return 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]';
      case 'ajuste': return 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="bg-[var(--color-surface)]/70 backdrop-blur border-0 shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-[var(--color-foreground)]">
          <Package className="w-5 h-5 text-[var(--color-primary)]" />
          Atividades Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">{Array(5).fill(0).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-lg">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1"><Skeleton className="h-4 w-48 mb-2" /><Skeleton className="h-3 w-32" /></div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}</div>
        ) : (
          <div className="space-y-3">
            {recentEntries.map((entry) => (
              <div key={entry.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors duration-200">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${entry.origem_entrada === 'compra' ? 'bg-[var(--color-info)]/10' : 'bg-[var(--color-warning)]/10'}`}>
                  {entry.origem_entrada === 'compra' ? <ArrowRight className="w-5 h-5 text-[var(--color-info)]" /> : <ArrowLeft className="w-5 h-5 text-[var(--color-warning)]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--color-foreground)] truncate">{getProductName(entry.product_id)}</p>
                  <p className="text-sm text-[var(--color-muted)]">{entry.quantity_received} UN • {format(new Date(entry.entry_date || entry.created_date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <Badge variant="outline" className={getSectorColor(entry.setor)}>{entry.setor}</Badge>
                  <Badge variant="outline" className={getStatusColor(entry.origem_entrada)}>{entry.origem_entrada}</Badge>
                </div>
              </div>
            ))}
            {recentEntries.length === 0 && (
              <div className="text-center py-8 text-[var(--color-muted)]">
                <Package className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>Nenhuma atividade recente encontrada</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
