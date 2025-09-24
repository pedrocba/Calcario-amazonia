
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Printer, Truck, Check, Package, Calendar as CalendarIcon, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import RemessaTicket from '../components/remessas/RemessaTicket';
import PrintTicketStyle from '../components/ui/PrintTicketStyle';
import { motion } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function RemessasPage() {
    // Dados de exemplo (mock data) para substituir as chamadas de API
    const mockRemessas = [
        { id: 1, numero_remessa: 'REM000001', data_remessa: '2024-01-15T10:00:00Z', status: 'aberta', observacoes: 'Remessa para fazenda', motorista: 'João Silva', veiculo_placa: 'ABC-1234' },
        { id: 2, numero_remessa: 'REM000002', data_remessa: '2024-01-14T14:30:00Z', status: 'enviada', observacoes: 'Materiais de manutenção', motorista: 'Maria Santos', veiculo_placa: 'DEF-5678' },
        { id: 3, numero_remessa: 'REM000003', data_remessa: '2024-01-13T09:15:00Z', status: 'recebida', observacoes: 'Peças de reposição', motorista: 'Pedro Costa', veiculo_placa: 'GHI-9012' }
    ];

    const mockTransferencias = [
        { id: 1, remessa_id: 1, numero_transferencia: 'TRF000001', produto_nome: 'Cimento Portland', quantidade: 50, unidade_medida: 'KG', status: 'enviado' },
        { id: 2, remessa_id: 1, numero_transferencia: 'TRF000002', produto_nome: 'Areia Fina', quantidade: 100, unidade_medida: 'KG', status: 'enviado' },
        { id: 3, remessa_id: 2, numero_transferencia: 'TRF000003', produto_nome: 'Brita 1', quantidade: 80, unidade_medida: 'KG', status: 'enviado' },
        { id: 4, remessa_id: null, numero_transferencia: 'TRF000004', produto_nome: 'Cal Hidratada', quantidade: 30, unidade_medida: 'KG', status: 'enviado' }
    ];

    const [remessas, setRemessas] = useState([]);
    const [transferencias, setTransferencias] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [ticketToPrint, setTicketToPrint] = useState(null);
    const [editingRemessa, setEditingRemessa] = useState(null);
    const [showRemessaForm, setShowRemessaForm] = useState(false);

    useEffect(() => {
        // Carregar dados de exemplo
        setRemessas(mockRemessas);
        setTransferencias(mockTransferencias);

        const handleAfterPrint = () => {
            setTicketToPrint(null);
        };

        window.addEventListener('afterprint', handleAfterPrint);
        return () => window.removeEventListener('afterprint', handleAfterPrint);
    }, []);

    const handleCreateRemessa = async (remessaData = null) => {
        try {
            if (editingRemessa && remessaData) {
                // Simular edição de remessa existente
                setRemessas(prevRemessas => 
                    prevRemessas.map(r => r.id === editingRemessa.id ? { ...r, ...remessaData } : r)
                );
                setEditingRemessa(null);
                alert("Remessa atualizada com sucesso!");
            } else {
                // Simular criação de nova remessa
                const lastRemessa = remessas[0];
                const lastNumber = lastRemessa ? parseInt(lastRemessa.numero_remessa.replace(/\D/g, ''), 10) : 0;
                const nextNumber = lastNumber + 1;
                const numeroRemessa = `REM${String(nextNumber).padStart(6, '0')}`;

                const novaRemessa = {
                    id: Math.max(...remessas.map(r => r.id)) + 1,
                    numero_remessa: numeroRemessa,
                    data_remessa: new Date().toISOString(),
                    status: 'aberta',
                    observacoes: '',
                    motorista: '',
                    veiculo_placa: ''
                };

                setRemessas(prevRemessas => [novaRemessa, ...prevRemessas]);
                alert("Remessa criada com sucesso!");
            }
            
            setShowRemessaForm(false);
        } catch (error) {
            console.error("Erro ao salvar remessa:", error);
            alert("Falha ao salvar remessa.");
        }
    };

    const handleEditRemessa = (remessa) => {
        if (remessa.items && remessa.items.length > 0) {
            alert("Não é possível editar uma remessa que já possui itens associados.");
            return;
        }
        setEditingRemessa(remessa);
        setShowRemessaForm(true);
    };

    const handleDeleteRemessa = async (remessa) => {
        if (remessa.items && remessa.items.length > 0) {
            alert("Não é possível excluir uma remessa que possui itens associados. Remova os itens primeiro.");
            return;
        }

        if (!confirm(`Tem certeza que deseja excluir a remessa ${remessa.numero_remessa}?\n\nEsta ação não pode ser desfeita!`)) {
            return;
        }

        try {
            // Simular exclusão da remessa
            setRemessas(prevRemessas => prevRemessas.filter(r => r.id !== remessa.id));
            alert("Remessa excluída com sucesso!");
        } catch (error) {
            console.error("Erro ao excluir remessa:", error);
            alert("Erro ao excluir remessa. Tente novamente.");
        }
    };

    const handlePrintTicket = (remessa, items) => {
        setTicketToPrint({ remessa, items });
        setTimeout(() => window.print(), 300);
    };
    
    const remessasComItems = useMemo(() => {
        return remessas.map(remessa => ({
            ...remessa,
            items: transferencias.filter(t => t.remessa_id === remessa.id)
        }));
    }, [remessas, transferencias]);

    const statusConfig = {
        aberta: { color: "bg-blue-100 text-blue-800", text: "Aberta" },
        enviada: { color: "bg-orange-100 text-orange-800", text: "Enviada" },
        recebida: { color: "bg-green-100 text-green-800", text: "Recebida" }
    };

    return (
        <>
            <PrintTicketStyle />

            <div className={ticketToPrint ? 'hidden' : ''}>
                <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 mb-2">Gestão de Remessas</h1>
                                <p className="text-slate-600">Agrupe e envie múltiplas transferências de uma só vez.</p>
                            </div>
                            <Button onClick={() => { setEditingRemessa(null); setShowRemessaForm(true); }} className="bg-blue-600 hover:bg-blue-700 shadow-lg">
                                <Plus className="w-5 h-5 mr-2" />
                                Criar Nova Remessa
                            </Button>
                        </div>

                        {showRemessaForm && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-8 overflow-hidden">
                                <RemessaForm 
                                    remessa={editingRemessa}
                                    onSubmit={handleCreateRemessa}
                                    onCancel={() => { 
                                        setShowRemessaForm(false); 
                                        setEditingRemessa(null); 
                                    }}
                                />
                            </motion.div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {isLoading ? (
                                Array(3).fill(0).map((_, i) => <Card key={i} className="h-48 animate-pulse bg-slate-200"></Card>)
                            ) : (
                                remessasComItems.map(({ id, numero_remessa, data_remessa, status, items, observacoes, motorista, veiculo_placa }) => (
                                    <Card key={id} className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow flex flex-col">
                                        <CardHeader>
                                            <div className="flex justify-between items-start">
                                                <CardTitle className="text-lg font-bold text-slate-800">{numero_remessa}</CardTitle>
                                                <Badge className={statusConfig[status].color}>{statusConfig[status].text}</Badge>
                                            </div>
                                            <CardDescription className="flex items-center gap-2 text-sm text-slate-500 pt-1">
                                                <CalendarIcon className="w-4 h-4" />
                                                {format(new Date(data_remessa), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex-grow">
                                            <div className="flex items-center gap-2 text-slate-700">
                                                <Package className="w-5 h-5 text-blue-600"/>
                                                <span className="font-medium">{items.length}</span> 
                                                <span>{items.length === 1 ? 'item na remessa' : 'itens na remessa'}</span>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="flex gap-2">
                                            <Button 
                                                variant="outline" 
                                                className="flex-1"
                                                onClick={() => handlePrintTicket({ id, numero_remessa, data_remessa, status, observacoes, motorista, veiculo_placa }, items)}
                                            >
                                                <Printer className="w-4 h-4 mr-2" />
                                                Imprimir
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEditRemessa({ id, numero_remessa, data_remessa, status, items, observacoes, motorista, veiculo_placa })}
                                                className="hover:bg-blue-50 hover:text-blue-700"
                                                title="Editar remessa"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteRemessa({ id, numero_remessa, data_remessa, status, items })}
                                                className="hover:bg-red-50 hover:text-red-700"
                                                title="Excluir remessa"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))
                            )}
                        </div>
                        {!isLoading && remessasComItems.length === 0 && (
                            <div className="text-center py-12 text-slate-500">
                                <Truck className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                                <h3 className="text-lg font-medium">Nenhuma remessa criada ainda</h3>
                                <p>Clique em "Criar Nova Remessa" para começar.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {ticketToPrint && (
                <div className="printable-ticket">
                    <RemessaTicket remessa={ticketToPrint.remessa} items={ticketToPrint.items} />
                </div>
            )}
        </>
    );
}

function RemessaForm({ remessa, onSubmit, onCancel }) {
    const [observacoes, setObservacoes] = useState(remessa?.observacoes || '');
    const [motorista, setMotorista] = useState(remessa?.motorista || '');
    const [veiculoPlaca, setVeiculoPlaca] = useState(remessa?.veiculo_placa || '');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            observacoes,
            motorista,
            veiculo_placa: veiculoPlaca
        });
    };

    return (
        <Card className="bg-slate-50 border-l-4 border-blue-500">
            <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="motorista">Motorista</Label>
                            <Input 
                                id="motorista" 
                                value={motorista} 
                                onChange={e => setMotorista(e.target.value)} 
                                placeholder="Nome do motorista"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="veiculo_placa">Placa do Veículo</Label>
                            <Input 
                                id="veiculo_placa" 
                                value={veiculoPlaca} 
                                onChange={e => setVeiculoPlaca(e.target.value)} 
                                placeholder="Ex: ABC-1234"
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="observacoes">Observações</Label>
                        <Textarea 
                            id="observacoes" 
                            value={observacoes} 
                            onChange={e => setObservacoes(e.target.value)}
                            placeholder="Observações sobre a remessa..."
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
                        <Button type="submit">
                            {remessa ? 'Atualizar' : 'Criar'} Remessa
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
