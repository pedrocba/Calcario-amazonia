
import React, { useState, useEffect, useCallback } from 'react';
import { FinancialAccount } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Building, Wallet, CreditCard, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { useCompany } from '../common/CompanyContext';

export default function AccountManager() {
    const { currentCompany } = useCompany();
    const [accounts, setAccounts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);
    const [isDeletingAll, setIsDeletingAll] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        type: 'banco',
        initial_balance: 0,
        active: true
    });

    const loadAccounts = useCallback(async () => {
        setIsLoading(true);
        try {
            let accountsData = [];
            if (currentCompany) {
                accountsData = await FinancialAccount.filter({ company_id: currentCompany.id });
            } else {
                accountsData = await FinancialAccount.list();
            }
            setAccounts(accountsData || []);
        } catch (error) {
            console.error("Erro ao carregar contas:", error);
        }
        setIsLoading(false);
    }, [currentCompany]);

    useEffect(() => {
        loadAccounts();
    }, [loadAccounts]);

    const resetForm = () => {
        setFormData({ name: '', type: 'banco', initial_balance: 0, active: true });
        setEditingAccount(null);
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSave = {
                ...formData,
                company_id: currentCompany?.id,
                company_name: currentCompany?.name
            };

            if (editingAccount) {
                await FinancialAccount.update(editingAccount.id, dataToSave);
                alert('Conta atualizada com sucesso!');
            } else {
                await FinancialAccount.create(dataToSave);
                alert('Conta criada com sucesso!');
            }
            resetForm();
            loadAccounts();
        } catch (error) {
            console.error("Erro ao salvar conta:", error);
            alert("Erro ao salvar conta financeira");
        }
    };

    const handleEdit = (account) => {
        setEditingAccount(account);
        setFormData({
            name: account.name,
            type: account.type,
            initial_balance: account.initial_balance,
            active: account.active
        });
        setShowForm(true);
    };

    const handleDelete = async (account) => {
        if (confirm(`Tem certeza que deseja excluir a conta "${account.name}"?\n\nEsta ação não pode ser desfeita!`)) {
            try {
                await FinancialAccount.delete(account.id);
                alert('Conta excluída com sucesso!');
                loadAccounts();
            } catch (error) {
                console.error("Erro ao excluir conta:", error);
                alert("Erro ao excluir conta");
            }
        }
    };

    const handleDeleteAll = async () => {
        if (!confirm(`⚠️ CUIDADO! Esta ação vai DELETAR TODAS as ${accounts.length} contas financeiras.\n\nEsta ação NÃO pode ser desfeita!\n\nDeseja continuar?`)) {
            return;
        }

        setIsDeletingAll(true);
        try {
            let deletedCount = 0;
            for (const account of accounts) {
                await FinancialAccount.delete(account.id);
                deletedCount++;
            }
            alert(`✅ ${deletedCount} contas foram excluídas com sucesso!`);
            loadAccounts();
        } catch (error) {
            console.error("Erro ao excluir todas as contas:", error);
            alert("Erro ao excluir contas");
        } finally {
            setIsDeletingAll(false);
        }
    };

    const formatCurrency = (value) => {
        return (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Contas Financeiras</h2>
                    <p className="text-slate-600">Gerencie suas contas bancárias, caixa interno e carteiras digitais</p>
                </div>
                <div className="flex gap-2">
                    {accounts.length > 0 && (
                        <Button 
                            variant="destructive" 
                            onClick={handleDeleteAll}
                            disabled={isDeletingAll}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {isDeletingAll ? 'Excluindo...' : 'Excluir Todas'}
                        </Button>
                    )}
                    <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Conta
                    </Button>
                </div>
            </div>

            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>{editingAccount ? 'Editar Conta' : 'Nova Conta Financeira'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name">Nome da Conta *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        placeholder="Ex: Banco do Brasil - Conta Corrente"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="type">Tipo de Conta *</Label>
                                    <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="banco">Conta Bancária</SelectItem>
                                            <SelectItem value="caixa">Caixa Interno</SelectItem>
                                            <SelectItem value="carteira_digital">Carteira Digital (PIX, PayPal, etc.)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="initial_balance">Saldo Inicial (R$)</Label>
                                <Input
                                    id="initial_balance"
                                    type="number"
                                    step="0.01"
                                    value={formData.initial_balance}
                                    onChange={(e) => setFormData({...formData, initial_balance: parseFloat(e.target.value)})}
                                    placeholder="0,00"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    Informe o saldo que esta conta possui no momento do cadastro
                                </p>
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="ghost" onClick={resetForm}>
                                    Cancelar
                                </Button>
                                <Button type="submit">
                                    {editingAccount ? 'Salvar Alterações' : 'Criar Conta'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Contas Cadastradas ({accounts.length})</span>
                        {accounts.length > 0 && (
                            <div className="flex items-center gap-2 text-sm text-orange-600">
                                <AlertTriangle className="w-4 h-4" />
                                Use "Excluir Todas" para limpar contas sem utilidade
                            </div>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Conta</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead className="text-right">Saldo Inicial</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {accounts.map(account => {
                                const IconComponent = account.type === 'banco' ? Building : account.type === 'caixa' ? Wallet : CreditCard;
                                return (
                                    <TableRow key={account.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                                    <IconComponent className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <span className="font-medium">{account.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {account.type === 'banco' ? 'Conta Bancária' : account.type === 'caixa' ? 'Caixa Interno' : 'Carteira Digital'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            <span className={account.initial_balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                {formatCurrency(account.initial_balance)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={account.active ? "default" : "destructive"}>
                                                {account.active ? 'Ativa' : 'Inativa'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                <Button variant="ghost" size="sm" onClick={() => handleEdit(account)}>
                                                    <Edit className="w-4 h-4 mr-1" />
                                                    Editar
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleDelete(account)} className="text-red-600 hover:text-red-700">
                                                    <Trash2 className="w-4 h-4 mr-1" />
                                                    Excluir
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                    {accounts.length === 0 && !isLoading && (
                        <div className="text-center py-12 text-slate-500">
                            <Wallet className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                            <h3 className="font-medium mb-2">Nenhuma conta cadastrada</h3>
                            <p className="text-sm mb-4">Cadastre suas contas bancárias e meios de pagamento para gerenciar suas finanças.</p>
                            <Button onClick={() => setShowForm(true)} variant="outline">
                                <Plus className="w-4 h-4 mr-2" />
                                Cadastrar primeira conta
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
