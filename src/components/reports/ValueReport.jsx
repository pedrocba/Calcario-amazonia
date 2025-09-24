import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, DollarSign } from "lucide-react";

const setorColors = {
  santarem: 'bg-green-100 text-green-800',
  fazenda: 'bg-blue-100 text-blue-800'
};

export default function ValueReport({ data, products, isLoading, onExport }) {
  const { topProductsByValue, totalValue } = data;

  return (
    <div className="space-y-6">
      <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-blue-600" />
            Produtos por Valor de Estoque
          </CardTitle>
          <Button onClick={onExport} variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar CSV
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-slate-600">Valor Total do Estoque</p>
              <p className="text-3xl font-bold text-slate-900">
                R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Posição</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Quantidade Total</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>% do Estoque</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProductsByValue.map((item, index) => (
                  <TableRow key={item.product.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium text-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-orange-500' : 'bg-slate-300'
                      }`}>
                        {index + 1}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900">{item.product.name}</p>
                        <p className="text-sm text-slate-500">{item.product.description || 'Sem descrição'}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{item.product.code}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        {item.product.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{item.totalQuantity.toFixed(0)} UN</TableCell>
                    <TableCell className="font-bold text-green-700">
                      R$ {item.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(item.totalValue / totalValue) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">
                          {((item.totalValue / totalValue) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}