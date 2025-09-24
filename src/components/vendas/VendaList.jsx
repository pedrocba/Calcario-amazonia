
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MoreHorizontal, FileText, XCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom'; // Assuming react-router-dom for Link
import { createPageUrl } from '@/utils'; // Added import for createPageUrl

export default function VendaList({ vendas, isLoading, onCancelVenda }) { // Removed createPageUrl from props

    const getStatusColor = (status) => {
        const colors = {
            pendente: 'bg-yellow-100 text-yellow-800',
            parcial: 'bg-blue-100 text-blue-800',
            pago: 'bg-green-100 text-green-800',
            aguardando: 'bg-slate-100 text-slate-800',
            total: 'bg-green-100 text-green-800',
            faturada: 'bg-blue-100 text-blue-800',
            concluida: 'bg-blue-100 text-blue-800',
            cancelada: 'bg-red-100 text-red-800',
            rascunho: 'bg-gray-100 text-gray-800'
        };
        return colors[status] || colors.rascunho;
    };

    const formatCurrency = (value) => (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const formatDate = (date) => {
        if (!date) return 'N/A';
        try {
            const dateObj = new Date(date);
            if (isNaN(dateObj.getTime())) {
                console.warn('Data inválida:', date);
                return 'Data inválida';
            }
            return format(dateObj, "dd/MM/yyyy HH:mm", { locale: ptBR });
        } catch (error) {
            console.error('Erro ao formatar data:', error, 'Data original:', date);
            return 'Erro na data';
        }
    };

    return (
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
                <CardTitle>Histórico de Vendas</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nº Venda</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Data</TableHead>
                                <TableHead className="text-right">Valor Total</TableHead>
                                <TableHead>Pagamento</TableHead>
                                <TableHead>Retirada</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={8}><Skeleton className="h-8 w-full" /></TableCell>
                                    </TableRow>
                                ))
                            ) : vendas.map(venda => (
                                <TableRow key={venda.id}>
                                    <TableCell className="font-mono">{venda.id.slice(0, 8)}</TableCell>
                                    <TableCell>{venda.client?.name || 'Cliente não encontrado'}</TableCell>
                                    <TableCell>{formatDate(venda.date)}</TableCell>
                                    <TableCell className="text-right font-mono">{formatCurrency(venda.final_amount)}</TableCell>
                                    <TableCell><Badge className={getStatusColor(venda.status)}>{venda.status}</Badge></TableCell>
                                    <TableCell><Badge className={getStatusColor(venda.status)}>{venda.status}</Badge></TableCell>
                                    <TableCell><Badge className={getStatusColor(venda.status)}>{venda.status}</Badge></TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem asChild>
                                                    <Link to={`/VendaDetalhes/${venda.id}`}>
                                                        <FileText className="w-4 h-4 mr-2" /> Ver Detalhes
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onCancelVenda(venda)} className="text-red-600">
                                                    <XCircle className="w-4 h-4 mr-2" /> Cancelar Venda
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
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
