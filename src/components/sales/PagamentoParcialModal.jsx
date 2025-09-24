import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import retiradaService from '@/api/retiradaService';

const PagamentoParcialModal = ({ isOpen, onClose, vendaId, clienteId, companyId, faturaId }) => {
  const [resumoFinanceiro, setResumoFinanceiro] = useState(null);
  const [pagamentos, setPagamentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [valorPago, setValorPago] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('dinheiro');
  const [observacoes, setObservacoes] = useState('');

  useEffect(() => {
    if (isOpen && vendaId) {
      loadData();
    }
  }, [isOpen, vendaId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resumoData, pagamentosData] = await Promise.all([
        retiradaService.getResumoFinanceiro(vendaId),
        retiradaService.getPagamentosParciaisByVenda(vendaId)
      ]);
      
      setResumoFinanceiro(resumoData);
      setPagamentos(pagamentosData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePagamento = async () => {
    if (!valorPago || parseFloat(valorPago) <= 0) {
      alert('Valor deve ser maior que zero');
      return;
    }

    if (parseFloat(valorPago) > resumoFinanceiro.saldoDevedor) {
      alert('Valor excede o saldo devedor');
      return;
    }

    try {
      setLoading(true);
      
      await retiradaService.registrarPagamentoParcial({
        venda_id: vendaId,
        fatura_id: faturaId,
        cliente_id: clienteId,
        valor_pago: valorPago,
        forma_pagamento: formaPagamento,
        observacoes: observacoes,
        company_id: companyId
      });

      // Limpar formulário
      setValorPago('');
      setObservacoes('');

      // Recarregar dados
      await loadData();
      
      alert('Pagamento registrado com sucesso!');
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      alert('Erro ao registrar pagamento: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getFormaPagamentoLabel = (forma) => {
    const formas = {
      'dinheiro': 'Dinheiro',
      'pix': 'PIX',
      'cartao_credito': 'Cartão de Crédito',
      'cartao_debito': 'Cartão de Débito',
      'transferencia': 'Transferência',
      'cheque': 'Cheque'
    };
    return formas[forma] || forma;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Controle de Pagamentos
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumo Financeiro */}
          {resumoFinanceiro && (
            <Card>
              <CardHeader>
                <CardTitle>Resumo Financeiro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600">Valor Total</p>
                    <p className="text-xl font-bold text-blue-800">
                      {formatCurrency(resumoFinanceiro.valorTotal)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-600">Total Pago</p>
                    <p className="text-xl font-bold text-green-800">
                      {formatCurrency(resumoFinanceiro.totalPago)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-600">Saldo Devedor</p>
                    <p className="text-xl font-bold text-red-800">
                      {formatCurrency(resumoFinanceiro.saldoDevedor)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-600">% Pago</p>
                    <p className="text-xl font-bold text-yellow-800">
                      {resumoFinanceiro.percentualPago.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Formulário de Pagamento */}
          {resumoFinanceiro && resumoFinanceiro.saldoDevedor > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Registrar Pagamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Valor do Pagamento *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={valorPago}
                      onChange={(e) => setValorPago(e.target.value)}
                      placeholder="Digite o valor"
                      max={resumoFinanceiro.saldoDevedor}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Saldo devedor: {formatCurrency(resumoFinanceiro.saldoDevedor)}
                    </p>
                  </div>
                  <div>
                    <Label>Forma de Pagamento *</Label>
                    <select
                      value={formaPagamento}
                      onChange={(e) => setFormaPagamento(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="dinheiro">Dinheiro</option>
                      <option value="pix">PIX</option>
                      <option value="cartao_credito">Cartão de Crédito</option>
                      <option value="cartao_debito">Cartão de Débito</option>
                      <option value="transferencia">Transferência</option>
                      <option value="cheque">Cheque</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label>Observações</Label>
                  <Textarea
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    placeholder="Observações sobre o pagamento"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Histórico de Pagamentos */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Pagamentos</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Carregando...</div>
              ) : pagamentos.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  Nenhum pagamento registrado
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Forma de Pagamento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Observações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagamentos.map((pagamento) => (
                      <TableRow key={pagamento.id}>
                        <TableCell>{formatDate(pagamento.data_pagamento)}</TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(pagamento.valor_pago)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getFormaPagamentoLabel(pagamento.forma_pagamento)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={pagamento.status === 'confirmado' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {pagamento.status === 'confirmado' ? 'Confirmado' : 'Cancelado'}
                          </Badge>
                        </TableCell>
                        <TableCell>{pagamento.observacoes || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          {resumoFinanceiro && resumoFinanceiro.saldoDevedor > 0 && (
            <Button onClick={handlePagamento} disabled={loading}>
              {loading ? 'Registrando...' : 'Registrar Pagamento'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PagamentoParcialModal;

