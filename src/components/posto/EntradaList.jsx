import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Trash2, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function EntradaList({ entradas, postos, isLoading, onDelete, onRestore, showDeletedEntries, onToggleDeleted }) {
  const getPostoNome = (id) => {
    return (postos || []).find(p => p.id === id)?.nome || 'N/A';
  };

  return (
    <Card className="bg-white/70 backdrop-blur border-0 shadow-xl mt-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          {showDeletedEntries ? 'Entradas Excluídas' : 'Histórico de Entradas'}
        </CardTitle>
        <Button
          variant="outline"
          onClick={() => onToggleDeleted(!showDeletedEntries)}
          className="flex items-center gap-2"
        >
          {showDeletedEntries ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          {showDeletedEntries ? 'Ver Entradas Ativas' : 'Ver Entradas Excluídas'}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tanque</TableHead>
                <TableHead>Litros</TableHead>
                <TableHead>Custo/L</TableHead>
                <TableHead>Custo Total</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>NF</TableHead>
                {showDeletedEntries && <TableHead>Excluído Por</TableHead>}
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={showDeletedEntries ? "9" : "8"}><Skeleton className="h-8" /></TableCell>
                  </TableRow>
                ))
              ) : (entradas || []).map(entrada => (
                <TableRow key={entrada.id} className={showDeletedEntries ? 'bg-red-50' : ''}>
                  <TableCell>{format(new Date(entrada.data_entrada), "dd/MM/yyyy HH:mm", { locale: ptBR })}</TableCell>
                  <TableCell>{getPostoNome(entrada.posto_id)}</TableCell>
                  <TableCell className="font-medium text-blue-600">{entrada.quantidade_litros.toLocaleString('pt-BR')} L</TableCell>
                  <TableCell>R$ {entrada.custo_por_litro.toFixed(2)}</TableCell>
                  <TableCell className="font-semibold text-green-700">R$ {entrada.custo_total.toFixed(2)}</TableCell>
                  <TableCell>{entrada.fornecedor}</TableCell>
                  <TableCell>{entrada.nota_fiscal}</TableCell>
                  {showDeletedEntries && (
                    <TableCell>
                      <Badge variant="outline" className="text-xs bg-red-100 text-red-800">
                        {entrada.excluido_por || 'N/A'}
                      </Badge>
                    </TableCell>
                  )}
                  <TableCell>
                    {showDeletedEntries ? (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => onRestore(entrada)} 
                        className="text-green-600 hover:text-green-800 hover:bg-green-50"
                        title="Restaurar Entrada"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => onDelete(entrada)} 
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        title="Marcar como Excluída"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!isLoading && (entradas || []).length === 0 && (
            <div className="text-center py-8 text-slate-500">
              {showDeletedEntries ? 'Nenhuma entrada excluída encontrada.' : 'Nenhuma entrada ativa encontrada.'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}