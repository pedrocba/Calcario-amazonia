import React, { useState, useEffect, useMemo } from "react";
import { WeightReading } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Scale, Filter, Calendar, RefreshCcw, Download, Activity } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";

export default function WeightHistory() {
  const [readings, setReadings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    scale_id: 'all',
    status: 'all'
  });
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadReadings();
    
    // Auto-refresh a cada 10 segundos se ativado
    let interval;
    if (autoRefresh) {
      interval = setInterval(loadReadings, 10000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const loadReadings = async () => {
    try {
      const data = await WeightReading.list('-data_hora', 500); // Últimas 500 leituras
      setReadings(data);
    } catch (error) {
      console.error('Erro ao carregar histórico de pesagens:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReadings = useMemo(() => {
    return readings.filter(reading => {
      // Filtro por data
      const readingDate = new Date(reading.data_hora);
      const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
      const toDate = filters.dateTo ? new Date(filters.dateTo + 'T23:59:59') : null;
      
      const dateMatch = (!fromDate || readingDate >= fromDate) && 
                       (!toDate || readingDate <= toDate);
      
      // Filtro por scale_id
      const scaleMatch = filters.scale_id === 'all' || reading.scale_id === filters.scale_id;
      
      // Filtro por status
      const statusMatch = filters.status === 'all' || reading.status === filters.status;
      
      return dateMatch && scaleMatch && statusMatch;
    });
  }, [readings, filters]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      scale_id: 'all',
      status: 'all'
    });
  };

  const exportData = () => {
    const csvContent = [
      'Data/Hora,Peso (kg),Balança,Status',
      ...filteredReadings.map(reading => 
        `"${format(new Date(reading.data_hora), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}",${reading.peso},"${reading.scale_id}","${reading.status}"`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historico_pesagens_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800 border-green-200';
      case 'processado': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'erro': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'ativo': return 'Ativo';
      case 'processado': return 'Processado';
      case 'erro': return 'Erro';
      default: return status;
    }
  };

  const formatWeight = (peso) => {
    return (peso / 1000).toFixed(3);
  };

  // Obter lista única de scale_ids para o filtro
  const uniqueScaleIds = [...new Set(readings.map(r => r.scale_id))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
              <Scale className="w-8 h-8 text-blue-600" />
              Histórico de Pesagens
            </h1>
            <p className="text-slate-600">Monitoramento das leituras da balança em tempo real</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant={autoRefresh ? "default" : "outline"}
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="flex items-center gap-2"
            >
              <Activity className={`w-4 h-4 ${autoRefresh ? 'animate-pulse' : ''}`} />
              {autoRefresh ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}
            </Button>
            <Button variant="outline" onClick={loadReadings} className="flex items-center gap-2">
              <RefreshCcw className="w-4 h-4" />
              Atualizar
            </Button>
            <Button variant="outline" onClick={exportData} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total de Leituras</p>
                  <p className="text-xl md:text-2xl font-bold text-slate-900">{filteredReadings.length}</p>
                </div>
                <Scale className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Peso Máximo</p>
                  <p className="text-xl md:text-2xl font-bold text-slate-900">
                    {filteredReadings.length > 0 ? formatWeight(Math.max(...filteredReadings.map(r => r.peso))) : '0.000'} t
                  </p>
                </div>
                <Activity className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Peso Médio</p>
                  <p className="text-xl md:text-2xl font-bold text-slate-900">
                    {filteredReadings.length > 0 ? 
                      formatWeight(filteredReadings.reduce((sum, r) => sum + r.peso, 0) / filteredReadings.length) : '0.000'} t
                  </p>
                </div>
                <Activity className="w-6 h-6 md:w-8 md:h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Última Leitura</p>
                  <p className="text-sm md:text-base font-bold text-slate-900">
                    {filteredReadings.length > 0 ? 
                      format(new Date(filteredReadings[0].data_hora), 'HH:mm:ss', { locale: ptBR }) : 'N/A'}
                  </p>
                </div>
                <Calendar className="w-6 h-6 md:w-8 md:h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-6 bg-white/70 backdrop-blur border-0 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-blue-600" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Data Inicial</label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Data Final</label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Balança</label>
                <Select value={filters.scale_id} onValueChange={(value) => handleFilterChange('scale_id', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Balanças</SelectItem>
                    {uniqueScaleIds.map(scaleId => (
                      <SelectItem key={scaleId} value={scaleId}>{scaleId}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Status</label>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="processado">Processado</SelectItem>
                    <SelectItem value="erro">Erro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button variant="outline" onClick={clearFilters} className="w-full">
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Histórico */}
        <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-3">
                <Scale className="w-5 h-5 text-blue-600" />
                Histórico de Leituras ({filteredReadings.length})
              </span>
              {autoRefresh && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  Atualizando automaticamente
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-100">
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Peso (kg)</TableHead>
                    <TableHead>Peso (t)</TableHead>
                    <TableHead>Balança</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array(10).fill(0).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                      </TableRow>
                    ))
                  ) : (
                    filteredReadings.map((reading, index) => (
                      <motion.tr
                        key={reading.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.02 }}
                        className="hover:bg-slate-50"
                      >
                        <TableCell className="font-mono text-sm">
                          {format(new Date(reading.data_hora), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                        </TableCell>
                        <TableCell className="font-mono font-medium text-lg">
                          {reading.peso.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="font-mono font-bold text-lg text-blue-700">
                          {formatWeight(reading.peso)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {reading.scale_id}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(reading.status)}>
                            {getStatusLabel(reading.status)}
                          </Badge>
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                </TableBody>
              </Table>
              
              {!isLoading && filteredReadings.length === 0 && (
                <div className="text-center py-12">
                  <Scale className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhuma leitura encontrada</h3>
                  <p className="text-slate-500">Ajuste os filtros ou aguarde novas leituras da balança.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}