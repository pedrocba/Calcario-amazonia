import React, { useState, useEffect } from 'react';
import { FinancialAccount } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Building, Wallet, CreditCard } from 'lucide-react';

export default function ContasFinanceiras() {
    const [accounts, setAccounts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        type: 'banco',
        initial_balance: 0,
        active: true
    });

    useEffect(() => {
        loadAccounts();
    }, []);

    const loadAccounts = async () => {
        setIsLoading(true);
        try {
            const accountsData = await FinancialAccount.list();
            setAccounts(accountsData);
        } catch (error) {
            console.error("Erro ao carregar contas:", error);
        }
        setIsLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingAccount) {
                await FinancialAccount.update(editingAccount.id, formData);
            } else {
                await FinancialAccount.create(formData);
            }
            setShowForm(false);
            setEditingAccount(null);
            setFormData({ name: '', type: 'banco', initial_balance: 0, active: true });
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

    const formatCurrency = (value) => {
        return (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Contas Financeiras</h1>
                        <p className="text-slate-600">Gerencie suas contas bancárias, caixa interno e carteiras digitais</p>
                    </div>
                    <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Conta
                    </Button>
                </div>

                {showForm && (
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>{editingAccount ? 'Editar Conta' : 'Nova Conta Financeira'}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="name">Nome da Conta</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            placeholder="Ex: Banco do Brasil - CC"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="type">Tipo de Conta</Label>
                                        <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="banco">Conta Bancária</SelectItem>
                                                <SelectItem value="caixa">Caixa Interno</SelectItem>
                                                <SelectItem value="carteira_digital">Carteira Digital</SelectItem>
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
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="ghost" onClick={() => {setShowForm(false); setEditingAccount(null);}}>
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
                        <CardTitle>Lista de Contas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome da Conta</TableHead>
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
                                                <div className="flex items-center gap-2">
                                                    <IconComponent className="w-4 h-4 text-slate-500" />
                                                    <span className="font-medium">{account.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {account.type === 'banco' ? 'Banco' : account.type === 'caixa' ? 'Caixa' : 'Digital'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-mono">
                                                {formatCurrency(account.initial_balance)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={account.active ? "default" : "destructive"}>
                                                    {account.active ? 'Ativa' : 'Inativa'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="sm" onClick={() => handleEdit(account)}>
                                                    Editar
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                        {accounts.length === 0 && !isLoading && (
                            <div className="text-center py-8 text-slate-500">
                                <Wallet className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                                <p>Nenhuma conta cadastrada.</p>
                                <p className="text-sm">Clique em "Nova Conta" para começar.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}