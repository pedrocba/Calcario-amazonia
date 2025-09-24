
import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Check, X, Printer, Undo, FileCheck2, Clock, CheckCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import RequisicaoForm from "../components/requisicoes/RequisicaoForm";
import RequisicaoList from "../components/requisicoes/RequisicaoList";
import DevolucaoForm from "../components/requisicoes/DevolucaoForm";
import RequisicaoTicket from "../components/requisicoes/RequisicaoTicket";
import PrintTicketStyle from "../components/ui/PrintTicketStyle";

const statusConfig = {
    pendente: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    aguardando_retirada: { label: 'Aguard. Retirada', color: 'bg-blue-100 text-blue-800', icon: FileCheck2 },
    aguardando_devolucao: { label: 'Aguard. Devolução', color: 'bg-orange-100 text-orange-800', icon: Undo },
    concluida: { label: 'Concluída', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    recusada: { label: 'Recusada', color: 'bg-red-100 text-red-800', icon: X }
};

export default function Requisicoes() {
    // Dados de exemplo (mock data) para substituir as chamadas de API
    const mockRequisicoes = [
        { id: 1, numero_requisicao: 'REQ000001', solicitante_id: 1, solicitante_nome: 'João Silva', setor: 'Manutenção', local_uso: 'Fazenda', status: 'pendente', data_solicitacao: '2024-01-15T10:00:00Z', observacao: 'Materiais para manutenção preventiva', total_itens: 3 },
        { id: 2, numero_requisicao: 'REQ000002', solicitante_id: 2, solicitante_nome: 'Maria Santos', setor: 'Operação', local_uso: 'Matriz', status: 'aguardando_retirada', data_solicitacao: '2024-01-14T14:30:00Z', observacao: 'Ferramentas para operação', total_itens: 2 },
        { id: 3, numero_requisicao: 'REQ000003', solicitante_id: 1, solicitante_nome: 'João Silva', setor: 'Manutenção', local_uso: 'Fazenda', status: 'concluida', data_solicitacao: '2024-01-13T09:15:00Z', observacao: 'Peças de reposição', total_itens: 1 }
    ];

    const mockItems = [
        { id: 1, requisicao_id: 1, produto_id: 1, quantidade_solicitada: 5, quantidade_atendida: 5, unidade_medida: 'UN', observacao_item: 'Chave de fenda', data_devolucao_prevista: '2024-01-20T00:00:00Z', status_devolucao: 'pendente', veiculo_id: 1, veiculo_nome: 'ABC-1234 - Volvo FH 460', hodometro_horimetro: 150000, tipo_servico: 'Manutenção' },
        { id: 2, requisicao_id: 1, produto_id: 2, quantidade_solicitada: 2, quantidade_atendida: 2, unidade_medida: 'UN', observacao_item: 'Parafusos', data_devolucao_prevista: null, status_devolucao: 'nao_aplicavel', veiculo_id: null, veiculo_nome: null, hodometro_horimetro: null, tipo_servico: null },
        { id: 3, requisicao_id: 2, produto_id: 3, quantidade_solicitada: 1, quantidade_atendida: 1, unidade_medida: 'UN', observacao_item: 'Martelo', data_devolucao_prevista: null, status_devolucao: 'nao_aplicavel', veiculo_id: null, veiculo_nome: null, hodometro_horimetro: null, tipo_servico: null }
    ];

    const mockProducts = [
        { id: 1, name: 'Chave de Fenda', code: 'PROD000001', category: 'Ferramentas', active: true },
        { id: 2, name: 'Parafusos', code: 'PROD000002', category: 'Parafusos', active: true },
        { id: 3, name: 'Martelo', code: 'PROD000003', category: 'Ferramentas', active: true }
    ];

    const mockVehicles = [
        { id: 1, plate: 'ABC-1234', brand: 'Volvo', model: 'FH 460', year: 2020, driver_name: 'João Silva' },
        { id: 2, plate: 'DEF-5678', brand: 'Scania', model: 'R 450', year: 2019, driver_name: 'Maria Santos' }
    ];

    const mockStockEntries = [
        { id: 1, product_id: 1, quantity_available: 10, status: 'ativo', entry_date: '2024-01-10T00:00:00Z' },
        { id: 2, product_id: 2, quantity_available: 50, status: 'ativo', entry_date: '2024-01-12T00:00:00Z' },
        { id: 3, product_id: 3, quantity_available: 5, status: 'ativo', entry_date: '2024-01-08T00:00:00Z' }
    ];

    const [requisicoes, setRequisicoes] = useState([]);
    const [items, setItems] = useState([]);
    const [products, setProducts] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [stockEntries, setStockEntries] = useState([]);
    const [currentUser, setCurrentUser] = useState({ id: 1, full_name: 'Administrador', email: 'admin@exemplo.com' });
    const [isLoading, setIsLoading] = useState(false);
    
    const [showForm, setShowForm] = useState(false);
    const [showDevolucaoForm, setShowDevolucaoForm] = useState(false);

    const [selectedRequisicao, setSelectedRequisicao] = useState(null);
    const [ticketToPrint, setTicketToPrint] = useState(null);

    const [activeTab, setActiveTab] = useState('pendente');

    useEffect(() => {
        // Carregar dados de exemplo
        setRequisicoes(mockRequisicoes);
        setItems(mockItems);
        setProducts(mockProducts);
        setStockEntries(mockStockEntries);
        setVehicles(mockVehicles);

        const handleAfterPrint = () => setTicketToPrint(null);
        window.addEventListener('afterprint', handleAfterPrint);
        return () => window.removeEventListener('afterprint', handleAfterPrint);
    }, []);

    const handleCreateRequisicao = async (data) => {
        try {
            // Gerar número da requisição
            const lastReq = requisicoes[0];
            const lastNumber = lastReq ? parseInt(lastReq.numero_requisicao.replace(/\D/g, ''), 10) : 0;
            const nextNumber = isNaN(lastNumber) ? requisicoes.length + 1 : lastNumber + 1;
            const numeroRequisicao = `REQ${String(nextNumber).padStart(6, '0')}`;

            // Simular criação da requisição
            const novaRequisicao = {
                id: Math.max(...requisicoes.map(r => r.id)) + 1,
                numero_requisicao: numeroRequisicao,
                solicitante_id: currentUser.id,
                solicitante_nome: data.solicitante_nome,
                setor: data.solicitante_setor,
                local_uso: data.local_uso,
                status: 'pendente',
                data_solicitacao: new Date().toISOString(),
                observacao: data.observacao,
                total_itens: data.itens.length
            };

            setRequisicoes(prevRequisicoes => [novaRequisicao, ...prevRequisicoes]);

            // Simular criação dos itens da requisição
            const novosItems = data.itens.map((item, index) => {
                const vehicle = vehicles.find(v => v.id === item.veiculo_id);
                return {
                    id: Math.max(...items.map(i => i.id)) + index + 1,
                    requisicao_id: novaRequisicao.id,
                    produto_id: item.produto_id,
                    quantidade_solicitada: item.quantidade,
                    quantidade_atendida: item.quantidade,
                    unidade_medida: item.unidade_medida,
                    observacao_item: item.observacao,
                    data_devolucao_prevista: item.data_devolucao_prevista,
                    status_devolucao: item.eh_ferramenta ? 'pendente' : 'nao_aplicavel',
                    veiculo_id: item.veiculo_id,
                    veiculo_nome: vehicle ? `${vehicle.plate} - ${vehicle.model}` : null,
                    hodometro_horimetro: item.hodometro_horimetro,
                    tipo_servico: item.tipo_servico,
                };
            });

            setItems(prevItems => [...novosItems, ...prevItems]);

            alert(`Requisição ${numeroRequisicao} criada com sucesso!`);
            setShowForm(false);
        } catch (error) {
            console.error("Erro ao criar requisição:", error);
            alert("Erro ao criar requisição. Tente novamente.");
        }
    };
    
    const handleApprove = async (req) => {
        setRequisicoes(prevRequisicoes => 
            prevRequisicoes.map(r => r.id === req.id ? { ...r, status: 'aguardando_retirada' } : r)
        );
        alert('Requisição aprovada com sucesso!');
    };

    const handleReject = async (req) => {
        const motivo = prompt("Qual o motivo da recusa?");
        if (motivo) {
            setRequisicoes(prevRequisicoes => 
                prevRequisicoes.map(r => r.id === req.id ? { ...r, status: 'recusada', motivo_recusa: motivo } : r)
            );
            alert('Requisição recusada!');
        }
    };

    const handleCancelAprovacao = async (req) => {
        if (confirm(`Tem certeza que deseja cancelar a aprovação da requisição ${req.numero_requisicao}? A requisição voltará para o status 'Pendente'.`)) {
            setRequisicoes(prevRequisicoes => 
                prevRequisicoes.map(r => r.id === req.id ? { ...r, status: 'pendente' } : r)
            );
            alert('Aprovação cancelada com sucesso!');
        }
    };
    
    const handleConfirmRetirada = async (req) => {
        try {
            const reqItems = (items || []).filter(i => i.requisicao_id === req.id);
            const hasDevolucao = reqItems.some(i => i.data_devolucao_prevista);
            const newStatus = hasDevolucao ? 'aguardando_devolucao' : 'concluida';

            // Simular atualização do status da requisição
            setRequisicoes(prevRequisicoes => 
                prevRequisicoes.map(r => r.id === req.id ? { 
                    ...r, 
                    status: newStatus,
                    data_retirada: new Date().toISOString()
                } : r)
            );

            // Simular baixa no estoque
            setStockEntries(prevStockEntries => 
                prevStockEntries.map(entry => {
                    const item = reqItems.find(i => i.produto_id === entry.product_id);
                    if (item && entry.status === 'ativo' && entry.quantity_available > 0) {
                        const quantidadeADescontar = Math.min(item.quantidade_atendida || item.quantidade_solicitada, entry.quantity_available);
                        const novaQuantidadeDisponivel = entry.quantity_available - quantidadeADescontar;
                        return {
                            ...entry,
                            quantity_available: novaQuantidadeDisponivel,
                            status: novaQuantidadeDisponivel <= 0 ? 'consumido' : 'ativo'
                        };
                    }
                    return entry;
                })
            );
            
            // Simular atualização dos itens se houver devolução pendente
            setItems(prevItems => 
                prevItems.map(item => {
                    if (reqItems.some(ri => ri.id === item.id) && item.data_devolucao_prevista) {
                        return { ...item, status_devolucao: 'pendente' };
                    }
                    return item;
                })
            );

            alert(`Retirada da requisição ${req.numero_requisicao} confirmada! Baixa no estoque realizada com sucesso.`);
        } catch (error) {
            console.error("Erro ao confirmar retirada:", error);
            alert("Erro ao confirmar retirada. Verifique o console para mais detalhes.");
        }
    };

    const handleOpenDevolucao = (req) => {
        setSelectedRequisicao(req);
        setShowDevolucaoForm(true);
    };

    const handleConfirmDevolucao = async (devolucoes) => {
        const reqId = selectedRequisicao.id;

        try {
            // Simular atualização dos itens da requisição
            setItems(prevItems => 
                prevItems.map(item => {
                    if (devolucoes[item.id]) {
                        const dev = devolucoes[item.id];
                        return {
                            ...item,
                            status_devolucao: 'devolvido',
                            data_devolucao_real: new Date().toISOString(),
                            condicao_devolucao: dev.condicao,
                            observacao_devolucao: dev.observacao
                        };
                    }
                    return item;
                })
            );

            // Simular retorno ao estoque se a condição for boa
            const novasEntradas = [];
            for (const itemId in devolucoes) {
                const dev = devolucoes[itemId];
                const itemRequisitado = items.find(i => i.id === itemId);
                
                if (dev.condicao === 'bom' && itemRequisitado) {
                    const quantidadeDevolvida = itemRequisitado.quantidade_atendida || itemRequisitado.quantidade_solicitada;
                    const novaEntrada = {
                        id: Math.max(...stockEntries.map(e => e.id)) + novasEntradas.length + 1,
                        reference: `DEV-${selectedRequisicao.numero_requisicao}-${itemId.slice(-4)}`,
                        product_id: itemRequisitado.produto_id,
                        warehouse_location: 'PATIO_DEVOLUCAO',
                        setor: selectedRequisicao.setor,
                        origem_entrada: 'devolucao',
                        condicao: 'usado',
                        quantity_received: quantidadeDevolvida,
                        quantity_available: quantidadeDevolvida,
                        unit_cost: 0,
                        status: 'ativo',
                        entry_date: new Date().toISOString()
                    };
                    novasEntradas.push(novaEntrada);
                }
            }

            if (novasEntradas.length > 0) {
                setStockEntries(prevStockEntries => [...novasEntradas, ...prevStockEntries]);
            }
            
            // Verificar se a requisição pode ser concluída
            const allItems = items.filter(i => i.requisicao_id === reqId);
            const allDevolvidos = allItems.every(item => {
                const isDevolvidoAgora = Object.keys(devolucoes).includes(item.id);
                return item.status_devolucao !== 'pendente' || isDevolvidoAgora;
            });

            if (allDevolvidos) {
                setRequisicoes(prevRequisicoes => 
                    prevRequisicoes.map(r => r.id === reqId ? { 
                        ...r, 
                        status: 'concluida',
                        data_devolucao_final: new Date().toISOString()
                    } : r)
                );
            }

            setShowDevolucaoForm(false);
            setSelectedRequisicao(null);
            alert('Devolução registrada com sucesso! Estoque atualizado.');

        } catch (error) {
            console.error("Erro ao confirmar devolução:", error);
            alert("Erro ao processar devolução. Verifique o console para mais detalhes.");
        }
    };

    const handlePrint = (req) => {
        const reqItems = (items || []).filter(item => item.requisicao_id === req.id);
        setTicketToPrint({ requisicao: req, items: reqItems, products });
        setTimeout(() => window.print(), 300);
    };

    const requisicoesComItems = useMemo(() => {
        return (requisicoes || []).map(req => ({
            ...req,
            items: (items || []).filter(item => item.requisicao_id === req.id)
        }));
    }, [requisicoes, items]);

    const groupedRequisicoes = useMemo(() => {
        const groups = {
            pendente: [],
            aguardando_retirada: [],
            aguardando_devolucao: [],
            historico: []
        };
        (requisicoesComItems || []).forEach(req => {
            if (req.status === 'pendente') groups.pendente.push(req);
            else if (req.status === 'aguardando_retirada') groups.aguardando_retirada.push(req);
            else if (req.status === 'aguardando_devolucao') groups.aguardando_devolucao.push(req);
            else if (['concluida', 'recusada'].includes(req.status)) groups.historico.push(req); // Add recusada to historico
        });
        return groups;
    }, [requisicoesComItems]);

    return (
        <>
            <PrintTicketStyle />
            <div className={ticketToPrint ? 'hidden' : ''}>
                <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900">Requisições de Saída</h1>
                                <p className="text-slate-600">Gestão de solicitações, retiradas e devoluções.</p>
                            </div>
                            <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="w-5 h-5 mr-2" />
                                Nova Requisição
                            </Button>
                        </div>

                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="pendente">
                                    Pendentes ({groupedRequisicoes.pendente.length})
                                </TabsTrigger>
                                <TabsTrigger value="aguardando_retirada">
                                    Para Retirada ({groupedRequisicoes.aguardando_retirada.length})
                                </TabsTrigger>
                                <TabsTrigger value="aguardando_devolucao">
                                    Para Devolução ({groupedRequisicoes.aguardando_devolucao.length})
                                </TabsTrigger>
                                <TabsTrigger value="historico">
                                    Histórico ({groupedRequisicoes.historico.length})
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="pendente" className="mt-6">
                                <RequisicaoList 
                                    requisicoes={groupedRequisicoes.pendente}
                                    products={products}
                                    vehicles={vehicles}
                                    isLoading={isLoading}
                                    statusConfig={statusConfig}
                                    actions={{
                                        primary: { label: "Aprovar", icon: Check, handler: handleApprove, variant: "default" },
                                        secondary: { label: "Recusar", icon: X, handler: handleReject, variant: "destructive" },
                                        tertiary: { label: "Imprimir", icon: Printer, handler: handlePrint, variant: "outline" }
                                    }}
                                />
                            </TabsContent>
                            
                            <TabsContent value="aguardando_retirada" className="mt-6">
                                <RequisicaoList 
                                    requisicoes={groupedRequisicoes.aguardando_retirada}
                                    products={products}
                                    vehicles={vehicles}
                                    isLoading={isLoading}
                                    statusConfig={statusConfig}
                                    actions={{
                                        primary: { label: "Confirmar Retirada", icon: CheckCircle, handler: handleConfirmRetirada, variant: "default" },
                                        secondary: { label: "Cancelar Aprovação", icon: Undo, handler: handleCancelAprovacao, variant: "destructive" },
                                        tertiary: { label: "Imprimir Termo", icon: Printer, handler: handlePrint, variant: "outline" }
                                    }}
                                />
                            </TabsContent>

                            <TabsContent value="aguardando_devolucao" className="mt-6">
                                <RequisicaoList 
                                    requisicoes={groupedRequisicoes.aguardando_devolucao}
                                    products={products}
                                    vehicles={vehicles}
                                    isLoading={isLoading}
                                    statusConfig={statusConfig}
                                    actions={{
                                        primary: { label: "Registrar Devolução", icon: Undo, handler: handleOpenDevolucao, variant: "default" },
                                        secondary: { label: "Imprimir Termo", icon: Printer, handler: handlePrint, variant: "outline" }
                                    }}
                                />
                            </TabsContent>
                            
                            <TabsContent value="historico" className="mt-6">
                                <RequisicaoList 
                                    requisicoes={groupedRequisicoes.historico}
                                    products={products}
                                    vehicles={vehicles}
                                    isLoading={isLoading}
                                    statusConfig={statusConfig}
                                    showDetails={true}
                                    actions={{
                                        primary: { label: "Imprimir", icon: Printer, handler: handlePrint, variant: "outline" }
                                    }}
                                />
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>

            {showForm && (
                <RequisicaoForm
                    onCancel={() => setShowForm(false)}
                    onSubmit={handleCreateRequisicao}
                    products={(products || []).filter(p => p.active)}
                    vehicles={vehicles}
                    stockEntries={stockEntries || []}
                    currentUser={currentUser}
                />
            )}

            {showDevolucaoForm && selectedRequisicao && (
                <DevolucaoForm
                    isOpen={showDevolucaoForm}
                    onClose={() => setShowDevolucaoForm(false)}
                    requisicao={selectedRequisicao}
                    items={selectedRequisicao.items || []}
                    products={products || []}
                    onConfirm={handleConfirmDevolucao}
                />
            )}

            {ticketToPrint && (
                <div className="printable-ticket">
                    <RequisicaoTicket 
                        requisicao={ticketToPrint.requisicao}
                        items={ticketToPrint.items}
                        products={ticketToPrint.products}
                    />
                </div>
            )}
        </>
    );
}













