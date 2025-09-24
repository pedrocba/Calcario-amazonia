import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CustomerForm({ customer, onSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        name: '',
        document: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
    });

    useEffect(() => {
        if (customer) {
            setFormData({
                name: customer.name || '',
                document: customer.document || '',
                email: customer.email || '',
                phone: customer.phone || '',
                address: customer.address || '',
                city: customer.city || '',
                state: customer.state || '',
            });
        } else {
            setFormData({
                name: '',
                document: '',
                email: '',
                phone: '',
                address: '',
                city: '',
                state: '',
            });
        }
    }, [customer]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validação básica
        if (!formData.name || formData.name.trim() === '') {
            alert('Nome é obrigatório!');
            return;
        }
        
        onSubmit(formData);
    };

    return (
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
                <CardTitle>{customer ? 'Editar Cliente' : 'Novo Cliente'}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="name">Nome Completo / Razão Social *</Label>
                        <Input id="name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="document">CPF / CNPJ</Label>
                            <Input id="document" value={formData.document} onChange={handleChange} />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="phone">Telefone</Label>
                            <Input id="phone" value={formData.phone} onChange={handleChange} />
                        </div>
                    </div>
                     <div className="space-y-1">
                        <Label htmlFor="email">E-mail</Label>
                        <Input id="email" type="email" value={formData.email} onChange={handleChange} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="address">Endereço</Label>
                        <Input id="address" value={formData.address} onChange={handleChange} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="city">Cidade</Label>
                            <Input id="city" value={formData.city} onChange={handleChange} />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="state">Estado (UF)</Label>
                            <Input id="state" value={formData.state} onChange={handleChange} maxLength="2" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
                        <Button type="submit">{customer ? 'Salvar Alterações' : 'Criar Cliente'}</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}