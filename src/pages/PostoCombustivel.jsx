
import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

import PostoStats from "../components/posto/PostoStats";
import EntradaList from "../components/posto/EntradaList";
import PostoForm from "../components/posto/PostoForm";
import EntradaCombustivelForm from "../components/posto/EntradaCombustivelForm";
import AjusteEstoqueForm from "../components/posto/AjusteEstoqueForm";

export default function PostoCombustivelPage() {
  // Dados de exemplo (mock data) para substituir as chamadas de API
  const mockPostos = [
    { id: 1, nome: 'Tanque Principal', capacidade: 10000, estoque_atual: 7500, tipo_combustivel: 'Diesel', status: 'ativo', localizacao: 'Pátio Principal' },
    { id: 2, nome: 'Tanque Reserva', capacidade: 5000, estoque_atual: 3200, tipo_combustivel: 'Gasolina', status: 'ativo', localizacao: 'Pátio Secundário' },
    { id: 3, nome: 'Tanque de Emergência', capacidade: 2000, estoque_atual: 0, tipo_combustivel: 'Diesel', status: 'inativo', localizacao: 'Depósito' }
  ];

  const mockEntradas = [
    { id: 1, posto_id: 1, quantidade_litros: 2000, preco_por_litro: 4.50, total: 9000.00, data_entrada: '2024-01-15T10:00:00Z', fornecedor: 'Posto Central', status: 'ativo' },
    { id: 2, posto_id: 2, quantidade_litros: 1500, preco_por_litro: 5.20, total: 7800.00, data_entrada: '2024-01-14T14:30:00Z', fornecedor: 'Distribuidora ABC', status: 'ativo' },
    { id: 3, posto_id: 1, quantidade_litros: 1000, preco_por_litro: 4.45, total: 4450.00, data_entrada: '2024-01-13T09:15:00Z', fornecedor: 'Posto Central', status: 'excluido', data_exclusao: '2024-01-13T16:00:00Z', excluido_por: 'Admin' }
  ];

  const mockFuelingRecords = [
    { id: 1, vehicle_id: 1, fuel_type: 'Diesel', liters: 200, price_per_liter: 4.50, total_cost: 900.00, date: '2024-01-15T10:00:00Z', location: 'Posto Central' },
    { id: 2, vehicle_id: 2, fuel_type: 'Gasolina', liters: 150, price_per_liter: 5.20, total_cost: 780.00, date: '2024-01-14T14:30:00Z', location: 'Distribuidora ABC' }
  ];

  const [postos, setPostos] = useState([]);
  const [entradas, setEntradas] = useState([]);
  const [fuelingRecords, setFuelingRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPostoForm, setShowPostoForm] = useState(false);
  const [showEntradaForm, setShowEntradaForm] = useState(false);
  const [editingPosto, setEditingPosto] = useState(null);
  const [showAjusteForm, setShowAjusteForm] = useState(false);
  const [ajustandoPosto, setAjustandoPosto] = useState(null);
  const [currentUser, setCurrentUser] = useState({ id: 1, full_name: 'Administrador', email: 'admin@exemplo.com' });
  const [showDeletedEntries, setShowDeletedEntries] = useState(false);

  useEffect(() => {
    // Carregar dados de exemplo
    setPostos(mockPostos);
    setEntradas(mockEntradas);
    setFuelingRecords(mockFuelingRecords);
  }, []);

  const handlePostoSubmit = async (data) => {
    try {
      if (editingPosto) {
        // Simular atualização
        setPostos(prevPostos => prevPostos.map(p => p.id === editingPosto.id ? { ...p, ...data } : p));
      } else {
        // Simular criação
        const newPosto = {
          id: Math.max(...postos.map(p => p.id)) + 1,
          ...data,
          estoque_atual: 0,
          status: 'ativo'
        };
        setPostos(prevPostos => [newPosto, ...prevPostos]);
      }
      setShowPostoForm(false);
      setEditingPosto(null);
      alert('Posto salvo com sucesso!');
    } catch (error) {
      console.error("Erro ao salvar posto:", error);
      alert('Erro ao salvar posto. Tente novamente.');
    }
  };

  const handleEntradaSubmit = async (data) => {
    try {
      // Simular criação de entrada
      const newEntrada = {
        id: Math.max(...entradas.map(e => e.id)) + 1,
        ...data,
        total: data.quantidade_litros * data.preco_por_litro,
        data_entrada: new Date().toISOString(),
        status: 'ativo'
      };
      setEntradas(prevEntradas => [newEntrada, ...prevEntradas]);
      
      // Atualizar o estoque do posto
      const posto = postos.find(p => p.id === data.posto_id);
      if (posto) {
        const estoqueAnterior = parseFloat(posto.estoque_atual || 0);
        const quantidadeAdicionada = parseFloat(data.quantidade_litros || 0);
        const novoEstoque = estoqueAnterior + quantidadeAdicionada;
        
        setPostos(prevPostos => prevPostos.map(p => 
          p.id === data.posto_id ? { ...p, estoque_atual: novoEstoque } : p
        ));
      }

      setShowEntradaForm(false);
      alert('Entrada registrada com sucesso!');
    } catch (error) {
      console.error("Erro ao salvar entrada:", error);
      alert('Houve um erro ao salvar a entrada. Tente novamente.');
    }
  };

  const handleDeleteEntrada = async (entrada) => {
    if (!confirm(`Tem certeza que deseja marcar como excluída a entrada de ${entrada.quantidade_litros}L do dia ${format(new Date(entrada.data_entrada), "dd/MM/yyyy")}?\n\nATENÇÃO: O estoque do tanque será ajustado, mas a entrada ficará marcada como excluída e pode ser recuperada.`)) {
      return;
    }

    try {
      // Simular atualização da entrada para status excluído
      setEntradas(prevEntradas => prevEntradas.map(e => 
        e.id === entrada.id ? {
          ...e,
          status: 'excluido',
          data_exclusao: new Date().toISOString(),
          excluido_por: currentUser?.full_name || 'Sistema'
        } : e
      ));

      // Ajustar o estoque do tanque
      const posto = postos.find(p => p.id === entrada.posto_id);
      if (posto) {
        const estoqueAnterior = parseFloat(posto.estoque_atual || 0);
        const quantidadeRemovida = parseFloat(entrada.quantidade_litros || 0);
        const novoEstoque = estoqueAnterior - quantidadeRemovida;
        
        setPostos(prevPostos => prevPostos.map(p => 
          p.id === entrada.posto_id ? { ...p, estoque_atual: novoEstoque } : p
        ));
        
        alert("Entrada marcada como excluída com sucesso. Pode ser recuperada se necessário.");
      }
    } catch (error) {
      console.error("Erro ao marcar entrada como excluída:", error);
      alert("Erro ao marcar entrada como excluída.");
    }
  };

  const handleRestoreEntrada = async (entrada) => {
    if (!confirm(`Tem certeza que deseja restaurar a entrada de ${entrada.quantidade_litros}L?\n\nO estoque do tanque será ajustado novamente.`)) {
      return;
    }

    try {
      // Simular restauração da entrada
      setEntradas(prevEntradas => prevEntradas.map(e => 
        e.id === entrada.id ? {
          ...e,
          status: 'ativo',
          data_exclusao: null,
          excluido_por: null
        } : e
      ));

      // Ajustar o estoque do tanque (adicionar novamente)
      const posto = postos.find(p => p.id === entrada.posto_id);
      if (posto) {
        const estoqueAnterior = parseFloat(posto.estoque_atual || 0);
        const quantidadeAdicionada = parseFloat(entrada.quantidade_litros || 0);
        const novoEstoque = estoqueAnterior + quantidadeAdicionada;
        
        setPostos(prevPostos => prevPostos.map(p => 
          p.id === entrada.posto_id ? { ...p, estoque_atual: novoEstoque } : p
        ));
        
        alert("Entrada restaurada com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao restaurar entrada:", error);
      alert("Erro ao restaurar entrada.");
    }
  };
  
  const handleEditPosto = (posto) => {
    setEditingPosto(posto);
    setShowPostoForm(true);
  }

  const handleOpenAjusteForm = (posto) => {
    setAjustandoPosto(posto);
    setShowAjusteForm(true);
  };

  const handleAjusteSubmit = async (ajusteData) => {
    try {
        // Simular atualização do estoque do posto
        setPostos(prevPostos => prevPostos.map(p => 
          p.id === ajusteData.posto_id ? { ...p, estoque_atual: ajusteData.valor_novo } : p
        ));
        
        // Simular log do ajuste
        console.log('Ajuste de estoque:', {
          ...ajusteData,
          posto_nome: ajustandoPosto.nome,
          diferenca: ajusteData.valor_novo - ajusteData.valor_anterior,
          responsavel_ajuste: currentUser?.full_name || 'Sistema'
        });

        setShowAjusteForm(false);
        setAjustandoPosto(null);
        alert('Estoque ajustado com sucesso!');
    } catch (error) {
        console.error("Erro ao ajustar estoque:", error);
        alert('Ocorreu um erro ao tentar ajustar o estoque.');
    }
  };

  // Filtrar entradas baseado no toggle
  const entradasFiltradas = useMemo(() => {
    if (showDeletedEntries) {
      return entradas.filter(e => e.status === 'excluido');
    } else {
      return entradas.filter(e => e.status !== 'excluido');
    }
  }, [entradas, showDeletedEntries]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Postos de Combustível</h1>
            <p className="text-slate-600">Gestão de tanques, entradas e consumo.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowPostoForm(true)} variant="outline">
              <Plus className="w-4 h-4 mr-2" /> Novo Tanque
            </Button>
            <Button onClick={() => setShowEntradaForm(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" /> Nova Entrada
            </Button>
          </div>
        </div>

        <PostoStats 
          postos={postos} 
          fuelingRecords={fuelingRecords}
          isLoading={isLoading} 
          onEditPosto={handleEditPosto}
          onAjustarEstoque={handleOpenAjusteForm}
        />
        
        <AnimatePresence>
          {showPostoForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <PostoForm
                onSubmit={handlePostoSubmit}
                onCancel={() => { setShowPostoForm(false); setEditingPosto(null); }}
                initialData={editingPosto}
              />
            </motion.div>
          )}
          {showEntradaForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <EntradaCombustivelForm
                onSubmit={handleEntradaSubmit}
                onCancel={() => setShowEntradaForm(false)}
                postos={postos}
              />
            </motion.div>
          )}
          {showAjusteForm && ajustandoPosto && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <AjusteEstoqueForm
                posto={ajustandoPosto}
                onSubmit={handleAjusteSubmit}
                onCancel={() => { setShowAjusteForm(false); setAjustandoPosto(null); }}
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        <EntradaList 
          entradas={entradasFiltradas} 
          postos={postos} 
          isLoading={isLoading} 
          onDelete={handleDeleteEntrada}
          onRestore={handleRestoreEntrada}
          showDeletedEntries={showDeletedEntries}
          onToggleDeleted={setShowDeletedEntries}
        />
      </div>
    </div>
  );
}
