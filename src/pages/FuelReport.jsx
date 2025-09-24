
import React, { useState, useEffect, useMemo, useContext } from 'react';
import { FuelingRecord, Vehicle } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Download, Fuel, Truck, Calendar as CalendarIcon, DollarSign, Droplets } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCompany } from '../components/common/CompanyContext';

export default function FuelReport() {
  const { currentCompany } = useCompany();
  const [records, setRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [selectedVehicle, setSelectedVehicle] = useState('all');

  useEffect(() => {
    if (currentCompany) {
      loadData();
    }
  }, [currentCompany]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const companyFilter = { company_id: currentCompany.id };
      const [fuelingData, vehiclesData] = await Promise.all([
        FuelingRecord.filter(companyFilter, '-date'),
        Vehicle.filter(companyFilter),
      ]);
      setRecords(fuelingData);
      setVehicles(vehiclesData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
    setIsLoading(false);
  };

  const filteredRecords = useMemo(() => {
    return records.filter(rec => {
      const recordDate = new Date(rec.date);
      const isWithinDate = recordDate >= (dateRange.from || new Date(0)) && recordDate <= (dateRange.to || new Date());
      const isVehicleMatch = selectedVehicle === 'all' || rec.vehicle_id === selectedVehicle;
      return isWithinDate && isVehicleMatch;
    });
  }, [records, dateRange, selectedVehicle]);

  const reportStats = useMemo(() => {
    const totalCost = filteredRecords.reduce((sum, rec) => sum + (rec.total_cost || 0), 0);
    const totalLiters = filteredRecords.reduce((sum, rec) => sum + (rec.liters || 0), 0);
    const avgCostPerLiter = totalLiters > 0 ? totalCost / totalLiters : 0;
    return {
      totalRecords: filteredRecords.length,
      totalCost,
      totalLiters,
      avgCostPerLiter,
    };
  }, [filteredRecords]);

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Data;Veiculo;Placa;Combustivel;Litros;Custo Total;Custo por Litro;Hodometro;Fornecedor\r\n";
    
    filteredRecords.forEach(rec => {
        const vehicle = vehicles.find(v => v.id === rec.vehicle_id);
        const row = [
            format(new Date(rec.date), "dd/MM/yyyy HH:mm"),
            vehicle?.model || 'N/A',
            vehicle?.plate || 'N/A',
            rec.fuel_type,
            rec.liters.toFixed(2),
            rec.total_cost.toFixed(2),
            (rec.total_cost / rec.liters).toFixed(2),
            rec.odometer_at_fueling,
            rec.supplier
        ].join(";");
        csvContent += row + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_combustivel_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
              <Fuel className="w-8 h-8 text-orange-600" />
              Relatório de Combustível
            </h1>
            <p className="text-slate-600">Análise detalhada de abastecimentos e custos.</p>
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
              <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                <SelectTrigger className="w-full md:w-[280px]">
                  <SelectValue placeholder="Selecione um veículo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Veículos</SelectItem>
                  {vehicles.map(v => (
                    <SelectItem key={v.id} value={v.id}>{v.plate} - {v.model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleExportCSV} className="w-full md:w-auto ml-auto">
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white/70 backdrop-blur border-0 shadow-xl"><CardContent className="p-6"><Truck className="w-8 h-8 text-blue-500 mb-2" /><p className="text-sm text-slate-600">Abastecimentos</p><p className="text-2xl font-bold">{reportStats.totalRecords}</p></CardContent></Card>
              <Card className="bg-white/70 backdrop-blur border-0 shadow-xl"><CardContent className="p-6"><DollarSign className="w-8 h-8 text-green-500 mb-2" /><p className="text-sm text-slate-600">Custo Total</p><p className="text-2xl font-bold">R$ {reportStats.totalCost.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p></CardContent></Card>
              <Card className="bg-white/70 backdrop-blur border-0 shadow-xl"><CardContent className="p-6"><Fuel className="w-8 h-8 text-orange-500 mb-2" /><p className="text-sm text-slate-600">Total de Litros</p><p className="text-2xl font-bold">{reportStats.totalLiters.toLocaleString('pt-BR')} L</p></CardContent></Card>
              <Card className="bg-white/70 backdrop-blur border-0 shadow-xl"><CardContent className="p-6"><Droplets className="w-8 h-8 text-purple-500 mb-2" /><p className="text-sm text-slate-600">Custo Médio / Litro</p><p className="text-2xl font-bold">R$ {reportStats.avgCostPerLiter.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p></CardContent></Card>
          </div>

          <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Detalhes dos Abastecimentos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Veículo</TableHead>
                    <TableHead>Litros</TableHead>
                    <TableHead>Custo Total</TableHead>
                    <TableHead>Hodômetro</TableHead>
                    <TableHead>Fornecedor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan="6" className="text-center">Carregando...</TableCell></TableRow>
                  ) : filteredRecords.length === 0 ? (
                    <TableRow><TableCell colSpan="6" className="text-center h-24">Nenhum registro encontrado para os filtros selecionados.</TableCell></TableRow>
                  ) : (
                    filteredRecords.map(rec => {
                      const vehicle = vehicles.find(v => v.id === rec.vehicle_id);
                      return (
                          <TableRow key={rec.id}>
                              <TableCell>{format(new Date(rec.date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</TableCell>
                              <TableCell>{vehicle ? `${vehicle.plate} - ${vehicle.model}` : 'Veículo não encontrado'}</TableCell>
                              <TableCell>{rec.liters.toFixed(2)} L</TableCell>
                              <TableCell className="font-medium text-green-600">R$ {rec.total_cost.toFixed(2)}</TableCell>
                              <TableCell>{rec.odometer_at_fueling.toLocaleString('pt-BR')} km</TableCell>
                              <TableCell>{rec.supplier}</TableCell>
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
    </>
  );
}
