import React, { useState, useEffect, useMemo } from 'react';
import { FinancialTransaction, RecurringCost } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Repeat, DollarSign, Check, Clock } from 'lucide-react';
import { format, getYear, getMonth, setYear, setMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function FixedCostReport() {
  const [transactions, setTransactions] = useState([]);
  const [recurringCosts, setRecurringCosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentDate, setCurrentDate] = useState(new Date());

  const years = [2023, 2024, 2025];
  const months = Array.from({length: 12}, (_, i) => ({ value: i, label: format(new Date(0, i), 'MMMM', {locale: ptBR})}));

  useEffect(() => {
    loadData();
  }, [currentDate]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const start = new Date(getYear(currentDate), getMonth(currentDate), 1);
      const end = new Date(getYear(currentDate), getMonth(currentDate) + 1, 0);

      const [transData, recurringData] = await Promise.all([
        FinancialTransaction.filter({ is_recurring: true, due_date: { gte: format(start, 'yyyy-MM-dd'), lte: format(end, 'yyyy-MM-dd') }}),
        RecurringCost.list(),
      ]);
      setTransactions(transData || []);
      setRecurringCosts(recurringData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
    setIsLoading(false);
  };

  const reportData = useMemo(() => {
    const totalPrevisto = recurringCosts.filter(rc => rc.is_active).reduce((sum, rc) => sum + rc.amount, 0);
    const totalLancado = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const totalPago = transactions.filter(t => t.status === 'pago').reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const totalPendente = totalLancado - totalPago;

    const byCategory = transactions.reduce((acc, t) => {
        const category = t.category || 'outros';
        if (!acc[category]) {
            acc[category] = { pago: 0, pendente: 0 };
        }
        if (t.status === 'pago') {
            acc[category].pago += Math.abs(t.amount);
        } else {
            acc[category].pendente += Math.abs(t.amount);
        }
        return acc;
    }, {});
    
    const chartData = Object.keys(byCategory).map(key => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        Pago: byCategory[key].pago,
        Pendente: byCategory[key].pendente
    }));

    return { totalPrevisto, totalLancado, totalPago, totalPendente, chartData };
  }, [transactions, recurringCosts]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <Repeat className="w-8 h-8 text-teal-600" />
            Relatório de Custos Fixos
          </h1>
          <p className="text-slate-600">Análise de despesas recorrentes geradas automaticamente.</p>
        </div>

        <Card className="mb-6 bg-white/70 backdrop-blur border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Filtro de Período</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Select value={getYear(currentDate)} onValueChange={y => setCurrentDate(setYear(currentDate, y))}>
                <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                <SelectContent>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={getMonth(currentDate)} onValueChange={m => setCurrentDate(setMonth(currentDate, m))}>
                <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                <SelectContent>{months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
            </Select>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card><CardHeader><CardTitle>Total Previsto</CardTitle></CardHeader><CardContent className="text-2xl font-bold">R$ {reportData.totalPrevisto.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</CardContent></Card>
          <Card><CardHeader><CardTitle>Total Lançado</CardTitle></CardHeader><CardContent className="text-2xl font-bold">R$ {reportData.totalLancado.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</CardContent></Card>
          <Card><CardHeader><CardTitle>Total Pago</CardTitle></CardHeader><CardContent className="text-2xl font-bold text-green-600">R$ {reportData.totalPago.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</CardContent></Card>
          <Card><CardHeader><CardTitle>Total Pendente</CardTitle></CardHeader><CardContent className="text-2xl font-bold text-red-600">R$ {reportData.totalPendente.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</CardContent></Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader><CardTitle>Despesas por Categoria</CardTitle></CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={reportData.chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
                            <Legend />
                            <Bar dataKey="Pago" stackId="a" fill="#22c55e" />
                            <Bar dataKey="Pendente" stackId="a" fill="#ef4444" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Detalhes dos Lançamentos</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow><TableHead>Descrição</TableHead><TableHead>Valor</TableHead><TableHead>Status</TableHead></TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? <TableRow><TableCell colSpan="3">Carregando...</TableCell></TableRow> : 
                            transactions.map(t => (
                                <TableRow key={t.id}>
                                    <TableCell>{t.description}</TableCell>
                                    <TableCell>R$ {Math.abs(t.amount).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${t.status === 'pago' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {t.status}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>

      </div>
    </div>
  );
}