import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, X, Save, MapPin } from "lucide-react";

const categorias = [
  { value: 'equipamentos', label: '🔧 Equipamentos' },
  { value: 'pecas_reposicao', label: '⚙️ Peças de Reposição' },
  { value: 'ferramentas', label: '🔨 Ferramentas' },
  { value: 'epi', label: '🦺 EPI' },
  { value: 'combustiveis', label: '⛽ Combustíveis' },
  { value: 'materia_prima', label: '📦 Matéria Prima' }
];

const setores = [
  { value: 'santarem', label: '🏢 Santarém (Matriz)' },
  { value: 'fazenda', label: '🚜 Fazenda (Filial)' }
];

export default function ProdutoAlmoxarifadoForm({ produto, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    nome_do_produto: '',
    codigo_interno: '',
    categoria: '',
    quantidade_estoque: 0,
    unidade_medida: 'UN',
    localizacao: '',
    setor: 'santarem',
    quantidade_minima: 0,
    custo_unitario: 0,
    ativo: true
  });

  useEffect(() => {
    if (produto) {
      setFormData({
        nome_do_produto: produto.nome_do_produto || '',
        codigo_interno: produto.codigo_interno || '',
        categoria: produto.categoria || '',
        quantidade_estoque: produto.quantidade_estoque || 0,
        unidade_medida: produto.unidade_medida || 'UN',
        localizacao: produto.localizacao || '',
        setor: produto.setor || 'santarem',
        quantidade_minima: produto.quantidade_minima || 0,
        custo_unitario: produto.custo_unitario || 0,
        ativo: produto.ativo !== false
      });
    }
  }, [produto]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="bg-white/90 backdrop-blur border-0 shadow-2xl mb-8">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <Package className="w-6 h-6 text-blue-600" />
          {produto ? 'Editar Produto do Almoxarifado' : 'Novo Produto do Almoxarifado'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-4">📋 Informações Básicas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome_do_produto">Nome do Produto *</Label>
                <Input 
                  id="nome_do_produto" 
                  value={formData.nome_do_produto} 
                  onChange={(e) => handleChange('nome_do_produto', e.target.value)} 
                  placeholder="Ex: Filtro de Ar CAT 320D"
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="codigo_interno">Código Interno *</Label>
                <Input 
                  id="codigo_interno" 
                  value={formData.codigo_interno} 
                  onChange={(e) => handleChange('codigo_interno', e.target.value)} 
                  placeholder="Ex: ALM001"
                  required 
                />
              </div>
            </div>
          </div>

          {/* Classificação */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-900 mb-4">🏷️ Classificação</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria *</Label>
                <Select required value={formData.categoria} onValueChange={(value) => handleChange('categoria', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="setor">Setor *</Label>
                <Select value={formData.setor} onValueChange={(value) => handleChange('setor', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {setores.map(setor => (
                      <SelectItem key={setor.value} value={setor.value}>
                        {setor.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unidade_medida">Unidade de Medida</Label>
                <Input 
                  id="unidade_medida" 
                  value={formData.unidade_medida} 
                  onChange={(e) => handleChange('unidade_medida', e.target.value)} 
                  placeholder="UN, KG, L, M..."
                />
              </div>
            </div>
          </div>

          {/* LOCAL DE ONDE PEGAR - DESTAQUE ESPECIAL */}
          <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-lg">
            <h3 className="font-medium text-yellow-900 mb-2 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              📍 LOCAL DE ONDE PEGAR (Localização Física)
            </h3>
            <p className="text-sm text-yellow-700 mb-4">
              Informe exatamente onde este produto está guardado no almoxarifado para facilitar a localização na hora da retirada.
            </p>
            <div className="space-y-2">
              <Label htmlFor="localizacao" className="text-yellow-900 font-medium">
                Localização no Almoxarifado *
              </Label>
              <Input 
                id="localizacao" 
                value={formData.localizacao} 
                onChange={(e) => handleChange('localizacao', e.target.value)} 
                placeholder="Ex: STM-A01 (Santarém Prateleira A01), FZD-EPI (Fazenda Setor EPI), DEPOSITO-FERRAMENTAS"
                required 
                className="text-lg font-medium border-yellow-300"
              />
              <div className="bg-yellow-100 p-3 rounded text-sm text-yellow-800">
                💡 <strong>Exemplos de localizações:</strong>
                <ul className="mt-2 space-y-1">
                  <li>• <strong>STM-A01</strong> = Santarém, Prateleira A, Posição 01</li>
                  <li>• <strong>FZD-EPI</strong> = Fazenda, Setor de EPIs</li>
                  <li>• <strong>DEPOSITO-FERRAMENTAS</strong> = Depósito de Ferramentas</li>
                  <li>• <strong>ALMOX-CENTRAL-B15</strong> = Almoxarifado Central, Bloco B15</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Controle de Estoque */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-medium text-purple-900 mb-4">📊 Controle de Estoque</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantidade_estoque">Quantidade Atual em Estoque</Label>
                <Input 
                  id="quantidade_estoque" 
                  type="number" 
                  min="0" 
                  value={formData.quantidade_estoque} 
                  onChange={(e) => handleChange('quantidade_estoque', parseInt(e.target.value) || 0)} 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantidade_minima">Quantidade Mínima (Alerta)</Label>
                <Input 
                  id="quantidade_minima" 
                  type="number" 
                  min="0" 
                  value={formData.quantidade_minima} 
                  onChange={(e) => handleChange('quantidade_minima', parseInt(e.target.value) || 0)} 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="custo_unitario">Custo Unitário (R$)</Label>
                <Input 
                  id="custo_unitario" 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  value={formData.custo_unitario} 
                  onChange={(e) => handleChange('custo_unitario', parseFloat(e.target.value) || 0)} 
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel} className="flex items-center gap-2">
              <X className="w-4 h-4" />
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
              <Save className="w-4 h-4" />
              {produto ? 'Atualizar' : 'Cadastrar'} Produto
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}