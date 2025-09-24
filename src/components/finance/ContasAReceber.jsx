
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FinancialTransaction, FinancialAccount } from '@/api/entities'; 
import { 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  CreditCard,
  Plus
} from 'lucide-react';
import { format, parse } from 'date-fns'; // Importar 'parse'
import { ptBR } from 'date-fns/locale';

export default function ContasAReceber({ data, accounts, contacts, isLoading, onRefresh }) {
  const [showReceiveDialog, setShowReceiveDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showEditDateDialog, setShowEditDateDialog] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [newDueDate, setNewDueDate] = useState('');
  const [receiveData, setReceiveData] = useState({
    valor_recebido: '',
    data_pagamento: new Date().toISOString().split('T')[0],
    account_id: '',
    observacoes: '',
    meio_pagamento: 'dinheiro'
  });

  const contasAReceber = useMemo(() => {
    // Verificação de segurança para evitar o erro .filter of undefined
    if (!data || !Array.isArray(data)) {
      return [];
    }
    return data.filter(t => t.type === 'receita');
  }, [data]);

  const handleEditDate = (transaction) => {
    setEditingTransaction(transaction);
    setNewDueDate(transaction.due_date); // Assuming due_date is already in YYYY-MM-DD format
    setShowEditDateDialog(true);
  };

  const handleUpdateDate = async () => {
    if (!editingTransaction || !newDueDate) {
      alert('Por favor, selecione uma data válida.');
      return;
    }

    try {
      await FinancialTransaction.update(editingTransaction.id, {
        due_date: newDueDate
      });
      
      alert('Data de vencimento atualizada com sucesso!');
      setShowEditDateDialog(false);
      setEditingTransaction(null);
      onRefresh();
    } catch (error) {
      console.error('Erro ao atualizar data:', error);
      alert('Erro ao atualizar a data. Tente novamente.');
    }
  };

  const handleReceiveClick = (transaction) => {
    const valorPendente = Math.abs(transaction.amount) - (transaction.valor_pago || 0);
    setSelectedTransaction(transaction);
    setReceiveData({
      valor_recebido: valorPendente.toString(),
      data_pagamento: new Date().toISOString().split('T')[0],
      // Verificação de segurança para accounts
      account_id: (accounts && accounts.length > 0) ? accounts[0].id : '',
      observacoes: '',
      meio_pagamento: 'dinheiro'
    });
    setShowReceiveDialog(true);
  };

  const handleConfirmReceive = async () => {
    if (!selectedTransaction || !receiveData.valor_recebido || !receiveData.account_id) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    const valorRecebido = parseFloat(receiveData.valor_recebido);
    const valorTotal = Math.abs(selectedTransaction.amount);
    const valorJaPago = selectedTransaction.valor_pago || 0;
    const novoValorPago = valorJaPago + valorRecebido;

    if (valorRecebido <= 0) {
      alert('O valor recebido deve ser maior que zero.');
      return;
    }

    if (novoValorPago > valorTotal) {
      alert(`O valor total pago (R$ ${novoValorPago.toFixed(2)}) não pode ser maior que o valor da conta (R$ ${valorTotal.toFixed(2)}).`);
      return;
    }

    try {
      // Determinar novo status
      let novoStatus;
      if (novoValorPago >= valorTotal) {
        novoStatus = 'pago';
      } else if (novoValorPago > 0) {
        novoStatus = 'parcial';
      } else {
        novoStatus = 'pendente';
      }

      // Atualizar a transação original
      await FinancialTransaction.update(selectedTransaction.id, {
        valor_pago: novoValorPago,
        status: novoStatus,
        payment_date: novoStatus === 'pago' ? receiveData.data_pagamento : selectedTransaction.payment_date,
        account_id: receiveData.account_id,
        notes: selectedTransaction.notes ? 
          `${selectedTransaction.notes}\n--- Recebimento ${format(new Date(), 'dd/MM/yyyy HH:mm')} ---\nR$ ${valorRecebido.toFixed(2)} via ${receiveData.meio_pagamento}${receiveData.observacoes ? `\nObs: ${receiveData.observacoes}` : ''}` :
          `Recebimento ${format(new Date(), 'dd/MM/yyyy HH:mm')}: R$ ${valorRecebido.toFixed(2)} via ${receiveData.meio_pagamento}${receiveData.observacoes ? `\nObs: ${receiveData.observacoes}` : ''}`
      });

      // Criar entrada no fluxo de caixa se não for o valor total
      if (novoStatus === 'parcial') {
        await FinancialTransaction.create({
          description: `Recebimento parcial: ${selectedTransaction.description}`,
          amount: valorRecebido,
          type: 'receita',
          category: 'venda_servico',
          status: 'pago',
          due_date: receiveData.data_pagamento,
          payment_date: receiveData.data_pagamento,
          account_id: receiveData.account_id,
          company_id: selectedTransaction.company_id,
          company_name: selectedTransaction.company_name,
          notes: `Pagamento parcial de ${selectedTransaction.description}${receiveData.observacoes ? `\nObs: ${receiveData.observacoes}` : ''}`
        });
      }

      alert(`✅ Recebimento registrado!\n\nValor recebido: R$ ${valorRecebido.toFixed(2)}\nTotal pago: R$ ${novoValorPago.toFixed(2)}\nRestante: R$ ${(valorTotal - novoValorPago).toFixed(2)}\nStatus: ${novoStatus === 'pago' ? 'Quitado' : novoStatus === 'parcial' ? 'Pagamento Parcial' : 'Pendente'}`);
      
      setShowReceiveDialog(false);
      setSelectedTransaction(null);
      onRefresh();
    } catch (error) {
      console.error('Erro ao registrar recebimento:', error);
      alert('Erro ao registrar recebimento. Tente novamente.');
    }
  };

  const getStatusBadge = (transaction) => {
    const valorTotal = Math.abs(transaction.amount);
    const valorPago = transaction.valor_pago || 0;
    
    if (valorPago >= valorTotal) {
      return <Badge className="bg-green-100 text-green-800">Pago</Badge>;
    } else if (valorPago > 0) {
      return <Badge className="bg-yellow-100 text-yellow-800">Parcial</Badge>;
    } else if (transaction.status === 'atrasado') {
      return <Badge className="bg-red-100 text-red-800">Atrasado</Badge>;
    } else {
      return <Badge className="bg-blue-100 text-blue-800">Pendente</Badge>;
    }
  };

  const totalReceber = contasAReceber.reduce((acc, t) => {
    const valorTotal = Math.abs(t.amount);
    const valorPago = t.valor_pago || 0;
    return acc + (valorTotal - valorPago);
  }, 0);

  const totalRecebido = contasAReceber.reduce((acc, t) => acc + (t.valor_pago || 0), 0);

  const getAccountName = (id) => {
    if (!accounts || !Array.isArray(accounts)) return 'N/A';
    return accounts.find(a => a.id === id)?.name || 'N/A';
  };
  
  const getContactName = (id) => {
    if (!contacts || !Array.isArray(contacts)) return 'N/A';
    return contacts.find(c => c.id === id)?.name || 'N/A';
  };

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total a Receber</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {totalReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Recebido</p>
                <p className="text-2xl font-bold text-blue-600">
                  R$ {totalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Contas em Aberto</p>
                <p className="text-2xl font-bold text-orange-600">
                  {contasAReceber.filter(t => (t.valor_pago || 0) < Math.abs(t.amount)).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Contas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Contas a Receber ({contasAReceber.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {contasAReceber.map((transaction) => {
              const valorTotal = Math.abs(transaction.amount);
              const valorPago = transaction.valor_pago || 0;
              const valorRestante = valorTotal - valorPago;
              const percentualPago = (valorPago / valorTotal) * 100;

              return (
                <div key={transaction.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{transaction.description}</h4>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-sm text-gray-600">
                          {/* CORREÇÃO APLICADA AQUI: Usar 'parse' para evitar erro de fuso horário */}
                          Vencimento: {format(parse(transaction.due_date, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy', { locale: ptBR })}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditDate(transaction)}
                          className="h-6 px-2 text-xs"
                        >
                          ✏️ Editar Data
                        </Button>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      {getStatusBadge(transaction)}
                      <div className="mt-1">
                        <p className="text-lg font-bold text-green-600">
                          R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        {valorPago > 0 && (
                          <p className="text-sm text-gray-600">
                            Pago: R$ {valorPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({percentualPago.toFixed(1)}%)
                          </p>
                        )}
                        {valorRestante > 0 && (
                          <p className="text-sm font-medium text-orange-600">
                            Restante: R$ {valorRestante.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Barra de Progresso */}
                  {valorPago > 0 && (
                    <div className="mb-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${Math.min(percentualPago, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {valorRestante > 0 && (
                    <div className="flex justify-end">
                      <Button 
                        size="sm" 
                        onClick={() => handleReceiveClick(transaction)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Receber Pagamento
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}

            {contasAReceber.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <TrendingUp className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p>Nenhuma conta a receber encontrada.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Recebimento */}
      <Dialog open={showReceiveDialog} onOpenChange={setShowReceiveDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Recebimento</DialogTitle>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-medium">{selectedTransaction.description}</h4>
                <div className="text-sm text-gray-600 mt-1">
                  <p>Valor Total: R$ {Math.abs(selectedTransaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <p>Já Pago: R$ {(selectedTransaction.valor_pago || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <p className="font-medium text-orange-600">
                    Restante: R$ ${(Math.abs(selectedTransaction.amount) - (selectedTransaction.valor_pago || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="valor_recebido">Valor Recebido *</Label>
                <Input
                  id="valor_recebido"
                  type="number"
                  step="0.01"
                  value={receiveData.valor_recebido}
                  onChange={(e) => setReceiveData(prev => ({...prev, valor_recebido: e.target.value}))}
                  placeholder="0,00"
                />
              </div>

              <div>
                <Label htmlFor="data_pagamento">Data do Pagamento *</Label>
                <Input
                  id="data_pagamento"
                  type="date"
                  value={receiveData.data_pagamento}
                  onChange={(e) => setReceiveData(prev => ({...prev, data_pagamento: e.target.value}))}
                />
              </div>

              <div>
                <Label htmlFor="account_id">Conta de Destino *</Label>
                <Select 
                  value={receiveData.account_id} 
                  onValueChange={(value) => setReceiveData(prev => ({...prev, account_id: value}))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a conta" />
                  </SelectTrigger>
                  <SelectContent>
                    {(accounts || [])
                      .sort((a, b) => a.name.localeCompare(b.name)) // ORGANIZADO ALFABETICAMENTE
                      .map(account => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="meio_pagamento">Meio de Pagamento</Label>
                <Select 
                  value={receiveData.meio_pagamento} 
                  onValueChange={(value) => setReceiveData(prev => ({...prev, meio_pagamento: value}))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="transferencia">Transferência</SelectItem>
                    <SelectItem value="cartao">Cartão</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={receiveData.observacoes}
                  onChange={(e) => setReceiveData(prev => ({...prev, observacoes: e.target.value}))}
                  placeholder="Observações sobre o recebimento..."
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowReceiveDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleConfirmReceive} className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirmar Recebimento
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Edição de Data */}
      <Dialog open={showEditDateDialog} onOpenChange={setShowEditDateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Data de Vencimento</DialogTitle>
          </DialogHeader>
          
          {editingTransaction && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-medium">{editingTransaction.description}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Valor: R$ {Math.abs(editingTransaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-gray-600">
                  Data atual: {format(parse(editingTransaction.due_date, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy')}
                </p>
              </div>

              <div>
                <Label htmlFor="new_due_date">Nova Data de Vencimento *</Label>
                <Input
                  id="new_due_date"
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowEditDateDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleUpdateDate} className="bg-blue-600 hover:bg-blue-700">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Atualizar Data
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
