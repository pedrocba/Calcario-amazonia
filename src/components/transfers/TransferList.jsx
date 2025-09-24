
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRightLeft, CheckCircle, Calendar, Package, Printer } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusColors = {
  enviado: 'bg-orange-100 text-orange-800 border-orange-200',
  recebido: 'bg-green-100 text-green-800 border-green-200',
  cancelado: 'bg-red-100 text-red-800 border-red-200'
};

const setorColors = {
  santarem: 'bg-green-100 text-green-800',
  fazenda: 'bg-blue-100 text-blue-800'
};

export default function TransferList({ transfers, products, isLoading, onReceive, showActions = false, showDetails = false, title, onPrintTicket }) {
  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Produto não encontrado';
  };

  const getProductCode = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.code : 'N/A';
  };

  return (
    <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <ArrowRightLeft className="w-5 h-5 text-blue-600" />
          {title || `Transferências (${isLoading ? '...' : transfers.length})`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-100">
                <TableHead>Referência</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Origem → Destino</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Status</TableHead>
                {showDetails && <TableHead>Motivo</TableHead>}
                <TableHead>Data Envio</TableHead>
                {showDetails && <TableHead>Data Recebimento</TableHead>}
                {/* The "Ações" TableHead is now always present as per outline, as the print button is always available */}
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
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    {showDetails && <TableCell><Skeleton className="h-4 w-32" /></TableCell>}
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    {showDetails && <TableCell><Skeleton className="h-4 w-20" /></TableCell>}
                    {/* Skeleton for action buttons */}
                    <TableCell><Skeleton className="h-8 w-24 rounded" /></TableCell>
                  </TableRow>
                ))
              ) : (
                transfers.map((transfer) => (
                  <TableRow key={transfer.id} className="hover:bg-slate-50">
                    <TableCell className="font-mono text-sm">{transfer.transfer_reference}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900">{getProductName(transfer.product_id)}</p>
                        <p className="text-sm text-slate-500">{getProductCode(transfer.product_id)}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={setorColors[transfer.setor_origem]}>
                          {transfer.setor_origem}
                        </Badge>
                        <ArrowRightLeft className="w-3 h-3 text-slate-400" />
                        <Badge variant="outline" className={setorColors[transfer.setor_destino]}>
                          {transfer.setor_destino}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {transfer.quantity_sent} UN
                      {transfer.status === 'recebido' && transfer.quantity_received !== transfer.quantity_sent && (
                        <div className="text-xs text-slate-500">
                          Recebido: {transfer.quantity_received} UN
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[transfer.status]}>
                        {transfer.status}
                      </Badge>
                    </TableCell>
                    {showDetails && (
                      <TableCell className="text-sm max-w-xs truncate">
                        {transfer.reason || '-'}
                      </TableCell>
                    )}
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {format(new Date(transfer.sent_date || transfer.created_date), 'dd/MM/yyyy', { locale: ptBR })}
                      </div>
                    </TableCell>
                    {showDetails && (
                      <TableCell className="text-sm">
                        {transfer.received_date ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {format(new Date(transfer.received_date), 'dd/MM/yyyy', { locale: ptBR })}
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </TableCell>
                    )}
                    {/* Action buttons cell, now always present */}
                    <TableCell>
                      <div className="flex gap-2">
                        {showActions && transfer.status === 'enviado' && onReceive && (
                          <Button 
                            size="sm"
                            onClick={() => onReceive(transfer)} 
                            className="bg-green-600 hover:bg-green-700 flex items-center gap-1"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Confirmar
                          </Button>
                        )}
                        {/* Botão de reimprimir ticket sempre disponível no corpo da tabela */}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            const product = products.find(p => p.id === transfer.product_id);
                            if (onPrintTicket) {
                              onPrintTicket({
                                transfer: transfer,
                                product: product,
                                originEntry: { reference: transfer.transfer_reference } // Dados básicos
                              });
                            }
                          }}
                          className="hover:bg-blue-50 hover:text-blue-700 flex items-center gap-1"
                          title="Reimprimir Ticket"
                        >
                          <Printer className="w-3 h-3" />
                          Ticket
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {!isLoading && transfers.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhuma transferência encontrada</h3>
              <p className="text-slate-500">Não há transferências para exibir.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
