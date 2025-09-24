
import React, { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Save, X, Calendar, AlertTriangle, Wrench, Truck, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function RequisicaoForm({ products, vehicles, stockEntries, currentUser, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    solicitante_nome: currentUser?.full_name || '',
    solicitante_setor: currentUser?.setor || 'santarem',
    local_uso: '',
    observacao: '',
    itens: []
  });

  const [novoItem, setNovoItem] = useState({
    produto_id: '',
    quantidade: '',
    eh_fracionado: false,
    observacao: '',
    data_devolucao_prevista: '',
    veiculo_id: '',
    hodometro_horimetro: '',
    tipo_servico: ''
  });

  const [searchProduct, setSearchProduct] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  const locaisUsoOptions = [
    { value: 'moinho', label: 'Moinho' },
    { value: 'britador', label: 'Britador' },
    { value: 'rebritador', label: 'Rebritador' },
    { value: 'oficina', label: 'Oficina' },
    { value: 'administracao', label: 'Administração' },
    { value: 'campo', label: 'Campo' },
    { value: 'transporte', label: 'Transporte' },
    { value: 'lavra', label: 'Lavra' },
    { value: 'beneficiamento', label: 'Beneficiamento' },
    { value: 'outros', label: 'Outros' }
  ];

  const availableStock = useMemo(() => {
    if (!novoItem.produto_id) return 0;
    
    const totalStock = (stockEntries || [])
        .filter(entry => entry.product_id === novoItem.produto_id && entry.status === 'ativo')
        .reduce((sum, entry) => sum + (entry.quantity_available || 0), 0);

    return totalStock;
  }, [novoItem.produto_id, stockEntries]);

  const filteredProducts = useMemo(() => {
    if (!searchProduct) return products;
    const searchTerm = searchProduct.toLowerCase();
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.code.toLowerCase().includes(searchTerm) ||
      (product.category && product.category.toLowerCase().includes(searchTerm))
    );
  }, [products, searchProduct]);

  const handleProductSelect = (product) => {
    setNovoItem(prev => ({
      ...prev,
      produto_id: product.id,
      data_devolucao_prevista: '',
      veiculo_id: '',
      hodometro_horimetro: '',
      tipo_servico: '',
      eh_fracionado: false
    }));
    setSearchProduct(`${product.code} - ${product.name}`);
    setShowProductDropdown(false);
  };

  const handleSearchChange = (value) => {
    setSearchProduct(value);
    setShowProductDropdown(true);
    
    if (!value) {
      setNovoItem(prev => ({ ...prev, produto_id: '' }));
    }
  };

  const handleAddItem = () => {
    if (!novoItem.produto_id || !novoItem.quantidade) {
      alert('Selecione um produto da lista e informe a quantidade');
      return;
    }

    const requestedQty = parseFloat(novoItem.quantidade);
    if (requestedQty <= 0) {
      alert('A quantidade deve ser maior que zero.');
      return;
    }

    if (requestedQty > availableStock) {
      alert(`Quantidade solicitada (${requestedQty}) indisponível.\nEstoque atual: ${availableStock}`);
      return;
    }

    const produto = products.find(p => p.id === novoItem.produto_id);
    if (!produto) return;

    const itemExistente = formData.itens.find(i => i.produto_id === novoItem.produto_id);
    if (itemExistente) {
      alert('Este produto já está na lista');
      return;
    }

    const ehFerramenta = produto.category === 'ferramentas';
    if (ehFerramenta && !novoItem.data_devolucao_prevista) {
      alert('Para ferramentas, é obrigatório informar a data de devolução prevista');
      return;
    }

    const ehLubrificante = produto.category === 'lubrificantes';
    if (ehLubrificante && (!novoItem.veiculo_id || !novoItem.hodometro_horimetro || !novoItem.tipo_servico)) {
      alert('Para lubrificantes, é obrigatório informar o Veículo, Hodômetro/Horímetro e o Tipo de Serviço.');
      return;
    }

    const item = {
      produto_id: novoItem.produto_id,
      produto_nome: produto.name,
      produto_codigo: produto.code,
      produto_categoria: produto.category,
      quantidade: parseFloat(novoItem.quantidade),
      eh_fracionado: novoItem.eh_fracionado,
      unidade_medida: produto.unit_of_measure || 'UN',
      observacao: novoItem.observacao,
      eh_ferramenta: ehFerramenta,
      data_devolucao_prevista: ehFerramenta ? novoItem.data_devolucao_prevista : null,
      veiculo_id: ehLubrificante ? novoItem.veiculo_id : null,
      hodometro_horimetro: ehLubrificante ? parseFloat(novoItem.hodometro_horimetro) : null,
      tipo_servico: ehLubrificante ? novoItem.tipo_servico : null,
      eh_lubrificante: ehLubrificante
    };

    setFormData(prev => ({
      ...prev,
      itens: [...prev.itens, item]
    }));

    setNovoItem({
      produto_id: '',
      quantidade: '',
      eh_fracionado: false,
      observacao: '',
      data_devolucao_prevista: '',
      veiculo_id: '',
      hodometro_horimetro: '',
      tipo_servico: ''
    });
    setSearchProduct('');
  };

  const handleRemoveItem = (index) => {
    setFormData(prev => ({
      ...prev,
      itens: prev.itens.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.solicitante_nome.trim()) {
      alert('Nome do solicitante é obrigatório');
      return;
    }
    
    if (!formData.local_uso.trim()) {
      alert('Local de uso é obrigatório');
      return;
    }
    
    if (formData.itens.length === 0) {
      alert('Adicione pelo menos um item à requisição');
      return;
    }

    try {
      onSubmit(formData);
    } catch (error) {
      console.error('Erro ao enviar requisição:', error);
      alert('Erro ao criar requisição. Tente novamente.');
    }
  };

  const getSelectedProduct = () => {
    return products.find(p => p.id === novoItem.produto_id);
  };

  const selectedProduct = getSelectedProduct();
  const isSelectedProductTool = selectedProduct?.category === 'ferramentas';
  const isSelectedProductLubricant = selectedProduct?.category === 'lubrificantes';

  useEffect(() => {
    const handleClickOutside = (event) => {
      const productSearchContainer = document.getElementById('product_search_container');
      if (productSearchContainer && !productSearchContainer.contains(event.target)) {
        setShowProductDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <Card className="bg-white/70 backdrop-blur border-0 shadow-xl mb-8">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <Plus className="w-5 h-5 text-blue-600" />
          Nova Requisição de Material
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
            <div>
              <Label className="text-sm font-medium text-slate-700">Nome do Solicitante *</Label>
              <Input 
                value={formData.solicitante_nome}
                onChange={(e) => setFormData(prev => ({...prev, solicitante_nome: e.target.value}))}
                placeholder="Digite o nome de quem está solicitando"
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700">Setor</Label>
              <Select 
                value={formData.solicitante_setor} 
                onValueChange={(value) => setFormData(prev => ({...prev, solicitante_setor: value}))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="santarem">Santarém (Matriz)</SelectItem>
                  <SelectItem value="fazenda">Fazenda (Filial)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700">Local de Uso *</Label>
              <Select
                value={formData.local_uso}
                onValueChange={(value) => setFormData(prev => ({...prev, local_uso: value}))}
                required
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione o local de uso" />
                </SelectTrigger>
                <SelectContent>
                  {locaisUsoOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 mt-1">Onde o material será utilizado</p>
            </div>
          </div>

          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-medium text-slate-900">Adicionar Item</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1 relative" id="product_search_container">
                <Label>Produto *</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar produto..."
                    value={searchProduct}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {showProductDropdown && filteredProducts.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredProducts.slice(0, 10).map((product) => (
                      <div
                        key={product.id}
                        className="px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                        onClick={() => handleProductSelect(product)}
                      >
                        <div className="font-medium text-slate-900">{product.name}</div>
                        <div className="text-sm text-slate-500">{product.code} - {product.category}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label>Quantidade *</Label>
                <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      step={isSelectedProductLubricant ? "0.1" : "1"}
                      placeholder="0"
                      value={novoItem.quantidade}
                      onChange={(e) => setNovoItem(prev => ({...prev, quantidade: e.target.value}))}
                      className="flex-grow"
                    />
                    {novoItem.produto_id && (
                        <Badge variant="secondary" className="whitespace-nowrap px-3 py-2 text-sm">
                            Disp: {availableStock}
                        </Badge>
                    )}
                </div>
                {isSelectedProductLubricant && (
                  <p className="text-xs text-slate-500 mt-1">Aceita decimais (ex: 5.5L)</p>
                )}
              </div>

              <div>
                <Label>Observação</Label>
                <Input 
                  placeholder="Observações do item"
                  value={novoItem.observacao}
                  onChange={(e) => setNovoItem(prev => ({...prev, observacao: e.target.value}))}
                />
              </div>
            </div>

            {isSelectedProductLubricant && (
              <div className="flex items-center space-x-2 p-3 bg-orange-50 rounded-lg">
                <Checkbox 
                  id="eh_fracionado"
                  checked={novoItem.eh_fracionado}
                  onCheckedChange={(checked) => setNovoItem(prev => ({...prev, eh_fracionado: checked}))}
                />
                <Label htmlFor="eh_fracionado" className="text-sm font-medium text-orange-800">
                  ☑️ Saída Fracionada (parte de um recipiente maior)
                </Label>
              </div>
            )}

            {isSelectedProductTool && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Ferramenta - Devolução Obrigatória</span>
                </div>
                <div>
                  <Label>Data de Devolução Prevista *</Label>
                  <Input
                    type="date"
                    value={novoItem.data_devolucao_prevista}
                    onChange={(e) => setNovoItem(prev => ({...prev, data_devolucao_prevista: e.target.value}))}
                    min={format(new Date(), 'yyyy-MM-dd')}
                  />
                </div>
              </div>
            )}

            {isSelectedProductLubricant && (
              <div className="p-3 bg-green-50 rounded-lg space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Wrench className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Lubrificante - Informações de Manutenção</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label>Veículo *</Label>
                    <Select value={novoItem.veiculo_id} onValueChange={(value) => setNovoItem(prev => ({...prev, veiculo_id: value}))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o veículo" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles.map(vehicle => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.plate} - {vehicle.model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Hodômetro/Horímetro *</Label>
                    <Input
                      type="number"
                      placeholder="Ex: 85000"
                      value={novoItem.hodometro_horimetro}
                      onChange={(e) => setNovoItem(prev => ({...prev, hodometro_horimetro: e.target.value}))}
                    />
                  </div>
                  <div>
                    <Label>Tipo de Serviço *</Label>
                    <Input
                      placeholder="Ex: Troca de Óleo, Lubrificação"
                      value={novoItem.tipo_servico}
                      onChange={(e) => setNovoItem(prev => ({...prev, tipo_servico: e.target.value}))}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button type="button" onClick={handleAddItem} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Item
              </Button>
            </div>
          </div>

          {formData.itens.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-slate-900">Itens da Requisição ({formData.itens.length})</h3>
              {formData.itens.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.produto_nome}</span>
                      {item.eh_fracionado && (
                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">Fracionado</span>
                      )}
                      {item.eh_ferramenta && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Ferramenta</span>
                      )}
                      {item.eh_lubrificante && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Lubrificante</span>
                      )}
                    </div>
                    <div className="text-sm text-slate-600">
                      {item.quantidade} {item.unidade_medida}
                      {item.data_devolucao_prevista && (
                        <span> • Devolução: {format(new Date(item.data_devolucao_prevista), 'dd/MM/yyyy', { locale: ptBR })}</span>
                      )}
                      {item.veiculo_id && (
                        <span> • Veículo: {vehicles.find(v => v.id === item.veiculo_id)?.plate}</span>
                      )}
                    </div>
                    {item.observacao && (
                      <div className="text-sm text-slate-500 italic">Obs: {item.observacao}</div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div>
            <Label>Observações Gerais</Label>
            <Textarea
              placeholder="Observações sobre a requisição..."
              value={formData.observacao}
              onChange={(e) => setFormData(prev => ({...prev, observacao: e.target.value}))}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              Criar Requisição
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
