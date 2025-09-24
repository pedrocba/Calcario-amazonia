import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, CreditCard, DollarSign, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import billingService from '@/api/billingService';

const BillingModal = ({ 
  isOpen, 
  onClose, 
  venda, 
  onBillingSuccess 
}) => {
  const [billingData, setBillingData] = useState({
    payment_conditions: 'a_vista',
    payment_method: 'dinheiro',
    installments: 1,
    due_date: '',
    additional_charges: 0,
    entrada: 0,
    notes: ''
  });
  
  const [installments, setInstallments] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  const paymentMethods = [
    { value: 'dinheiro', label: 'Dinheiro', icon: DollarSign },
    { value: 'pix', label: 'PIX', icon: CreditCard },
    { value: 'cartao_debito', label: 'Cartão de Débito', icon: CreditCard },
    { value: 'cartao_credito', label: 'Cartão de Crédito', icon: CreditCard },
    { value: 'transferencia', label: 'Transferência Bancária', icon: CreditCard },
    { value: 'cheque', label: 'Cheque', icon: CreditCard },
    { value: 'boleto', label: 'Boleto Bancário', icon: CreditCard }
  ];

  useEffect(() => {
    if (isOpen && venda) {
      // Reset form when modal opens
      setBillingData({
        payment_conditions: 'a_vista',
        payment_method: 'dinheiro',
        installments: 1,
        due_date: '',
        additional_charges: 0,
        entrada: 0,
        notes: ''
      });
      setInstallments([]);
      setErrors({});
    }
  }, [isOpen, venda]);

  const handleInputChange = (field, value) => {
    setBillingData(prev => ({ ...prev, [field]: value }));
    
    // Clear related errors
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }

    // Auto-generate installments for installment payments
    if (field === 'payment_conditions' && value === 'a_prazo') {
      setBillingData(prev => ({ ...prev, installments: 1 }));
      generateInstallments(1, venda?.final_amount || 0, 0);
    } else if (field === 'installments' && billingData.payment_conditions === 'a_prazo') {
      generateInstallments(parseInt(value) || 1, venda?.final_amount || 0, parseFloat(billingData.entrada) || 0);
    } else if (field === 'entrada' && billingData.payment_conditions === 'a_prazo') {
      generateInstallments(billingData.installments || 1, venda?.final_amount || 0, parseFloat(value) || 0);
    }
  };

  const generateInstallments = (numInstallments, totalValue, entrada = 0) => {
    const valorRestante = totalValue - entrada;
    const installmentValue = valorRestante / numInstallments;
    const today = new Date();
    const newInstallments = [];

    for (let i = 0; i < numInstallments; i++) {
      const dueDate = new Date(today);
      dueDate.setMonth(dueDate.getMonth() + i);
      
      newInstallments.push({
        number: i + 1,
        value: installmentValue,
        due_date: dueDate.toISOString().split('T')[0],
        status: 'pending'
      });
    }

    setInstallments(newInstallments);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!billingData.payment_method) {
      newErrors.payment_method = 'Método de pagamento é obrigatório';
    }

    if (billingData.payment_conditions === 'a_prazo') {
      if (!billingData.installments || billingData.installments < 1) {
        newErrors.installments = 'Número de parcelas deve ser maior que 0';
      }
      
      if (billingData.installments > 12) {
        newErrors.installments = 'Máximo de 12 parcelas';
      }

      const entrada = parseFloat(billingData.entrada) || 0;
      const totalValue = getTotalValue();
      
      if (entrada < 0) {
        newErrors.entrada = 'Valor da entrada não pode ser negativo';
      }
      
      if (entrada >= totalValue) {
        newErrors.entrada = 'Valor da entrada deve ser menor que o valor total';
      }
    }

    if (billingData.additional_charges < 0) {
      newErrors.additional_charges = 'Taxas adicionais não podem ser negativas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);
    
    try {
      // Processar faturamento real
      const result = await billingService.processBilling(venda.id, billingData);
      
      onBillingSuccess({
        ...billingData,
        installments: billingData.payment_conditions === 'a_prazo' ? installments : [],
        result: result
      });
      
      onClose();
    } catch (error) {
      console.error('Erro ao processar faturamento:', error);
      alert('Erro ao processar faturamento: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const getTotalValue = () => {
    const baseValue = venda?.final_amount || 0;
    const additionalCharges = parseFloat(billingData.additional_charges) || 0;
    return baseValue + additionalCharges;
  };

  const getInstallmentValue = () => {
    if (billingData.payment_conditions === 'a_vista') return getTotalValue();
    const entrada = parseFloat(billingData.entrada) || 0;
    const valorRestante = getTotalValue() - entrada;
    return valorRestante / (billingData.installments || 1);
  };

  if (!venda) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Faturar Venda #{venda.id.slice(0, 8)}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Resumo da Venda */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumo da Venda</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Cliente</p>
                  <p className="font-semibold">{venda.client?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Valor Base</p>
                  <p className="font-semibold text-green-600">
                    {formatCurrency(venda.final_amount)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configurações de Pagamento */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Configurações de Pagamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Condições de Pagamento */}
                <div>
                  <Label htmlFor="payment_conditions">Condições de Pagamento *</Label>
                  <Select 
                    value={billingData.payment_conditions} 
                    onValueChange={(value) => handleInputChange('payment_conditions', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="a_vista">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          À Vista
                        </div>
                      </SelectItem>
                      <SelectItem value="a_prazo">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          À Prazo
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Método de Pagamento */}
                <div>
                  <Label htmlFor="payment_method">Método de Pagamento *</Label>
                  <Select 
                    value={billingData.payment_method} 
                    onValueChange={(value) => handleInputChange('payment_method', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map(method => (
                        <SelectItem key={method.value} value={method.value}>
                          <div className="flex items-center gap-2">
                            <method.icon className="w-4 h-4" />
                            {method.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.payment_method && (
                    <p className="text-sm text-red-600 mt-1">{errors.payment_method}</p>
                  )}
                </div>

                {/* Número de Parcelas (apenas para à prazo) */}
                {billingData.payment_conditions === 'a_prazo' && (
                  <div>
                    <Label htmlFor="installments">Número de Parcelas *</Label>
                    <Input
                      type="number"
                      min="1"
                      max="12"
                      value={billingData.installments}
                      onChange={(e) => handleInputChange('installments', e.target.value)}
                      placeholder="Ex: 3"
                    />
                    {errors.installments && (
                      <p className="text-sm text-red-600 mt-1">{errors.installments}</p>
                    )}
                  </div>
                )}

                {/* Valor da Entrada (apenas para à prazo) */}
                {billingData.payment_conditions === 'a_prazo' && (
                  <div>
                    <Label htmlFor="entrada">Valor da Entrada (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={billingData.entrada}
                      onChange={(e) => handleInputChange('entrada', e.target.value)}
                      placeholder="0.00"
                    />
                    {errors.entrada && (
                      <p className="text-sm text-red-600 mt-1">{errors.entrada}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Deixe em branco ou 0 se não houver entrada
                    </p>
                  </div>
                )}

                {/* Taxas Adicionais */}
                <div>
                  <Label htmlFor="additional_charges">Taxas Adicionais (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={billingData.additional_charges}
                    onChange={(e) => handleInputChange('additional_charges', e.target.value)}
                    placeholder="0.00"
                  />
                  {errors.additional_charges && (
                    <p className="text-sm text-red-600 mt-1">{errors.additional_charges}</p>
                  )}
                </div>

                {/* Observações */}
                <div>
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    value={billingData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Observações adicionais sobre o faturamento..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Resumo Financeiro */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumo Financeiro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Valor Base:</span>
                    <span>{formatCurrency(venda.final_amount)}</span>
                  </div>
                  
                  {billingData.additional_charges > 0 && (
                    <div className="flex justify-between">
                      <span>Taxas Adicionais:</span>
                      <span className="text-red-600">
                        +{formatCurrency(billingData.additional_charges)}
                      </span>
                    </div>
                  )}
                  
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Valor Total:</span>
                      <span className="text-green-600">
                        {formatCurrency(getTotalValue())}
                      </span>
                    </div>
                  </div>

                  {/* Entrada (apenas para à prazo) */}
                  {billingData.payment_conditions === 'a_prazo' && billingData.entrada > 0 && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-blue-800">Entrada:</span>
                        <span className="text-lg font-bold text-blue-600">
                          {formatCurrency(billingData.entrada)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-blue-700 mt-1">
                        <span>Valor Restante:</span>
                        <span className="font-semibold">
                          {formatCurrency(getTotalValue() - billingData.entrada)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Valor da Parcela */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-blue-800">
                      {billingData.payment_conditions === 'a_vista' ? 'Valor à Vista' : 'Valor por Parcela'}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(getInstallmentValue())}
                  </p>
                </div>

                {/* Cronograma de Parcelas */}
                {billingData.payment_conditions === 'a_prazo' && installments.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Cronograma de Parcelas</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {installments.map((installment, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{installment.number}</Badge>
                            <span className="text-sm">
                              {new Date(installment.due_date).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <span className="font-semibold">
                            {formatCurrency(installment.value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Faturar Venda
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BillingModal;

