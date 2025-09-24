import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HardDrive, X, Save } from "lucide-react";

const tipos = ["Computador", "Notebook", "Impressora", "Nobreak", "Monitor", "Roteador", "Outro"];
const statusOptions = ["Em estoque", "Em uso", "Manutenção", "Baixado"];

export default function AtivoForm({ ativo, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    nome: '',
    tipo: '',
    numero_serie: '',
    patrimonio: '',
    marca: '',
    modelo: '',
    status: 'Em estoque',
    localizacao: '',
    usuario_responsavel: '',
    data_aquisicao: '',
    fornecedor: '',
    nota_fiscal: '',
    observacoes: ''
  });

  useEffect(() => {
    if (ativo) {
      setFormData({
        nome: ativo.nome || '',
        tipo: ativo.tipo || '',
        numero_serie: ativo.numero_serie || '',
        patrimonio: ativo.patrimonio || '',
        marca: ativo.marca || '',
        modelo: ativo.modelo || '',
        status: ativo.status || 'Em estoque',
        localizacao: ativo.localizacao || '',
        usuario_responsavel: ativo.usuario_responsavel || '',
        data_aquisicao: ativo.data_aquisicao ? new Date(ativo.data_aquisicao).toISOString().split('T')[0] : '',
        fornecedor: ativo.fornecedor || '',
        nota_fiscal: ativo.nota_fiscal || '',
        observacoes: ativo.observacoes || ''
      });
    }
  }, [ativo]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="bg-white/90 backdrop-blur border-0 shadow-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <HardDrive className="w-6 h-6 text-blue-600" />
          {ativo ? 'Editar Ativo de TI' : 'Novo Ativo de TI'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome / Descrição *</Label>
              <Input id="nome" value={formData.nome} onChange={(e) => handleChange('nome', e.target.value)} placeholder="Ex: Notebook Dell Vostro 3510" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo *</Label>
              <Select required value={formData.tipo} onValueChange={(value) => handleChange('tipo', value)}>
                <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                <SelectContent>{tipos.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="marca">Marca</Label>
              <Input id="marca" value={formData.marca} onChange={(e) => handleChange('marca', e.target.value)} placeholder="Ex: Dell" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="modelo">Modelo</Label>
              <Input id="modelo" value={formData.modelo} onChange={(e) => handleChange('modelo', e.target.value)} placeholder="Ex: Vostro 3510" />
            </div>
             <div className="space-y-2">
              <Label htmlFor="numero_serie">Número de Série</Label>
              <Input id="numero_serie" value={formData.numero_serie} onChange={(e) => handleChange('numero_serie', e.target.value)} placeholder="S/N do equipamento" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="space-y-2">
              <Label htmlFor="patrimonio">Patrimônio</Label>
              <Input id="patrimonio" value={formData.patrimonio} onChange={(e) => handleChange('patrimonio', e.target.value)} placeholder="Etiqueta de patrimônio" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select required value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{statusOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="localizacao">Localização</Label>
              <Input id="localizacao" value={formData.localizacao} onChange={(e) => handleChange('localizacao', e.target.value)} placeholder="Ex: Escritório Fazenda" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="usuario_responsavel">Usuário Responsável</Label>
            <Input id="usuario_responsavel" value={formData.usuario_responsavel} onChange={(e) => handleChange('usuario_responsavel', e.target.value)} placeholder="Nome do funcionário" />
          </div>

          <div className="border-t pt-6 space-y-6">
            <h3 className="text-lg font-medium">Informações de Aquisição</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="data_aquisicao">Data de Aquisição</Label>
                    <Input id="data_aquisicao" type="date" value={formData.data_aquisicao} onChange={(e) => handleChange('data_aquisicao', e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="fornecedor">Fornecedor</Label>
                    <Input id="fornecedor" value={formData.fornecedor} onChange={(e) => handleChange('fornecedor', e.target.value)} placeholder="Nome da loja" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="nota_fiscal">Nota Fiscal</Label>
                    <Input id="nota_fiscal" value={formData.nota_fiscal} onChange={(e) => handleChange('nota_fiscal', e.target.value)} placeholder="Número da NF-e" />
                </div>
            </div>
          </div>

           <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea id="observacoes" value={formData.observacoes} onChange={(e) => handleChange('observacoes', e.target.value)} placeholder="Detalhes adicionais, histórico de manutenção, etc." rows={3} />
            </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel} className="flex items-center gap-2"><X className="w-4 h-4" />Cancelar</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"><Save className="w-4 h-4" />{ativo ? 'Atualizar' : 'Salvar'} Ativo</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}