import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Truck, X, Save } from "lucide-react";

export default function WeighingForm({ vehicles, products, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    vehicle_id: '',
    product_id: '',
    origin: 'santarem',
    destination: 'fazenda',
    client_name: '',
    unit_price: 0,
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const originOptions = [
    { value: 'santarem', label: 'Santarém (Matriz)' },
    { value: 'fazenda', label: 'Fazenda (Filial)' }
  ];

  const destinationOptions = [
    { value: 'santarem', label: 'Santarém (Matriz)' },
    { value: 'fazenda', label: 'Fazenda (Filial)' },
    { value: 'cliente', label: 'Cliente Externo' }
  ];

  return (
    <Card className="bg-white/90 backdrop-blur border-0 shadow-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <Truck className="w-6 h-6 text-blue-600" />
          Nova Viagem para Pesagem
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="vehicle_id">Veículo *</Label>
              <Select required value={formData.vehicle_id} onValueChange={(value) => handleChange('vehicle_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um veículo" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map(vehicle => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.plate} - {vehicle.model} ({vehicle.driver_name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="product_id">Produto *</Label>
              <Select required value={formData.product_id} onValueChange={(value) => handleChange('product_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  {products.map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.code} - {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="origin">Origem *</Label>
              <Select required value={formData.origin} onValueChange={(value) => handleChange('origin', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {originOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination">Destino *</Label>
              <Select required value={formData.destination} onValueChange={(value) => handleChange('destination', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {destinationOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.destination === 'cliente' && (
            <div className="space-y-2">
              <Label htmlFor="client_name">Nome do Cliente</Label>
              <Input 
                id="client_name" 
                value={formData.client_name} 
                onChange={(e) => handleChange('client_name', e.target.value)} 
                placeholder="Nome da empresa ou cliente" 
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="unit_price">Preço por Tonelada (R$)</Label>
            <Input 
              id="unit_price" 
              type="number" 
              step="0.01" 
              min="0" 
              value={formData.unit_price} 
              onChange={(e) => handleChange('unit_price', parseFloat(e.target.value) || 0)} 
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea 
              id="notes" 
              value={formData.notes} 
              onChange={(e) => handleChange('notes', e.target.value)} 
              placeholder="Informações adicionais sobre a viagem..." 
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel} className="flex items-center gap-2">
              <X className="w-4 h-4" />
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
              <Save className="w-4 h-4" />
              Criar Viagem
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}