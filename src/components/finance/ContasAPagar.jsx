
import React, { useState, useMemo, useRef } from 'react';
import { FinancialTransaction } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  Clock,
  Calendar,
  DollarSign,
  Filter,
  Download,
  CreditCard,
  Plus
} from 'lucide-react';
import { differenceInDays, format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import TransactionForm from './TransactionForm';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompany } from '../common/CompanyContext';

export default function ContasAPagar({ transactions, accounts, contacts, isLoading, refreshData }) {
  const { currentCompany } = useCompany();
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [showForm, setShowForm] = useState(false);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [paymentData, setPaymentData] = useState({
    payment_date: new Date().toISOString().split('T')[0],
    notes: '',
    account_id: ''
  });

  const handleFormSubmit = async (data) => {
    try {
      // Garante que o valor seja negativo para despesas
      const finalData = {
          ...data,
          amount: -Math.abs(data.amount),
          type: 'despesa'
      };
      await FinancialTransaction.create(finalData);
      setShowForm(false);
      await refreshData();
      alert('Conta a pagar adicionada com sucesso!');
    } catch (error) {
        console.error("Erro ao adicionar conta a pagar:", error);
        alert('Erro ao salvar a conta. Verifique os dados e tente novamente.');
    }
  };

  const handleCardClick = (period) => {
    setSelectedPeriod(period);
  };

  const categorizedTransactions = useMemo(() => {
    // Verificar se transactions existe e é um array
    if (!transactions || !Array.isArray(transactions)) {
      return {
        atrasadas: [],
        hoje: [],
        proximos7dias: [],
        proximos30dias: [],
        filtered: []
      };
    }

    const today = new Date();

    const categorize = (transaction) => {
      // Adicionado T12:00:00 para evitar problemas de fuso horário
      const dueDate = parse(transaction.due_date, 'yyyy-MM-dd', new Date());
      const daysDiff = differenceInDays(dueDate, today);

      if (daysDiff < 0) return 'atrasadas';
      if (daysDiff === 0) return 'hoje';
      if (daysDiff <= 7) return 'proximos7dias';
      if (daysDiff <= 30) return 'proximos30dias';
      return 'futuras';
    };

    const filtered = transactions.filter(t => {
      if (selectedPeriod === 'all') return true;
      return categorize(t) === selectedPeriod;
    });

    return {
      atrasadas: transactions.filter(t => categorize(t) === 'atrasadas'),
      hoje: transactions.filter(t => categorize(t) === 'hoje'),
      proximos7dias: transactions.filter(t => categorize(t) === 'proximos7dias'),
      proximos30dias: transactions.filter(t => categorize(t) === 'proximos30dias'),
      filtered: filtered
    };
  }, [transactions, selectedPeriod]);

  const financialSummary = useMemo(() => {
    const calculateTotal = (list) => list.reduce((acc, t) => acc + Math.abs(t.amount), 0);

    return {
      atrasadas: calculateTotal(categorizedTransactions.atrasadas),
      hoje: calculateTotal(categorizedTransactions.hoje),
      proximos7dias: calculateTotal(categorizedTransactions.proximos7dias),
      proximos30dias: calculateTotal(categorizedTransactions.proximos30dias),
    };
  }, [categorizedTransactions]);

  const getAccountName = (id) => {
    if (!accounts || !Array.isArray(accounts)) return 'N/A';
    return accounts.find(a => a.id === id)?.name || 'N/A';
  };
  
  const getContactName = (id) => {
    if (!contacts || !Array.isArray(contacts)) return 'N/A';
    return contacts.find(c => c.id === id)?.name || 'N/A';
  };

  const getStatusBadge = (transaction) => {
    // Adicionado T12:00:00 para evitar problemas de fuso horário
    const dueDate = parse(transaction.due_date, 'yyyy-MM-dd', new Date());
    const today = new Date();
    const daysDiff = differenceInDays(dueDate, today);

    if (daysDiff < 0) {
      return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />Atrasado ({Math.abs(daysDiff)} dias)</Badge>;
    }
    if (daysDiff === 0) {
      return <Badge className="bg-orange-100 text-orange-800"><Clock className="w-3 h-3 mr-1" />Vence Hoje</Badge>;
    }
    if (daysDiff <= 7) {
      return <Badge className="bg-yellow-100 text-yellow-800"><Calendar className="w-3 h-3 mr-1" />{daysDiff} dias</Badge>;
    }
    return <Badge variant="outline">{daysDiff} dias</Badge>;
  };

  const handlePayment = (transaction) => {
    setSelectedTransaction(transaction);
    setPaymentData({
      payment_date: new Date().toISOString().split('T')[0],
      notes: '',
      account_id: transaction.account_id || ''
    });
    setShowPaymentModal(true);
  };

  const confirmPayment = async () => {
    if (!selectedTransaction || !paymentData.account_id) {
        alert("Por favor, selecione uma conta financeira para o pagamento.");
        return;
    }

    try {
      await FinancialTransaction.update(selectedTransaction.id, {
        status: 'pago',
        payment_date: paymentData.payment_date,
        notes: paymentData.notes,
        account_id: paymentData.account_id
      });

      setShowPaymentModal(false);
      setSelectedTransaction(null);
      await refreshData();
      alert(`Conta paga com sucesso!`);
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
      alert('Erro ao processar pagamento. Tente novamente.');
    }
  };

  const exportarCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Descricao;Vencimento;Valor;Status;Dias;Conta;Fornecedor\r\n";

    categorizedTransactions.filtered.forEach(t => {
      const daysDiff = differenceInDays(new Date(t.due_date), new Date());
      let status = '';
      if (daysDiff < 0) status = `Atrasado ${Math.abs(daysDiff)} dias`;
      else if (daysDiff === 0) status = 'Vence Hoje';
      else status = `${daysDiff} dias`;

      const row = [
        t.description,
        format(parse(t.due_date, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy'),
        Math.abs(t.amount).toFixed(2).replace('.', ','),
        status,
        daysDiff,
        getAccountName(t.account_id),
        getContactName(t.contact_id)
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(";");
      csvContent += row + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `contas_a_pagar_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[{period: 'atrasadas', title: 'Contas Atrasadas', count: categorizedTransactions.atrasadas.length, value: financialSummary.atrasadas, color: 'red', Icon: AlertTriangle},
          {period: 'hoje', title: 'Vencem Hoje', count: categorizedTransactions.hoje.length, value: financialSummary.hoje, color: 'orange', Icon: Clock},
          {period: 'proximos7dias', title: 'Próximos 7 Dias', count: categorizedTransactions.proximos7dias.length, value: financialSummary.proximos7dias, color: 'yellow', Icon: Calendar},
          {period: 'proximos30dias', title: 'Próximos 30 Dias', count: categorizedTransactions.proximos30dias.length, value: financialSummary.proximos30dias, color: 'blue', Icon: DollarSign}].map(item => (
            <Card
              key={item.period}
              className={`border-${item.color}-200 bg-${item.color}-50 cursor-pointer transition-all hover:shadow-lg ${selectedPeriod === item.period ? `ring-2 ring-${item.color}-400` : ''}`}
              onClick={() => handleCardClick(item.period)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium text-${item.color}-600`}>{item.title}</p>
                    <p className={`text-xs text-${item.color}-500 mb-2`}>{item.count} contas</p>
                    <p className={`text-lg font-bold text-${item.color}-700`}>A Pagar: R$ {item.value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                  </div>
                  <item.Icon className={`w-8 h-8 text-${item.color}-500`} />
                </div>
              </CardContent>
            </Card>
        ))}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <TransactionForm
              transaction={null} // Para um novo lançamento
              accounts={accounts}
              contacts={contacts}
              onSubmit={handleFormSubmit}
              onCancel={() => setShowForm(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <CardTitle>Contas a Pagar</CardTitle>
              {selectedPeriod !== 'all' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPeriod('all')}
                  className="text-xs"
                >
                  🔄 Limpar Filtro
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowForm(prev => !prev)} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Plus className="w-4 h-4 mr-2" />
                {showForm ? 'Fechar Formulário' : 'Nova Conta Manual'}
              </Button>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Contas</SelectItem>
                  <SelectItem value="atrasadas">Apenas Atrasadas</SelectItem>
                  <SelectItem value="hoje">Vencem Hoje</SelectItem>
                  <SelectItem value="proximos7dias">Próximos 7 Dias</SelectItem>
                  <SelectItem value="proximos30dias">Próximos 30 Dias</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={exportarCSV} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {selectedPeriod !== 'all' && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <Filter className="w-4 h-4 inline mr-2" />
                Mostrando apenas: <strong>
                  {selectedPeriod === 'atrasadas' && 'Contas Atrasadas'}
                  {selectedPeriod === 'hoje' && 'Contas que Vencem Hoje'}
                  {selectedPeriod === 'proximos7dias' && 'Contas dos Próximos 7 Dias'}
                  {selectedPeriod === 'proximos30dias' && 'Contas dos Próximos 30 Dias'}
                </strong>
                ({categorizedTransactions.filtered.length} contas)
              </p>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan="6" className="text-center">Carregando...</TableCell></TableRow>
              ) : categorizedTransactions.filtered.length === 0 ? (
                <TableRow><TableCell colSpan="6" className="text-center h-24">Nenhuma conta a pagar encontrada para os filtros selecionados.</TableCell></TableRow>
              ) : (
                categorizedTransactions.filtered
                  .sort((a, b) => parse(a.due_date, 'yyyy-MM-dd', new Date()) - parse(b.due_date, 'yyyy-MM-dd', new Date()))
                  .map(transaction => (
                    <TableRow key={transaction.id} className={differenceInDays(parse(transaction.due_date, 'yyyy-MM-dd', new Date()), new Date()) < 0 ? 'bg-red-50' : ''}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-slate-500">{transaction.category}</p>
                        </div>
                      </TableCell>
                      <TableCell>{format(parse(transaction.due_date, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                      <TableCell className="font-bold text-red-600">
                        R$ {Math.abs(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>{getStatusBadge(transaction)}</TableCell>
                      <TableCell className="text-sm">{getContactName(transaction.contact_id)}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handlePayment(transaction)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <CreditCard className="w-3 h-3 mr-1" />Pagar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Pagamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="font-medium">{selectedTransaction?.description}</p>
              <p className="text-lg font-bold text-slate-900">
                R$ {selectedTransaction ? Math.abs(selectedTransaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
              </p>
              <p className="text-sm text-slate-500">
                Vencimento: {selectedTransaction ? format(parse(selectedTransaction.due_date, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy') : ''}
              </p>
            </div>

            <div>
              <Label htmlFor="payment_date">Data do Pagamento</Label>
              <Input
                id="payment_date"
                type="date"
                value={paymentData.payment_date}
                onChange={(e) => setPaymentData(prev => ({...prev, payment_date: e.target.value}))}
              />
            </div>

            <div>
              <Label htmlFor="account_id">Conta Financeira *</Label>
              <Select value={paymentData.account_id} onValueChange={(value) => setPaymentData(prev => ({...prev, account_id: value}))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a conta" />
                </SelectTrigger>
                <SelectContent>
                  {accounts
                    .sort((a, b) => a.name.localeCompare(b.name)) // ORGANIZADO ALFABETICAMENTE
                    .map(account => (
                      <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Observações (opcional)</Label>
              <Textarea
                id="notes"
                placeholder="Adicione observações sobre este pagamento..."
                value={paymentData.notes}
                onChange={(e) => setPaymentData(prev => ({...prev, notes: e.target.value}))}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowPaymentModal(false)}>
                Cancelar
              </Button>
              <Button onClick={confirmPayment} className="bg-blue-600 hover:bg-blue-700">
                Confirmar Pagamento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
