
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Package, Trash2, Settings } from "lucide-react";

const categoryMeta = {
  equipamentos: { label: 'Equipamentos', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  pecas_reposicao: { label: 'Peças de Reposição', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  ferramentas: { label: 'Ferramentas', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  epi: { label: 'EPI', color: 'bg-green-100 text-green-800 border-green-200' },
  combustiveis: { label: 'Combustíveis', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  lubrificantes: { label: 'Lubrificantes', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
  materia_prima: { label: 'Matéria Prima', color: 'bg-gray-100 text-gray-800 border-gray-200' },
  utilidades: { label: 'Utilidades', color: 'bg-pink-100 text-pink-800 border-pink-200' }
};

const conditionMeta = {
  novo: { label: 'Novo', color: 'bg-green-100 text-green-800' },
  usado: { label: 'Usado', color: 'bg-yellow-100 text-yellow-800' },
  recondicionado: { label: 'Recondicionado', color: 'bg-blue-100 text-blue-800' }
};

export default function ProductList({ products, isLoading, onEdit, onDelete, onAdjustStock }) {
  const getMeta = (map, key) => map[key] || { label: key, color: 'bg-gray-100 text-gray-800' };

  return (
    <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <Package className="w-5 h-5 text-blue-600" />
          Lista de Produtos ({isLoading ? '...' : products.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-100">
                <TableHead>Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Custo</TableHead>
                <TableHead>Venda</TableHead>
                <TableHead>Margem</TableHead>
                <TableHead>Estoque Atual</TableHead>
                <TableHead>Estoque Min/Max</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell> {/* New Skeleton for Estoque Atual */}
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                  </TableRow>
                ))
              ) : (
                products.map((product) => (
                  <TableRow key={product.id} className="hover:bg-slate-50">
                    <TableCell className="font-mono text-sm">{product.code}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900">{product.name}</p>
                        {product.description && (
                          <p className="text-sm text-slate-500 truncate max-w-xs">{product.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getMeta(categoryMeta, product.category).color}>
                        {getMeta(categoryMeta, product.category).label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {product.cost_price > 0 ? (
                        <span className="font-medium">R$ {product.cost_price.toFixed(2)}</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {product.sale_price > 0 ? (
                        <span className="font-bold text-green-700">R$ {product.sale_price.toFixed(2)}</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </TableCell>
                     <TableCell>
                      {product.profit_margin !== undefined && product.profit_margin !== null ? (
                        <span className="text-sm text-blue-600">{product.profit_margin.toFixed(1)}%</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`font-bold text-lg ${product.current_stock !== undefined && product.current_stock <= product.min_qty && product.min_qty > 0 ? 'text-red-600' : 'text-slate-800'}`}>
                        {product.current_stock}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{product.min_qty} / {product.max_qty}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={product.active ? 'bg-green-600' : 'bg-slate-500'}>
                        {product.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(product)}
                          className="hover:bg-blue-50 hover:text-blue-700"
                          title="Editar produto"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onAdjustStock && onAdjustStock(product)}
                          className="hover:bg-orange-50 hover:text-orange-700"
                          title="Ajustar estoque"
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                        {product.active && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(product)}
                            className="hover:bg-red-50 hover:text-red-700"
                            title="Excluir produto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {!isLoading && products.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhum produto encontrado</h3>
              <p className="text-slate-500">Tente ajustar seus filtros ou cadastre um novo produto.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
