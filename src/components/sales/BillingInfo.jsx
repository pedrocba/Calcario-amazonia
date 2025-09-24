import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, Calendar, CreditCard, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import retiradaService from '@/api/retiradaService';

const BillingInfo = ({ billingInfo, onCancelBilling, onUpdateStatus, vendaId }) => {
  const [resumoFinanceiro, setResumoFinanceiro] = useState(null);
  const [loadingResumo, setLoadingResumo] = useState(false);

  useEffect(() => {
    if (vendaId && billingInfo && billingInfo.length > 0) {
      loadResumoFinanceiro();
    }
  }, [vendaId, billingInfo]);

  const loadResumoFinanceiro = async () => {
    if (!vendaId) return;
    
    setLoadingResumo(true);
    try {
      const resumoData = await retiradaService.getResumoFinanceiro(vendaId);
      setResumoFinanceiro(resumoData);
    } catch (error) {
      console.error('Erro ao carregar resumo financeiro:', error);
      // Se não conseguir carregar, calcular com base nas parcelas
      calculateResumoFromParcelas();
    } finally {
      setLoadingResumo(false);
    }
  };

  const calculateResumoFromParcelas = () => {
    if (!billingInfo || billingInfo.length === 0) return;

    const fatura = billingInfo[0];
    const parcelas = fatura.parcelas || [];
    
    const valorTotal = fatura.final_value || 0;
    const totalPago = parcelas
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + (p.paid_value || p.value || 0), 0);
    const saldoDevedor = valorTotal - totalPago;
    const percentualPago = valorTotal > 0 ? (totalPago / valorTotal) * 100 : 0;

    setResumoFinanceiro({
      valorTotal,
      totalPago,
      saldoDevedor,
      percentualPago
    });
  };

  if (!billingInfo || billingInfo.length === 0) {
    return null;
  }

  const fatura = billingInfo[0]; // Assumindo que há apenas uma fatura por venda
  const parcelas = fatura.parcelas || [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'paid':
        return 'Pago';
      case 'pending':
        return 'Pendente';
      case 'overdue':
        return 'Vencido';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date() && dueDate;
  };

  return (
    <div className="space-y-6">
      {/* Informações da Fatura */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Informações de Faturamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Status da Fatura</p>
              <Badge className={getStatusColor(fatura.status)}>
                <div className="flex items-center gap-1">
                  {getStatusIcon(fatura.status)}
                  {getStatusLabel(fatura.status)}
                </div>
              </Badge>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Método de Pagamento</p>
              <p className="font-semibold capitalize">
                {fatura.payment_method?.replace('_', ' ') || 'N/A'}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Condições</p>
              <p className="font-semibold capitalize">
                {fatura.payment_conditions === 'a_vista' ? 'À Vista' : 'À Prazo'}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Valor Total</p>
              <p className="font-semibold text-green-600">
                {formatCurrency(fatura.final_value)}
              </p>
            </div>
          </div>

          {/* Resumo Financeiro */}
          {resumoFinanceiro && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-4">Resumo Financeiro</h4>
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
            </div>
          )}

          {/* Ações da Fatura */}
          {fatura.status === 'pending' && (
            <div className="mt-4 flex gap-2">
              <Button 
                onClick={() => onUpdateStatus && onUpdateStatus(fatura.id, 'paid')}
                className="bg-green-600 hover:bg-green-700"
                size="sm"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Marcar como Pago
              </Button>
              <Button 
                onClick={() => onCancelBilling && onCancelBilling(fatura.id)}
                variant="outline"
                size="sm"
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                <AlertCircle className="w-4 h-4 mr-1" />
                Cancelar Fatura
              </Button>
            </div>
          )}

          {fatura.additional_charges > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex justify-between">
                <span className="text-sm text-blue-800">Taxas Adicionais:</span>
                <span className="font-semibold text-blue-800">
                  +{formatCurrency(fatura.additional_charges)}
                </span>
              </div>
            </div>
          )}

          {fatura.notes && (
            <div className="mt-4">
              <p className="text-sm text-gray-600">Observações:</p>
              <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded">
                {fatura.notes}
              </p>
            </div>
          )}

          {fatura.status === 'pending' && (
            <div className="mt-4 flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onCancelBilling && onCancelBilling(fatura.id)}
              >
                Cancelar Fatura
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cronograma de Parcelas */}
      {parcelas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Cronograma de Parcelas ({parcelas.length} parcelas)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parcela</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pagamento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parcelas.map((parcela, index) => (
                    <TableRow 
                      key={parcela.id}
                      className={isOverdue(parcela.due_date) && parcela.status === 'pending' ? 'bg-red-50' : ''}
                    >
                      <TableCell className="font-medium">
                        {parcela.installment_number}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {formatDate(parcela.due_date)}
                          {isOverdue(parcela.due_date) && parcela.status === 'pending' && (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(parcela.value)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(parcela.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(parcela.status)}
                            {getStatusLabel(parcela.status)}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {parcela.paid_at ? (
                          <div className="text-sm">
                            <p className="text-green-600 font-semibold">
                              {formatCurrency(parcela.paid_value || parcela.value)}
                            </p>
                            <p className="text-gray-500">
                              {formatDate(parcela.paid_at)}
                            </p>
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Resumo das Parcelas */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Total de Parcelas</p>
                <p className="text-lg font-semibold">{parcelas.length}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-green-600">Parcelas Pagas</p>
                <p className="text-lg font-semibold text-green-600">
                  {parcelas.filter(p => p.status === 'paid').length}
                </p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-sm text-yellow-600">Parcelas Pendentes</p>
                <p className="text-lg font-semibold text-yellow-600">
                  {parcelas.filter(p => p.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BillingInfo;

