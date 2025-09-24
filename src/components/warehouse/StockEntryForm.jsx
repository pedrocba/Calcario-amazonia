
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, X, Save } from "lucide-react";
import ProductCombobox from '../common/ProductCombobox'; // Importar o novo componente

export default function StockEntryForm({ entry, products, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    product_id: '',
    warehouse_location: '',
    setor: 'santarem',
    origem_entrada: 'compra',
    condicao: 'novo',
    ca: '', // New field for Certificado de Aprovação
    validade: '', // New field for Expiration Date
    quantity_received: 0, // Changed initial value from 1 to 0
    supplier: '',
    invoice_number: '',
    unit_cost: 0,
    notes: '' // New field for additional notes
  });

  useEffect(() => {
    if (entry) {
      setFormData({
        product_id: entry.product_id || '',
        warehouse_location: entry.warehouse_location || '',
        setor: entry.setor || 'santarem',
        origem_entrada: entry.origem_entrada || 'compra',
        condicao: entry.condicao || 'novo',
        ca: entry.ca || '',
        validade: entry.validade ? new Date(entry.validade).toISOString().split('T')[0] : '',
        quantity_received: entry.quantity_received || 0,
        supplier: entry.supplier || '',
        invoice_number: entry.invoice_number || '',
        unit_cost: entry.unit_cost || 0,
        notes: entry.notes || ''
      });
    } else {
      setFormData({
        product_id: '',
        warehouse_location: '',
        setor: 'santarem',
        origem_entrada: 'compra',
        condicao: 'novo',
        ca: '',
        validade: '',
        quantity_received: 0,
        supplier: '',
        invoice_number: '',
        unit_cost: 0,
        notes: ''
      });
    }
  }, [entry, products]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'product_id') {
      const product = products.find(p => p.id === value);
      if (product) {
        setFormData(prev => ({
          ...prev,
          unit_cost: product.cost_price || 0, // Pre-fill unit cost from product
          condicao: product.condition || 'novo' // Pre-fill condition from product
        }));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Enhanced Validations
    if (!formData.product_id) {
      alert("Por favor, selecione um produto válido da lista.");
      return;
    }

    if (!formData.warehouse_location || String(formData.warehouse_location).trim() === '') {
      alert("Por favor, preencha a 'Localização no Almoxarifado'.");
      return;
    }

    if (!formData.quantity_received || formData.quantity_received <= 0) {
      alert("Por favor, informe uma quantidade recebida válida (maior que 0).");
      return;
    }

    // Validate if the selected product still exists
    const selectedProduct = products.find(p => p.id === formData.product_id);
    if (!selectedProduct) {
      alert("Produto selecionado não encontrado. Por favor, selecione novamente.");
      return;
    }

    console.log('Enviando dados da entrada:', formData);
    onSubmit(formData);
  };

  const setorOptions = [
    { value: 'santarem', label: 'Santarém (Matriz)' },
    { value: 'fazenda', label: 'Fazenda (Filial)' }
  ];
  const origemOptions = [
    { value: 'compra', label: 'Compra Direta' },
    { value: 'transferencia', label: 'Transferência Recebida' },
    { value: 'ajuste', label: 'Ajuste de Inventário' }
  ];
  const condicaoOptions = [
    { value: 'novo', label: 'Novo' },
    { value: 'usado', label: 'Usado' },
    { value: 'recondicionado', label: 'Recondicionado' }
  ];

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-l-4 border-blue-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Package className="w-6 h-6 text-blue-600" />
          {entry ? 'Editar Entrada no Estoque' : 'Registrar Nova Entrada no Estoque'}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="product_id">Produto *</Label>
            <ProductCombobox
              products={products}
              value={formData.product_id}
              onValueChange={(value) => handleSelectChange('product_id', value)}
              placeholder="Busque e selecione um produto..."
              disabled={!!entry} // Disable product selection when editing
            />
            {entry && <p className="text-xs text-slate-500 mt-2">O produto não pode ser alterado na edição.</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="warehouse_location">Localização no Almoxarifado *</Label>
              <Input
                id="warehouse_location"
                name="warehouse_location"
                required
                value={formData.warehouse_location}
                onChange={(e) => handleChange('warehouse_location', e.target.value)}
                placeholder="Ex: STM-A01, FZD-EPI-02, CORREDOR-3-PRAT-B"
              />
              <p className="text-xs text-slate-500">Informe a localização física exata do item para facilitar a retirada.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="setor">Setor de Destino *</Label>
              <Select
                name="setor"
                required
                value={formData.setor}
                onValueChange={(value) => handleSelectChange('setor', value)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{setorOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="quantity_received">Quantidade Recebida *</Label>
              <Input id="quantity_received" name="quantity_received" type="number" min="1" required value={formData.quantity_received} onChange={(e) => handleChange('quantity_received', parseInt(e.target.value) || 0)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit_cost">Custo Unitário (R$)</Label>
              <Input id="unit_cost" name="unit_cost" type="number" step="0.01" min="0" value={formData.unit_cost} onChange={(e) => handleChange('unit_cost', parseFloat(e.target.value) || 0)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="condicao">Condição *</Label>
              <Select name="condicao" required value={formData.condicao} onValueChange={(value) => handleSelectChange('condicao', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{condicaoOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="ca">Certificado de Aprovação (CA)</Label>
              <Input id="ca" name="ca" value={formData.ca} onChange={(e) => handleChange('ca', e.target.value)} placeholder="Número do CA (se aplicável)" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="validade">Validade</Label>
              <Input id="validade" name="validade" type="date" value={formData.validade} onChange={(e) => handleChange('validade', e.target.value)} />
            </div>
          </div>

          <div className="border-t pt-6 space-y-6">
            <h3 className="text-lg font-medium">Informações Adicionais</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="origem_entrada">Origem da Entrada</Label>
                <Select name="origem_entrada" value={formData.origem_entrada} onValueChange={(value) => handleSelectChange('origem_entrada', value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{origemOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier">Fornecedor</Label>
                <Input id="supplier" name="supplier" value={formData.supplier} onChange={(e) => handleChange('supplier', e.target.value)} placeholder="Nome do fornecedor" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoice_number">Nota Fiscal</Label>
                <Input id="invoice_number" name="invoice_number" value={formData.invoice_number} onChange={(e) => handleChange('invoice_number', e.target.value)} placeholder="Número da NF-e" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea id="notes" name="notes" value={formData.notes} onChange={(e) => handleChange('notes', e.target.value)} placeholder="Informações adicionais sobre esta entrada..." rows={3} />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-3 pt-6 border-t">
          <Button type="button" variant="outline" onClick={onCancel} className="flex items-center gap-2"><X className="w-4 h-4" />Cancelar</Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"><Save className="w-4 h-4" />{entry ? 'Atualizar' : 'Registrar'} Entrada</Button>
        </CardFooter>
      </form>
    </Card>
  );
}
