
import React, { useState, useEffect, useMemo } from 'react';
import { Transfer, Product } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Download, ArrowRightLeft, Send, CheckCircle, Calendar as CalendarIcon, Clock, Package } from 'lucide-react';
import { format, startOfMonth, endOfMonth, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function TransferReport() {
  const [transfers, setTransfers] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedOrigin, setSelectedOrigin] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [transfersData, productsData] = await Promise.all([
        Transfer.list('-sent_date'),
        Product.list(),
      ]);
      setTransfers(transfersData || []);
      setProducts(productsData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
    setIsLoading(false);
  };

  const filteredTransfers = useMemo(() => {
    return transfers.filter(transfer => {
      const transferDate = new Date(transfer.sent_date);
      const isWithinDate = transferDate >= (dateRange.from || new Date(0)) && transferDate <= (dateRange.to || new Date());
      const statusMatch = selectedStatus === 'all' || transfer.status === selectedStatus;
      const originMatch = selectedOrigin === 'all' || transfer.setor_origem === selectedOrigin;
      return isWithinDate && statusMatch && originMatch;
    });
  }, [transfers, dateRange, selectedStatus, selectedOrigin]);

  const reportStats = useMemo(() => {
    const totalTransfers = filteredTransfers.length;
    const completedTransfers = filteredTransfers.filter(t => t.status === 'recebido').length;
    const pendingTransfers = filteredTransfers.filter(t => t.status === 'enviado').length;
    const totalQuantity = filteredTransfers.reduce((sum, t) => sum + (t.quantity_sent || 0), 0);
    
    const avgDeliveryTime = filteredTransfers
      .filter(t => t.status === 'recebido' && t.sent_date && t.received_date)
      .reduce((sum, t, _, arr) => {
        const days = differenceInDays(new Date(t.received_date), new Date(t.sent_date));
        return sum + days / arr.length;
      }, 0);

    return {
      totalTransfers,
      completedTransfers,
      pendingTransfers,
      totalQuantity,
      avgDeliveryTime: Math.round(avgDeliveryTime) || 0,
    };
  }, [filteredTransfers]);

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Referencia;Produto;Origem;Destino;Quantidade;Status;Data Envio;Data Recebimento;Tempo(dias)\r\n";
    
    filteredTransfers.forEach(transfer => {
      const product = products.find(p => p.id === transfer.product_id);
      const deliveryTime = transfer.status === 'recebido' && transfer.sent_date && transfer.received_date 
        ? differenceInDays(new Date(transfer.received_date), new Date(transfer.sent_date))
        : '';
      
      const row = [
        transfer.transfer_reference,
        product?.name || 'N/A',
        transfer.setor_origem,
        transfer.setor_destino,
        transfer.quantity_sent,
        transfer.status,
        format(new Date(transfer.sent_date), 'dd/MM/yyyy'),
        transfer.received_date ? format(new Date(transfer.received_date), 'dd/MM/yyyy') : '',
        deliveryTime
      ].join(";");
      csvContent += row + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_transferencias_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <ArrowRightLeft className="w-8 h-8 text-purple-600" />
            Relatório de Transferências
          </h1>
          <p className="text-slate-600">Análise de movimentações entre Santarém e Fazenda.</p>
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
                <SelectItem value="enviado">Enviado</SelectItem>
                <SelectItem value="recebido">Recebido</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedOrigin} onValueChange={setSelectedOrigin}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Origem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Origens</SelectItem>
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
              <ArrowRightLeft className="w-8 h-8 text-purple-500 mb-2" />
              <p className="text-sm text-slate-600">Total</p>
              <p className="text-2xl font-bold">{reportStats.totalTransfers}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
            <CardContent className="p-6">
              <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
              <p className="text-sm text-slate-600">Concluídas</p>
              <p className="text-2xl font-bold">{reportStats.completedTransfers}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
            <CardContent className="p-6">
              <Send className="w-8 h-8 text-blue-500 mb-2" />
              <p className="text-sm text-slate-600">Pendentes</p>
              <p className="text-2xl font-bold">{reportStats.pendingTransfers}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
            <CardContent className="p-6">
              <Package className="w-8 h-8 text-orange-500 mb-2" />
              <p className="text-sm text-slate-600">Itens Movidos</p>
              <p className="text-2xl font-bold">{reportStats.totalQuantity.toLocaleString('pt-BR')}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
            <CardContent className="p-6">
              <Clock className="w-8 h-8 text-indigo-500 mb-2" />
              <p className="text-sm text-slate-600">Tempo Médio</p>
              <p className="text-2xl font-bold">{reportStats.avgDeliveryTime} dias</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Detalhes das Transferências</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Referência</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Rota</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tempo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan="6" className="text-center">Carregando...</TableCell></TableRow>
                ) : filteredTransfers.length === 0 ? (
                  <TableRow><TableCell colSpan="6" className="text-center h-24">Nenhum registro encontrado.</TableCell></TableRow>
                ) : (
                  filteredTransfers.map(transfer => {
                    const product = products.find(p => p.id === transfer.product_id);
                    const deliveryTime = transfer.status === 'recebido' && transfer.sent_date && transfer.received_date 
                      ? differenceInDays(new Date(transfer.received_date), new Date(transfer.sent_date))
                      : null;
                    
                    return (
                      <TableRow key={transfer.id}>
                        <TableCell className="font-mono">{transfer.transfer_reference}</TableCell>
                        <TableCell>{product?.name || 'Produto não encontrado'}</TableCell>
                        <TableCell className="capitalize">{transfer.setor_origem} → {transfer.setor_destino}</TableCell>
                        <TableCell>{transfer.quantity_sent}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            transfer.status === 'recebido' ? 'bg-green-100 text-green-800' :
                            transfer.status === 'enviado' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {transfer.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {deliveryTime !== null ? `${deliveryTime} dias` : transfer.status === 'enviado' ? 'Pendente' : '-'}
                        </TableCell>
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
