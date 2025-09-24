
import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, Hand, AlertTriangle, CheckCircle, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import EpiDeliveryForm from "../components/epi/EpiDeliveryForm";

export default function EstoqueEPIs() {
  // Dados de exemplo (mock data) para substituir as chamadas de API
  const mockEpis = [
    { id: 1, nome: 'Capacete de Segurança', ca: 'CA12345', validade_ca: '2025-12-31T00:00:00Z', estoque_disponivel: 15, estoque_minimo: 5, categoria: 'Proteção Cabeça', tamanho: 'M' },
    { id: 2, nome: 'Óculos de Proteção', ca: 'CA12346', validade_ca: '2025-06-30T00:00:00Z', estoque_disponivel: 2, estoque_minimo: 10, categoria: 'Proteção Ocular', tamanho: 'Único' },
    { id: 3, nome: 'Luvas de Segurança', ca: 'CA12347', validade_ca: '2024-03-15T00:00:00Z', estoque_disponivel: 25, estoque_minimo: 15, categoria: 'Proteção Mãos', tamanho: 'M' },
    { id: 4, nome: 'Botas de Segurança', ca: 'CA12348', validade_ca: '2025-09-30T00:00:00Z', estoque_disponivel: 8, estoque_minimo: 5, categoria: 'Proteção Pés', tamanho: '42' },
    { id: 5, nome: 'Protetor Auditivo', ca: 'CA12349', validade_ca: '2024-12-31T00:00:00Z', estoque_disponivel: 0, estoque_minimo: 8, categoria: 'Proteção Auditiva', tamanho: 'Único' }
  ];

  const mockFuncionarios = [
    { id: 1, nome: 'João Silva', setor: 'Manutenção', cargo: 'Técnico' },
    { id: 2, nome: 'Maria Santos', setor: 'Operação', cargo: 'Operadora' },
    { id: 3, nome: 'Pedro Costa', setor: 'Manutenção', cargo: 'Supervisor' }
  ];

  const [epis, setEpis] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [currentUser, setCurrentUser] = useState({ id: 1, full_name: 'Administrador', email: 'admin@exemplo.com' });
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  const [filters, setFilters] = useState({
    categoria: 'all',
    status: 'all' // all, low_stock, ca_expired
  });

  useEffect(() => {
    // Carregar dados de exemplo
    setEpis(mockEpis);
    setFuncionarios(mockFuncionarios);
  }, []);

  const handleDeliverySubmit = async (deliveryData) => {
    try {
      // Simular criação do registro de entrega
      console.log('Entrega de EPI registrada:', deliveryData);

      // Simular atualização do estoque do EPI
      setEpis(prevEpis => 
        prevEpis.map(epi => {
          if (epi.id === deliveryData.epi_id) {
            const newStock = epi.estoque_disponivel - deliveryData.quantidade;
            return { ...epi, estoque_disponivel: Math.max(0, newStock) };
          }
          return epi;
        })
      );

      setShowForm(false);
      alert('Entrega de EPI registrada com sucesso!');
    } catch (error) {
      console.error("Erro ao salvar entrega:", error);
      alert('Erro ao registrar entrega. Tente novamente.');
    }
  };

  const filteredEpis = useMemo(() => {
    return epis.filter(epi => {
      const categoryMatch = filters.categoria === 'all' || epi.categoria === filters.categoria;
      
      let statusMatch = true;
      if (filters.status === 'low_stock') {
        statusMatch = epi.estoque_disponivel <= epi.estoque_minimo;
      } else if (filters.status === 'ca_expired') {
        statusMatch = new Date(epi.validade_ca) < new Date();
      }

      return categoryMatch && statusMatch;
    });
  }, [epis, filters]);

  const getStatus = (epi) => {
    if (new Date(epi.validade_ca) < new Date()) {
      return { text: 'CA Vencido', color: 'bg-red-100 text-red-800 border-red-200', icon: AlertTriangle };
    }
    if (epi.estoque_disponivel === 0) {
      return { text: 'Zerado', color: 'bg-red-100 text-red-800 border-red-200', icon: AlertTriangle };
    }
    if (epi.estoque_disponivel <= epi.estoque_minimo) {
      return { text: 'Estoque Baixo', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: AlertTriangle };
    }
    return { text: 'OK', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle };
  };

  const epiCategories = [...new Set(epis.map(e => e.categoria))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Gestão de Estoque de EPIs</h1>
            <p className="text-slate-600">Controle, entregue e monitore os equipamentos de proteção.</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 shadow-lg">
            <Hand className="w-5 h-5 mr-2" />
            Registrar Entrega
          </Button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-8 overflow-hidden">
              <EpiDeliveryForm
                epis={epis}
                funcionarios={funcionarios}
                currentUser={currentUser}
                onSubmit={handleDeliverySubmit}
                onCancel={() => setShowForm(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <Card className="mb-6 bg-white/70 backdrop-blur border-0 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3"><Filter className="w-5 h-5 text-blue-600" /> Filtros</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-4">
            <Select value={filters.categoria} onValueChange={(v) => setFilters({...filters, categoria: v})}>
              <SelectTrigger className="w-full md:w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                {epiCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filters.status} onValueChange={(v) => setFilters({...filters, status: v})}>
              <SelectTrigger className="w-full md:w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="low_stock">Estoque Baixo</SelectItem>
                <SelectItem value="ca_expired">CA Vencido</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Estoque Atual ({filteredEpis.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>EPI</TableHead>
                    <TableHead>CA</TableHead>
                    <TableHead>Validade CA</TableHead>
                    <TableHead>Estoque</TableHead>
                    <TableHead>Mínimo</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array(5).fill(0).map((_, i) => (
                      <TableRow key={i}><TableCell colSpan="6"><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                    ))
                  ) : filteredEpis.map((epi) => {
                    const status = getStatus(epi);
                    return (
                      <TableRow key={epi.id} className="hover:bg-slate-50">
                        <TableCell>
                          <p className="font-medium text-slate-900">{epi.nome}</p>
                          <p className="text-sm text-slate-500">{epi.categoria} - {epi.tamanho}</p>
                        </TableCell>
                        <TableCell className="font-mono">{epi.ca}</TableCell>
                        <TableCell>{format(new Date(epi.validade_ca), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                        <TableCell className="font-bold text-lg">{epi.estoque_disponivel}</TableCell>
                        <TableCell>{epi.estoque_minimo}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${status.color} flex items-center gap-1.5`}>
                            <status.icon className="w-3.5 h-3.5" />
                            {status.text}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            {!isLoading && filteredEpis.length === 0 && (
              <div className="text-center py-12">
                <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhum EPI encontrado</h3>
                <p className="text-slate-500">Tente ajustar seus filtros ou cadastre um novo EPI.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
