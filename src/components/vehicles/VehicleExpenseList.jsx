import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Wrench } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function VehicleExpenseList({ records, isLoading }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return format(new Date(dateStr), "dd/MM/yyyy", { locale: ptBR });
  };
  
  return (
    <Card className="bg-white/70">
      <CardHeader>
        <CardTitle className="flex items-center gap-3"><Wrench className="w-5 h-5 text-purple-500" /> Histórico de Despesas</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Custo</TableHead>
              <TableHead>Fornecedor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan="5"><Skeleton className="h-20" /></TableCell></TableRow>
            ) : records.length === 0 ? (
              <TableRow><TableCell colSpan="5" className="text-center h-24">Nenhuma despesa registrada.</TableCell></TableRow>
            ) : (
              records.map(rec => (
                <TableRow key={rec.id}>
                  <TableCell>{formatDate(rec.date)}</TableCell>
                  <TableCell className="capitalize">{rec.category.replace('_', ' ')}</TableCell>
                  <TableCell>{rec.description}</TableCell>
                  <TableCell>R$ {rec.cost.toFixed(2)}</TableCell>
                  <TableCell>{rec.supplier}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}