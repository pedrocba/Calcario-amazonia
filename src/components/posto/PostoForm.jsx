import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Save } from "lucide-react";

export default function PostoForm({ onSubmit, onCancel, initialData }) {
  const [formData, setFormData] = useState({
    nome: '',
    tipo_combustivel: 'diesel_s10',
    capacidade_total: '',
    estoque_atual: '0',
    estoque_minimo: '500',
    localizacao: '',
    ativo: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        nome: initialData.nome || '',
        tipo_combustivel: initialData.tipo_combustivel || 'diesel_s10',
        capacidade_total: initialData.capacidade_total || '',
        estoque_atual: initialData.estoque_atual || '0',
        estoque_minimo: initialData.estoque_minimo || '500',
        localizacao: initialData.localizacao || '',
        ativo: initialData.ativo !== undefined ? initialData.ativo : true,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSubmit = {
      ...formData,
      capacidade_total: parseInt(formData.capacidade_total, 10),
      estoque_atual: parseInt(formData.estoque_atual, 10),
      estoque_minimo: parseInt(formData.estoque_minimo, 10),
    };
    onSubmit(dataToSubmit);
  };

  return (
    <Card className="my-6">
      <CardHeader>
        <CardTitle>{initialData ? 'Editar Tanque' : 'Novo Tanque de Combustível'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome">Nome do Tanque</Label>
              <Input id="nome" value={formData.nome} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="tipo_combustivel">Tipo de Combustível</Label>
              <Select value={formData.tipo_combustivel} onValueChange={(v) => handleSelectChange('tipo_combustivel', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="diesel_s10">Diesel S10</SelectItem>
                  <SelectItem value="diesel_s500">Diesel S500</SelectItem>
                  <SelectItem value="arla_32">Arla 32</SelectItem>
                  <SelectItem value="gasolina_comum">Gasolina Comum</SelectItem>
                  <SelectItem value="gasolina_aditivada">Gasolina Aditivada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="capacidade_total">Capacidade Total (L)</Label>
              <Input id="capacidade_total" type="number" value={formData.capacidade_total} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="estoque_atual">Estoque Inicial (L)</Label>
              <Input id="estoque_atual" type="number" value={formData.estoque_atual} onChange={handleChange} disabled={!!initialData} />
            </div>
            <div>
              <Label htmlFor="estoque_minimo">Estoque Mínimo (L)</Label>
              <Input id="estoque_minimo" type="number" value={formData.estoque_minimo} onChange={handleChange} />
            </div>
          </div>
          <div>
            <Label htmlFor="localizacao">Localização</Label>
            <Input id="localizacao" value={formData.localizacao} onChange={handleChange} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" /> Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" /> Salvar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}