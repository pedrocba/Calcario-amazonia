import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, CreditCard, DollarSign, Receipt, X } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const FaturamentoModal = ({ venda, isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    status: 'Faturada',
    payment_method: 'dinheiro',
    payment_conditions: 'a_vista',
    due_date: '',
    installments: 1,
    installment_value: 0,
    total_value: 0,
    discount: 0,
    additional_charges: 0,
    final_value: 0,
    notes: '',
    cash_account: '',
    bank_account: ''
  });

  const [contas, setContas] = useState([]);
  const [caixas, setCaixas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [installments, setInstallments] = useState([]);

  // Carregar dados iniciais
  useEffect(() => {
    if (venda && isOpen) {
      setFormData(prev => ({
        ...prev,
        total_value: venda.final_amount || 0,
        final_value: venda.final_amount || 0,
        due_date: new Date().toISOString().split('T')[0]
      }));
      loadContasECaixas();
    }
  }, [venda, isOpen]);

  const loadContasECaixas = async () => {
    try {
      // Carregar contas bancárias
      const { data: contasData } = await supabase
        .from('contas_bancarias')
        .select('*')
        .eq('active', true);

      // Carregar caixas
      const { data: caixasData } = await supabase
        .from('caixas')
        .select('*')
        .eq('active', true);

      setContas(contasData || []);
      setCaixas(caixasData || []);
    } catch (error) {
      console.error('Erro ao carregar contas e caixas:', error);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Recalcular valores
      if (field === 'total_value' || field === 'discount' || field === 'additional_charges') {
        const total = parseFloat(newData.total_value) || 0;
        const discount = parseFloat(newData.discount) || 0;
        const charges = parseFloat(newData.additional_charges) || 0;
        newData.final_value = total - discount + charges;
      }
      
      // Calcular valor da parcela
      if (field === 'final_value' || field === 'installments') {
        const final = parseFloat(newData.final_value) || 0;
        const parcels = parseInt(newData.installments) || 1;
        newData.installment_value = final / parcels;
      }
      
      return newData;
    });
  };

  const generateInstallments = () => {
    const finalValue = parseFloat(formData.final_value) || 0;
    const parcels = parseInt(formData.installments) || 1;
    const installmentValue = finalValue / parcels;
    const dueDate = new Date(formData.due_date);
    
    const newInstallments = [];
    for (let i = 0; i < parcels; i++) {
      const installmentDate = new Date(dueDate);
      installmentDate.setMonth(installmentDate.getMonth() + i);
      
      newInstallments.push({
        number: i + 1,
        due_date: installmentDate.toISOString().split('T')[0],
        value: installmentValue,
        status: 'Pendente',
        payment_method: formData.payment_method
      });
    }
    
    setInstallments(newInstallments);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Atualizar venda
      const { error: vendaError } = await supabase
        .from('vendas')
        .update({
          status: formData.status,
          payment_method: formData.payment_method,
          final_amount: formData.final_value,
          discount: formData.discount,
          notes: formData.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', venda.id);

      if (vendaError) throw vendaError;

      // Criar fatura
      const { data: faturaData, error: faturaError } = await supabase
        .from('faturas')
        .insert({
          venda_id: venda.id,
          customer_id: venda.customer_id,
          total_value: formData.total_value,
          discount: formData.discount,
          additional_charges: formData.additional_charges,
          final_value: formData.final_value,
          payment_method: formData.payment_method,
          payment_conditions: formData.payment_conditions,
          due_date: formData.due_date,
          status: 'pending',
          notes: formData.notes,
          company_id: venda.company_id,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (faturaError) throw faturaError;

      // Criar parcelas se necessário
      if (formData.payment_conditions === 'a_prazo' && installments.length > 0) {
        const parcelasData = installments.map(installment => ({
          fatura_id: faturaData.id,
          venda_id: venda.id,
          customer_id: venda.customer_id,
          installment_number: installment.number,
          due_date: installment.due_date,
          value: installment.value,
          status: installment.status,
          payment_method: installment.payment_method,
          company_id: venda.company_id,
          created_at: new Date().toISOString()
        }));

        const { error: parcelasError } = await supabase
          .from('parcelas')
          .insert(parcelasData);

        if (parcelasError) throw parcelasError;
      }

      // Criar movimentação de caixa se for à vista
      if (formData.payment_conditions === 'a_vista' && formData.payment_method === 'dinheiro') {
        const { error: caixaError } = await supabase
          .from('movimentacoes_caixa')
          .insert({
            tipo: 'entrada',
            descricao: `Recebimento venda ${venda.id.slice(0, 8)}`,
            valor: formData.final_value,
            caixa_id: formData.cash_account,
            venda_id: venda.id,
            company_id: venda.company_id,
            created_at: new Date().toISOString()
          });

        if (caixaError) throw caixaError;
      }

      // Criar movimentação bancária se for transferência
      if (formData.payment_method === 'transferencia' && formData.bank_account) {
        const { error: bancoError } = await supabase
          .from('movimentacoes_bancarias')
          .insert({
            tipo: 'entrada',
            descricao: `Recebimento venda ${venda.id.slice(0, 8)}`,
            valor: formData.final_value,
            conta_id: formData.bank_account,
            venda_id: venda.id,
            company_id: venda.company_id,
            created_at: new Date().toISOString()
          });

        if (bancoError) throw bancoError;
      }

      onSuccess();
      onClose();
      
    } catch (error) {
      console.error('Erro ao faturar venda:', error);
      alert('Erro ao faturar venda: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Faturar Venda {venda?.id?.slice(0, 8)}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informações da Venda */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações da Venda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Valor Total</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.total_value}
                  onChange={(e) => handleChange('total_value', e.target.value)}
                />
              </div>
              
              <div>
                <Label>Desconto</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.discount}
                  onChange={(e) => handleChange('discount', e.target.value)}
                />
              </div>
              
              <div>
                <Label>Acréscimos</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.additional_charges}
                  onChange={(e) => handleChange('additional_charges', e.target.value)}
                />
              </div>
              
              <div className="bg-gray-50 p-3 rounded">
                <Label className="font-semibold">Valor Final</Label>
                <div className="text-xl font-bold text-green-600">
                  {formatCurrency(formData.final_value)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Condições de Pagamento */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Condições de Pagamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Forma de Pagamento</Label>
                <Select value={formData.payment_method} onValueChange={(value) => handleChange('payment_method', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                    <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                    <SelectItem value="transferencia">Transferência</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="boleto">Boleto</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Condição</Label>
                <Select value={formData.payment_conditions} onValueChange={(value) => handleChange('payment_conditions', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a_vista">À Vista</SelectItem>
                    <SelectItem value="a_prazo">À Prazo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.payment_conditions === 'a_prazo' && (
                <>
                  <div>
                    <Label>Número de Parcelas</Label>
                    <Input
                      type="number"
                      min="1"
                      max="12"
                      value={formData.installments}
                      onChange={(e) => handleChange('installments', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label>Data de Vencimento</Label>
                    <Input
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => handleChange('due_date', e.target.value)}
                    />
                  </div>
                  
                  <Button onClick={generateInstallments} variant="outline" className="w-full">
                    <Calendar className="w-4 h-4 mr-2" />
                    Gerar Parcelas
                  </Button>
                </>
              )}

              {formData.payment_method === 'dinheiro' && (
                <div>
                  <Label>Caixa</Label>
                  <Select value={formData.cash_account} onValueChange={(value) => handleChange('cash_account', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o caixa" />
                    </SelectTrigger>
                    <SelectContent>
                      {caixas.map(caixa => (
                        <SelectItem key={caixa.id} value={caixa.id}>
                          {caixa.name} - {formatCurrency(caixa.balance || 0)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.payment_method === 'transferencia' && (
                <div>
                  <Label>Conta Bancária</Label>
                  <Select value={formData.bank_account} onValueChange={(value) => handleChange('bank_account', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a conta" />
                    </SelectTrigger>
                    <SelectContent>
                      {contas.map(conta => (
                        <SelectItem key={conta.id} value={conta.id}>
                          {conta.bank_name} - {conta.account_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Parcelas */}
        {installments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Parcelas Geradas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {installments.map((installment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">Parcela {installment.number}</Badge>
                      <span>{new Date(installment.due_date).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="font-semibold">
                      {formatCurrency(installment.value)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Observações */}
        <div>
          <Label>Observações</Label>
          <Textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Observações adicionais sobre o faturamento..."
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
            {isLoading ? 'Faturando...' : 'Faturar Venda'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FaturamentoModal;


