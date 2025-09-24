import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, PlusCircle, X } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import ProductCombobox from '../common/ProductCombobox';
import CustomerCombobox from '../common/CustomerCombobox';

const NewSaleForm = ({ onClose, onSaveSuccess }) => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [items, setItems] = useState([]);
  const [notes, setNotes] = useState('');
  const [total, setTotal] = useState(0);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Encontrar o cliente selecionado para mostrar o saldo
  const selectedCustomerData = customers.find(c => c.id === selectedCustomer);

  // Carregar dados iniciais
  useEffect(() => {
    loadCustomersAndProducts();
  }, []);

  // Recalcular total quando itens mudam
  useEffect(() => {
    const newTotal = items.reduce((sum, item) => sum + (item.quantidade * item.preco_unitario), 0);
    setTotal(newTotal);
  }, [items]);

  const loadCustomersAndProducts = async () => {
    try {
      // Buscar clientes
      const { data: customersData, error: customersError } = await supabase
        .from('contacts')
        .select('id, name, email, phone, active')
        .eq('active', true)
        .order('name');

      if (customersError) throw customersError;

      // Buscar produtos
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .order('name');

      if (productsError) throw productsError;

      setCustomers(customersData || []);
      setProducts(productsData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar clientes e produtos: ' + error.message);
    }
  };

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
        newItems[index]['preco_unitario'] = product.sale_price || 0;
        newItems[index]['stock'] = product.current_stock || 0;
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

  const handleSaveSale = async () => {
    if (!selectedCustomer) {
      alert("Por favor, selecione um cliente.");
      return;
    }
    if (items.length === 0 || items.some(item => !item.produto_id)) {
      alert("Por favor, adicione pelo menos um produto válido à venda.");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Buscar company_id do usuário logado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado.");

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      if (!profile || !profile.company_id) {
        throw new Error("Filial não encontrada para o usuário.");
      }

      const companyId = profile.company_id;

      // 2. Criar a venda principal com todos os campos obrigatórios
      const valorTotal = items.reduce((sum, item) => sum + (item.quantidade * item.preco_unitario), 0);
      
      // Garantir que o status seja sempre definido
      const statusValue = 'pendente';
      
      const saleData = {
        status: statusValue, // Status inicial obrigatório - PRIMEIRO CAMPO
        client_id: selectedCustomer,
        total_amount: valorTotal,
        discount: 0,
        final_amount: valorTotal,
        payment_method: 'dinheiro',
        notes: notes || null,
        date: new Date().toISOString().split('T')[0],
        company_id: companyId
      };

      // Verificação adicional
      if (!saleData.status) {
        throw new Error('Status não foi definido corretamente');
      }

      console.log('Dados da venda a serem salvos:', saleData);
      console.log('Status definido:', saleData.status);
      console.log('Tipo do status:', typeof saleData.status);
      console.log('Valor do status é string?', typeof saleData.status === 'string');

      const { data: novaVenda, error: vendaError } = await supabase
        .from('vendas')
        .insert([saleData])
        .select()
        .single();

      if (vendaError) throw vendaError;

      // 3. Criar os itens da venda
      const itemPromises = items.map(item => {
        return supabase
          .from('itens_venda')
          .insert([{
            venda_id: novaVenda.id,
            product_id: item.produto_id,
            quantity: item.quantidade,
            unit_price: item.preco_unitario,
            total_price: item.quantidade * item.preco_unitario,
            discount: 0,
            company_id: companyId,
            created_at: new Date().toISOString()
          }]);
      });
      
      await Promise.all(itemPromises);

      alert(`Venda criada com sucesso! ID: ${novaVenda.id.slice(0, 8)}`);
      onSaveSuccess();
      
    } catch (error) {
      console.error('Erro ao criar venda:', error);
      alert(`Erro ao criar venda: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5" />
            Nova Venda
          </DialogTitle>
        </DialogHeader>

        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle>Criar Nova Venda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Seleção de Cliente */}
            <div>
              <Label htmlFor="customer-select">Cliente *</Label>
              <CustomerCombobox
                customers={customers}
                value={selectedCustomer}
                onValueChange={setSelectedCustomer}
                placeholder="Selecione um cliente..."
              />
              {selectedCustomerData && (
                <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                  <p><strong>Cliente:</strong> {selectedCustomerData.name}</p>
                  <p><strong>Email:</strong> {selectedCustomerData.email || 'N/A'}</p>
                  <p><strong>Telefone:</strong> {selectedCustomerData.phone || 'N/A'}</p>
                </div>
              )}
            </div>

            {/* Tabela de Itens */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <Label>Itens da Venda</Label>
                <Button type="button" onClick={handleAddItem} variant="outline" size="sm">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Adicionar Item
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Preço Unit.</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Estoque</TableHead>
                      <TableHead>Ações</TableHead>
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
                            placeholder="Selecione produto..."
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantidade}
                            onChange={(e) => handleItemChange(index, 'quantidade', parseInt(e.target.value) || 1)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.preco_unitario}
                            onChange={(e) => handleItemChange(index, 'preco_unitario', parseFloat(e.target.value) || 0)}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell className="font-mono">
                          {(item.quantidade * item.preco_unitario).toLocaleString('pt-BR', { 
                            style: 'currency', 
                            currency: 'BRL' 
                          })}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {item.stock} UN
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Observações */}
            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observações adicionais sobre a venda..."
                rows={3}
              />
            </div>

            {/* Total */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <p className="text-sm text-slate-600">Total da Venda</p>
                <p className="text-2xl font-bold font-mono">
                  {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSaveSale} disabled={isLoading}>
            {isLoading ? 'Salvando...' : 'Salvar Venda'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewSaleForm;
