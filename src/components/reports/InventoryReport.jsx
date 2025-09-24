import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Package } from "lucide-react";

const categoryLabels = {
  equipamentos: 'Equipamentos',
  pecas_reposicao: 'Peças de Reposição',
  ferramentas: 'Ferramentas',
  epi: 'EPI',
  combustiveis: 'Combustíveis',
  materia_prima: 'Matéria Prima'
};

const setorColors = {
  santarem: 'bg-green-100 text-green-800',
  fazenda: 'bg-blue-100 text-blue-800'
};

export default function InventoryReport({ data, products, isLoading, onExport }) {
  const { filteredStock } = data;

  // Agrupar por categoria
  const stockByCategory = {};
  filteredStock.forEach(entry => {
    const product = products.find(p => p.id === entry.product_id);
    if (product) {
      if (!stockByCategory[product.category]) {
        stockByCategory[product.category] = {
          items: [],
          totalQuantity: 0,
          totalValue: 0
        };
      }
      stockByCategory[product.category].items.push({ ...entry, product });
      stockByCategory[product.category].totalQuantity += entry.quantity_available;
      stockByCategory[product.category].totalValue += (entry.quantity_available * (entry.unit_cost || 0));
    }
  });

  return (
    <div className="space-y-6">
      <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <Package className="w-5 h-5 text-blue-600" />
            Relatório de Estoque por Categoria
          </CardTitle>
          <Button onClick={onExport} variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar CSV
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {Object.entries(stockByCategory).map(([category, categoryData]) => (
              <div key={category}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {categoryLabels[category] || category}
                  </h3>
                  <div className="flex gap-4 text-sm text-slate-600">
                    <span>Total: {categoryData.totalQuantity} UN</span>
                    <span>Valor: R$ {categoryData.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead>Produto</TableHead>
                        <TableHead>Código</TableHead>
                        <TableHead>Setor</TableHead>
                        <TableHead>Localização</TableHead>
                        <TableHead>Quantidade</TableHead>
                        <TableHead>Custo Unit.</TableHead>
                        <TableHead>Valor Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categoryData.items.map((item) => (
                        <TableRow key={item.id} className="hover:bg-slate-50">
                          <TableCell className="font-medium">{item.product.name}</TableCell>
                          <TableCell className="font-mono text-sm">{item.product.code}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={setorColors[item.setor]}>
                              {item.setor}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{item.warehouse_location || '-'}</TableCell>
                          <TableCell className="font-medium">{item.quantity_available}</TableCell>
                          <TableCell>R$ {(item.unit_cost || 0).toFixed(2)}</TableCell>
                          <TableCell className="font-medium text-green-700">
                            R$ {(item.quantity_available * (item.unit_cost || 0)).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}