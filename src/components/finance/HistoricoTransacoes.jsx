import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Calendar, Filter, Download } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function HistoricoTransacoes({ transactions, accounts, isLoading }) {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    type: 'all',
  });

  const historico = useMemo(() => {
    if (!transactions) return [];
    return transactions
      .filter(t => t.status === 'pago')
      .filter(t => {
        if (!filters.startDate || !filters.endDate) return true;
        const paymentDate = parseISO(t.payment_date);
        const startDate = new Date(filters.startDate);
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999); // Incluir o dia inteiro
        return paymentDate >= startDate && paymentDate <= endDate;
      })
      .filter(t => filters.type === 'all' || t.type === filters.type)
      .sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date));
  }, [transactions, filters]);

  const getAccountName = (id) => accounts?.find(a => a.id === id)?.name || 'N/A';

  const exportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Data Pagamento;Descricao;Tipo;Valor;Conta\r\n";
    historico.forEach(t => {
        const row = [
            format(parseISO(t.payment_date), 'dd/MM/yyyy'),
            t.description,
            t.type === 'receita' ? 'Entrada' : 'Saída',
            `"${Math.abs(t.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}"`,
            getAccountName(t.account_id),
        ].join(";");
        csvContent += row + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "historico_financeiro.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <CardTitle>Histórico de Transações</CardTitle>
            <Button onClick={exportCSV} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
            </Button>
        </div>
        <div className="flex flex-col md:flex-row gap-4 pt-4">
            <div className="flex gap-2 items-center">
                <label className="text-sm">De:</label>
                <Input type="date" value={filters.startDate} onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))} />
            </div>
            <div className="flex gap-2 items-center">
                <label className="text-sm">Até:</label>
                <Input type="date" value={filters.endDate} onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))} />
            </div>
            <Select value={filters.type} onValueChange={v => setFilters(f => ({...f, type: v}))}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="receita">Entradas</SelectItem>
                    <SelectItem value="despesa">Saídas</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data Pagto.</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Conta</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan="5" className="text-center">Carregando...</TableCell></TableRow>
            ) : historico.length === 0 ? (
              <TableRow><TableCell colSpan="5" className="text-center h-24">Nenhuma transação encontrada.</TableCell></TableRow>
            ) : (
              historico.map(t => (
                <TableRow key={t.id}>
                  <TableCell>{format(parseISO(t.payment_date), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                  <TableCell>
                    <p className="font-medium">{t.description}</p>
                    <p className="text-sm text-slate-500">{t.category}</p>
                  </TableCell>
                  <TableCell>
                    <Badge className={t.type === 'receita' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {t.type === 'receita' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                      {t.type === 'receita' ? 'Entrada' : 'Saída'}
                    </Badge>
                  </TableCell>
                  <TableCell>{getAccountName(t.account_id)}</TableCell>
                  <TableCell className={`text-right font-mono font-bold ${t.type === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                    R$ {Math.abs(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}