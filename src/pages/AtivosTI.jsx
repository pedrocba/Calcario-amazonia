import React, { useState, useEffect, useMemo } from "react";
import { AtivoTI } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Filter, HardDrive } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import AtivoForm from "../components/ativos/AtivoForm";
import AtivoList from "../components/ativos/AtivoList";
import AtivoFilters from "../components/ativos/AtivoFilters";

export default function AtivosTIPage() {
  const [ativos, setAtivos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAtivo, setEditingAtivo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    tipo: 'all',
    status: 'all',
  });

  useEffect(() => {
    loadAtivos();
  }, []);

  const loadAtivos = async () => {
    setIsLoading(true);
    try {
      const data = await AtivoTI.list('-created_date');
      setAtivos(data);
    } catch (error) {
      console.error('Erro ao carregar ativos de TI:', error);
    }
    setIsLoading(false);
  };

  const filteredAtivos = useMemo(() => {
    return ativos.filter(ativo => {
      const searchMatch = searchTerm === '' ||
        ativo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ativo.numero_serie && ativo.numero_serie.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (ativo.patrimonio && ativo.patrimonio.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (ativo.usuario_responsavel && ativo.usuario_responsavel.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const tipoMatch = filters.tipo === 'all' || ativo.tipo === filters.tipo;
      const statusMatch = filters.status === 'all' || ativo.status === filters.status;

      return searchMatch && tipoMatch && statusMatch;
    });
  }, [ativos, searchTerm, filters]);

  const handleSubmit = async (ativoData) => {
    try {
      if (editingAtivo) {
        await AtivoTI.update(editingAtivo.id, ativoData);
      } else {
        await AtivoTI.create(ativoData);
      }
      
      setShowForm(false);
      setEditingAtivo(null);
      await loadAtivos();
    } catch (error) {
      console.error('Erro ao salvar ativo:', error);
    }
  };

  const handleEdit = (ativo) => {
    setEditingAtivo(ativo);
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingAtivo(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Ativos de TI</h1>
            <p className="text-slate-600">Gerencie os equipamentos de TI da empresa.</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 shadow-lg">
            <Plus className="w-5 h-5 mr-2" />
            Cadastrar Novo Ativo
          </Button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-8 overflow-hidden">
              <AtivoForm ativo={editingAtivo} onSubmit={handleSubmit} onCancel={cancelForm} />
            </motion.div>
          )}
        </AnimatePresence>

        <Card className="mb-6 bg-white/70 backdrop-blur border-0 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-blue-600" />
              Filtros e Busca
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input placeholder="Buscar por nome, série, patrimônio ou usuário..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                </div>
              </div>
              <AtivoFilters filters={filters} onFilterChange={setFilters} />
            </div>
          </CardContent>
        </Card>

        <AtivoList ativos={filteredAtivos} isLoading={isLoading} onEdit={handleEdit} />
      </div>
    </div>
  );
}