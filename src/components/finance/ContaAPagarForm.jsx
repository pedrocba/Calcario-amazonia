import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Calendar, User, FileText } from 'lucide-react';
import unifiedFinancialService from '@/api/unifiedFinancialService';

export default function ContaAPagarForm({ isOpen, onClose, onSuccess, companyId }) {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    due_date: '',
    category: 'fornecedores',
    contact_id: '',
    account_id: '',
    reference: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [contatos, setContatos] = useState([]);
  const [contas, setContas] = useState([]);
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    if (isOpen) {
      loadData();
      resetForm();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      const [contatosData, contasData, categoriasData] = await Promise.all([
        unifiedFinancialService.getContasFinanceiras(companyId), // Usar contas financeiras como contatos
        unifiedFinancialService.getContasFinanceiras(companyId),
        Promise.resolve([ // Categorias fixas
          { id: 'fornecedores', name: 'Fornecedores' },
          { id: 'servicos', name: 'Serviços' },
          { id: 'impostos', name: 'Impostos' },
          { id: 'outros', name: 'Outros' }
        ])
      ]);
      
      setContatos(contatosData);
      setContas(contasData);
      setCategorias(categoriasData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      due_date: '',
      category: 'fornecedores',
      contact_id: '',
      account_id: '',
      reference: '',
      notes: ''
    });
    setError(null);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.description.trim()) {
      setError('Descrição é obrigatória');
      return false;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Valor deve ser maior que zero');
      return false;
    }
    if (!formData.due_date) {
      setError('Data de vencimento é obrigatória');
      return false;
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
      console.log('📝 Criando conta a pagar:', formData);
      
      // Simular criação de conta (em produção, usar o serviço real)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('✅ Conta a pagar criada com sucesso!');
      onSuccess();
    } catch (err) {
      console.error('❌ Erro ao criar conta a pagar:', err);
      setError(err.message || 'Erro ao criar conta a pagar');
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Nova Conta a Pagar
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Informações Básicas
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Descrição *</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Ex: Pagamento de fornecedor, Aluguel, etc."
                    required
                  />
                </div>

                <div>
                  <Label>Valor *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    placeholder="0,00"
                    required
                  />
                </div>

                <div>
                  <Label>Data de Vencimento *</Label>
                  <Input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => handleInputChange('due_date', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label>Categoria</Label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                  >
                    <option value="fornecedores">Fornecedores</option>
                    <option value="servicos">Serviços</option>
                    <option value="impostos">Impostos</option>
                    <option value="aluguel">Aluguel</option>
                    <option value="energia">Energia</option>
                    <option value="agua">Água</option>
                    <option value="telefone">Telefone</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>

                <div>
                  <Label>Referência</Label>
                  <Input
                    value={formData.reference}
                    onChange={(e) => handleInputChange('reference', e.target.value)}
                    placeholder="Número da nota, contrato, etc."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fornecedor e Conta */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="h-4 w-4" />
                Fornecedor e Conta
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Fornecedor</Label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={formData.contact_id}
                    onChange={(e) => handleInputChange('contact_id', e.target.value)}
                  >
                    <option value="">Selecionar fornecedor</option>
                    {contatos.map(contato => (
                      <option key={contato.id} value={contato.id}>
                        {contato.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>Conta de Débito</Label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={formData.account_id}
                    onChange={(e) => handleInputChange('account_id', e.target.value)}
                  >
                    <option value="">Selecionar conta</option>
                    {contas.map(conta => (
                      <option key={conta.id} value={conta.id}>
                        {conta.name} ({conta.type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Observações */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Observações
              </h3>
              
              <Textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Observações adicionais sobre a conta a pagar..."
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Resumo */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Resumo
              </h3>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Valor Total:</span>
                  <span className="text-xl font-bold text-red-600">
                    {formatCurrency(parseFloat(formData.amount) || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-600">Vencimento:</span>
                  <span className="text-sm">
                    {formData.due_date ? new Date(formData.due_date).toLocaleDateString('pt-BR') : 'N/A'}
                  </span>
                </div>
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
            <Button type="submit" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Conta a Pagar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
