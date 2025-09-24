
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Package, MapPin, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function StockList({ stockEntries, products, isLoading, onEdit, onDelete }) {
  const getProduct = (productId) => products.find(p => p.id === productId);

  const statusColors = {
    ativo: 'bg-green-100 text-green-800',
    transferido: 'bg-blue-100 text-blue-800',
    consumido: 'bg-orange-100 text-orange-800',
    zerado: 'bg-red-100 text-red-800'
  };

  return (
    <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <Package className="w-5 h-5 text-blue-600" />
          Posição de Estoque ({isLoading ? '...' : stockEntries.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-100">
                <TableHead>Ref.</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Disponível</TableHead>
                <TableHead>Reservado</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data Entrada</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-16 rounded" /></TableCell>
                  </TableRow>
                ))
              ) : (
                stockEntries.map((entry) => {
                  const product = getProduct(entry.product_id);
                  return (
                    <TableRow key={entry.id} className="hover:bg-slate-50">
                      <TableCell className="font-mono text-sm">{entry.reference}</TableCell>
                      <TableCell>
                        <p className="font-medium text-slate-900">{product?.name || 'Produto não encontrado'}</p>
                        <p className="text-sm text-slate-500">{product?.code || 'N/A'}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-blue-900">{entry.warehouse_location || 'N/D'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-lg text-green-700">{entry.quantity_available}</TableCell>
                      <TableCell className="text-orange-700">{entry.quantity_reserved || 0}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColors[entry.status]}>{entry.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(entry.entry_date || entry.created_date), 'dd/MM/yyyy', { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => onEdit(entry)} className="hover:bg-blue-50 hover:text-blue-700">
                            <Edit className="w-4 h-4" />
                          </Button>
                          {entry.status === 'ativo' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onDelete && onDelete(entry)}
                              className="hover:bg-red-50 hover:text-red-700"
                              title="Desativar entrada"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          {!isLoading && stockEntries.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhuma entrada de estoque encontrada</h3>
              <p className="text-slate-500">Clique em "Nova Entrada de Estoque" para começar.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
