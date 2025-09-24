import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, ArrowUp, ArrowDown, ArrowRightLeft } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const tipoColors = {
  entrada: 'bg-green-100 text-green-800',
  saida: 'bg-red-100 text-red-800',
  transferencia: 'bg-blue-100 text-blue-800'
};

const tipoIcons = {
  entrada: ArrowDown,
  saida: ArrowUp,
  transferencia: ArrowRightLeft
};

export default function MovimentacoesList({ movimentacoes, produtos, isLoading }) {
  const getProdutoNome = (produtoId) => {
    const produto = produtos.find(p => p.id === produtoId);
    return produto ? produto.nome_do_produto : 'Produto não encontrado';
  };

  return (
    <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Movimentações Recentes ({isLoading ? '...' : movimentacoes.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-100">
                <TableHead>Ticket</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Origem → Destino</TableHead>
                <TableHead>Solicitante</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  </TableRow>
                ))
              ) : (
                movimentacoes.map((mov) => {
                  const TipoIcon = tipoIcons[mov.tipo_movimentacao];
                  return (
                    <TableRow key={mov.id} className="hover:bg-slate-50">
                      <TableCell className="font-mono text-sm font-medium">
                        {mov.numero_ticket}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={tipoColors[mov.tipo_movimentacao]}>
                          <TipoIcon className="w-3 h-3 mr-1" />
                          {mov.tipo_movimentacao}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-900">{getProdutoNome(mov.produto_id)}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-lg">
                        {mov.quantidade}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>De: <span className="font-medium">{mov.origem || '-'}</span></div>
                          <div>Para: <span className="font-medium">{mov.destino || '-'}</span></div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{mov.solicitante}</p>
                          <p className="text-xs text-slate-500">por {mov.responsavel}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(mov.data || mov.created_date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          {!isLoading && movimentacoes.length === 0 && (
            <div className="text-center py-12">
              <TrendingUp className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhuma movimentação registrada</h3>
              <p className="text-slate-500">As movimentações aparecerão aqui conforme forem registradas.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}