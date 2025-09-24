import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRightLeft, Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function TransferStatus({ transfers, products, isLoading }) {
  const pendingTransfers = transfers.filter(t => t.status === 'enviado').slice(0, 4);

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Produto Desconhecido';
  };

  return (
    <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-slate-900">
          <ArrowRightLeft className="w-5 h-5 text-blue-600" />
          Status das Transferências
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">{Array(4).fill(0).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-lg">
              <Skeleton className="w-10 h-10 rounded-full" /><div className="flex-1"><Skeleton className="h-4 w-40 mb-2" /><Skeleton className="h-3 w-28" /></div><Skeleton className="h-6 w-20 rounded-full" />
            </div>
          ))}</div>
        ) : (
          <div className="space-y-3">
            {pendingTransfers.map((transfer) => (
              <div key={transfer.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors duration-200">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">{getProductName(transfer.product_id)}</p>
                  <p className="text-sm text-slate-500">{transfer.quantity_sent} UN • {transfer.setor_origem.slice(0,3).toUpperCase()} → {transfer.setor_destino.slice(0,3).toUpperCase()}</p>
                  <p className="text-xs text-slate-400">{format(new Date(transfer.sent_date || transfer.created_date), 'dd/MM/yyyy', { locale: ptBR })}</p>
                </div>
                <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">Pendente</Badge>
              </div>
            ))}
            {pendingTransfers.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-6 h-6 text-green-600" /></div>
                <p className="text-sm">Nenhuma transferência pendente</p>
                <p className="text-xs text-slate-400 mt-1">Todas as transferências foram processadas</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}