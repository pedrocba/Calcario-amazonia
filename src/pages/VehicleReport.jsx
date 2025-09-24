import React, { useState, useEffect, useMemo } from 'react';
import { Vehicle, FuelingRecord, VehicleExpense, WeighingTrip } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Download, Truck, Fuel, Wrench, Calendar as CalendarIcon, DollarSign, Activity } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function VehicleReport() {
  const [vehicles, setVehicles] = useState([]);
  const [fuelingRecords, setFuelingRecords] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [selectedVehicle, setSelectedVehicle] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [vehiclesData, fuelingData, expensesData, tripsData] = await Promise.all([
        Vehicle.list('-created_date'),
        FuelingRecord.list('-date'),
        VehicleExpense.list('-date'),
        WeighingTrip.list('-created_date'),
      ]);
      setVehicles(vehiclesData || []);
      setFuelingRecords(fuelingData || []);
      setExpenses(expensesData || []);
      setTrips(tripsData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
    setIsLoading(false);
  };

  const filteredData = useMemo(() => {
    const vehicleMatch = (vehicleId) => selectedVehicle === 'all' || vehicleId === selectedVehicle;
    const dateMatch = (date) => {
      const itemDate = new Date(date);
      return itemDate >= (dateRange.from || new Date(0)) && itemDate <= (dateRange.to || new Date());
    };

    return {
      vehicles: vehicles.filter(v => selectedStatus === 'all' || v.status === selectedStatus),
      fueling: fuelingRecords.filter(f => vehicleMatch(f.vehicle_id) && dateMatch(f.date)),
      expenses: expenses.filter(e => vehicleMatch(e.vehicle_id) && dateMatch(e.date)),
      trips: trips.filter(t => vehicleMatch(t.vehicle_id) && dateMatch(t.created_date)),
    };
  }, [vehicles, fuelingRecords, expenses, trips, selectedVehicle, selectedStatus, dateRange]);

  const reportStats = useMemo(() => {
    const totalFuelCost = filteredData.fueling.reduce((sum, f) => sum + (f.total_cost || 0), 0);
    const totalExpenseCost = filteredData.expenses.reduce((sum, e) => sum + (e.cost || 0), 0);
    const totalLiters = filteredData.fueling.reduce((sum, f) => sum + (f.liters || 0), 0);
    const completedTrips = filteredData.trips.filter(t => t.status === 'concluida').length;
    const avgFuelConsumption = totalLiters > 0 && completedTrips > 0 ? totalLiters / completedTrips : 0;

    return {
      totalVehicles: filteredData.vehicles.length,
      totalFuelCost,
      totalExpenseCost,
      totalCost: totalFuelCost + totalExpenseCost,
      completedTrips,
      avgFuelConsumption: Math.round(avgFuelConsumption * 100) / 100,
    };
  }, [filteredData]);

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Veiculo;Placa;Status;Abastecimentos;Custo Combustivel;Despesas;Custo Total;Viagens\r\n";
    
    filteredData.vehicles.forEach(vehicle => {
      const vehicleFueling = filteredData.fueling.filter(f => f.vehicle_id === vehicle.id);
      const vehicleExpenses = filteredData.expenses.filter(e => e.vehicle_id === vehicle.id);
      const vehicleTrips = filteredData.trips.filter(t => t.vehicle_id === vehicle.id);
      
      const fuelCost = vehicleFueling.reduce((sum, f) => sum + (f.total_cost || 0), 0);
      const expenseCost = vehicleExpenses.reduce((sum, e) => sum + (e.cost || 0), 0);
      
      const row = [
        vehicle.model,
        vehicle.plate,
        vehicle.status,
        vehicleFueling.length,
        fuelCost.toFixed(2),
        expenseCost.toFixed(2),
        (fuelCost + expenseCost).toFixed(2),
        vehicleTrips.length
      ].join(";");
      csvContent += row + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_veiculos_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <Truck className="w-8 h-8 text-indigo-600" />
            Relatório de Veículos
          </h1>
          <p className="text-slate-600">Análise de performance da frota e custos operacionais.</p>
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
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Veículo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Veículos</SelectItem>
                {vehicles.map(v => (
                  <SelectItem key={v.id} value={v.id}>{v.plate} - {v.model}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Status</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="parado">Parado</SelectItem>
                <SelectItem value="manutencao">Manutenção</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleExportCSV} className="w-full md:w-auto ml-auto">
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
            <CardContent className="p-6">
              <Truck className="w-8 h-8 text-indigo-500 mb-2" />
              <p className="text-sm text-slate-600">Frota Total</p>
              <p className="text-2xl font-bold">{reportStats.totalVehicles}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
            <CardContent className="p-6">
              <Fuel className="w-8 h-8 text-orange-500 mb-2" />
              <p className="text-sm text-slate-600">Custo Combustível</p>
              <p className="text-xl font-bold">R$ {reportStats.totalFuelCost.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
            <CardContent className="p-6">
              <Wrench className="w-8 h-8 text-purple-500 mb-2" />
              <p className="text-sm text-slate-600">Outras Despesas</p>
              <p className="text-xl font-bold">R$ {reportStats.totalExpenseCost.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
            <CardContent className="p-6">
              <DollarSign className="w-8 h-8 text-green-500 mb-2" />
              <p className="text-sm text-slate-600">Custo Total</p>
              <p className="text-xl font-bold">R$ {reportStats.totalCost.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
            <CardContent className="p-6">
              <Activity className="w-8 h-8 text-blue-500 mb-2" />
              <p className="text-sm text-slate-600">Viagens</p>
              <p className="text-2xl font-bold">{reportStats.completedTrips}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
            <CardContent className="p-6">
              <Fuel className="w-8 h-8 text-red-500 mb-2" />
              <p className="text-sm text-slate-600">Consumo Médio</p>
              <p className="text-xl font-bold">{reportStats.avgFuelConsumption} L/viagem</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Performance por Veículo</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Veículo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Abastecimentos</TableHead>
                  <TableHead>Custo Combustível</TableHead>
                  <TableHead>Outras Despesas</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan="6" className="text-center">Carregando...</TableCell></TableRow>
                ) : filteredData.vehicles.length === 0 ? (
                  <TableRow><TableCell colSpan="6" className="text-center h-24">Nenhum veículo encontrado.</TableCell></TableRow>
                ) : (
                  filteredData.vehicles.map(vehicle => {
                    const vehicleFueling = filteredData.fueling.filter(f => f.vehicle_id === vehicle.id);
                    const vehicleExpenses = filteredData.expenses.filter(e => e.vehicle_id === vehicle.id);
                    
                    const fuelCost = vehicleFueling.reduce((sum, f) => sum + (f.total_cost || 0), 0);
                    const expenseCost = vehicleExpenses.reduce((sum, e) => sum + (e.cost || 0), 0);
                    const totalCost = fuelCost + expenseCost;
                    
                    return (
                      <TableRow key={vehicle.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{vehicle.plate}</p>
                            <p className="text-sm text-slate-500">{vehicle.model}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            vehicle.status === 'ativo' ? 'bg-green-100 text-green-800' :
                            vehicle.status === 'parado' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {vehicle.status}
                          </span>
                        </TableCell>
                        <TableCell>{vehicleFueling.length}</TableCell>
                        <TableCell>R$ {fuelCost.toFixed(2)}</TableCell>
                        <TableCell>R$ {expenseCost.toFixed(2)}</TableCell>
                        <TableCell className="font-medium">R$ {totalCost.toFixed(2)}</TableCell>
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