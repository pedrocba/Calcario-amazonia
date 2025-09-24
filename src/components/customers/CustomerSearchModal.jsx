
import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, User, Wallet, Phone, Mail, MapPin, FileText, Package, PackageCheck } from 'lucide-react';

export default function CustomerSearchModal({ open, onOpenChange, customers, sales, saleItems }) {
    const [searchTerm, setSearchTerm] = useState('');
    
    const getCustomerProductBalance = (customerId) => {
        const customerSales = sales.filter(s => s.cliente_id === customerId && s.status_venda !== 'cancelada');
        const productBalance = {};

        for (const sale of customerSales) {
            const itemsInSale = saleItems.filter(i => i.venda_id === sale.id);
            for (const item of itemsInSale) {
                const pendingAmount = (item.quantidade_vendida || 0) - (item.quantidade_retirada || 0);
                if (pendingAmount > 0) {
                    if (productBalance[item.produto_nome]) {
                        productBalance[item.produto_nome] += pendingAmount;
                    } else {
                        productBalance[item.produto_nome] = pendingAmount;
                    }
                }
            }
        }
        return productBalance;
    };

    const filteredCustomers = useMemo(() => {
        if (!searchTerm) return [];
        
        return customers.filter(customer =>
            customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (customer.document && customer.document.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (customer.phone && customer.phone.includes(searchTerm))
        );
    }, [customers, searchTerm]);

    const formatCurrency = (value) => {
        return (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('pt-BR');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Search className="w-5 h-5 text-blue-600" />
                        Buscar Cliente
                    </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                    {/* Campo de busca */}
                    <div>
                        <Label htmlFor="customer-search">Buscar por nome, documento, email ou telefone</Label>
                        <div className="relative mt-2">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <Input
                                id="customer-search"
                                placeholder="Digite para buscar..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Resultados da busca */}
                    <div className="space-y-4">
                        {searchTerm && filteredCustomers.length === 0 && (
                            <div className="text-center py-8 text-slate-500">
                                <User className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                                <p>Nenhum cliente encontrado para "{searchTerm}"</p>
                            </div>
                        )}

                        {filteredCustomers.map(customer => {
                            const productBalance = getCustomerProductBalance(customer.id);
                            const hasProductBalance = Object.keys(productBalance).length > 0;

                            return (
                                <Card key={customer.id} className="bg-white/80 backdrop-blur border shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <User className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-lg">{customer.name}</h3>
                                                    {customer.document && (
                                                        <p className="text-sm text-slate-500">{customer.document}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={customer.active ? "default" : "destructive"}>
                                                    {customer.active ? 'Ativo' : 'Inativo'}
                                                </Badge>
                                            </div>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {/* Saldo */}
                                            <div className="flex items-center gap-2">
                                                <Wallet className="w-4 h-4 text-green-600" />
                                                <div>
                                                    <p className="text-xs text-slate-500">Saldo em Conta</p>
                                                    <p className={`font-mono font-semibold ${
                                                        customer.current_balance > 0 ? 'text-green-600' : 
                                                        customer.current_balance < 0 ? 'text-red-600' : 'text-slate-600'
                                                    }`}>
                                                        {formatCurrency(customer.current_balance)}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Contato */}
                                            {(customer.phone || customer.email) && (
                                                <div className="space-y-1">
                                                    {customer.phone && (
                                                        <div className="flex items-center gap-2">
                                                            <Phone className="w-4 h-4 text-slate-400" />
                                                            <span className="text-sm">{customer.phone}</span>
                                                        </div>
                                                    )}
                                                    {customer.email && (
                                                        <div className="flex items-center gap-2">
                                                            <Mail className="w-4 h-4 text-slate-400" />
                                                            <span className="text-sm">{customer.email}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Endereço */}
                                            {(customer.address || customer.city) && (
                                                <div className="flex items-start gap-2">
                                                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                                                    <div className="text-sm">
                                                        {customer.address && <p>{customer.address}</p>}
                                                        {customer.city && customer.state && (
                                                            <p className="text-slate-500">{customer.city}, {customer.state}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Saldo de Produtos a Retirar */}
                                        {hasProductBalance && (
                                            <div className="mt-4 pt-4 border-t border-slate-200">
                                                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                                    <Package className="w-4 h-4 text-orange-600" />
                                                    Saldo de Produtos a Retirar
                                                </h4>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 text-sm pl-6">
                                                    {Object.entries(productBalance).map(([productName, quantity]) => (
                                                        <div key={productName} className="flex justify-between">
                                                            <span>{productName}</span>
                                                            <span className="font-bold">{quantity} un</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Informações adicionais */}
                                        <div className="mt-4 pt-4 border-t border-slate-200">
                                            <div className="flex items-center gap-4 text-xs text-slate-500">
                                                <div className="flex items-center gap-1">
                                                    <FileText className="w-3 h-3" />
                                                    Cadastrado em {formatDate(customer.created_date)}
                                                </div>
                                                <div>
                                                    Filial: {customer.company_name}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
