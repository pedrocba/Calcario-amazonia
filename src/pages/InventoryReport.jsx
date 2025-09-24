
import React, { useState, useEffect, useMemo } from 'react';
import { StockEntry, Product } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Package, MapPin, DollarSign, AlertTriangle } from 'lucide-react';

export default function InventoryReport() {
  const [stockEntries, setStockEntries] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSetor, setSelectedSetor] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('ativo');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [stockData, productsData] = await Promise.all([
        StockEntry.list('-created_date'),
        Product.list(),
      ]);
      setStockEntries(stockData || []);
      setProducts(productsData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
    setIsLoading(false);
  };

  const filteredEntries = useMemo(() => {
    return stockEntries.filter(entry => {
      const product = products.find(p => p.id === entry.product_id);
      const setorMatch = selectedSetor === 'all' || entry.setor === selectedSetor;
      const categoryMatch = selectedCategory === 'all' || (product && product.category === selectedCategory);
      const statusMatch = selectedStatus === 'all' || entry.status === selectedStatus;
      return setorMatch && categoryMatch && statusMatch;
    });
  }, [stockEntries, products, selectedSetor, selectedCategory, selectedStatus]);

  const reportStats = useMemo(() => {
    const totalValue = filteredEntries.reduce((sum, entry) => sum + ((entry.unit_cost || 0) * (entry.quantity_available || 0)), 0);
    const totalItems = filteredEntries.reduce((sum, entry) => sum + (entry.quantity_available || 0), 0);
    const lowStockItems = filteredEntries.filter(entry => {
      const product = products.find(p => p.id === entry.product_id);
      return product && product.min_qty > 0 && entry.quantity_available <= product.min_qty;
    }).length;
    
    return {
      totalEntries: filteredEntries.length,
      totalValue,
      totalItems,
      lowStockItems,
    };
  }, [filteredEntries, products]);

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Produto;Codigo;Categoria;Setor;Localizacao;Disponivel;Custo Unitario;Valor Total;Status\r\n";
    
    filteredEntries.forEach(entry => {
      const product = products.find(p => p.id === entry.product_id);
      const totalValue = (entry.unit_cost || 0) * (entry.quantity_available || 0);
      const row = [
        product?.name || 'N/A',
        product?.code || 'N/A',
        product?.category || 'N/A',
        entry.setor,
        entry.warehouse_location || 'N/A',
        entry.quantity_available,
        (entry.unit_cost || 0).toFixed(2),
        totalValue.toFixed(2),
        entry.status
      ].join(";");
      csvContent += row + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_estoque_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-600" />
            Relatório de Estoque
          </h1>
          <p className="text-slate-600">Análise detalhada da posição de estoque e valores.</p>
        </div>

        <Card className="mb-6 bg-white/70 backdrop-blur border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Filtros do Relatório</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-4">
            <Select value={selectedSetor} onValueChange={setSelectedSetor}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Setor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Setores</SelectItem>
                <SelectItem value="santarem">Santarém</SelectItem>
                <SelectItem value="fazenda">Fazenda</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Categorias</SelectItem>
                <SelectItem value="equipamentos">Equipamentos</SelectItem>
                <SelectItem value="pecas_reposicao">Peças</SelectItem>
                <SelectItem value="ferramentas">Ferramentas</SelectItem>
                <SelectItem value="epi">EPI</SelectItem>
                <SelectItem value="combustiveis">Combustíveis</SelectItem>
                <SelectItem value="lubrificantes">Lubrificantes</SelectItem>
                <SelectItem value="materia_prima">Matéria Prima</SelectItem>
                <SelectItem value="utilidades">Utilidades</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Status</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="transferido">Transferido</SelectItem>
                <SelectItem value="consumido">Consumido</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleExportCSV} className="w-full md:w-auto ml-auto">
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
            <CardContent className="p-6">
              <Package className="w-8 h-8 text-blue-500 mb-2" />
              <p className="text-sm text-slate-600">Total de Itens</p>
              <p className="text-2xl font-bold">{reportStats.totalItems.toLocaleString('pt-BR')}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
            <CardContent className="p-6">
              <DollarSign className="w-8 h-8 text-green-500 mb-2" />
              <p className="text-sm text-slate-600">Valor Total</p>
              <p className="text-2xl font-bold">R$ {reportStats.totalValue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
            <CardContent className="p-6">
              <MapPin className="w-8 h-8 text-purple-500 mb-2" />
              <p className="text-sm text-slate-600">Entradas Ativas</p>
              <p className="text-2xl font-bold">{reportStats.totalEntries}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
            <CardContent className="p-6">
              <AlertTriangle className="w-8 h-8 text-red-500 mb-2" />
              <p className="text-sm text-slate-600">Estoque Baixo</p>
              <p className="text-2xl font-bold">{reportStats.lowStockItems}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Detalhes do Estoque</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Setor</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Disponível</TableHead>
                  <TableHead>Valor Unit.</TableHead>
                  <TableHead>Valor Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan="6" className="text-center">Carregando...</TableCell></TableRow>
                ) : filteredEntries.length === 0 ? (
                  <TableRow><TableCell colSpan="6" className="text-center h-24">Nenhum registro encontrado.</TableCell></TableRow>
                ) : (
                  filteredEntries.map(entry => {
                    const product = products.find(p => p.id === entry.product_id);
                    const totalValue = (entry.unit_cost || 0) * (entry.quantity_available || 0);
                    return (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{product?.name || 'Produto não encontrado'}</p>
                            <p className="text-sm text-slate-500">{product?.code}</p>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{entry.setor}</TableCell>
                        <TableCell>{entry.warehouse_location || 'N/D'}</TableCell>
                        <TableCell className="font-bold">{entry.quantity_available}</TableCell>
                        <TableCell>R$ {(entry.unit_cost || 0).toFixed(2)}</TableCell>
                        <TableCell className="font-medium text-green-600">R$ {totalValue.toFixed(2)}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
