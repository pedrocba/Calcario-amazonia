
import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import StockEntryForm from "../components/warehouse/StockEntryForm";
import StockList from "../components/warehouse/StockList";
import StockFilters from "../components/warehouse/StockFilters";
import StockStats from "../components/warehouse/StockStats";
import StockFlowDashboard from "../components/warehouse/StockFlowDashboard";
import { useCompany } from "../components/common/CompanyContext";
import useInventoryFlow from "../hooks/useInventoryFlow";

const CALCARIO_PRODUCTS = [
  {
    id: 101,
    name: "Calcário In Natura",
    code: "CALC-RAW-001",
    category: "Matéria-Prima",
    unit_of_measure: "TON",
    cost_price: 110,
  },
  {
    id: 201,
    name: "Calcário Britado 0-32",
    code: "CALC-PRO-201",
    category: "Produto Acabado",
    unit_of_measure: "TON",
    cost_price: 185,
  },
  {
    id: 202,
    name: "Calcário Micronizado",
    code: "CALC-PRO-202",
    category: "Produto Acabado",
    unit_of_measure: "TON",
    cost_price: 260,
  },
  {
    id: 301,
    name: "Resíduo Calcário Fino",
    code: "CALC-BY-301",
    category: "Subproduto",
    unit_of_measure: "TON",
    cost_price: 0,
  },
];

const CALCARIO_STOCK_ENTRIES = [
  {
    id: 1,
    reference: "ENT000601",
    product_id: 101,
    quantity_received: 500,
    quantity_available: 360,
    unit_cost: 110,
    status: "ativo",
    origem_entrada: "compra",
    setor: "almoxarifado",
    entry_date: "2024-01-06T10:00:00Z",
    notes: "1ª descarga da balsa BL-2401",
  },
  {
    id: 2,
    reference: "ENT000602",
    product_id: 101,
    quantity_received: 420,
    quantity_available: 390,
    unit_cost: 110,
    status: "ativo",
    origem_entrada: "compra",
    setor: "almoxarifado",
    entry_date: "2024-01-08T15:30:00Z",
    notes: "2ª descarga da balsa BL-2401",
  },
  {
    id: 3,
    reference: "ENT000701",
    product_id: 101,
    quantity_received: 410,
    quantity_available: 410,
    unit_cost: 112,
    status: "ativo",
    origem_entrada: "compra",
    setor: "almoxarifado",
    entry_date: "2024-02-14T09:45:00Z",
    notes: "Descarga parcial da balsa BL-2402",
  },
  {
    id: 4,
    reference: "ENT-PROC-2401",
    product_id: 201,
    quantity_received: 225,
    quantity_available: 180,
    unit_cost: 0,
    status: "ativo",
    origem_entrada: "processamento",
    setor: "producao",
    entry_date: "2024-01-12T11:00:00Z",
    notes: "Lote produzido do processo PROC-2401-01",
  },
  {
    id: 5,
    reference: "ENT-PROC-2402",
    product_id: 202,
    quantity_received: 162,
    quantity_available: 162,
    unit_cost: 0,
    status: "ativo",
    origem_entrada: "processamento",
    setor: "producao",
    entry_date: "2024-02-19T10:00:00Z",
    notes: "Lote produzido do processo PROC-2402-01",
  },
];

export default function Warehouse() {
  const { currentCompany } = useCompany();

  // Dados de exemplo (mock data) para substituir as chamadas de API
  const mockProducts = CALCARIO_PRODUCTS;
  const mockStockEntries = CALCARIO_STOCK_ENTRIES;

  const [stockEntries, setStockEntries] = useState([]);
  const [products, setProducts] = useState([]);
  const [bargeLoads, setBargeLoads] = useState([]);
  const [unloadingTrips, setUnloadingTrips] = useState([]);
  const [processingBatches, setProcessingBatches] = useState([]);
  const [outboundShipments, setOutboundShipments] = useState([]);
  const isLoading = false;
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    setor: "all",
    origem_entrada: "all",
    status: "ativo",
    categoria: "all",
  });

  useEffect(() => {
    if (currentCompany) {
      // Carregar dados de exemplo
      setProducts(mockProducts);

      const mockBargeLoads = [
        {
          id: 1,
          barge_code: "BL-2401",
          supplier: "Mineração Tapajós",
          product_id: 101,
          product_name: "Calcário In Natura",
          purchase_date: "2024-01-02T08:00:00Z",
          total_tonnage: 1000,
        },
        {
          id: 2,
          barge_code: "BL-2402",
          supplier: "Pedreira São Jorge",
          product_id: 101,
          product_name: "Calcário In Natura",
          purchase_date: "2024-02-10T10:00:00Z",
          total_tonnage: 800,
        },
      ];

      const mockUnloadingTrips = [
        {
          id: 11,
          barge_id: 1,
          sequence: 1,
          product_id: 101,
          arrival_date: "2024-01-05T14:30:00Z",
          tonnage: 320,
          destination: "Pátio Santarém",
        },
        {
          id: 12,
          barge_id: 1,
          sequence: 2,
          product_id: 101,
          arrival_date: "2024-01-07T16:00:00Z",
          tonnage: 340,
          destination: "Pátio Santarém",
        },
        {
          id: 21,
          barge_id: 2,
          sequence: 1,
          product_id: 101,
          arrival_date: "2024-02-14T09:45:00Z",
          tonnage: 410,
          destination: "Pátio Santarém",
        },
      ];

      const mockProcessingBatches = [
        {
          id: 100,
          batch_code: "PROC-2401-01",
          start_date: "2024-01-09T08:00:00Z",
          raw_product_id: 101,
          finished_product_id: 201,
          finished_product_name: "Calcário Britado 0-32",
          tonnage_consumed: 250,
          tonnage_produced: 225,
        },
        {
          id: 101,
          batch_code: "PROC-2402-01",
          start_date: "2024-02-18T07:30:00Z",
          raw_product_id: 101,
          finished_product_id: 202,
          finished_product_name: "Calcário Micronizado",
          tonnage_consumed: 180,
          tonnage_produced: 162,
        },
      ];

      const mockOutboundShipments = [
        {
          id: 301,
          order_code: "PED-5001",
          product_id: 201,
          product_name: "Calcário Britado 0-32",
          customer_name: "Agro Amazônia",
          shipping_date: "2024-01-20T12:00:00Z",
          tonnage: 120,
          status: "completed",
        },
        {
          id: 302,
          order_code: "PED-5002",
          product_id: 202,
          product_name: "Calcário Micronizado",
          customer_name: "Cooperativa Vale Verde",
          shipping_date: "2024-02-22T08:30:00Z",
          tonnage: 90,
          status: "scheduled",
        },
      ];

      const stockEntriesWithCompany = mockStockEntries.map((entry) => ({
        ...entry,
        company_id: currentCompany.id,
        company_name: currentCompany.name,
      }));

      setStockEntries(stockEntriesWithCompany);
      setBargeLoads(mockBargeLoads);
      setUnloadingTrips(mockUnloadingTrips);
      setProcessingBatches(mockProcessingBatches);
      setOutboundShipments(mockOutboundShipments);
    } else {
      // Limpar dados se nenhuma filial estiver selecionada
      setStockEntries([]);
      setProducts([]);
      setBargeLoads([]);
      setUnloadingTrips([]);
      setProcessingBatches([]);
      setOutboundShipments([]);
    }
  }, [currentCompany]);

  const { metrics, productBreakdown, timelineEvents } = useInventoryFlow({
    bargeLoads,
    unloadingTrips,
    processingBatches,
    outboundShipments,
  });

  const handleSubmit = async (entryData) => {
    try {
      console.log("Dados recebidos para salvar:", entryData);

      if (!entryData.product_id) {
        alert("Erro: Produto não selecionado corretamente.");
        return;
      }

      if (!currentCompany || !currentCompany.id) {
        alert("Erro: Empresa não selecionada. Não foi possível salvar a entrada.");
        return;
      }

      const setorFromEntry = entryData.setor || currentCompany?.code?.toLowerCase() || "almoxarifado";
      const dataToSave = {
        ...entryData,
        company_id: currentCompany.id,
        company_name: currentCompany.name,
        setor: setorFromEntry,
      };

      if (editingEntry) {
        // Simular atualização
        const updatedEntries = stockEntries.map((entry) =>
          entry.id === editingEntry.id
            ? { ...entry, ...dataToSave, quantity_available: dataToSave.quantity_received }
            : entry,
        );
        setStockEntries(updatedEntries);
        alert("Entrada de estoque atualizada com sucesso!");
      } else {
        // Simular criação
        const nextId = stockEntries.length > 0 ? Math.max(...stockEntries.map((e) => e.id)) + 1 : 1;
        const newRef = `ENT${String(Date.now()).slice(-6)}`;
        const newEntry = {
          id: nextId,
          ...dataToSave,
          reference: newRef,
          status: "ativo",
          quantity_available: dataToSave.quantity_received,
          entry_date: new Date().toISOString(),
        };
        setStockEntries([...stockEntries, newEntry]);
        alert("Entrada de estoque criada com sucesso!");
      }

      setShowForm(false);
      setEditingEntry(null);
    } catch (error) {
      console.error("Erro detalhado ao salvar entrada de estoque:", error);
      alert(`Erro ao salvar entrada de estoque: ${error.message || "Erro desconhecido"}`);
    }
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setShowForm(true);
  };

  const handleDelete = async (entry) => {
    if (
      confirm(
        `Tem certeza que deseja desativar a entrada "${entry.reference}"?\n\nEsta ação irá:\n- Alterar o status para "consumido"\n- Zerar a quantidade disponível\n- Manter o histórico para auditoria\n\nEsta ação NÃO pode ser desfeita!`,
      )
    ) {
      try {
        // Simular desativação
        const updatedEntries = stockEntries.map((e) =>
          e.id === entry.id
            ? { ...e, status: "consumido", quantity_available: 0 }
            : e,
        );
        setStockEntries(updatedEntries);
        alert(`Entrada "${entry.reference}" foi desativada com sucesso.`);
      } catch (error) {
        console.error("Erro ao desativar entrada:", error);
        alert(`Erro ao desativar entrada: ${error.message}`);
      }
    }
  };

  const filteredEntries = useMemo(() => {
    // O filtro por filial já é feito em loadData, então a lista `stockEntries` já está correta.
    return stockEntries.filter((entry) => {
      // This check is technically redundant if loadData is filtering correctly,
      // but keeping it here for an extra layer of safety to ensure UI consistency if data somehow slips through.
      if (currentCompany && entry.company_id !== currentCompany.id) {
        return false;
      }

      const product = products.find((p) => p.id === entry.product_id);

      const normalizedSearch = searchTerm.trim().toLowerCase();
      const searchMatch =
        normalizedSearch === "" ||
        entry.reference.toLowerCase().includes(normalizedSearch) ||
        (product && product.name.toLowerCase().includes(normalizedSearch)) ||
        (product && product.code.toLowerCase().includes(normalizedSearch)) ||
        (entry.notes && entry.notes.toLowerCase().includes(normalizedSearch)); // Added entry.notes to search criteria

      const setorMatch = filters.setor === "all" || entry.setor === filters.setor;
      const origemMatch = filters.origem_entrada === "all" || entry.origem_entrada === filters.origem_entrada;
      const statusMatch = filters.status === "all" || entry.status === filters.status;
      const categoryMatch = filters.categoria === "all" || (product && product.category === filters.categoria);

      return searchMatch && setorMatch && origemMatch && statusMatch && categoryMatch;
    });
  }, [stockEntries, products, searchTerm, filters, currentCompany]);

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

        <StockFlowDashboard
          metrics={metrics}
          productBreakdown={productBreakdown}
          timelineEvents={timelineEvents}
        />

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
