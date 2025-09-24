import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Package, MapPin } from "lucide-react";

const categoryColors = {
  equipamentos: 'bg-blue-100 text-blue-800',
  pecas_reposicao: 'bg-orange-100 text-orange-800',
  ferramentas: 'bg-purple-100 text-purple-800',
  epi: 'bg-green-100 text-green-800',
  combustiveis: 'bg-yellow-100 text-yellow-800',
  materia_prima: 'bg-gray-100 text-gray-800'
};

const setorColors = {
  santarem: 'bg-green-100 text-green-800',
  fazenda: 'bg-blue-100 text-blue-800'
};

export default function ProdutosList({ produtos, isLoading, onEdit }) {
  return (
    <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <Package className="w-5 h-5 text-blue-600" />
          Produtos do Almoxarifado ({isLoading ? '...' : produtos.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-100">
                <TableHead>Código</TableHead>
                <TableHead>Nome do Produto</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Setor</TableHead>
                <TableHead>📍 Local de Onde Pegar</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead>Custo</TableHead>
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
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 rounded" /></TableCell>
                  </TableRow>
                ))
              ) : (
                produtos.map((produto) => (
                  <TableRow key={produto.id} className="hover:bg-slate-50">
                    <TableCell className="font-mono text-sm font-medium">
                      {produto.codigo_interno}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900">{produto.nome_do_produto}</p>
                        <p className="text-sm text-slate-500">{produto.unidade_medida}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={categoryColors[produto.categoria] || 'bg-gray-100 text-gray-800'}>
                        {produto.categoria}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={setorColors[produto.setor]}>
                        {produto.setor}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-900">
                          {produto.localizacao || 'Não definido'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <span className="font-bold text-lg text-slate-900">
                          {produto.quantidade_estoque}
                        </span>
                        {produto.quantidade_minima > 0 && produto.quantidade_estoque <= produto.quantidade_minima && (
                          <div className="text-xs text-red-600 font-medium">
                            ⚠️ Estoque baixo
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {produto.custo_unitario > 0 ? (
                        <span className="font-medium">R$ {produto.custo_unitario.toFixed(2)}</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => onEdit(produto)} 
                        className="hover:bg-blue-50 hover:text-blue-700"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {!isLoading && produtos.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhum produto cadastrado</h3>
              <p className="text-slate-500">Cadastre o primeiro produto do almoxarifado.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}