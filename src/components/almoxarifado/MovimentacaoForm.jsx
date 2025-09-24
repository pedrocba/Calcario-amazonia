import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRightLeft, X, Save, FileText, User } from "lucide-react";

const tiposMovimentacao = [
  { value: 'entrada', label: '⬇️ Entrada (Recebimento)' },
  { value: 'saida', label: '⬆️ Saída (Retirada)' },
  { value: 'transferencia', label: '🔄 Transferência (Entre Setores)' }
];

export default function MovimentacaoForm({ produtos, movimentacao, onSubmit, onCancel, currentUser }) {
  const [formData, setFormData] = useState({
    produto_id: '',
    tipo_movimentacao: '',
    quantidade: 0,
    origem: '',
    destino: '',
    solicitante: '',
    responsavel: currentUser?.full_name || '',
    observacao: '',
    numero_ticket: ''
  });

  const [produtoSelecionado, setProdutoSelecionado] = useState(null);

  useEffect(() => {
    if (movimentacao) {
      setFormData({
        produto_id: movimentacao.produto_id || '',
        tipo_movimentacao: movimentacao.tipo_movimentacao || '',
        quantidade: movimentacao.quantidade || 0,
        origem: movimentacao.origem || '',
        destino: movimentacao.destino || '',
        solicitante: movimentacao.solicitante || '',
        responsavel: movimentacao.responsavel || currentUser?.full_name || '',
        observacao: movimentacao.observacao || '',
        numero_ticket: movimentacao.numero_ticket || ''
      });
    }
  }, [movimentacao, currentUser]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Gerar número do ticket se não existir
    if (!formData.numero_ticket) {
      const timestamp = Date.now();
      const tipo = formData.tipo_movimentacao.toUpperCase().substring(0, 3);
      formData.numero_ticket = `${tipo}${timestamp.toString().slice(-6)}`;
    }
    
    onSubmit(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProdutoChange = (produtoId) => {
    const produto = produtos.find(p => p.id === produtoId);
    setProdutoSelecionado(produto);
    handleChange('produto_id', produtoId);
    
    // Auto-preencher origem baseado no produto selecionado
    if (produto) {
      handleChange('origem', `${produto.setor} - ${produto.localizacao}`);
    }
  };

  return (
    <Card className="bg-white/90 backdrop-blur border-0 shadow-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <ArrowRightLeft className="w-6 h-6 text-blue-600" />
          {movimentacao ? 'Editar Movimentação' : 'Nova Movimentação de Estoque'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="produto_id">Produto *</Label>
              <Select required value={formData.produto_id} onValueChange={handleProdutoChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  {produtos.map(produto => (
                    <SelectItem key={produto.id} value={produto.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{produto.nome_do_produto}</span>
                        <span className="text-sm text-slate-500">
                          {produto.codigo_interno} • Estoque: {produto.quantidade_estoque} {produto.unidade_medida}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_movimentacao">Tipo de Movimentação *</Label>
              <Select required value={formData.tipo_movimentacao} onValueChange={(value) => handleChange('tipo_movimentacao', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tiposMovimentacao.map(tipo => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {produtoSelecionado && (
            <div className="p-4 bg-slate-50 rounded-lg">
              <h4 className="font-medium text-slate-900 mb-2">📦 Produto Selecionado</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-slate-600">Nome:</span>
                  <p className="font-medium">{produtoSelecionado.nome_do_produto}</p>
                </div>
                <div>
                  <span className="text-slate-600">Código:</span>
                  <p className="font-medium">{produtoSelecionado.codigo_interno}</p>
                </div>
                <div>
                  <span className="text-slate-600">Estoque Atual:</span>
                  <p className="font-medium">{produtoSelecionado.quantidade_estoque} {produtoSelecionado.unidade_medida}</p>
                </div>
                <div>
                  <span className="text-slate-600">Localização:</span>
                  <p className="font-medium">{produtoSelecionado.localizacao}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="quantidade">Quantidade *</Label>
              <Input 
                id="quantidade" 
                type="number" 
                min="1" 
                required
                value={formData.quantidade} 
                onChange={(e) => handleChange('quantidade', parseInt(e.target.value) || 0)} 
                placeholder="Quantas unidades?"
              />
              {produtoSelecionado && formData.tipo_movimentacao === 'saida' && (
                <p className="text-xs text-slate-500">
                  Disponível: {produtoSelecionado.quantidade_estoque} {produtoSelecionado.unidade_medida}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="origem">Origem</Label>
              <Input 
                id="origem" 
                value={formData.origem} 
                onChange={(e) => handleChange('origem', e.target.value)} 
                placeholder="Ex: Santarém - STM-A01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="destino">Destino</Label>
              <Input 
                id="destino" 
                value={formData.destino} 
                onChange={(e) => handleChange('destino', e.target.value)} 
                placeholder="Ex: Fazenda - FZD-B02"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="solicitante">
                <User className="w-4 h-4 inline mr-1" />
                Solicitante *
              </Label>
              <Input 
                id="solicitante" 
                value={formData.solicitante} 
                onChange={(e) => handleChange('solicitante', e.target.value)} 
                placeholder="Nome de quem está solicitando"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsavel">Responsável pela Movimentação</Label>
              <Input 
                id="responsavel" 
                value={formData.responsavel} 
                onChange={(e) => handleChange('responsavel', e.target.value)} 
                placeholder="Nome do responsável"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacao">Observações</Label>
            <Textarea 
              id="observacao" 
              value={formData.observacao} 
              onChange={(e) => handleChange('observacao', e.target.value)} 
              placeholder="Informações adicionais sobre a movimentação..."
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
              {movimentacao ? 'Atualizar' : 'Registrar'} Movimentação
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}