
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, PlusCircle, Wallet } from 'lucide-react';
import ProductCombobox from '../common/ProductCombobox';
import CustomerCombobox from '../common/CustomerCombobox'; // Adicionado

export default function VendaForm({ customers, products, onSubmit, onCancel, venda }) {
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [items, setItems] = useState([]);
    const [notes, setNotes] = useState('');
    const [total, setTotal] = useState(0);

    // Encontrar o cliente selecionado para mostrar o saldo
    const selectedCustomerData = customers.find(c => c.id === selectedCustomer);

    useEffect(() => {
        const newTotal = items.reduce((sum, item) => sum + (item.quantidade * item.preco_unitario), 0);
        setTotal(newTotal);
    }, [items]);

    const handleAddItem = () => {
        setItems([...items, {
            produto_id: '',
            produto_nome: '',
            quantidade: 1,
            preco_unitario: 0,
            stock: 0
        }]);
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;

        if (field === 'produto_id') {
            const product = products.find(p => p.id === value);
            if (product) {
                newItems[index]['produto_nome'] = product.name;
                newItems[index]['preco_unitario'] = product.cost_price || 0;
                newItems[index]['stock'] = product.stock || 0;
            } else {
                newItems[index]['produto_nome'] = '';
                newItems[index]['preco_unitario'] = 0;
                newItems[index]['stock'] = 0;
            }
        }

        setItems(newItems);
    };

    const handleRemoveItem = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedCustomer) {
            alert("Por favor, selecione um cliente.");
            return;
        }
        if (items.length === 0 || items.some(item => !item.produto_id)) {
            alert("Por favor, adicione pelo menos um produto válido à venda.");
            return;
        }
        const customer = customers.find(c => c.id === selectedCustomer);
        onSubmit({ customer, items, notes });
    };

    return (
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
                <CardTitle>{venda ? 'Editar Venda' : 'Criar Nova Venda'}</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                    <div>
                        <Label htmlFor="customer-select">Cliente</Label>
                        <CustomerCombobox
                            customers={customers}
                            value={selectedCustomer}
                            onValueChange={setSelectedCustomer}
                            placeholder="Busque e selecione um cliente..."
                        />
                        
                        {/* Mostrar saldo do cliente selecionado */}
                        {selectedCustomerData && (
                            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center gap-2 text-blue-700">
                                    <Wallet className="w-4 h-4" />
                                    <span className="font-medium">
                                        Saldo em Conta: {(selectedCustomerData.current_balance || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </span>
                                    {selectedCustomerData.current_balance > 0 && (
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                            Crédito disponível
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <Label>Itens da Venda</Label>
                        <div className="border rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Produto</TableHead>
                                        <TableHead className="w-24">Qtd.</TableHead>
                                        <TableHead className="w-32">Preço Unit.</TableHead>
                                        <TableHead className="w-32 text-right">Subtotal</TableHead>
                                        <TableHead className="w-12"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <ProductCombobox
                                                    products={products}
                                                    value={item.produto_id}
                                                    onValueChange={(value) => handleItemChange(index, 'produto_id', value)}
                                                    placeholder="Busque um produto..."
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input 
                                                    type="number" 
                                                    value={item.quantidade} 
                                                    onChange={(e) => handleItemChange(index, 'quantidade', parseFloat(e.target.value) || 0)} 
                                                    min="1" 
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input 
                                                    type="number" 
                                                    value={item.preco_unitario} 
                                                    onChange={(e) => handleItemChange(index, 'preco_unitario', parseFloat(e.target.value) || 0)} 
                                                    step="0.01" 
                                                />
                                            </TableCell>
                                            <TableCell className="text-right font-mono">
                                                {(item.quantidade * item.preco_unitario).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </TableCell>
                                            <TableCell>
                                                <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}>
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={handleAddItem} className="mt-2">
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Adicionar Produto
                        </Button>
                    </div>

                    <div>
                        <Label htmlFor="notes">Observações</Label>
                        <Textarea 
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                    <div className="text-right">
                        <p className="text-sm text-slate-600">Total da Venda</p>
                        <p className="text-2xl font-bold font-mono">
                            {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
                        <Button type="submit">Salvar Venda</Button>
                    </div>
                </CardFooter>
            </form>
        </Card>
    );
}
