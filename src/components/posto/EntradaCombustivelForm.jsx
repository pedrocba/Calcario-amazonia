import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Save } from "lucide-react";

export default function EntradaCombustivelForm({ onSubmit, onCancel, postos }) {
  const [formData, setFormData] = useState({
    posto_id: '',
    data_entrada: new Date().toISOString().slice(0, 16),
    quantidade_litros: '',
    custo_por_litro: '',
    fornecedor: '',
    nota_fiscal: '',
    motorista_entrega: '',
    responsavel_recebimento: '',
    observacoes: '',
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const custo_total = parseFloat(formData.quantidade_litros) * parseFloat(formData.custo_por_litro);
    const dataToSubmit = {
      ...formData,
      quantidade_litros: parseFloat(formData.quantidade_litros),
      custo_por_litro: parseFloat(formData.custo_por_litro),
      custo_total: isNaN(custo_total) ? 0 : custo_total,
    };
    onSubmit(dataToSubmit);
  };

  return (
    <Card className="my-6">
      <CardHeader>
        <CardTitle>Nova Entrada de Combustível</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="posto_id">Tanque de Destino</Label>
              <Select value={formData.posto_id} onValueChange={(v) => handleSelectChange('posto_id', v)} required>
                <SelectTrigger><SelectValue placeholder="Selecione o tanque" /></SelectTrigger>
                <SelectContent>
                  {postos.map(p => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="data_entrada">Data e Hora da Entrada</Label>
              <Input id="data_entrada" type="datetime-local" value={formData.data_entrada} onChange={handleChange} required />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="quantidade_litros">Quantidade (L)</Label>
              <Input id="quantidade_litros" type="number" step="0.01" value={formData.quantidade_litros} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="custo_por_litro">Custo por Litro (R$)</Label>
              <Input id="custo_por_litro" type="number" step="0.01" value={formData.custo_por_litro} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="nota_fiscal">Nota Fiscal</Label>
              <Input id="nota_fiscal" value={formData.nota_fiscal} onChange={handleChange} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fornecedor">Fornecedor</Label>
              <Input id="fornecedor" value={formData.fornecedor} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="motorista_entrega">Motorista da Entrega</Label>
              <Input id="motorista_entrega" value={formData.motorista_entrega} onChange={handleChange} />
            </div>
          </div>
           <div>
              <Label htmlFor="responsavel_recebimento">Responsável pelo Recebimento</Label>
              <Input id="responsavel_recebimento" value={formData.responsavel_recebimento} onChange={handleChange} required />
            </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" /> Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" /> Salvar Entrada
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}