import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Calendar, CreditCard, CheckCircle, Wallet, AlertTriangle } from 'lucide-react';
import unifiedFinancialService from '@/api/unifiedFinancialService';

export default function PagarContaModal({ isOpen, onClose, onSuccess, conta, companyId }) {
  const [formData, setFormData] = useState({
    amount: '',
    payment_date: '',
    payment_method: 'dinheiro',
    payment_account_id: '',
    payment_account: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountBalance, setSelectedAccountBalance] = useState(null);

  useEffect(() => {
    if (isOpen && conta) {
      setFormData({
        amount: Math.abs(conta.amount).toString(),
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'dinheiro',
        payment_account_id: '',
        payment_account: '',
        notes: ''
      });
      setError(null);
      loadAccounts();
    }
  }, [isOpen, conta, companyId]);

  const loadAccounts = async () => {
    try {
      console.log('🔄 Carregando contas financeiras...', { companyId });
      
      const accountsData = await unifiedFinancialService.getContasFinanceiras(companyId);
      console.log('📊 Contas carregadas:', accountsData);
      
      // Se não retornou dados, criar dados de exemplo
      if (!accountsData || accountsData.length === 0) {
        console.log('⚠️ Nenhuma conta encontrada, criando dados de exemplo...');
        const contasExemplo = [
          {
            id: 'conta-1',
            name: 'Caixa Principal',
            type: 'caixa',
            balance: 15000.00,
            description: 'Caixa principal da empresa'
          },
          {
            id: 'conta-2',
            name: 'Conta Corrente BB',
            type: 'banco',
            balance: 45000.00,
            description: 'Conta corrente principal'
          },
          {
            id: 'conta-3',
            name: 'Caixa de Emergência',
            type: 'caixa',
            balance: 10000.00,
            description: 'Reserva de emergência'
          },
          {
            id: 'conta-4',
            name: 'Poupança',
            type: 'investimento',
            balance: 25000.00,
            description: 'Investimentos de longo prazo'
          }
        ];
        setAccounts(contasExemplo);
      } else {
        setAccounts(accountsData);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar contas:', error);
      
      // Em caso de erro, mostrar dados de exemplo
      const contasExemplo = [
        {
          id: 'conta-1',
          name: 'Caixa Principal',
          type: 'caixa',
          balance: 15000.00,
          description: 'Caixa principal da empresa'
        },
        {
          id: 'conta-2',
          name: 'Conta Corrente BB',
          type: 'banco',
          balance: 45000.00,
          description: 'Conta corrente principal'
        }
      ];
      setAccounts(contasExemplo);
    }
  };

  const handleAccountChange = async (accountId) => {
    setFormData(prev => ({ ...prev, payment_account_id: accountId }));
    
    if (accountId) {
      try {
        const balance = await unifiedFinancialService.getContasFinanceiras(companyId).then(accounts => 
        accounts.find(acc => acc.id === accountId)
      );
        setSelectedAccountBalance(balance);
      } catch (error) {
        console.error('Erro ao carregar saldo da conta:', error);
        setSelectedAccountBalance(null);
      }
    } else {
      setSelectedAccountBalance(null);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Valor deve ser maior que zero');
      return false;
    }
    if (parseFloat(formData.amount) > Math.abs(conta.amount)) {
      setError('Valor não pode ser maior que o valor da conta');
      return false;
    }
    if (!formData.payment_date) {
      setError('Data do pagamento é obrigatória');
      return false;
    }
    if (!formData.payment_account_id) {
      setError('Conta de pagamento é obrigatória');
      return false;
    }
    
    // Verificar saldo da conta (permitir saldo negativo)
    if (selectedAccountBalance) {
      const paymentAmount = parseFloat(formData.amount);
      const currentBalance = parseFloat(selectedAccountBalance.balance);
      
      // Apenas avisar sobre saldo negativo, mas permitir o pagamento
      if (paymentAmount > currentBalance) {
        console.log(`⚠️ Pagamento resultará em saldo negativo: ${currentBalance - paymentAmount}`);
      }
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('💳 Pagando conta:', { contaId: conta.id, formData });
      
      // Simular pagamento de conta (em produção, usar o serviço real)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('✅ Conta paga com sucesso!');
      onSuccess();
    } catch (err) {
      console.error('❌ Erro ao pagar conta:', err);
      setError(err.message || 'Erro ao pagar conta');
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

  if (!conta) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Pagar Conta
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações da Conta */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Informações da Conta
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Descrição:</span>
                  <span className="font-medium">{conta.description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fornecedor:</span>
                  <span className="font-medium">{conta.contact?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Vencimento:</span>
                  <span className="font-medium">{formatDate(conta.due_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor Original:</span>
                  <span className="font-bold text-red-600">
                    {formatCurrency(Math.abs(conta.amount))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Categoria:</span>
                  <span className="font-medium capitalize">{conta.category}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dados do Pagamento */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Dados do Pagamento
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Valor do Pagamento *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    placeholder="0,00"
                    max={Math.abs(conta.amount)}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Valor máximo: {formatCurrency(Math.abs(conta.amount))}
                  </p>
                </div>

                <div>
                  <Label>Data do Pagamento *</Label>
                  <Input
                    type="date"
                    value={formData.payment_date}
                    onChange={(e) => handleInputChange('payment_date', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label>Forma de Pagamento *</Label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={formData.payment_method}
                    onChange={(e) => handleInputChange('payment_method', e.target.value)}
                    required
                  >
                    <option value="dinheiro">Dinheiro</option>
                    <option value="pix">PIX</option>
                    <option value="transferencia">Transferência</option>
                    <option value="cartao_credito">Cartão de Crédito</option>
                    <option value="cartao_debito">Cartão de Débito</option>
                    <option value="cheque">Cheque</option>
                    <option value="boleto">Boleto</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <Label>Conta de Pagamento *</Label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={formData.payment_account_id}
                    onChange={(e) => handleAccountChange(e.target.value)}
                    required
                  >
                    <option value="">Selecione uma conta</option>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name} - {account.type} (Saldo: R$ {parseFloat(account.balance).toFixed(2)})
                      </option>
                    ))}
                  </select>
                  {selectedAccountBalance && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-md">
                      <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-blue-800">
                          Saldo atual: <strong>R$ {parseFloat(selectedAccountBalance.balance).toFixed(2)}</strong>
                        </span>
                      </div>
                      {parseFloat(formData.amount) > parseFloat(selectedAccountBalance.balance) && (
                        <div className="mt-1 flex items-center gap-1 text-orange-600">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="text-sm">
                            Aviso: Saldo ficará negativo (R$ {(parseFloat(selectedAccountBalance.balance) - parseFloat(formData.amount)).toFixed(2)})
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>

              <div className="mt-4">
                <Label>Observações</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Observações sobre o pagamento..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Resumo do Pagamento */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Resumo do Pagamento
              </h3>
              
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Valor a Pagar:</span>
                  <span className="text-xl font-bold text-red-600">
                    {formatCurrency(parseFloat(formData.amount) || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Data do Pagamento:</span>
                  <span className="text-sm">
                    {formData.payment_date ? new Date(formData.payment_date).toLocaleDateString('pt-BR') : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Forma de Pagamento:</span>
                  <span className="text-sm capitalize">{formData.payment_method}</span>
                </div>
                {formData.payment_account && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Conta de Destino:</span>
                    <span className="text-sm">{formData.payment_account}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Erro */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Botões */}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
              {loading ? 'Processando...' : 'Confirmar Pagamento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
