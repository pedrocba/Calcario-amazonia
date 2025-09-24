
import React, { useState, useEffect, useMemo } from 'react';
import { RequisicaoDeSaida, ItemDaRequisicao, Product } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Download, ClipboardList, CheckCircle, Clock, Undo, Calendar as CalendarIcon, Package } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function RequisitionReport() {
  const [requisicoes, setRequisicoes] = useState([]);
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedSetor, setSelectedSetor] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [reqData, itemsData, productsData] = await Promise.all([
        RequisicaoDeSaida.list('-data_solicitacao'),
        ItemDaRequisicao.list(),
        Product.list(),
      ]);
      setRequisicoes(reqData || []);
      setItems(itemsData || []);
      setProducts(productsData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
    setIsLoading(false);
  };

  const filteredRequisicoes = useMemo(() => {
    return requisicoes.filter(req => {
      const reqDate = new Date(req.data_solicitacao);
      const isWithinDate = reqDate >= (dateRange.from || new Date(0)) && reqDate <= (dateRange.to || new Date());
      const statusMatch = selectedStatus === 'all' || req.status === selectedStatus;
      const setorMatch = selectedSetor === 'all' || req.setor === selectedSetor;
      return isWithinDate && statusMatch && setorMatch;
    });
  }, [requisicoes, dateRange, selectedStatus, selectedSetor]);

  const filteredItems = useMemo(() => {
    const reqIds = new Set(filteredRequisicoes.map(req => req.id));
    return items.filter(item => reqIds.has(item.requisicao_id));
  }, [items, filteredRequisicoes]);

  const reportStats = useMemo(() => {
    const totalReqs = filteredRequisicoes.length;
    const concluidas = filteredRequisicoes.filter(r => r.status === 'concluida').length;
    const pendentes = filteredRequisicoes.filter(r => r.status === 'pendente').length;
    const aguardandoDevolucao = filteredRequisicoes.filter(r => r.status === 'aguardando_devolucao').length;
    
    const totalItens = filteredRequisicoes.reduce((sum, req) => {
      const reqItems = items.filter(item => item.requisicao_id === req.id);
      return sum + reqItems.reduce((itemSum, item) => itemSum + (item.quantidade_atendida || 0), 0);
    }, 0);

    return {
      totalReqs,
      concluidas,
      pendentes,
      aguardandoDevolucao,
      totalItens,
    };
  }, [filteredRequisicoes, items]);

  const topProducts = useMemo(() => {
    const productCounts = filteredItems.reduce((acc, item) => {
      const productId = item.produto_id;
      if (!acc[productId]) {
        const productInfo = products.find(p => p.id === productId);
        acc[productId] = {
          name: productInfo?.name || 'Produto não encontrado',
          code: productInfo?.code || 'N/A',
          count: 0,
          totalQuantity: 0,
        };
      }
      acc[productId].count += 1;
      acc[productId].totalQuantity += (item.quantidade_atendida || item.quantidade_solicitada || 0);
      return acc;
    }, {});

    return Object.values(productCounts)
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 10); // Top 10
  }, [filteredItems, products]);

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Numero;Solicitante;Setor;Status;Data Solicitacao;Total Itens\r\n";
    
    filteredRequisicoes.forEach(req => {
      const reqItems = items.filter(item => item.requisicao_id === req.id);
      const row = [
        req.numero_requisicao,
        req.solicitante_nome,
        req.setor,
        req.status,
        format(new Date(req.data_solicitacao), 'dd/MM/yyyy'),
        reqItems.length
      ].join(";");
      csvContent += row + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_requisicoes_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-green-600" />
            Relatório de Requisições
          </h1>
          <p className="text-slate-600">Análise de saídas, devoluções e performance por setor.</p>
        </div>

        <Card className="mb-6 bg-white/70 backdrop-blur border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Filtros do Relatório</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant={"outline"} className="w-full md:w-[280px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? 
                    dateRange.to ? `${format(dateRange.from, "LLL dd, y")} - ${format(dateRange.to, "LLL dd, y")}`
                    : format(dateRange.from, "LLL dd, y")
                    : "Selecione o período"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Status</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="aguardando_retirada">Aguard. Retirada</SelectItem>
                <SelectItem value="aguardando_devolucao">Aguard. Devolução</SelectItem>
                <SelectItem value="concluida">Concluída</SelectItem>
                <SelectItem value="recusada">Recusada</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedSetor} onValueChange={setSelectedSetor}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Setor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Setores</SelectItem>
                <SelectItem value="santarem">Santarém</SelectItem>
                <SelectItem value="fazenda">Fazenda</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleExportCSV} className="w-full md:w-auto ml-auto">
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
            <CardContent className="p-6">
              <ClipboardList className="w-8 h-8 text-green-500 mb-2" />
              <p className="text-sm text-slate-600">Total</p>
              <p className="text-2xl font-bold">{reportStats.totalReqs}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
            <CardContent className="p-6">
              <CheckCircle className="w-8 h-8 text-blue-500 mb-2" />
              <p className="text-sm text-slate-600">Concluídas</p>
              <p className="text-2xl font-bold">{reportStats.concluidas}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
            <CardContent className="p-6">
              <Clock className="w-8 h-8 text-yellow-500 mb-2" />
              <p className="text-sm text-slate-600">Pendentes</p>
              <p className="text-2xl font-bold">{reportStats.pendentes}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
            <CardContent className="p-6">
              <Undo className="w-8 h-8 text-purple-500 mb-2" />
              <p className="text-sm text-slate-600">Aguard. Devolução</p>
              <p className="text-2xl font-bold">{reportStats.aguardandoDevolucao}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
            <CardContent className="p-6">
              <Package className="w-8 h-8 text-orange-500 mb-2" />
              <p className="text-sm text-slate-600">Total Itens</p>
              <p className="text-2xl font-bold">{reportStats.totalItens}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-white/70 backdrop-blur border-0 shadow-xl lg:col-span-1">
                <CardHeader>
                    <CardTitle>Detalhes das Requisições</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Número</TableHead>
                                <TableHead>Solicitante</TableHead>
                                <TableHead>Setor</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Data</TableHead>
                                <TableHead>Itens</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan="6" className="text-center">Carregando...</TableCell></TableRow>
                            ) : filteredRequisicoes.length === 0 ? (
                                <TableRow><TableCell colSpan="6" className="text-center h-24">Nenhum registro encontrado.</TableCell></TableRow>
                            ) : (
                                filteredRequisicoes.map(req => {
                                    const reqItems = items.filter(item => item.requisicao_id === req.id);
                                    return (
                                    <TableRow key={req.id}>
                                        <TableCell className="font-mono">{req.numero_requisicao}</TableCell>
                                        <TableCell>{req.solicitante_nome}</TableCell>
                                        <TableCell className="capitalize">{req.setor}</TableCell>
                                        <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            req.status === 'concluida' ? 'bg-green-100 text-green-800' :
                                            req.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                                            req.status === 'aguardando_devolucao' ? 'bg-purple-100 text-purple-800' :
                                            req.status === 'recusada' ? 'bg-red-100 text-red-800' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                            {req.status.replace(/_/g, ' ')}
                                        </span>
                                        </TableCell>
                                        <TableCell>{format(new Date(req.data_solicitacao), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                                        <TableCell>{reqItems.length}</TableCell>
                                    </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur border-0 shadow-xl lg:col-span-1">
                <CardHeader>
                    <CardTitle>Top 10 Produtos Mais Requisitados</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Produto</TableHead>
                                <TableHead className="text-center">Nº de Saídas</TableHead>
                                <TableHead className="text-right">Qtd. Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan="3" className="text-center">Carregando...</TableCell></TableRow>
                            ) : topProducts.length === 0 ? (
                                <TableRow><TableCell colSpan="3" className="text-center h-24">Nenhum item requisitado no período.</TableCell></TableRow>
                            ) : (
                                topProducts.map(product => (
                                    <TableRow key={product.code}>
                                        <TableCell>
                                            <p className="font-medium">{product.name}</p>
                                            <p className="text-sm text-slate-500 font-mono">{product.code}</p>
                                        </TableCell>
                                        <TableCell className="text-center font-medium">{product.count}</TableCell>
                                        <TableCell className="text-right font-bold text-blue-600">{product.totalQuantity}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>

      </div>
    </div>
  );
}
