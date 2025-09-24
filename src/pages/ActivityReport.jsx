import React, { useState, useEffect, useMemo } from 'react';
import { ActivityLog } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Download, Activity, User, Calendar as CalendarIcon, Search } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ActivityReport() {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const activitiesData = await ActivityLog.list('-created_date');
      setActivities(activitiesData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
    setIsLoading(false);
  };

  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      const activityDate = new Date(activity.created_date);
      const isWithinDate = activityDate >= (dateRange.from || new Date(0)) && activityDate <= (dateRange.to || new Date());
      const searchMatch = searchTerm === '' ||
        activity.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (activity.details && activity.details.toLowerCase().includes(searchTerm.toLowerCase()));
      return isWithinDate && searchMatch;
    });
  }, [activities, dateRange, searchTerm]);

  const reportStats = useMemo(() => {
    const totalActivities = filteredActivities.length;
    const uniqueUsers = [...new Set(filteredActivities.map(a => a.user_email))].length;
    const mostActiveUser = filteredActivities.reduce((acc, activity) => {
      acc[activity.user_name] = (acc[activity.user_name] || 0) + 1;
      return acc;
    }, {});
    const topUser = Object.keys(mostActiveUser).reduce((a, b) => mostActiveUser[a] > mostActiveUser[b] ? a : b, '');

    return {
      totalActivities,
      uniqueUsers,
      topUser,
      topUserCount: mostActiveUser[topUser] || 0,
    };
  }, [filteredActivities]);

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Data;Usuario;Acao;Detalhes\r\n";
    
    filteredActivities.forEach(activity => {
      const row = [
        format(new Date(activity.created_date), 'dd/MM/yyyy HH:mm'),
        activity.user_name,
        activity.action,
        activity.details || ''
      ].join(";");
      csvContent += row + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_atividades_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <Activity className="w-8 h-8 text-red-600" />
            Relatório de Atividades
          </h1>
          <p className="text-slate-600">Auditoria das ações realizadas pelos usuários no sistema.</p>
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
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Buscar por usuário ou ação..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={handleExportCSV} className="w-full md:w-auto">
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
            <CardContent className="p-6">
              <Activity className="w-8 h-8 text-red-500 mb-2" />
              <p className="text-sm text-slate-600">Total Atividades</p>
              <p className="text-2xl font-bold">{reportStats.totalActivities}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
            <CardContent className="p-6">
              <User className="w-8 h-8 text-blue-500 mb-2" />
              <p className="text-sm text-slate-600">Usuários Ativos</p>
              <p className="text-2xl font-bold">{reportStats.uniqueUsers}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur border-0 shadow-xl col-span-2">
            <CardContent className="p-6">
              <User className="w-8 h-8 text-green-500 mb-2" />
              <p className="text-sm text-slate-600">Usuário Mais Ativo</p>
              <p className="text-lg font-bold">{reportStats.topUser}</p>
              <p className="text-sm text-slate-500">{reportStats.topUserCount} atividades</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Log de Atividades</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan="4" className="text-center">Carregando...</TableCell></TableRow>
                ) : filteredActivities.length === 0 ? (
                  <TableRow><TableCell colSpan="4" className="text-center h-24">Nenhuma atividade encontrada.</TableCell></TableRow>
                ) : (
                  filteredActivities.map(activity => (
                    <TableRow key={activity.id}>
                      <TableCell className="font-mono text-sm">
                        {format(new Date(activity.created_date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </TableCell>
                      <TableCell>{activity.user_name}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {activity.action}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-xs truncate" title={activity.details}>
                        {activity.details || '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}