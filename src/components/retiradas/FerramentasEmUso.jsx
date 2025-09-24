import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Package } from "lucide-react";
import { format, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function FerramentasEmUso({ retiradas, products, isLoading }) {
    const isOverdue = (dateStr) => {
        if (!dateStr) return false;
        return isPast(new Date(dateStr));
    };

    if (isLoading) {
        return (
            <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
                <CardHeader>
                    <CardTitle>Carregando Ferramentas em Uso...</CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-32 w-full" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-blue-600" />
                    Ferramentas Atualmente em Uso
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50">
                                <TableHead>Retirada</TableHead>
                                <TableHead>Solicitante</TableHead>
                                <TableHead>Setor</TableHead>
                                <TableHead>Data Retirada</TableHead>
                                <TableHead>Previsão Devolução</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {retiradas.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12">
                                        Nenhuma ferramenta em uso no momento.
                                    </TableCell>
                                </TableRow>
                            )}
                            {retiradas.map(retirada => (
                                <TableRow key={retirada.id} className={isOverdue(retirada.data_prevista_devolucao) ? 'bg-red-50' : ''}>
                                    <TableCell className="font-mono">{retirada.numero_retirada}</TableCell>
                                    <TableCell>{retirada.solicitante_nome}</TableCell>
                                    <TableCell><Badge variant="outline">{retirada.setor}</Badge></TableCell>
                                    <TableCell>{format(new Date(retirada.data_retirada), 'dd/MM/yy HH:mm', { locale: ptBR })}</TableCell>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            {isOverdue(retirada.data_prevista_devolucao) && <AlertTriangle className="w-4 h-4 text-red-600"/>}
                                            <span className={isOverdue(retirada.data_prevista_devolucao) ? 'text-red-600' : ''}>
                                                {format(new Date(retirada.data_prevista_devolucao), 'dd/MM/yyyy', { locale: ptBR })}
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
    );
}