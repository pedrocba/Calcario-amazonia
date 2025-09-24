import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Wrench, X, Save } from "lucide-react";

export default function VehicleExpenseForm({ vehicleId, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    vehicle_id: vehicleId,
    date: new Date().toISOString().split('T')[0], // Formato para date
    category: 'manutencao',
    description: '',
    cost: '',
    supplier: '',
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSubmit = {
      ...formData,
      cost: parseFloat(formData.cost) || 0,
    };
    onSubmit(dataToSubmit);
  };

  return (
    <Card className="bg-white/95 my-6 shadow-lg border-l-4 border-purple-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-3"><Wrench className="w-6 h-6 text-purple-600" /> Nova Despesa</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data da Despesa</Label>
              <Input id="date" type="date" value={formData.date} onChange={(e) => handleChange('date', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={formData.category} onValueChange={(v) => handleChange('category', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="manutencao">Manutenção</SelectItem>
                  <SelectItem value="combustivel">Combustível (Outros)</SelectItem>
                  <SelectItem value="pedagio">Pedágio</SelectItem>
                  <SelectItem value="pecas_pneus">Peças e Pneus</SelectItem>
                  <SelectItem value="diarias_motorista">Diárias/Motorista</SelectItem>
                  <SelectItem value="documentacao">Documentação</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost">Custo Total (R$)</Label>
              <Input id="cost" type="number" step="0.01" value={formData.cost} onChange={(e) => handleChange('cost', e.target.value)} placeholder="350.00" required />
            </div>
          </div>
          <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" value={formData.description} onChange={(e) => handleChange('description', e.target.value)} placeholder="Ex: Troca de óleo e filtros" required />
          </div>
           <div className="space-y-2">
              <Label htmlFor="supplier">Fornecedor / Oficina</Label>
              <Input id="supplier" type="text" value={formData.supplier} onChange={(e) => handleChange('supplier', e.target.value)} placeholder="Mecânica do Zé" />
            </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}><X className="w-4 h-4 mr-2" />Cancelar</Button>
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700"><Save className="w-4 h-4 mr-2" />Salvar Despesa</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}