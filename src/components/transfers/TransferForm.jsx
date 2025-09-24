
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRightLeft, X, Send } from "lucide-react";

export default function TransferForm({ availableStock, products, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    origin_entry_id: '',
    setor_origem: 'santarem', // Initialized as per outline
    setor_destino: 'fazenda', // Initialized as per outline
    quantity_sent: 1,
    reason: '',
    notes: ''
  });

  // Memoize the selected entry from availableStock
  const selectedEntry = useMemo(() => {
    return availableStock.find(e => e.id === formData.origin_entry_id);
  }, [formData.origin_entry_id, availableStock]);

  // Find the product details for the selected entry
  // This is necessary because selectedEntry itself doesn't contain the product object directly.
  const selectedProduct = useMemo(() => {
    if (selectedEntry) {
      return products.find(p => p.id === selectedEntry.product_id);
    }
    return null;
  }, [selectedEntry, products]);

  // Handler for Select components, which also updates origin/destination sectors
  const handleSelectChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (field === 'origin_entry_id') {
      const entry = availableStock.find(e => e.id === value);
      if (entry) {
        setFormData(prev => ({
          ...prev,
          setor_origem: entry.setor,
          setor_destino: entry.setor === 'santarem' ? 'fazenda' : 'santarem'
        }));
      } else {
        // If no entry is selected (e.g., cleared or invalid ID), reset sectors
        setFormData(prev => ({
          ...prev,
          setor_origem: '',
          setor_destino: ''
        }));
      }
    }
  };

  // Generic handleChange for Input and Textarea fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation as per outline
    if (!formData.origin_entry_id) {
      alert("Por favor, selecione um lote de origem.");
      return;
    }

    const quantity = parseInt(formData.quantity_sent);
    if (isNaN(quantity) || quantity <= 0) {
      alert("A quantidade a transferir deve ser um número maior que zero.");
      return;
    }

    if (selectedEntry && quantity > selectedEntry.quantity_available) {
      alert(`Quantidade disponível insuficiente. Máximo: ${selectedEntry.quantity_available} UN.`);
      return;
    }
    
    // Construct transferData including relevant fields from selectedEntry
    const transferData = {
      ...formData,
      product_id: selectedEntry.product_id,
      condicao: selectedEntry.condicao,
      ca: selectedEntry.ca,
      validade: selectedEntry.validade,
      unit_cost: selectedEntry.unit_cost,
      quantity_sent: quantity // Ensure the parsed integer quantity is used
    };
    
    onSubmit(transferData);
  };

  const setorOptions = [
    { value: 'santarem', label: 'Santarém (Matriz)' },
    { value: 'fazenda', label: 'Fazenda (Filial)' }
  ];

  return (
    <Card className="bg-slate-50 border-l-4 border-blue-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <ArrowRightLeft className="w-6 h-6 text-blue-600" />
          Nova Transferência entre Setores
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="origin_entry_id">Item do Estoque para Transferir *</Label>
            {/* Removed the separate search input field as per simplification */}
            <Select 
              required 
              value={formData.origin_entry_id} 
              onValueChange={(value) => handleSelectChange('origin_entry_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Busque e selecione um lote de estoque para transferir..." />
              </SelectTrigger>
              <SelectContent>
                {availableStock.length > 0 ? (
                  availableStock.map(entry => {
                    const product = products.find(p => p.id === entry.product_id); // Find product for display
                    return (
                      <SelectItem key={entry.id} value={entry.id}>
                        <div className="flex justify-between items-center w-full">
                          <span>
                            {product ? `${product.name} (${product.code})` : 'Produto desconhecido'}
                          </span>
                          <span className="text-sm text-slate-500 ml-4">
                            {entry.setor} • {entry.quantity_available} UN • Ref: {entry.reference}
                          </span>
                        </div>
                      </SelectItem>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-sm text-slate-500">
                    Nenhum item com estoque ativo para transferência.
                    <br/>Primeiro, registre uma "Nova Entrada de Estoque" no Almoxarifado.
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedEntry && selectedProduct && (
            <div className="p-4 bg-slate-100 rounded-lg border border-slate-200">
              <h4 className="font-semibold text-slate-900 mb-2 text-lg">Detalhes do Item Selecionado</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-slate-600">Produto:</span>
                  <p className="font-medium text-slate-800">{selectedProduct.name}</p>
                </div>
                <div>
                  <span className="text-slate-600">Localização:</span>
                  <p className="font-medium text-slate-800">{selectedEntry.warehouse_location || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-slate-600">Disponível:</span>
                  <p className="font-medium text-slate-800">{selectedEntry.quantity_available} UN</p>
                </div>
                <div>
                  <span className="text-slate-600">Condição:</span>
                  <p className="font-medium text-slate-800">{selectedEntry.condicao}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="setor_origem">Setor de Origem</Label>
              <Input disabled value={setorOptions.find(o => o.value === formData.setor_origem)?.label || ''} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="setor_destino">Setor de Destino *</Label>
              <Select 
                required 
                value={formData.setor_destino} 
                onValueChange={(value) => handleSelectChange('setor_destino', value)} 
                disabled={!selectedEntry}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {setorOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity_sent">Quantidade a Transferir *</Label>
              <Input 
                id="quantity_sent" 
                name="quantity_sent" // Added name for generic handleChange
                type="number" 
                min="1" 
                max={selectedEntry ? selectedEntry.quantity_available : 99999}
                required
                value={formData.quantity_sent} 
                onChange={handleChange} // Use generic handleChange
                placeholder="0"
                disabled={!selectedEntry}
              />
              {selectedEntry && (
                <p className="text-xs text-slate-500">
                  Máximo disponível: {selectedEntry.quantity_available} UN
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Motivo da Transferência</Label>
            <Input 
              id="reason" 
              name="reason" // Added name for generic handleChange
              value={formData.reason} 
              onChange={handleChange} 
              placeholder="Ex: Necessidade operacional, reposição de estoque..." 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea 
              id="notes" 
              name="notes" // Added name for generic handleChange
              value={formData.notes} 
              onChange={handleChange} 
              placeholder="Informações adicionais sobre a transferência..." 
              rows={3} 
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel} className="flex items-center gap-2"><X className="w-4 h-4" />Cancelar</Button>
            <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2" 
                disabled={!selectedEntry || parseInt(formData.quantity_sent) <= 0 || parseInt(formData.quantity_sent) > (selectedEntry?.quantity_available || 0)}
            >
                <Send className="w-4 h-4" />Enviar Transferência
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
