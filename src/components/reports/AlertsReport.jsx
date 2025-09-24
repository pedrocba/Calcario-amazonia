import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, AlertTriangle, CheckCircle } from "lucide-react";

const setorColors = {
  santarem: 'bg-green-100 text-green-800',
  fazenda: 'bg-blue-100 text-blue-800'
};

export default function AlertsReport({ data, products, stockEntries, isLoading, onExport }) {
  const { lowStockItems } = data;

  const getProductStock = (productId) => {
    return stockEntries
      .filter(s => s.product_id === productId && s.status === 'ativo')
      .reduce((sum, entry) => sum + entry.quantity_available, 0);
  };

  const getProductStockBySetor = (productId, setor) => {
    return stockEntries
      .filter(s => s.product_id === productId && s.status === 'ativo' && s.setor === setor)
      .reduce((sum, entry) => sum + entry.quantity_available, 0);
  };

  const criticalItems = lowStockItems.filter(product => {
    const currentStock = getProductStock(product.id);
    return currentStock === 0;
  });

  const warningItems = lowStockItems.filter(product => {
    const currentStock = getProductStock(product.id);
    return currentStock > 0 && currentStock <= product.min_qty;
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Estoque Zerado</p>
                <p className="text-2xl font-bold text-red-900">{criticalItems.length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Estoque Baixo</p>
                <p className="text-2xl font-bold text-orange-900">{warningItems.length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Estoque Normal</p>
                <p className="text-2xl font-bold text-green-900">{products.length - lowStockItems.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Produtos com Alertas de Estoque
          </CardTitle>
          <Button onClick={onExport} variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar CSV
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Severidade</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Estoque Atual</TableHead>
                  <TableHead>Estoque Mínimo</TableHead>
                  <TableHead>Santarém</TableHead>
                  <TableHead>Fazenda</TableHead>
                  <TableHead>Ação Recomendada</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockItems.map((product) => {
                  const currentStock = getProductStock(product.id);
                  const santaremStock = getProductStockBySetor(product.id, 'santarem');
                  const fazendaStock = getProductStockBySetor(product.id, 'fazenda');
                  const isCritical = currentStock === 0;

                  return (
                    <TableRow key={product.id} className="hover:bg-slate-50">
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={isCritical ? 'bg-red-100 text-red-800 border-red-200' : 'bg-orange-100 text-orange-800 border-orange-200'}
                        >
                          {isCritical ? 'CRÍTICO' : 'ATENÇÃO'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-900">{product.name}</p>
                          <p className="text-sm text-slate-500">{product.description || 'Sem descrição'}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{product.code}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">
                          {product.category}
                        </Badge>
                      </TableCell>
                      <TableCell className={`font-bold ${isCritical ? 'text-red-600' : 'text-orange-600'}`}>
                        {currentStock} UN
                      </TableCell>
                      <TableCell className="font-medium">{product.min_qty} UN</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={setorColors.santarem}>
                          {santaremStock} UN
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={setorColors.fazenda}>
                          {fazendaStock} UN
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {isCritical ? (
                          <span className="text-red-600 font-medium">Compra urgente necessária</span>
                        ) : (
                          <span className="text-orange-600 font-medium">Avaliar reposição</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            
            {lowStockItems.length === 0 && (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhum alerta de estoque</h3>
                <p className="text-slate-500">Todos os produtos estão com estoque adequado.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}