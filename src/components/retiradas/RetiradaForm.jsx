
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Save, X, User, Package } from "lucide-react";

export default function RetiradaForm({ products, stockEntries, currentUser, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    solicitante_id: '',
    solicitante_nome: '',
    setor: 'santarem',
    tipo_de_retirada: 'peca_consumo',
    finalidade: '',
    data_prevista_devolucao: '',
    assinatura_solicitante: 'aceito_digitalmente',
    observacao_retirada: '',
    itens: []
  });

  const [novoItem, setNovoItem] = useState({
    produto_id: '',
    stock_entry_id: '',
    quantidade: '',
    observacao: ''
  });

  const [showUserSelect, setShowUserSelect] = useState(false); // This state is not directly used in the provided outline but is part of the original code, so it's kept.

  const getAvailableStock = (productId) => {
    return stockEntries.filter(entry =>
      entry.product_id === productId &&
      entry.quantity_available > 0 &&
      entry.setor === formData.setor
    );
  };

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? `${product.code} - ${product.name}` : 'Produto não encontrado';
  };

  const getStockInfo = (stockEntryId) => {
    const entry = stockEntries.find(s => s.id === stockEntryId);
    return entry ? `Disponível: ${entry.quantity_available} | Local: ${entry.warehouse_location || 'N/A'}` : '';
  };

  // New function from the outline
  const getStockLocationDisplay = (entry) => {
    const location = entry.warehouse_location || 'Local não definido';
    const available = entry.quantity_available;
    const condition = entry.condicao || 'novo';
    return `${location} • Disponível: ${available} UN • Condição: ${condition}`;
  };

  const handleAddItem = () => {
    if (!novoItem.produto_id || !novoItem.stock_entry_id || !novoItem.quantidade) {
      alert('Preencha todos os campos obrigatórios do item');
      return;
    }

    const stockEntry = stockEntries.find(s => s.id === novoItem.stock_entry_id);
    const product = products.find(p => p.id === novoItem.produto_id);

    if (!stockEntry || !product) return;

    if (parseFloat(novoItem.quantidade) > stockEntry.quantity_available) {
      alert('Quantidade solicitada maior que disponível em estoque');
      return;
    }

    const item = {
      produto_id: novoItem.produto_id,
      produto_nome: product.name,
      produto_codigo: product.code,
      stock_entry_id: novoItem.stock_entry_id,
      quantidade: parseFloat(novoItem.quantidade),
      unidade_medida: product.unit_of_measure || 'UN',
      observacao: novoItem.observacao,
      disponivel: stockEntry.quantity_available,
      localizacao: stockEntry.warehouse_location
    };

    setFormData(prev => ({
      ...prev,
      itens: [...prev.itens, item]
    }));

    setNovoItem({
      produto_id: '',
      stock_entry_id: '',
      quantidade: '',
      observacao: ''
    });
  };

  const handleRemoveItem = (index) => {
    setFormData(prev => ({
      ...prev,
      itens: prev.itens.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.solicitante_nome) {
      alert('Digite o nome do solicitante');
      return;
    }

    if (formData.itens.length === 0) {
      alert('Adicione pelo menos um item à retirada');
      return;
    }

    if (formData.tipo_de_retirada === 'ferramenta_devolucao' && !formData.data_prevista_devolucao) {
      alert('Data prevista de devolução é obrigatória para ferramentas');
      return;
    }

    onSubmit(formData);
  };

  const handleSolicitanteAtual = () => {
    setFormData(prev => ({
      ...prev,
      solicitante_id: currentUser.id,
      solicitante_nome: currentUser.full_name,
      setor: currentUser.setor || 'santarem'
    }));
    setShowUserSelect(false);
  };

  return (
    <Card className="bg-white/70 backdrop-blur border-0 shadow-xl mb-8">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <Package className="w-5 h-5 text-blue-600" />
          Nova Retirada de Item
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados do Solicitante */}
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-medium text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4" />
              Dados do Solicitante
            </h3>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleSolicitanteAtual}
                className="flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Eu mesmo
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowUserSelect(!showUserSelect)}
                className="flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Outro funcionário
              </Button>
            </div>

            {/* Campos sempre visíveis para edição */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nome do Solicitante *</Label>
                <Input
                  placeholder="Digite o nome completo"
                  value={formData.solicitante_nome}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    solicitante_nome: e.target.value,
                    solicitante_id: e.target.value ? 'manual_' + Date.now() : ''
                  }))}
                />
              </div>
              <div>
                <Label>Setor *</Label>
                <Select value={formData.setor} onValueChange={(value) => setFormData(prev => ({...prev, setor: value}))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="santarem">Santarém</SelectItem>
                    <SelectItem value="fazenda">Fazenda</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.solicitante_nome && (
              <div className="p-3 bg-green-50 rounded border border-green-200">
                <p><strong>Solicitante:</strong> {formData.solicitante_nome}</p>
                <p><strong>Setor:</strong> {formData.setor}</p>
              </div>
            )}
          </div>

          {/* Tipo de Retirada */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Tipo de Retirada</Label>
            <RadioGroup
              value={formData.tipo_de_retirada}
              onValueChange={(value) => setFormData(prev => ({...prev, tipo_de_retirada: value}))}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="peca_consumo" id="consumo" />
                <Label htmlFor="consumo">Peça de Consumo (baixa do estoque)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ferramenta_devolucao" id="ferramenta" />
                <Label htmlFor="ferramenta">Ferramenta com Devolução (empréstimo)</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Finalidade e Data de Devolução */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Finalidade *</Label>
              <Input
                placeholder="Ex: soldagem na obra X, manutenção do equipamento Y"
                value={formData.finalidade}
                onChange={(e) => setFormData(prev => ({...prev, finalidade: e.target.value}))}
              />
            </div>
            {formData.tipo_de_retirada === 'ferramenta_devolucao' && (
              <div>
                <Label>Data Prevista de Devolução *</Label>
                <Input
                  type="date"
                  value={formData.data_prevista_devolucao}
                  onChange={(e) => setFormData(prev => ({...prev, data_prevista_devolucao: e.target.value}))}
                />
              </div>
            )}
          </div>

          {/* Adicionar Item - MELHORADO */}
          <div className="border rounded-lg p-4 space-y-4 bg-blue-50 border-blue-200">
            <h3 className="font-medium text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" />
              Adicionar Produto para Retirada
            </h3>

            <div className="bg-white p-4 rounded-lg border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label className="font-medium text-slate-700">1. Escolha o Produto</Label>
                  <Select value={novoItem.produto_id} onValueChange={(value) => {
                    setNovoItem(prev => ({...prev, produto_id: value, stock_entry_id: ''}));
                  }}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Selecione o produto que será retirado" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map(product => (
                        <SelectItem key={product.id} value={product.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{product.name}</span>
                            <span className="text-sm text-slate-500">Código: {product.code}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="font-medium text-slate-700">2. Local de Onde Pegar</Label>
                  <Select
                    value={novoItem.stock_entry_id}
                    onValueChange={(value) => setNovoItem(prev => ({...prev, stock_entry_id: value}))}
                    disabled={!novoItem.produto_id}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder={!novoItem.produto_id ? "Primeiro escolha o produto" : "Onde está guardado?"} />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableStock(novoItem.produto_id).map(entry => (
                        <SelectItem key={entry.id} value={entry.id}>
                          <div className="flex flex-col py-1">
                            <span className="font-medium text-slate-900">
                              📍 {entry.warehouse_location || 'Local não definido'}
                            </span>
                            <span className="text-sm text-green-600">
                              ✅ Disponível: {entry.quantity_available} unidades
                            </span>
                            <span className="text-xs text-slate-500">
                              Condição: {entry.condicao || 'Não informado'} • Ref: {entry.reference || 'Não informado'}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!novoItem.produto_id && (
                    <p className="text-xs text-slate-500 mt-1">
                      💡 O "local" mostra onde o produto está fisicamente guardado no almoxarifado
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium text-slate-700">3. Quantidade a Retirar</Label>
                  <Input
                    type="number"
                    placeholder="Quantas unidades?"
                    value={novoItem.quantidade}
                    onChange={(e) => setNovoItem(prev => ({...prev, quantidade: e.target.value}))}
                    className="h-12"
                  />
                  {novoItem.stock_entry_id && (
                    <p className="text-xs text-slate-500 mt-1">
                      Máximo disponível: {getAvailableStock(novoItem.produto_id).find(e => e.id === novoItem.stock_entry_id)?.quantity_available || 0} unidades
                    </p>
                  )}
                </div>

                <div className="flex items-end">
                  <Button
                    type="button"
                    onClick={handleAddItem}
                    className="w-full h-12 bg-green-600 hover:bg-green-700"
                    disabled={!novoItem.produto_id || !novoItem.stock_entry_id || !novoItem.quantidade}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar à Lista
                  </Button>
                </div>
              </div>

              <div className="mt-4">
                <Label className="font-medium text-slate-700">Observação do Item (opcional)</Label>
                <Input
                  placeholder="Ex: Item com pequeno arranhão, ferramenta nova, etc..."
                  value={novoItem.observacao}
                  onChange={(e) => setNovoItem(prev => ({...prev, observacao: e.target.value}))}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Informações sobre locais de estoque */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <h4 className="font-medium text-yellow-800 mb-2">💡 Sobre os Locais de Estoque:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• <strong>STM-A01:</strong> Santarém, Prateleira A, Posição 01</li>
                <li>• <strong>FZD-EPI:</strong> Fazenda, Setor de EPIs</li>
                <li>• <strong>DEPOSITO-FERRAMENTAS:</strong> Depósito de Ferramentas</li>
                <li>• Isso ajuda a encontrar rapidamente onde o produto está guardado</li>
              </ul>
            </div>
          </div>

          {/* Lista de Itens */}
          {formData.itens.length > 0 && (
            <div>
              <h3 className="font-medium text-slate-900 mb-4">Itens para Retirada</h3>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>Código</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Disponível</TableHead>
                      <TableHead>Observação</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.itens.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono text-sm">{item.produto_codigo}</TableCell>
                        <TableCell className="font-medium">{item.produto_nome}</TableCell>
                        <TableCell className="text-sm">{item.localizacao || 'N/A'}</TableCell>
                        <TableCell>{item.quantidade} {item.unidade_medida}</TableCell>
                        <TableCell className="text-green-600">{item.disponivel}</TableCell>
                        <TableCell className="text-sm">{item.observacao || '-'}</TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Observações e Assinatura */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Observações Gerais</Label>
              <Textarea
                placeholder="Observações sobre a retirada..."
                value={formData.observacao_retirada}
                onChange={(e) => setFormData(prev => ({...prev, observacao_retirada: e.target.value}))}
                className="h-24"
              />
            </div>

            <div className="space-y-3">
              <Label>Confirmação do Solicitante</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="assinatura"
                  checked={formData.assinatura_solicitante === 'aceito_digitalmente'}
                  onCheckedChange={(checked) =>
                    setFormData(prev => ({...prev, assinatura_solicitante: checked ? 'aceito_digitalmente' : ''}))
                  }
                />
                <Label htmlFor="assinatura" className="text-sm">
                  Confirmo que estou retirando os itens listados e me responsabilizo por eles
                </Label>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              Registrar Retirada
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
