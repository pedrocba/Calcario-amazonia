
import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRightLeft, Search, Send, CheckCircle, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import TransferForm from "../components/transfers/TransferForm";
import TransferList from "../components/transfers/TransferList";
import TransferFilters from "../components/transfers/TransferFilters";
import TransferStats from "../components/transfers/TransferStats";
import TransferTicket from "../components/transfers/TransferTicket";
import PrintTicketStyle from "../components/ui/PrintTicketStyle";

export default function Transfers() {
  // Dados de exemplo (mock data) para substituir as chamadas de API
  const mockProducts = [
    { id: 1, name: 'Cimento Portland', code: 'PROD000001', category: 'Cimento', cost_price: 25.50 },
    { id: 2, name: 'Areia Fina', code: 'PROD000002', category: 'Agregados', cost_price: 15.00 },
    { id: 3, name: 'Brita 1', code: 'PROD000003', category: 'Agregados', cost_price: 18.00 },
    { id: 4, name: 'Cal Hidratada', code: 'PROD000004', category: 'Cal', cost_price: 12.50 },
    { id: 5, name: 'Argila', code: 'PROD000005', category: 'Agregados', cost_price: 8.00 }
  ];

  const mockStockEntries = [
    { id: 1, product_id: 1, quantity_available: 150, quantity_reserved: 0, unit_cost: 25.50, status: 'ativo', setor: 'santarem' },
    { id: 2, product_id: 2, quantity_available: 300, quantity_reserved: 0, unit_cost: 15.00, status: 'ativo', setor: 'santarem' },
    { id: 3, product_id: 3, quantity_available: 120, quantity_reserved: 0, unit_cost: 18.00, status: 'ativo', setor: 'santarem' },
    { id: 4, product_id: 4, quantity_available: 45, quantity_reserved: 0, unit_cost: 12.50, status: 'ativo', setor: 'santarem' },
    { id: 5, product_id: 5, quantity_available: 200, quantity_reserved: 0, unit_cost: 8.00, status: 'ativo', setor: 'santarem' }
  ];

  const mockTransfers = [
    { id: 1, transfer_reference: 'TRF000001', product_id: 1, quantity_sent: 50, quantity_received: 0, status: 'enviado', setor_origem: 'santarem', setor_destino: 'fazenda', sent_date: '2024-01-15T10:00:00Z', received_date: null, origin_entry_id: 1 },
    { id: 2, transfer_reference: 'TRF000002', product_id: 2, quantity_sent: 100, quantity_received: 100, status: 'recebido', setor_origem: 'santarem', setor_destino: 'fazenda', sent_date: '2024-01-14T14:30:00Z', received_date: '2024-01-14T16:00:00Z', origin_entry_id: 2 },
    { id: 3, transfer_reference: 'TRF000003', product_id: 3, quantity_sent: 30, quantity_received: 0, status: 'enviado', setor_origem: 'santarem', setor_destino: 'fazenda', sent_date: '2024-01-13T09:15:00Z', received_date: null, origin_entry_id: 3 }
  ];

  const [transfers, setTransfers] = useState([]);
  const [stockEntries, setStockEntries] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('enviar');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    setor_origem: 'all',
    setor_destino: 'all'
  });
  const [ticketToPrint, setTicketToPrint] = useState(null);

  useEffect(() => {
    // Carregar dados de exemplo
    setTransfers(mockTransfers);
    setStockEntries(mockStockEntries);
    setProducts(mockProducts);
    
    // Adicionar listener para impressão
    const handleAfterPrint = () => {
      setTicketToPrint(null);
    };
    
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  const filteredTransfers = useMemo(() => {
    return transfers.filter(transfer => {
      const product = products.find(p => p.id === transfer.product_id);
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      
      const searchMatch = lowerCaseSearchTerm === '' || 
        transfer.transfer_reference.toLowerCase().includes(lowerCaseSearchTerm) ||
        (product && product.name.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (product && product.sku && product.sku.toLowerCase().includes(lowerCaseSearchTerm)) ||
        transfer.setor_origem.toLowerCase().includes(lowerCaseSearchTerm) ||
        transfer.setor_destino.toLowerCase().includes(lowerCaseSearchTerm) ||
        transfer.status.toLowerCase().includes(lowerCaseSearchTerm);
      
      const statusMatch = filters.status === 'all' || transfer.status === filters.status;
      const origemMatch = filters.setor_origem === 'all' || transfer.setor_origem === filters.setor_origem;
      const destinoMatch = filters.setor_destino === 'all' || transfer.setor_destino === filters.setor_destino;

      return searchMatch && statusMatch && origemMatch && destinoMatch;
    });
  }, [transfers, products, searchTerm, filters]);

  const availableStock = useMemo(() => {
    return stockEntries.filter(entry => 
      entry.status === 'ativo' && 
      entry.quantity_available > 0
    );
  }, [stockEntries]);

  const handleSubmit = async (transferData) => {
    try {
      // Gerar referência única
      const lastTransfer = transfers[0];
      const lastRef = lastTransfer ? parseInt(lastTransfer.transfer_reference.replace(/\D/g, ''), 10) : 0;
      const nextRef = lastRef + 1;
      transferData.transfer_reference = `TRF${String(nextRef).padStart(6, '0')}`;
      transferData.sent_date = new Date().toISOString();
      transferData.status = 'enviado';
      
      // Simular criação
      const newId = Math.max(...transfers.map(t => t.id)) + 1;
      const newTransfer = { id: newId, ...transferData };
      setTransfers([newTransfer, ...transfers]);
      
      // Atualizar quantidade disponível na origem
      const originEntry = stockEntries.find(e => e.id === transferData.origin_entry_id);
      if (originEntry) {
        const newAvailable = originEntry.quantity_available - transferData.quantity_sent;
        const updatedStockEntries = stockEntries.map(entry => 
          entry.id === originEntry.id 
            ? { ...entry, quantity_available: newAvailable, quantity_reserved: (entry.quantity_reserved || 0) + transferData.quantity_sent }
            : entry
        );
        setStockEntries(updatedStockEntries);
      }
      
      setShowForm(false);
      
      // Preparar dados para o ticket
      const product = products.find(p => p.id === transferData.product_id);
      const ticketData = {
        transfer: { ...newTransfer, ...transferData },
        product: product,
        originEntry: originEntry
      };
      
      // Mostrar ticket para impressão
      setTicketToPrint(ticketData);
      
      // Aguardar um pouco e imprimir automaticamente
      setTimeout(() => {
        window.print();
      }, 500);
      
    } catch (error) {
      console.error('Erro ao enviar transferência:', error);
    }
  };

  const handleReceive = async (transfer) => {
    try {
      // Atualizar status da transferência
      const updatedTransfers = transfers.map(t => 
        t.id === transfer.id 
          ? { ...t, status: 'recebido', received_date: new Date().toISOString(), quantity_received: transfer.quantity_sent }
          : t
      );
      setTransfers(updatedTransfers);

      // Simular criação de nova entrada no destino
      const originEntry = stockEntries.find(e => e.id === transfer.origin_entry_id);
      if (originEntry) {
        const newEntryRef = `ENT${String(Date.now()).slice(-6)}`;
        const newEntry = {
          id: Math.max(...stockEntries.map(e => e.id)) + 1,
          reference: newEntryRef,
          product_id: transfer.product_id,
          setor: transfer.setor_destino,
          origem_entrada: 'transferencia',
          condicao: 'novo',
          ca: 'N/A',
          validade: 'N/A',
          quantity_received: transfer.quantity_sent,
          quantity_available: transfer.quantity_sent,
          unit_cost: transfer.unit_cost || originEntry.unit_cost,
          transfer_origin_reference: transfer.transfer_reference,
          status: 'ativo',
          entry_date: new Date().toISOString(),
          warehouse_location: `${transfer.setor_destino.toUpperCase().slice(0,3)}-TRF`
        };
        setStockEntries([...stockEntries, newEntry]);

        // Atualizar entrada de origem
        const updatedStockEntries = stockEntries.map(entry => 
          entry.id === originEntry.id 
            ? { ...entry, quantity_reserved: (entry.quantity_reserved || 0) - transfer.quantity_sent }
            : entry
        );
        setStockEntries(updatedStockEntries);
      }

      alert('Transferência recebida com sucesso!');
    } catch (error) {
      console.error('Erro ao confirmar recebimento:', error);
    }
  };

  // Função para reimprimir ticket
  const handlePrintTicket = (ticketData) => {
    setTicketToPrint(ticketData);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <>
      <PrintTicketStyle />
      
      <div className={ticketToPrint ? 'hidden' : ''}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Gestão de Transferências</h1>
                <p className="text-slate-600">Movimentação entre Santarém e Fazenda</p>
              </div>
            </div>

            <TransferStats transfers={transfers} isLoading={isLoading} />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 lg:w-96">
                <TabsTrigger value="enviar" className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Enviar
                </TabsTrigger>
                <TabsTrigger value="receber" className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Receber
                </TabsTrigger>
                <TabsTrigger value="historico" className="flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4" />
                  Histórico
                </TabsTrigger>
              </TabsList>

              <TabsContent value="enviar" className="space-y-6">
                <div className="flex justify-end">
                  <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 shadow-lg">
                    <Plus className="w-5 h-5 mr-2" />
                    Nova Transferência
                  </Button>
                </div>

                <AnimatePresence>
                  {showForm && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <TransferForm 
                        availableStock={availableStock}
                        products={products}
                        onSubmit={handleSubmit} 
                        onCancel={() => setShowForm(false)} 
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <TransferList 
                  transfers={transfers.filter(t => t.status === 'enviado')} 
                  products={products} 
                  isLoading={isLoading}
                  showActions={false}
                  title="Transferências Enviadas"
                  onPrintTicket={handlePrintTicket}
                />
              </TabsContent>

              <TabsContent value="receber" className="space-y-6">
                <TransferList 
                  transfers={transfers.filter(t => t.status === 'enviado')} 
                  products={products} 
                  isLoading={isLoading}
                  onReceive={handleReceive}
                  showActions={true}
                  title="Transferências Pendentes"
                  onPrintTicket={handlePrintTicket}
                />
              </TabsContent>

              <TabsContent value="historico" className="space-y-6">
                <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
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
                            placeholder="Buscar por referência, produto, setor, status..." 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                            className="pl-10" 
                          />
                        </div>
                      </div>
                      <TransferFilters filters={filters} onFilterChange={setFilters} />
                    </div>
                  </CardContent>
                </Card>

                <TransferList 
                  transfers={filteredTransfers} 
                  products={products} 
                  isLoading={isLoading}
                  showActions={false}
                  showDetails={true}
                  title={`Histórico Completo (${filteredTransfers.length})`}
                  onPrintTicket={handlePrintTicket}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {ticketToPrint && (
        <div className="printable-ticket">
          <TransferTicket {...ticketToPrint} />
        </div>
      )}
    </>
  );
}
