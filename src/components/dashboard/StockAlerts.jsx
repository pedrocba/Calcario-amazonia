import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, CheckCircle } from "lucide-react";

export default function StockAlerts({ lowStockItems, stockEntries, isLoading }) {
  return (
    <Card className="bg-white/70 backdrop-blur border-0 shadow-xl h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-slate-900">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          Alertas de Estoque
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">{Array(3).fill(0).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg">
              <div className="flex-1"><Skeleton className="h-4 w-32 mb-2" /><Skeleton className="h-3 w-24" /></div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}</div>
        ) : (
          <>
            <div className={`mb-4 p-3 rounded-lg border ${lowStockItems.length > 0 ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'}`}>
              <div className="flex items-center gap-2">
                {lowStockItems.length > 0 ? <AlertTriangle className="w-4 h-4 text-orange-600" /> : <CheckCircle className="w-4 h-4 text-green-600" />}
                <span className={`text-sm font-medium ${lowStockItems.length > 0 ? 'text-orange-800' : 'text-green-800'}`}>
                  {lowStockItems.length} {lowStockItems.length === 1 ? 'item com' : 'itens com'} estoque baixo
                </span>
              </div>
            </div>
            <div className="space-y-3">
              {lowStockItems.slice(0, 4).map((product) => {
                const currentStock = stockEntries.filter(s => s.product_id === product.id && s.status === 'ativo').reduce((sum, entry) => sum + entry.quantity_available, 0);
                return (
                  <div key={product.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors duration-200">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">{product.name}</p>
                      <p className="text-sm text-slate-500">Atual: {currentStock} | Mín: {product.min_qty}</p>
                    </div>
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Baixo</Badge>
                  </div>
                );
              })}
              {lowStockItems.length === 0 && (
                <div className="text-center py-6 text-slate-500">
                  <p className="text-sm">Nenhum alerta de estoque no momento.</p>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}