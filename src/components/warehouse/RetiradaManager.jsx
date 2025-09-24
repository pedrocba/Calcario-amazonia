import React, { useState, useEffect, useMemo } from "react";
import { RetiradaDeItem, ItemRetirado, Product, StockEntry, User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Package, ArrowLeft, ArrowRight, Clock, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import RetiradaForm from "../retiradas/RetiradaForm";
import RetiradaList from "../retiradas/RetiradaList";
import DevolucaoForm from "../retiradas/DevolucaoForm";
import RetiradaStats from "../retiradas/RetiradaStats";
import FerramentasEmUso from "../retiradas/FerramentasEmUso";
import TicketRetirada from "../retiradas/TicketRetirada";

export default function RetiradaManager() {
  const [retiradas, setRetiradas] = useState([]);
  const [products, setProducts] = useState([]);
  const [stockEntries, setStockEntries] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRetiradaForm, setShowRetiradaForm] = useState(false);
  const [showDevolucaoForm, setShowDevolucaoForm] = useState(false);
  const [selectedRetirada, setSelectedRetirada] = useState(null);
  const [activeTab, setActiveTab] = useState('nova');
  const [ticketToPrint, setTicketToPrint] = useState(null);

  useEffect(() => {
    loadData();
    const handleAfterPrint = () => setTicketToPrint(null);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [retiradasData, productsData, stockData, userData] = await Promise.all([
        RetiradaDeItem.list('-created_date'),
        Product.list(),
        StockEntry.list(),
        User.me()
      ]);
      setRetiradas(retiradasData);
      setProducts(productsData);
      setStockEntries(stockData);
      setCurrentUser(userData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
    setIsLoading(false);
  };

  const handleSubmitRetirada = async (retiradaData) => {
    try {
      const lastRet = retiradas[0];
      const lastNum = lastRet ? parseInt(lastRet.numero_retirada.replace('RET', ''), 10) : 0;
      const nextNum = lastNum + 1;
      const numeroRetirada = `RET${String(nextNum).padStart(6, '0')}`;

      const novaRetirada = await RetiradaDeItem.create({
        numero_retirada: numeroRetirada,
        solicitante_id: retiradaData.solicitante_id,
        solicitante_nome: retiradaData.solicitante_nome,
        setor: retiradaData.setor,
        tipo_de_retirada: retiradaData.tipo_de_retirada,
        finalidade: retiradaData.finalidade,
        status: 'entregue',
        data_retirada: new Date().toISOString(),
        data_prevista_devolucao: retiradaData.data_prevista_devolucao,
        assinatura_solicitante: retiradaData.assinatura_solicitante,
        observacao_retirada: retiradaData.observacao_retirada,
        entregue_por: currentUser.full_name,
        total_itens: retiradaData.itens.length
      });

      for (const item of retiradaData.itens) {
        await ItemRetirado.create({
          retirada_id: novaRetirada.id,
          produto_id: item.produto_id,
          stock_entry_id: item.stock_entry_id,
          quantidade: item.quantidade,
          unidade_medida: item.unidade_medida,
          observacao: item.observacao
        });

        if (retiradaData.tipo_de_retirada === 'peca_consumo') {
          const stockEntry = stockEntries.find(s => s.id === item.stock_entry_id);
          if (stockEntry) {
            const novaQuantidade = stockEntry.quantity_available - item.quantidade;
            await StockEntry.update(item.stock_entry_id, {
              quantity_available: Math.max(0, novaQuantidade)
            });
          }
        }
      }

      setShowRetiradaForm(false);
      await loadData();
    } catch (error) {
      console.error('Erro ao criar retirada:', error);
    }
  };

  const handleDevolucao = async (devolucaoData) => {
    try {
      await RetiradaDeItem.update(selectedRetirada.id, {
        status: devolucaoData.todosItensDevolvidos ? 'devolvido' : 'entregue',
        data_real_devolucao: devolucaoData.todosItensDevolvidos ? new Date().toISOString() : selectedRetirada.data_real_devolucao,
        observacao_devolucao: devolucaoData.observacao_devolucao,
        recebido_por: currentUser.full_name
      });

      for (const itemDevolucao of devolucaoData.itens) {
        await ItemRetirado.update(itemDevolucao.item_id, {
          foi_devolvido: itemDevolucao.quantidade_devolvida > 0,
          quantidade_devolvida: itemDevolucao.quantidade_devolvida,
          estado_na_devolucao: itemDevolucao.estado_na_devolucao,
          data_devolucao_item: new Date().toISOString()
        });
      }

      setShowDevolucaoForm(false);
      setSelectedRetirada(null);
      await loadData();
    } catch (error) {
      console.error('Erro ao processar devolução:', error);
    }
  };

  const handlePrint = (retirada) => {
    setTicketToPrint(retirada);
    setTimeout(() => window.print(), 100);
  };
  
  const stats = useMemo(() => {
    const aguardandoEntrega = retiradas.filter(r => r.status === 'aguardando_entrega').length;
    const entregues = retiradas.filter(r => r.status === 'entregue').length;
    const devolvidos = retiradas.filter(r => r.status === 'devolvido').length;
    const atrasados = retiradas.filter(r => r.status === 'atrasado').length;
    const extraviados = retiradas.filter(r => r.status === 'extraviado').length;

    return { aguardandoEntrega, entregues, devolvidos, atrasados, extraviados };
  }, [retiradas]);

  const canCreateRetirada = true;

  const filteredRetiradas = useMemo(() => {
    return retiradas;
  }, [retiradas]);

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .printable-ticket, .printable-ticket * { visibility: visible; }
          .printable-ticket { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
      <div className={ticketToPrint ? 'hidden' : ''}>
        <div className="space-y-6">
            <RetiradaStats stats={stats} isLoading={isLoading} />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-5 lg:w-[700px]">
                <TabsTrigger value="nova" className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Nova
                </TabsTrigger>
                <TabsTrigger value="entregues" className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Entregues
                </TabsTrigger>
                <TabsTrigger value="devolucao" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Devolução
                </TabsTrigger>
                <TabsTrigger value="ferramentas" className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Em Uso
                </TabsTrigger>
                <TabsTrigger value="historico" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Histórico
                </TabsTrigger>
              </TabsList>

              <TabsContent value="nova" className="space-y-6">
                <div className="flex justify-end">
                  <Button 
                    onClick={() => setShowRetiradaForm(true)} 
                    className="bg-blue-600 hover:bg-blue-700 shadow-lg"
                    size="lg"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Nova Retirada
                  </Button>
                </div>

                <AnimatePresence>
                  {showRetiradaForm && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: 'auto' }} 
                      exit={{ opacity: 0, height: 0 }} 
                      className="overflow-hidden"
                    >
                      <RetiradaForm 
                        products={products.filter(p => p.active)}
                        stockEntries={stockEntries.filter(s => s.status === 'ativo' && s.quantity_available > 0)}
                        currentUser={currentUser}
                        onSubmit={handleSubmitRetirada} 
                        onCancel={() => setShowRetiradaForm(false)} 
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <RetiradaList 
                  retiradas={filteredRetiradas.filter(r => r.status === 'aguardando_entrega')} 
                  products={products}
                  currentUser={currentUser}
                  isLoading={isLoading}
                  title="Aguardando Entrega"
                  showActions={false}
                  onPrint={handlePrint}
                />
              </TabsContent>

              <TabsContent value="entregues" className="space-y-6">
                <RetiradaList 
                  retiradas={filteredRetiradas.filter(r => r.status === 'entregue')} 
                  products={products}
                  currentUser={currentUser}
                  isLoading={isLoading}
                  title="Itens Entregues"
                  showActions={true}
                  onDevolucao={(retirada) => {
                    setSelectedRetirada(retirada);
                    setShowDevolucaoForm(true);
                  }}
                  onPrint={handlePrint}
                />
              </TabsContent>

              <TabsContent value="devolucao" className="space-y-6">
                <AnimatePresence>
                  {showDevolucaoForm && selectedRetirada && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <DevolucaoForm 
                        retirada={selectedRetirada}
                        products={products}
                        onSubmit={handleDevolucao} 
                        onCancel={() => {
                          setShowDevolucaoForm(false);
                          setSelectedRetirada(null);
                        }} 
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <RetiradaList 
                  retiradas={filteredRetiradas.filter(r => ['devolvido', 'atrasado'].includes(r.status))} 
                  products={products}
                  currentUser={currentUser}
                  isLoading={isLoading}
                  title="Controle de Devolução"
                  showActions={false}
                  showDetails={true}
                />
              </TabsContent>

              <TabsContent value="ferramentas" className="space-y-6">
                <FerramentasEmUso 
                  retiradas={filteredRetiradas.filter(r => r.tipo_de_retirada === 'ferramenta_devolucao' && (r.status === 'entregue' || r.status === 'atrasado'))}
                  products={products}
                  isLoading={isLoading}
                />
              </TabsContent>

              <TabsContent value="historico" className="space-y-6">
                <RetiradaList 
                  retiradas={filteredRetiradas} 
                  products={products}
                  currentUser={currentUser}
                  isLoading={isLoading}
                  title="Histórico Completo"
                  showActions={false}
                  showDetails={true}
                  onPrint={handlePrint}
                />
              </TabsContent>
            </Tabs>
        </div>
      </div>
      {ticketToPrint && (
        <div className="printable-ticket">
            <TicketRetirada retirada={ticketToPrint} products={products} />
        </div>
      )}
    </>
  );
}