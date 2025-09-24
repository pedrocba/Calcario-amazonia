import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, CreditCard, DollarSign } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const ContasCaixasManager = () => {
  const [contas, setContas] = useState([]);
  const [caixas, setCaixas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showContaModal, setShowContaModal] = useState(false);
  const [showCaixaModal, setShowCaixaModal] = useState(false);
  const [editingConta, setEditingConta] = useState(null);
  const [editingCaixa, setEditingCaixa] = useState(null);

  const [contaForm, setContaForm] = useState({
    bank_name: '',
    bank_code: '',
    account_number: '',
    account_type: 'corrente',
    agency: '',
    balance: 0
  });

  const [caixaForm, setCaixaForm] = useState({
    name: '',
    description: '',
    balance: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [contasData, caixasData] = await Promise.all([
        supabase.from('contas_bancarias').select('*').eq('active', true),
        supabase.from('caixas').select('*').eq('active', true)
      ]);

      setContas(contasData.data || []);
      setCaixas(caixasData.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConta = async () => {
    try {
      const contaData = {
        ...contaForm,
        company_id: '68cacb913d169d191be6c90d' // ID da empresa atual
      };

      if (editingConta) {
        const { error } = await supabase
          .from('contas_bancarias')
          .update(contaData)
          .eq('id', editingConta.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('contas_bancarias')
          .insert(contaData);
        
        if (error) throw error;
      }

      setShowContaModal(false);
      setEditingConta(null);
      setContaForm({
        bank_name: '',
        bank_code: '',
        account_number: '',
        account_type: 'corrente',
        agency: '',
        balance: 0
      });
      loadData();
    } catch (error) {
      console.error('Erro ao salvar conta:', error);
      alert('Erro ao salvar conta: ' + error.message);
    }
  };

  const handleSaveCaixa = async () => {
    try {
      const caixaData = {
        ...caixaForm,
        company_id: '68cacb913d169d191be6c90d' // ID da empresa atual
      };

      if (editingCaixa) {
        const { error } = await supabase
          .from('caixas')
          .update(caixaData)
          .eq('id', editingCaixa.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('caixas')
          .insert(caixaData);
        
        if (error) throw error;
      }

      setShowCaixaModal(false);
      setEditingCaixa(null);
      setCaixaForm({
        name: '',
        description: '',
        balance: 0
      });
      loadData();
    } catch (error) {
      console.error('Erro ao salvar caixa:', error);
      alert('Erro ao salvar caixa: ' + error.message);
    }
  };

  const handleEditConta = (conta) => {
    setEditingConta(conta);
    setContaForm({
      bank_name: conta.bank_name,
      bank_code: conta.bank_code,
      account_number: conta.account_number,
      account_type: conta.account_type,
      agency: conta.agency,
      balance: conta.balance
    });
    setShowContaModal(true);
  };

  const handleEditCaixa = (caixa) => {
    setEditingCaixa(caixa);
    setCaixaForm({
      name: caixa.name,
      description: caixa.description,
      balance: caixa.balance
    });
    setShowCaixaModal(true);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (isLoading) {
    return <div className="p-6">Carregando...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Gerenciar Contas e Caixas</h1>
        <p className="text-gray-600">Configure as contas bancárias e caixas para o sistema de faturamento</p>
      </div>

      <Tabs defaultValue="contas" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="contas">Contas Bancárias</TabsTrigger>
          <TabsTrigger value="caixas">Caixas</TabsTrigger>
        </TabsList>

        <TabsContent value="contas">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Contas Bancárias</CardTitle>
                <Button onClick={() => setShowContaModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Conta
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contas.map(conta => (
                  <div key={conta.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-semibold">{conta.bank_name}</div>
                        <div className="text-sm text-gray-600">
                          {conta.account_type} - {conta.account_number}
                        </div>
                        <div className="text-sm text-gray-500">
                          Agência: {conta.agency}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-semibold text-green-600">
                          {formatCurrency(conta.balance)}
                        </div>
                        <div className="text-sm text-gray-500">Saldo</div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditConta(conta)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="caixas">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Caixas</CardTitle>
                <Button onClick={() => setShowCaixaModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Caixa
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {caixas.map(caixa => (
                  <div key={caixa.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="font-semibold">{caixa.name}</div>
                        <div className="text-sm text-gray-600">{caixa.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-semibold text-green-600">
                          {formatCurrency(caixa.balance)}
                        </div>
                        <div className="text-sm text-gray-500">Saldo</div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCaixa(caixa)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Conta Bancária */}
      <Dialog open={showContaModal} onOpenChange={setShowContaModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingConta ? 'Editar Conta Bancária' : 'Nova Conta Bancária'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome do Banco</Label>
              <Input
                value={contaForm.bank_name}
                onChange={(e) => setContaForm(prev => ({ ...prev, bank_name: e.target.value }))}
                placeholder="Ex: Banco do Brasil"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Código do Banco</Label>
                <Input
                  value={contaForm.bank_code}
                  onChange={(e) => setContaForm(prev => ({ ...prev, bank_code: e.target.value }))}
                  placeholder="Ex: 001"
                />
              </div>
              <div>
                <Label>Agência</Label>
                <Input
                  value={contaForm.agency}
                  onChange={(e) => setContaForm(prev => ({ ...prev, agency: e.target.value }))}
                  placeholder="Ex: 1234"
                />
              </div>
            </div>
            <div>
              <Label>Número da Conta</Label>
              <Input
                value={contaForm.account_number}
                onChange={(e) => setContaForm(prev => ({ ...prev, account_number: e.target.value }))}
                placeholder="Ex: 12345-6"
              />
            </div>
            <div>
              <Label>Tipo de Conta</Label>
              <Select
                value={contaForm.account_type}
                onValueChange={(value) => setContaForm(prev => ({ ...prev, account_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="corrente">Conta Corrente</SelectItem>
                  <SelectItem value="poupanca">Conta Poupança</SelectItem>
                  <SelectItem value="investimento">Conta Investimento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Saldo Inicial</Label>
              <Input
                type="number"
                step="0.01"
                value={contaForm.balance}
                onChange={(e) => setContaForm(prev => ({ ...prev, balance: parseFloat(e.target.value) || 0 }))}
                placeholder="0,00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowContaModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveConta}>
              {editingConta ? 'Atualizar' : 'Criar'} Conta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Caixa */}
      <Dialog open={showCaixaModal} onOpenChange={setShowCaixaModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCaixa ? 'Editar Caixa' : 'Novo Caixa'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome do Caixa</Label>
              <Input
                value={caixaForm.name}
                onChange={(e) => setCaixaForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Caixa Principal"
              />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea
                value={caixaForm.description}
                onChange={(e) => setCaixaForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição do caixa..."
                rows={3}
              />
            </div>
            <div>
              <Label>Saldo Inicial</Label>
              <Input
                type="number"
                step="0.01"
                value={caixaForm.balance}
                onChange={(e) => setCaixaForm(prev => ({ ...prev, balance: parseFloat(e.target.value) || 0 }))}
                placeholder="0,00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCaixaModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveCaixa}>
              {editingCaixa ? 'Atualizar' : 'Criar'} Caixa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContasCaixasManager;







