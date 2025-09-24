
import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Building2, Package, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import StockEntryForm from "../components/warehouse/StockEntryForm";
import StockList from "../components/warehouse/StockList";
import StockFilters from "../components/warehouse/StockFilters";
import StockStats from "../components/warehouse/StockStats";
import { useCompany } from "../components/common/CompanyContext";

export default function Warehouse() {
  const { currentCompany } = useCompany();

  // Dados de exemplo (mock data) para substituir as chamadas de API
  const mockProducts = [
    { id: 1, name: 'Cimento Portland', code: 'PROD000001', category: 'Cimento', cost_price: 25.50 },
    { id: 2, name: 'Areia Fina', code: 'PROD000002', category: 'Agregados', cost_price: 15.00 },
    { id: 3, name: 'Brita 1', code: 'PROD000003', category: 'Agregados', cost_price: 18.00 },
    { id: 4, name: 'Cal Hidratada', code: 'PROD000004', category: 'Cal', cost_price: 12.50 },
    { id: 5, name: 'Argila', code: 'PROD000005', category: 'Agregados', cost_price: 8.00 }
  ];

  const mockStockEntries = [
    { id: 1, reference: 'ENT000001', product_id: 1, quantity_received: 200, quantity_available: 150, unit_cost: 25.50, status: 'ativo', origem_entrada: 'compra', setor: 'almoxarifado', entry_date: '2024-01-15T10:00:00Z', notes: 'Entrada de cimento Portland' },
    { id: 2, reference: 'ENT000002', product_id: 2, quantity_received: 350, quantity_available: 300, unit_cost: 15.00, status: 'ativo', origem_entrada: 'compra', setor: 'almoxarifado', entry_date: '2024-01-14T14:30:00Z', notes: 'Entrada de areia fina' },
    { id: 3, reference: 'ENT000003', product_id: 3, quantity_received: 150, quantity_available: 120, unit_cost: 18.00, status: 'ativo', origem_entrada: 'compra', setor: 'almoxarifado', entry_date: '2024-01-13T09:15:00Z', notes: 'Entrada de brita 1' },
    { id: 4, reference: 'ENT000004', product_id: 4, quantity_received: 60, quantity_available: 45, unit_cost: 12.50, status: 'ativo', origem_entrada: 'compra', setor: 'almoxarifado', entry_date: '2024-01-12T16:45:00Z', notes: 'Entrada de cal hidratada' },
    { id: 5, reference: 'ENT000005', product_id: 5, quantity_received: 250, quantity_available: 200, unit_cost: 8.00, status: 'ativo', origem_entrada: 'compra', setor: 'almoxarifado', entry_date: '2024-01-11T11:20:00Z', notes: 'Entrada de argila' }
  ];

  const [stockEntries, setStockEntries] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    setor: 'all',
    origem_entrada: 'all',
    status: 'ativo',
    categoria: 'all'
  });

  useEffect(() => {
    if (currentCompany) {
      // Carregar dados de exemplo
      setStockEntries(mockStockEntries);
      setProducts(mockProducts);
    } else {
      // Limpar dados se nenhuma filial estiver selecionada
      setStockEntries([]);
      setProducts([]);
    }
  }, [currentCompany]);

  const handleSubmit = async (entryData) => {
    try {
      console.log('Dados recebidos para salvar:', entryData);
      
      if (!entryData.product_id) {
        alert("Erro: Produto não selecionado corretamente.");
        return;
      }

      if (!currentCompany || !currentCompany.id) {
          alert("Erro: Empresa não selecionada. Não foi possível salvar a entrada.");
          return;
      }

      const dataToSave = {
          ...entryData,
          company_id: currentCompany.id,
          company_name: currentCompany.name,
          setor: currentCompany.code.toLowerCase(),
      };
      
      if (editingEntry) {
        // Simular atualização
        const updatedEntries = stockEntries.map(entry => 
          entry.id === editingEntry.id 
            ? { ...entry, ...dataToSave, quantity_available: dataToSave.quantity_received }
            : entry
        );
        setStockEntries(updatedEntries);
        alert('Entrada de estoque atualizada com sucesso!');
      } else {
        // Simular criação
        const newId = Math.max(...stockEntries.map(e => e.id)) + 1;
        const newRef = `ENT${String(Date.now()).slice(-6)}`;
        const newEntry = {
          id: newId,
          ...dataToSave,
          reference: newRef,
          status: 'ativo',
          quantity_available: dataToSave.quantity_received,
          entry_date: new Date().toISOString()
        };
        setStockEntries([...stockEntries, newEntry]);
        alert('Entrada de estoque criada com sucesso!');
      }
      
      setShowForm(false);
      setEditingEntry(null);
    } catch (error) {
      console.error('Erro detalhado ao salvar entrada de estoque:', error);
      alert(`Erro ao salvar entrada de estoque: ${error.message || 'Erro desconhecido'}`);
    }
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setShowForm(true);
  };

  const handleDelete = async (entry) => {
    if (confirm(`Tem certeza que deseja desativar a entrada "${entry.reference}"?\n\nEsta ação irá:\n- Alterar o status para "consumido"\n- Zerar a quantidade disponível\n- Manter o histórico para auditoria\n\nEsta ação NÃO pode ser desfeita!`)) {
      try {
        // Simular desativação
        const updatedEntries = stockEntries.map(e => 
          e.id === entry.id 
            ? { ...e, status: 'consumido', quantity_available: 0 }
            : e
        );
        setStockEntries(updatedEntries);
        alert(`Entrada "${entry.reference}" foi desativada com sucesso.`);
      } catch (error) {
        console.error('Erro ao desativar entrada:', error);
        alert(`Erro ao desativar entrada: ${error.message}`);
      }
    }
  };

  const filteredEntries = useMemo(() => {
    // O filtro por filial já é feito em loadData, então a lista `stockEntries` já está correta.
    return stockEntries.filter(entry => {
      // This check is technically redundant if loadData is filtering correctly,
      // but keeping it here for an extra layer of safety to ensure UI consistency if data somehow slips through.
      if (currentCompany && entry.company_id !== currentCompany.id) {
          return false;
      }

      const product = products.find(p => p.id === entry.product_id);
      
      const searchMatch = searchTerm === '' || 
        entry.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product && product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product && product.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (entry.notes && entry.notes.toLowerCase().includes(searchTerm.toLowerCase())); // Added entry.notes to search criteria
      
      const setorMatch = filters.setor === 'all' || entry.setor === filters.setor;
      const origemMatch = filters.origem_entrada === 'all' || entry.origem_entrada === filters.origem_entrada;
      const statusMatch = filters.status === 'all' || entry.status === filters.status;
      const categoryMatch = filters.categoria === 'all' || (product && product.category === filters.categoria);

      return searchMatch && setorMatch && origemMatch && statusMatch && categoryMatch;
    });
  }, [stockEntries, products, searchTerm, filters]); // Removido currentCompany pois a fonte já é filtrada

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Almoxarifado - Controle de Estoque</h1>
            <p className="text-slate-600">Gerencie aqui as entradas e a posição do seu estoque.</p>
          </div>
          <Button onClick={() => { setEditingEntry(null); setShowForm(true); }} className="bg-blue-600 hover:bg-blue-700 shadow-lg">
            <Plus className="w-5 h-5 mr-2" />
            Registrar Nova Entrada no Estoque
          </Button>
        </div>

        <StockStats stockEntries={stockEntries} products={products} isLoading={isLoading} />
        
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-8 overflow-hidden">
              <StockEntryForm 
                entry={editingEntry}
                products={products}
                onSubmit={handleSubmit} 
                onCancel={() => {
                  setShowForm(false);
                  setEditingEntry(null);
                }} 
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        <Card className="mb-6 bg-white/70 backdrop-blur border-0 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <Search className="w-5 h-5 text-blue-600" />
              Filtros e Busca
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input 
                    placeholder="Buscar por referência, nome, código do produto ou notas..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="pl-10" 
                  />
                </div>
              </div>
              <StockFilters filters={filters} onFilterChange={setFilters} />
            </div>
          </CardContent>
        </Card>
        
        <StockList 
          stockEntries={filteredEntries}
          products={products}
          isLoading={isLoading} 
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
