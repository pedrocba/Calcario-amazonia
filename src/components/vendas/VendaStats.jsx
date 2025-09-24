
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ShoppingCart, AlertCircle, CheckCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function VendaStats({ vendas, isLoading }) {
    const stats = React.useMemo(() => {
        const faturadas = vendas.filter(v => v.status === 'faturada');
        const aReceber = faturadas
            .filter(v => v.status !== 'pago')
            .reduce((sum, v) => sum + (v.final_amount || 0), 0);
        
        const vendasEsteMes = vendas.filter(v => {
            if (!v.date) return false;
            try {
                const vendaDate = new Date(v.date);
                return !isNaN(vendaDate.getTime()) && vendaDate.getMonth() === new Date().getMonth();
            } catch {
                return false;
            }
        }).length;
        const vendasCanceladas = vendas.filter(v => v.status === 'cancelada').length;

        return { aReceber, vendasEsteMes, vendasCanceladas };
    }, [vendas]);

    const formatCurrency = (value) => (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
            </div>
        );
    }
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total a Receber</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(stats.aReceber)}</div>
                    <p className="text-xs text-muted-foreground">De vendas faturadas</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Vendas (este mês)</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.vendasEsteMes}</div>
                    <p className="text-xs text-muted-foreground">Total de pedidos criados</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Vendas Canceladas</CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.vendasCanceladas}</div>
                    <p className="text-xs text-muted-foreground">Total de vendas canceladas</p>
                </CardContent>
            </Card>
        </div>
    );
}
