
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function TransactionForm({ transaction, accounts, contacts, onSubmit, onCancel, type }) {
    const [formData, setFormData] = useState({
        description: '',
        amount: 0,
        type: type || 'despesa', // Initialize type from prop or default
        category: 'fornecedores',
        status: 'pendente',
        due_date: '',
        payment_date: '',
        account_id: '',
        contact_id: '',
        notes: ''
    });

    useEffect(() => {
        if (transaction) {
            setFormData({
                ...transaction,
                due_date: transaction.due_date ? new Date(transaction.due_date).toISOString().split('T')[0] : '',
                payment_date: transaction.payment_date ? new Date(transaction.payment_date).toISOString().split('T')[0] : '',
                amount: Math.abs(transaction.amount) // Trabalhar com valor positivo no form
            });
        }
    }, [transaction]);

    const handleChange = (e) => {
        const { id, value, type } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [id]: type === 'number' ? parseFloat(value) : value 
        }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const finalData = {
            ...formData,
            // Garante que o valor seja negativo para despesas
            amount: formData.type === 'despesa' ? -Math.abs(formData.amount) : Math.abs(formData.amount)
        };
        onSubmit(finalData);
    };

    return (
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-blue-200">
            <CardHeader>
                <CardTitle>{transaction ? 'Editar Lançamento' : 'Novo Lançamento Manual'}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="description">Descrição *</Label>
                            <Input id="description" value={formData.description} onChange={handleChange} required />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="amount">Valor (R$) *</Label>
                            <Input id="amount" type="number" step="0.01" value={formData.amount} onChange={handleChange} required />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="due_date">Data de Vencimento *</Label>
                            <Input id="due_date" type="date" value={formData.due_date} onChange={handleChange} required />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="category">Categoria</Label>
                            <Select value={formData.category} onValueChange={(value) => handleSelectChange('category', value)}>
                                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="venda_servico">Venda de Serviço</SelectItem>
                                    <SelectItem value="venda_produto">Venda de Produto</SelectItem>
                                    <SelectItem value="fornecedores">Fornecedores</SelectItem>
                                    <SelectItem value="salarios">Salários</SelectItem>
                                    <SelectItem value="impostos">Impostos</SelectItem>
                                    <SelectItem value="aluguel">Aluguel</SelectItem>
                                    <SelectItem value="marketing">Marketing</SelectItem>
                                    <SelectItem value="outros">Outros</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="account_id">Conta Financeira</Label>
                            <Select value={formData.account_id} onValueChange={(value) => handleSelectChange('account_id', value)}>
                                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                <SelectContent>
                                    {accounts
                                        .sort((a, b) => a.name.localeCompare(b.name)) // ORGANIZADO ALFABETICAMENTE
                                        .map(account => (
                                        <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="contact_id">Fornecedor/Cliente</Label>
                             <Select value={formData.contact_id} onValueChange={(value) => handleSelectChange('contact_id', value)}>
                                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                <SelectContent>
                                    {contacts
                                        .sort((a, b) => a.name.localeCompare(b.name)) // ORGANIZADO ALFABETICAMENTE
                                        .map(contact => (
                                        <SelectItem key={contact.id} value={contact.id}>{contact.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
                        <Button type="submit">{transaction ? 'Salvar Alterações' : 'Adicionar Lançamento'}</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
