import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  Edit,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';
import accountBalanceService from '@/api/accountBalanceService';

export default function MovimentacoesCaixa({ companyId, accounts, onRefresh }) {
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingMovimentacao, setEditingMovimentacao] = useState(null);
  const [filtros, setFiltros] = useState({
    search: '',
    account_id: '',
    type: '',
    date_from: '',
    date_to: ''
  });
  const [formData, setFormData] = useState({
    account_id: '',
    type: 'entrada',
    amount: '',
    description: '',
    reference: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadMovimentacoes();
  }, [companyId, filtros]);

  const loadMovimentacoes = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('financial_transactions')
        .select(`
          *,
          account:financial_accounts (
            id,
            name,
            type
          )
        `)
        .eq('empresa_id', companyId)
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filtros.search) {
        query = query.ilike('description', `%${filtros.search}%`);
      }
      if (filtros.account_id) {
        query = query.eq('account_id', filtros.account_id);
      }
      if (filtros.type) {
        query = query.eq('type', filtros.type);
      }
      if (filtros.date_from) {
        query = query.gte('date', filtros.date_from);
      }
      if (filtros.date_to) {
        query = query.lte('date', filtros.date_to);
      }

      const { data, error } = await query;
      if (error) throw error;

      setMovimentacoes(data || []);
    } catch (err) {
      console.error('Erro ao carregar movimentações:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const movimentacaoData = {
        account_id: formData.account_id,
        type: formData.type,
        amount: formData.type === 'entrada' 
          ? Math.abs(parseFloat(formData.amount))
          : -Math.abs(parseFloat(formData.amount)),
        description: formData.description,
        reference: formData.reference,
        notes: formData.notes,
        empresa_id: companyId,
        date: formData.date,
        status: 'pago',
        category: 'movimentacao_manual'
      };

      if (editingMovimentacao) {
        // Atualizar movimentação existente
        const { error } = await supabase
          .from('financial_transactions')
          .update(movimentacaoData)
          .eq('id', editingMovimentacao.id);

        if (error) throw error;
      } else {
        // Criar nova movimentação
        const { error } = await supabase
          .from('financial_transactions')
          .insert([movimentacaoData]);

        if (error) throw error;

        // Atualizar saldo da conta
        await accountBalanceService.updateAccountBalance(
          formData.account_id,
          Math.abs(parseFloat(formData.amount)),
          formData.type === 'entrada' ? 'credit' : 'debit'
        );
      }

      setShowModal(false);
      resetForm();
      loadMovimentacoes();
      onRefresh();
    } catch (err) {
      console.error('Erro ao salvar movimentação:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      account_id: '',
      type: 'entrada',
      amount: '',
      description: '',
      reference: '',
      notes: '',
      date: new Date().toISOString().split('T')[0]
    });
    setEditingMovimentacao(null);
  };

  const handleEdit = (movimentacao) => {
    setEditingMovimentacao(movimentacao);
    setFormData({
      account_id: movimentacao.account_id,
      type: movimentacao.amount > 0 ? 'entrada' : 'saida',
      amount: Math.abs(movimentacao.amount).toString(),
      description: movimentacao.description,
      reference: movimentacao.reference || '',
      notes: movimentacao.notes || '',
      date: movimentacao.date
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir esta movimentação?')) return;

    try {
      const { error } = await supabase
        .from('financial_transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      loadMovimentacoes();
      onRefresh();
    } catch (err) {
      console.error('Erro ao excluir movimentação:', err);
      setError(err.message);
    }
  };

  const getTypeIcon = (type) => {
    return type === 'entrada' ? ArrowUpRight : ArrowDownLeft;
  };

  const getTypeColor = (type) => {
    return type === 'entrada' ? 'text-green-600' : 'text-red-600';
  };

  const getTypeBadge = (amount) => {
    const isEntrada = amount > 0;
    return (
      <Badge variant={isEntrada ? 'default' : 'destructive'}>
        {isEntrada ? 'Entrada' : 'Saída'}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <Label>Buscar</Label>
              <Input
                placeholder="Descrição, referência..."
                value={filtros.search}
                onChange={(e) => setFiltros(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
            <div>
              <Label>Conta</Label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={filtros.account_id}
                onChange={(e) => setFiltros(prev => ({ ...prev, account_id: e.target.value }))}
              >
                <option value="">Todas</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Tipo</Label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={filtros.type}
                onChange={(e) => setFiltros(prev => ({ ...prev, type: e.target.value }))}
              >
                <option value="">Todos</option>
                <option value="entrada">Entrada</option>
                <option value="saida">Saída</option>
              </select>
            </div>
            <div>
              <Label>Data Início</Label>
              <Input
                type="date"
                value={filtros.date_from}
                onChange={(e) => setFiltros(prev => ({ ...prev, date_from: e.target.value }))}
              />
            </div>
            <div>
              <Label>Data Fim</Label>
              <Input
                type="date"
                value={filtros.date_to}
                onChange={(e) => setFiltros(prev => ({ ...prev, date_to: e.target.value }))}
              />
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={loadMovimentacoes} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Header com Botão de Nova Movimentação */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Movimentações de Caixa</h3>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Movimentação
        </Button>
      </div>

      {/* Tabela de Movimentações */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Conta</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : movimentacoes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    Nenhuma movimentação encontrada
                  </TableCell>
                </TableRow>
              ) : (
                movimentacoes.map((movimentacao) => {
                  const TypeIcon = getTypeIcon(movimentacao.amount > 0 ? 'entrada' : 'saida');
                  return (
                    <TableRow key={movimentacao.id}>
                      <TableCell>
                        {new Date(movimentacao.date).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{movimentacao.description}</p>
                          {movimentacao.reference && (
                            <p className="text-sm text-gray-500">Ref: {movimentacao.reference}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {movimentacao.account?.name || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {getTypeBadge(movimentacao.amount)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <TypeIcon className={`w-4 h-4 ${getTypeColor(movimentacao.amount > 0 ? 'entrada' : 'saida')}`} />
                          <span className={getTypeColor(movimentacao.amount > 0 ? 'entrada' : 'saida')}>
                            {formatCurrency(Math.abs(movimentacao.amount))}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">Processado</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(movimentacao)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(movimentacao.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de Nova/Edição de Movimentação */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingMovimentacao ? 'Editar Movimentação' : 'Nova Movimentação'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Conta *</Label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={formData.account_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, account_id: e.target.value }))}
                  required
                >
                  <option value="">Selecione uma conta</option>
                  {accounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.name} - {account.type} (Saldo: {formatCurrency(account.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Tipo *</Label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  required
                >
                  <option value="entrada">Entrada</option>
                  <option value="saida">Saída</option>
                </select>
              </div>

              <div>
                <Label>Valor *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0,00"
                  required
                />
              </div>

              <div>
                <Label>Data *</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <Label>Descrição *</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição da movimentação"
                required
              />
            </div>

            <div>
              <Label>Referência</Label>
              <Input
                value={formData.reference}
                onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                placeholder="Número da nota, comprovante, etc."
              />
            </div>

            <div>
              <Label>Observações</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Observações adicionais"
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : editingMovimentacao ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

