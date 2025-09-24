// CÓDIGO COMPLETO E CORRIGIDO PARA /src/components/products/ProductForm.jsx

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "../../lib/supabaseClient";

const initialFormData = {
  code: '', name: '', description: '', category_id: '',
  condition: 'novo', unit_of_measure: 'UN', cost_price: 0,
  sale_price: 0, profit_margin: 0, initial_stock: 0,
};

export default function ProductForm({ product, onSubmit, onCancel, categories, onCategoryAdded }) {
  const [formData, setFormData] = useState(initialFormData);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({ 
        ...initialFormData, 
        ...product,
        // Na edição, mostra o estoque atual como "estoque inicial" para ajuste
        initial_stock: product.current_stock || 0
      });
    } else {
      setFormData(initialFormData);
    }
  }, [product]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePriceChange = (field, value) => {
    const numericValue = parseFloat(value) || 0;
    let newFormData = { ...formData, [field]: numericValue };
    const { cost_price } = newFormData;

    if (field === 'cost_price' || field === 'profit_margin') {
      const newSalePrice = cost_price * (1 + (newFormData.profit_margin / 100));
      newFormData.sale_price = parseFloat(newSalePrice.toFixed(2));
    } else if (field === 'sale_price') {
      if (cost_price > 0) {
        const newMargin = ((numericValue / cost_price) - 1) * 100;
        newFormData.profit_margin = parseFloat(newMargin.toFixed(2));
      } else {
        newFormData.profit_margin = 0;
      }
    }
    setFormData(newFormData);
  };

  const handleAddNewCategory = async () => {
    if (!newCategoryName.trim()) return alert("O nome da categoria não pode estar vazio.");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado.");

      const { data: profile } = await supabase.from('profiles').select('company_id').eq('user_id', user.id).single();
      if (!profile) throw new Error("Perfil do usuário não encontrado.");

      const { error } = await supabase.from('product_categories').insert([{ name: newCategoryName, company_id: profile.company_id }]);
      if (error) throw error;
      
      alert("Categoria adicionada com sucesso!");
      setNewCategoryName('');
      setIsCategoryDialogOpen(false);
      if (onCategoryAdded) onCategoryAdded();
    } catch (error) {
      alert("Falha ao adicionar categoria: " + error.message);
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 border rounded-lg bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="code">Código do Produto</Label>
          <Input id="code" value={formData.code} readOnly className="bg-gray-200" />
        </div>
        <div>
          <Label htmlFor="name">Nome do Produto *</Label>
          <Input id="name" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} required />
        </div>
      </div>
      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea id="description" value={formData.description} onChange={(e) => handleChange('description', e.target.value)} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
            <Label htmlFor="category">Categoria *</Label>
            <div className="flex items-center gap-2">
              <Select required value={formData.category_id} onValueChange={(value) => handleChange('category_id', value)}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {(categories || []).map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
              </Select>
              <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                  <DialogTrigger asChild>
                      <Button type="button" variant="outline" size="icon">+</Button>
                  </DialogTrigger>
                  <DialogContent>
                      <DialogHeader><DialogTitle>Adicionar Nova Categoria</DialogTitle></DialogHeader>
                      <Input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="Nome da nova categoria"/>
                      <DialogFooter>
                          <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>Cancelar</Button>
                          <Button onClick={handleAddNewCategory}>Salvar</Button>
                      </DialogFooter>
                  </DialogContent>
              </Dialog>
            </div>
        </div>
        <div>
          <Label htmlFor="condition">Condição</Label>
          <Select value={formData.condition} onValueChange={(value) => handleChange('condition', value)}>
            <SelectTrigger><SelectValue/></SelectTrigger>
            <SelectContent>
                <SelectItem value="novo">Novo</SelectItem>
                <SelectItem value="usado">Usado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t pt-4">
        <div>
          <Label>Custo (R$)</Label>
          <Input type="number" step="0.01" value={formData.cost_price} onChange={(e) => handlePriceChange('cost_price', e.target.value)}/>
        </div>
        <div>
          <Label>Margem de Lucro (%)</Label>
          <Input type="number" step="0.01" value={formData.profit_margin} onChange={(e) => handlePriceChange('profit_margin', e.target.value)}/>
        </div>
        <div>
          <Label>Preço de Venda (R$)</Label>
          <Input type="number" step="0.01" value={formData.sale_price} onChange={(e) => handlePriceChange('sale_price', e.target.value)} className="bg-blue-50 font-bold"/>
        </div>
      </div>
      
      {/* Campo de Estoque Inicial */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-4">
        <div>
          <Label>{product && product.id ? 'Ajustar Estoque para:' : 'Estoque Inicial'}</Label>
          <Input 
            type="number" 
            min="0" 
            step="1" 
            value={formData.initial_stock} 
            onChange={(e) => handleChange('initial_stock', parseInt(e.target.value) || 0)}
            placeholder={product && product.id ? "Nova quantidade em estoque" : "Quantidade inicial em estoque"}
          />
          <p className="text-sm text-gray-500 mt-1">
            {product && product.id 
              ? "Altere a quantidade para ajustar o estoque atual" 
              : "Quantidade inicial do produto no estoque"
            }
          </p>
        </div>
        <div>
          <Label>Unidade de Medida</Label>
          <Select value={formData.unit_of_measure} onValueChange={(value) => handleChange('unit_of_measure', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a unidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UN">Unidade (UN)</SelectItem>
              <SelectItem value="KG">Quilograma (KG)</SelectItem>
              <SelectItem value="TON">Tonelada (TON)</SelectItem>
              <SelectItem value="L">Litro (L)</SelectItem>
              <SelectItem value="M">Metro (M)</SelectItem>
              <SelectItem value="M2">Metro Quadrado (M²)</SelectItem>
              <SelectItem value="M3">Metro Cúbico (M³)</SelectItem>
              <SelectItem value="CX">Caixa (CX)</SelectItem>
              <SelectItem value="PC">Peça (PC)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex justify-end gap-3 pt-6 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button type="submit">{product && product.id ? 'Atualizar' : 'Criar'} Produto</Button>
      </div>
    </form>
  );
}