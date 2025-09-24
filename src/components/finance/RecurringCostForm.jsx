import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Save } from 'lucide-react';

export default function RecurringCostForm({ cost, accounts, contacts, onSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        description: '',
        amount: 0,
        category: 'outros',
        day_of_month: 1,
        account_id: '',
        contact_id: '',
        is_active: true
    });

    useEffect(() => {
        if (cost) {
            setFormData(cost);
        }
    }, [cost]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Card className="bg-slate-50 border-slate-200">
            <CardHeader>
                <CardTitle>{cost ? 'Editar Custo Fixo' : 'Novo Custo Fixo'}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="description">Descrição</Label>
                            <Input id="description" value={formData.description} onChange={(e) => handleChange('description', e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category">Categoria</Label>
                             <Select value={formData.category} onValueChange={(v) => handleChange('category', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
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
                        <div className="space-y-2">
                            <Label htmlFor="amount">Valor (R$)</Label>
                            <Input id="amount" type="number" step="0.01" value={formData.amount} onChange={(e) => handleChange('amount', parseFloat(e.target.value))} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="day_of_month">Dia do Vencimento</Label>
                            <Input id="day_of_month" type="number" min="1" max="31" value={formData.day_of_month} onChange={(e) => handleChange('day_of_month', parseInt(e.target.value))} required />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="account_id">Conta Padrão</Label>
                            <Select value={formData.account_id} onValueChange={(v) => handleChange('account_id', v)} required>
                                <SelectTrigger><SelectValue placeholder="Selecione a conta" /></SelectTrigger>
                                <SelectContent>
                                    {accounts.map(acc => <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contact_id">Fornecedor (Opcional)</Label>
                            <Select value={formData.contact_id || ''} onValueChange={(v) => handleChange('contact_id', v)}>
                                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={null}>Nenhum</SelectItem>
                                    {contacts.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <Button type="button" variant="outline" onClick={onCancel}><X className="w-4 h-4 mr-2" /> Cancelar</Button>
                        <Button type="submit"><Save className="w-4 h-4 mr-2" /> Salvar</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}