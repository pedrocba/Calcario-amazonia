import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, TrendingUp, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const origemColors = {
  compra: 'bg-blue-100 text-blue-800',
  transferencia: 'bg-orange-100 text-orange-800',
  ajuste: 'bg-purple-100 text-purple-800'
};

const setorColors = {
  santarem: 'bg-green-100 text-green-800',
  fazenda: 'bg-blue-100 text-blue-800'
};

export default function MovementReport({ data, products, isLoading, onExport }) {
  const { recentEntries, categoryMovements } = data;

  return (
    <div className="space-y-6">
      <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Movimentações por Categoria
          </CardTitle>
          <Button onClick={onExport} variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar CSV
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {Object.entries(categoryMovements).map(([category, movement]) => (
              <div key={category} className="p-4 bg-slate-50 rounded-lg">
                <h4 className="font-medium text-slate-900 mb-2">{category}</h4>
                <div className="space-y-1 text-sm">
                  <p>Entradas: <span className="font-medium">{movement.entradas}</span></p>
                  <p>Quantidade: <span className="font-medium">{movement.quantidade} UN</span></p>
                  <p>Valor: <span className="font-medium text-green-700">R$ {movement.valor.toFixed(2)}</span></p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-600" />
            Movimentações Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Data</TableHead>
                  <TableHead>Referência</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Setor</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Valor Unit.</TableHead>
                  <TableHead>Valor Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentEntries.map((entry) => {
                  const product = products.find(p => p.id === entry.product_id);
                  return (
                    <TableRow key={entry.id} className="hover:bg-slate-50">
                      <TableCell className="text-sm">
                        {format(new Date(entry.entry_date || entry.created_date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </TableCell>
                      <TableCell className="font-mono text-sm">{entry.reference}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product?.name || 'N/A'}</p>
                          <p className="text-sm text-slate-500">{product?.code || 'N/A'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={origemColors[entry.origem_entrada]}>
                          {entry.origem_entrada}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={setorColors[entry.setor]}>
                          {entry.setor}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{entry.quantity_received}</TableCell>
                      <TableCell>R$ {(entry.unit_cost || 0).toFixed(2)}</TableCell>
                      <TableCell className="font-medium text-green-700">
                        R$ {(entry.quantity_received * (entry.unit_cost || 0)).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}