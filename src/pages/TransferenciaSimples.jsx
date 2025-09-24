
import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Send,
  Package,
  CheckCircle,
  Clock,
  Plus,
  Truck,
  Archive,
  Printer,
  Search,
  Edit,
  Trash2
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { UploadFile } from "@/api/integrations";
import TransferenciaTicket from "../components/transferencia-simples/TransferenciaTicket";
import PrintTicketStyle from "../components/ui/PrintTicketStyle";

export default function TransferenciaSimplesPage() {
  // Dados de exemplo (mock data) para substituir as chamadas de API
  const mockTransferencias = [
    { id: 1, numero_transferencia: 'TRF000001', produto_nome: 'Cimento Portland', quantidade: 50, unidade_medida: 'KG', status: 'enviado', data_envio: '2024-01-15T10:00:00Z', enviado_por: 'João Silva', observacoes_origem: 'Transferência para fazenda' },
    { id: 2, numero_transferencia: 'TRF000002', produto_nome: 'Areia Fina', quantidade: 100, unidade_medida: 'KG', status: 'recebido', data_envio: '2024-01-14T14:30:00Z', data_recebimento: '2024-01-16T09:15:00Z', enviado_por: 'Maria Santos', recebido_por: 'Pedro Costa', observacoes_origem: 'Material para construção' },
    { id: 3, numero_transferencia: 'TRF000003', produto_nome: 'Brita 1', quantidade: 80, unidade_medida: 'KG', status: 'enviado', data_envio: '2024-01-13T09:15:00Z', enviado_por: 'João Silva', observacoes_origem: 'Agregado para obra' },
    { id: 4, numero_transferencia: 'TRF000004', produto_nome: 'Cal Hidratada', quantidade: 30, unidade_medida: 'KG', status: 'enviado', data_envio: '2024-01-12T16:45:00Z', enviado_por: 'Maria Santos', observacoes_origem: 'Cal para acabamento' }
  ];

  const mockProducts = [
    { id: 1, name: 'Cimento Portland', code: 'PROD000001', category: 'Cimento', active: true },
    { id: 2, name: 'Areia Fina', code: 'PROD000002', category: 'Agregados', active: true },
    { id: 3, name: 'Brita 1', code: 'PROD000003', category: 'Agregados', active: true },
    { id: 4, name: 'Cal Hidratada', code: 'PROD000004', category: 'Cal', active: true }
  ];

  const mockRemessas = [
    { id: 1, numero_remessa: 'REM000001', data_remessa: '2024-01-15T10:00:00Z', status: 'aberta', motorista: 'João Silva', veiculo_placa: 'ABC-1234' },
    { id: 2, numero_remessa: 'REM000002', data_remessa: '2024-01-14T14:30:00Z', status: 'aberta', motorista: 'Maria Santos', veiculo_placa: 'DEF-5678' }
  ];

  const [transferencias, setTransferencias] = useState([]);
  const [products, setProducts] = useState([]);
  const [remessas, setRemessas] = useState([]);
  const [currentUser, setCurrentUser] = useState({ id: 1, full_name: 'Administrador', email: 'admin@exemplo.com' });
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showRecebimentoForm, setShowRecebimentoForm] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [activeTab, setActiveTab] = useState('enviar');
  const [selectedForRemessa, setSelectedForRemessa] = useState([]);
  const [isRemessaDialogOpen, setIsRemessaDialogOpen] = useState(false);
  const [targetRemessaId, setTargetRemessaId] = useState('');

  const [ticketToPrint, setTicketToPrint] = useState(null);

  // NOVO: Estados para o modal de associação
  const [isAssociacaoDialogOpen, setIsAssociacaoDialogOpen] = useState(false);
  const [associacaoSearchTerm, setAssociacaoSearchTerm] = useState('');

  // NOVO: Estado para edição de transferência
  const [editingTransfer, setEditingTransfer] = useState(null);
  
  // Formulário de Recebimento (Fazenda) - Simplificado
  const [recebimentoForm, setRecebimentoForm] = useState({
    observacoes_recebimento: '',
    warehouse_location: '',
    supplier: '',
    invoice_number: '',
    unit_cost: 0
  });

  useEffect(() => {
    // Carregar dados de exemplo
    setTransferencias(mockTransferencias);
    setProducts(mockProducts);
    setRemessas(mockRemessas.filter(r => r.status === 'aberta'));

    const handleAfterPrint = () => setTicketToPrint(null);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  const handleTransferSubmit = async (transferData) => {
    try {
      if (editingTransfer) {
        // Simular edição de transferência existente
        setTransferencias(prevTransferencias => 
          prevTransferencias.map(t => t.id === editingTransfer.id ? {
            ...t,
            ...transferData,
            // Manter dados originais que não devem ser alterados na edição
            numero_transferencia: editingTransfer.numero_transferencia,
            data_envio: editingTransfer.data_envio,
            enviado_por: editingTransfer.enviado_por,
            status: editingTransfer.status
          } : t)
        );
        
        setEditingTransfer(null);
        alert("Transferência atualizada com sucesso!");
      } else {
        // Simular criação de nova transferência
        const lastTransfer = transferencias[0];
        const lastNumber = lastTransfer ? parseInt(lastTransfer.numero_transferencia.replace(/\D/g, ''), 10) : 0;
        const nextNumber = isNaN(lastNumber) ? transferencias.length + 1 : lastNumber + 1;
        const numeroTransferencia = `TRF${String(nextNumber).padStart(6, '0')}`;

        const newTransfer = {
          id: Math.max(...transferencias.map(t => t.id)) + 1,
          ...transferData,
          numero_transferencia: numeroTransferencia,
          data_envio: new Date().toISOString(),
          enviado_por: currentUser.full_name,
          status: 'enviado',
        };

        setTransferencias(prevTransferencias => [newTransfer, ...prevTransferencias]);
        setTicketToPrint(newTransfer);
        setTimeout(() => window.print(), 300);
      }

      setShowForm(false);
    } catch (error) {
      console.error("Erro ao salvar transferência:", error);
      alert("Erro ao salvar transferência. Tente novamente.");
    }
  };

  const handleEditTransfer = (transferencia) => {
    if (transferencia.status !== 'enviado') {
      alert("Só é possível editar transferências com status 'enviado'.");
      return;
    }
    setEditingTransfer(transferencia);
    setShowForm(true);
  };

  const handleDeleteTransfer = async (transferencia) => {
    if (!confirm(`Tem certeza que deseja excluir a transferência ${transferencia.numero_transferencia}?\n\nEsta ação não pode ser desfeita!`)) {
      return;
    }

    try {
      // Simular exclusão da transferência
      setTransferencias(prevTransferencias => prevTransferencias.filter(t => t.id !== transferencia.id));
      alert("Transferência excluída com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir transferência:", error);
      alert("Erro ao excluir transferência. Tente novamente.");
    }
  };

  const handleRecebimentoSubmit = async (productId) => {
    if (!selectedTransfer || !productId) {
      alert("Erro: Transferência ou produto não selecionado.");
      return;
    }
    if (!recebimentoForm.warehouse_location) {
      alert("Por favor, preencha a 'Localização no Almoxarifado'.");
      return;
    }

    try {
      // Simular criação de nova entrada de estoque na fazenda
      const newEntryRef = `ENT${String(Date.now()).slice(-6)}`;
      console.log('Nova entrada de estoque criada:', {
        reference: newEntryRef,
        product_id: productId,
        setor: 'fazenda',
        origem_entrada: 'transferencia',
        condicao: 'novo',
        quantity_received: selectedTransfer.quantidade,
        quantity_available: selectedTransfer.quantidade,
        status: 'ativo',
        entry_date: new Date().toISOString(),
        warehouse_location: recebimentoForm.warehouse_location || 'A DEFINIR',
        supplier: recebimentoForm.supplier,
        invoice_number: recebimentoForm.invoice_number,
        unit_cost: recebimentoForm.unit_cost,
        notes: `Recebido de ${selectedTransfer.numero_transferencia}. Obs: ${recebimentoForm.observacoes_recebimento}`
      });

      // Simular atualização do status da transferência
      setTransferencias(prevTransferencias => 
        prevTransferencias.map(t => t.id === selectedTransfer.id ? {
          ...t,
          status: 'recebido',
          data_recebimento: new Date().toISOString(),
          recebido_por: currentUser.full_name,
          observacoes_recebimento: recebimentoForm.observacoes_recebimento,
          produto_id_cadastrado: productId,
        } : t)
      );

      setIsAssociacaoDialogOpen(false);
      setSelectedTransfer(null);
      setRecebimentoForm({
        observacoes_recebimento: '',
        warehouse_location: '',
        supplier: '',
        invoice_number: '',
        unit_cost: 0
      });

      alert(`Recebimento da transferência ${selectedTransfer.numero_transferencia} confirmado!`);
    } catch (error) {
      console.error("Erro ao confirmar recebimento:", error);
      alert("Erro ao confirmar recebimento. Tente novamente.");
    }
  };

  const handleCreateAndReceive = async () => {
    if (!recebimentoForm.warehouse_location) {
      alert("Por favor, preencha a 'Localização no Almoxarifado' antes de cadastrar e receber.");
      return;
    }
    try {
      const lastProduct = products[0];
      const lastId = lastProduct ? parseInt(lastProduct.code.replace('PROD', ''), 10) : 0;
      const nextId = isNaN(lastId) ? products.length + 1 : lastId + 1;
      const newCode = `PROD${String(nextId).padStart(6, '0')}`;

      // Simular criação de novo produto
      const newProduct = {
        id: Math.max(...products.map(p => p.id)) + 1,
        code: newCode,
        name: selectedTransfer.produto_nome.trim(),
        category: 'pecas_reposicao',
        unit_of_measure: selectedTransfer.unidade_medida || 'UN',
        active: true
      };

      setProducts(prevProducts => [newProduct, ...prevProducts]);
      await handleRecebimentoSubmit(newProduct.id);

    } catch (error) {
      alert("Falha ao criar novo produto. Tente novamente.");
      console.error("Erro ao criar produto:", error);
    }
  };

  const handleCheckboxChange = (id, checked) => {
    setSelectedForRemessa(prev =>
      checked ? [...prev, id] : prev.filter(item => item !== id)
    );
  };

  const handleAddToRemessa = async () => {
    if (!targetRemessaId || selectedForRemessa.length === 0) {
      alert("Selecione uma remessa e pelo menos uma transferência.");
      return;
    }
    try {
      // Simular adição de transferências à remessa
      setTransferencias(prevTransferencias => 
        prevTransferencias.map(t => 
          selectedForRemessa.includes(t.id) ? { ...t, remessa_id: targetRemessaId } : t
        )
      );
      
      alert(`✅ ${selectedForRemessa.length} transferências adicionadas à remessa com sucesso!`);
      setSelectedForRemessa([]);
      setIsRemessaDialogOpen(false);
    } catch (error) {
      console.error("Erro ao adicionar transferências à remessa:", error);
      alert(`❌ Falha ao adicionar transferências: ${error.message}`);
    }
  };

  const handleReceberClick = (transferencia) => {
    setSelectedTransfer(transferencia);
    setAssociacaoSearchTerm(transferencia.produto_nome); // Preenche a busca com o nome do produto
    setRecebimentoForm({ // Reset form when opening dialog for a new transfer
      observacoes_recebimento: '',
      warehouse_location: '',
      supplier: '',
      invoice_number: '',
      unit_cost: 0
    });
    setIsAssociacaoDialogOpen(true);
  };

  const statusConfig = {
    enviado: { color: "bg-yellow-100 text-yellow-800", text: "Enviado" },
    recebido: { color: "bg-green-100 text-green-800", text: "Recebido" },
    cancelado: { color: "bg-red-100 text-red-800", text: "Cancelado" },
  };

  const filteredProductsForAssociacao = useMemo(() => {
    if (!associacaoSearchTerm) return products.slice(0, 10); // Show a few if search is empty
    const searchTerm = associacaoSearchTerm.toLowerCase();
    return products.filter(p =>
      p.name.toLowerCase().includes(searchTerm) ||
      p.code.toLowerCase().includes(searchTerm)
    ).slice(0, 10); // Limita a 10 resultados para performance
  }, [associacaoSearchTerm, products]);


  if (ticketToPrint) {
    return (
      <>
        <PrintTicketStyle />
        <div className="printable-ticket">
          <TransferenciaTicket transferencia={ticketToPrint} />
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Transferência Simples</h1>
            <p className="text-slate-600">Envio de materiais da Matriz para a Fazenda.</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-96">
            <TabsTrigger value="enviar" className="flex items-center gap-1"><Send className="w-4 h-4" />Enviar</TabsTrigger>
            <TabsTrigger value="receber" className="flex items-center gap-1"><CheckCircle className="w-4 h-4" />Receber</TabsTrigger>
            <TabsTrigger value="historico" className="flex items-center gap-1"><Clock className="w-4 h-4" />Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="enviar">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Enviar Novos Itens</CardTitle>
                </div>
                <Button onClick={() => { setEditingTransfer(null); setShowForm(true); }} className="bg-blue-600 hover:bg-blue-700 shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Envio
                </Button>
              </CardHeader>
              <CardContent>
                <AnimatePresence>
                  {showForm && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
                      <TransferenciaForm 
                        transfer={editingTransfer}
                        onSubmit={handleTransferSubmit} 
                        onCancel={() => { 
                          setShowForm(false); 
                          setEditingTransfer(null); 
                        }} 
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                <h3 className="font-semibold text-lg mb-4">Pendentes de Remessa</h3>
                <p className="text-sm text-slate-500 mb-4">Selecione as transferências que deseja agrupar em uma remessa.</p>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">
                          <Checkbox onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedForRemessa(transferencias.filter(t => !t.remessa_id && t.status === 'enviado').map(t => t.id));
                            } else {
                              setSelectedForRemessa([]);
                            }
                          }} />
                        </TableHead>
                        <TableHead>Nº</TableHead>
                        <TableHead>Produto</TableHead>
                        <TableHead>Qtd.</TableHead>
                        <TableHead>Data Envio</TableHead>
                        <TableHead>Enviado Por</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transferencias.filter(t => !t.remessa_id && t.status === 'enviado').map(t => (
                        <TableRow key={t.id}>
                          <TableCell>
                            <Checkbox 
                              checked={selectedForRemessa.includes(t.id)} 
                              onCheckedChange={(checked) => handleCheckboxChange(t.id, checked)} 
                            />
                          </TableCell>
                          <TableCell className="font-semibold">{t.numero_transferencia}</TableCell>
                          <TableCell>{t.produto_nome}</TableCell>
                          <TableCell>{t.quantidade} {t.unidade_medida}</TableCell>
                          <TableCell>{t.data_envio ? format(new Date(t.data_envio), 'dd/MM/yy') : '-'}</TableCell>
                          <TableCell>{t.enviado_por}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditTransfer(t)}
                                className="hover:bg-blue-50 hover:text-blue-700"
                                title="Editar transferência"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteTransfer(t)}
                                className="hover:bg-red-50 hover:text-red-700"
                                title="Excluir transferência"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="mt-6 flex justify-end">
                  <Dialog open={isRemessaDialogOpen} onOpenChange={setIsRemessaDialogOpen}>
                    <DialogTrigger asChild>
                      <Button disabled={selectedForRemessa.length === 0}><Archive className="w-4 h-4 mr-2" />Adicionar à Remessa</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Adicionar à Remessa</DialogTitle><DialogDescription>Selecione a remessa de destino para as {selectedForRemessa.length} transferências selecionadas.</DialogDescription></DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="remessa_id">Remessas Abertas</Label>
                          <Select onValueChange={setTargetRemessaId}>
                            <SelectTrigger>
                              <SelectValue placeholder="Busque e selecione uma remessa..." />
                            </SelectTrigger>
                            <SelectContent>
                              {remessas.map(r => 
                                <SelectItem key={r.id} value={r.id}>
                                  {r.numero_remessa} ({format(new Date(r.data_remessa), 'dd/MM/yy')}) - {r.motorista || 'Sem motorista'} - {r.veiculo_placa || 'Sem placa'}
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRemessaDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleAddToRemessa}>Confirmar</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="receber">
            <Card>
              <CardHeader><CardTitle>Receber Transferências na Fazenda</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader><TableRow><TableHead>Nº</TableHead><TableHead>Produto</TableHead><TableHead>Qtd.</TableHead><TableHead>Data Envio</TableHead><TableHead>Ação</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {transferencias.filter(t => t.status === 'enviado').map(t => (
                        <TableRow key={t.id} className="hover:bg-slate-50">
                          <TableCell className="font-semibold">{t.numero_transferencia}</TableCell>
                          <TableCell>{t.produto_nome}</TableCell>
                          <TableCell>{t.quantidade} {t.unidade_medida}</TableCell>
                          <TableCell>{t.data_envio ? format(new Date(t.data_envio), 'dd/MM/yy') : '-'}</TableCell>
                          <TableCell>
                            <Button onClick={() => handleReceberClick(t)} className="bg-green-600 hover:bg-green-700" size="sm">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Receber
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historico">
            <Card>
              <CardHeader><CardTitle>Histórico de Transferências</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Nº</TableHead><TableHead>Produto</TableHead><TableHead>Status</TableHead><TableHead>Data Envio</TableHead><TableHead>Data Recebimento</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {transferencias.filter(t => t.status !== 'enviado').map(t => (
                      <TableRow key={t.id}>
                        <TableCell>{t.numero_transferencia}</TableCell>
                        <TableCell>{t.produto_nome}</TableCell>
                        <TableCell><Badge className={statusConfig[t.status]?.color}>{statusConfig[t.status]?.text}</Badge></TableCell>
                        <TableCell>{t.data_envio ? format(new Date(t.data_envio), 'dd/MM/yy') : '-'}</TableCell>
                        <TableCell>{t.data_recebimento ? format(new Date(t.data_recebimento), 'dd/MM/yy') : '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* NOVO MODAL DE ASSOCIAÇÃO */}
      <Dialog open={isAssociacaoDialogOpen} onOpenChange={setIsAssociacaoDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Associar Produto Recebido</DialogTitle>
            <DialogDescription>
              O item <span className="font-bold text-blue-600">"{selectedTransfer?.produto_nome}"</span> foi recebido.
              Confirme se ele corresponde a um item já existente no seu estoque ou cadastre-o como novo.
            </DialogDescription>
          </DialogHeader>

          <div className="my-4">
            <Label htmlFor="search-associacao">Buscar no Estoque Local</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                id="search-associacao"
                value={associacaoSearchTerm}
                onChange={(e) => setAssociacaoSearchTerm(e.target.value)}
                className="pl-10"
                placeholder="Busque por nome ou código..."
              />
            </div>
          </div>

          <div className="border rounded-md max-h-64 overflow-y-auto">
            {filteredProductsForAssociacao.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProductsForAssociacao.map(p => (
                    <TableRow key={p.id}>
                      <TableCell>{p.code}</TableCell>
                      <TableCell>{p.name}</TableCell>
                      <TableCell>
                        <Button size="sm" onClick={() => handleRecebimentoSubmit(p.id)}>Selecionar</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center p-8 text-slate-500">
                <p>Nenhum produto encontrado com o termo "{associacaoSearchTerm}".</p>
                <p className="text-sm mt-2">Você pode cadastrá-lo como um novo item.</p>
              </div>
            )}
          </div>

          <div className="space-y-4 py-4 border-t pt-6">
            <h4 className="text-lg font-semibold mb-4">Detalhes do Recebimento</h4>
            <div className="space-y-2">
              <Label htmlFor="dialog_warehouse_location">Localização no Almoxarifado <span className="text-red-500">*</span></Label>
              <Input
                id="dialog_warehouse_location"
                required
                value={recebimentoForm.warehouse_location}
                onChange={(e) => setRecebimentoForm({ ...recebimentoForm, warehouse_location: e.target.value })}
                placeholder="Ex: FZD-A01, FZD-EPI-02"
              />
              <p className="text-xs text-slate-500">Informe onde o produto será armazenado na fazenda.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dialog_unit_cost">Custo Unitário (R$)</Label>
                <Input
                  id="dialog_unit_cost"
                  type="number"
                  step="0.01"
                  value={recebimentoForm.unit_cost}
                  onChange={(e) => setRecebimentoForm({ ...recebimentoForm, unit_cost: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dialog_supplier">Fornecedor</Label>
                <Input
                  id="dialog_supplier"
                  value={recebimentoForm.supplier}
                  onChange={(e) => setRecebimentoForm({ ...recebimentoForm, supplier: e.target.value })}
                  placeholder="Ex: Transferência da Matriz"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dialog_invoice_number">Número da Nota Fiscal</Label>
              <Input
                id="dialog_invoice_number"
                value={recebimentoForm.invoice_number}
                onChange={(e) => setRecebimentoForm({ ...recebimentoForm, invoice_number: e.target.value })}
                placeholder="Número da NF (opcional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dialog_observacoes_recebimento">Observações do Recebimento</Label>
              <Textarea
                id="dialog_observacoes_recebimento"
                value={recebimentoForm.observacoes_recebimento}
                onChange={(e) => setRecebimentoForm({ ...recebimentoForm, observacoes_recebimento: e.target.value })}
                placeholder="Condições do produto, divergências, etc..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => {
              setIsAssociacaoDialogOpen(false);
              setSelectedTransfer(null);
              setRecebimentoForm({ observacoes_recebimento: '', warehouse_location: '', supplier: '', invoice_number: '', unit_cost: 0 });
            }}>Cancelar</Button>
            <Button onClick={handleCreateAndReceive} className="bg-green-700 hover:bg-green-800">
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar como Novo e Receber
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TransferenciaForm({ transfer, onSubmit, onCancel }) {
  const [produtoNome, setProdutoNome] = useState(transfer?.produto_nome || '');
  const [quantidade, setQuantidade] = useState(transfer?.quantidade || '');
  const [unidade, setUnidade] = useState(transfer?.unidade_medida || 'UN');
  const [observacoes, setObservacoes] = useState(transfer?.observacoes_origem || '');

  // Reset form fields when 'transfer' prop changes (e.g., when switching from edit to new)
  useEffect(() => {
    if (transfer) {
      setProdutoNome(transfer.produto_nome);
      setQuantidade(transfer.quantidade);
      setUnidade(transfer.unidade_medida);
      setObservacoes(transfer.observacoes_origem);
    } else {
      setProdutoNome('');
      setQuantidade('');
      setUnidade('UN');
      setObservacoes('');
    }
  }, [transfer]);


  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      produto_nome: produtoNome,
      quantidade: parseFloat(quantidade),
      unidade_medida: unidade,
      observacoes_origem: observacoes,
    });
  };

  return (
    <Card className="bg-slate-50 border-l-4 border-blue-500">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="produto_nome">Nome do Produto</Label>
              <Input id="produto_nome" value={produtoNome} onChange={e => setProdutoNome(e.target.value)} required />
            </div>
            <div className="flex gap-2">
              <div className="flex-grow space-y-1">
                <Label htmlFor="quantidade">Quantidade</Label>
                <Input id="quantidade" type="number" value={quantidade} onChange={e => setQuantidade(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="unidade">Unidade</Label>
                <Select value={unidade} onValueChange={setUnidade}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UN">UN</SelectItem>
                    <SelectItem value="PC">PC</SelectItem>
                    <SelectItem value="CX">CX</SelectItem>
                    <SelectItem value="L">L</SelectItem>
                    <SelectItem value="KG">KG</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea id="observacoes" value={observacoes} onChange={e => setObservacoes(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
            <Button type="submit">
              {transfer ? 'Atualizar' : 'Enviar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
