import React, { useState, useEffect } from 'react';
import { RecurringCost, FinancialAccount, Contact, FinancialTransaction } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Power, PowerOff, Sparkles, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import RecurringCostForm from './RecurringCostForm';
import { startOfMonth, endOfMonth, format } from 'date-fns';

export default function RecurringCostManager() {
    const [costs, setCosts] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingCost, setEditingCost] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [costData, accData, contData] = await Promise.all([
                RecurringCost.list('-created_date'),
                FinancialAccount.list(),
                Contact.list()
            ]);
            setCosts(costData);
            setAccounts(accData);
            setContacts(contData);
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFormSubmit = async (data) => {
        try {
            if (editingCost) {
                await RecurringCost.update(editingCost.id, data);
            } else {
                await RecurringCost.create(data);
            }
            setShowForm(false);
            setEditingCost(null);
            loadData();
        } catch (error) {
            console.error("Erro ao salvar custo:", error);
        }
    };

    const handleDelete = async (id) => {
        if (confirm("Tem certeza que deseja excluir este modelo de custo? A ação não pode ser desfeita.")) {
            await RecurringCost.delete(id);
            loadData();
        }
    };
    
    const toggleActive = async (cost) => {
        await RecurringCost.update(cost.id, { is_active: !cost.is_active });
        loadData();
    };
    
    const handleGenerateTransactions = async () => {
        setIsGenerating(true);
        let generatedCount = 0;
        let skippedCount = 0;
        const now = new Date();
        const periodStart = startOfMonth(now);
        const periodEnd = endOfMonth(now);

        try {
            const activeCosts = costs.filter(c => c.is_active);
            if (activeCosts.length === 0) {
                alert("Nenhum custo fixo ativo para gerar lançamentos.");
                setIsGenerating(false);
                return;
            }

            for (const cost of activeCosts) {
                const dueDate = new Date(now.getFullYear(), now.getMonth(), cost.day_of_month);
                
                // Verificar se já existe um lançamento para este custo neste mês
                const existing = await FinancialTransaction.filter({
                    recurring_cost_id: cost.id,
                    due_date: { gte: format(periodStart, 'yyyy-MM-dd'), lte: format(periodEnd, 'yyyy-MM-dd') }
                });

                if (existing.length === 0) {
                    await FinancialTransaction.create({
                        description: cost.description,
                        amount: -Math.abs(cost.amount), // Despesa é sempre negativa
                        type: 'despesa',
                        category: cost.category,
                        status: 'pendente',
                        due_date: format(dueDate, 'yyyy-MM-dd'),
                        account_id: cost.account_id,
                        contact_id: cost.contact_id,
                        is_recurring: true,
                        recurring_cost_id: cost.id,
                    });
                    generatedCount++;
                } else {
                    skippedCount++;
                }
            }
            alert(`Processo concluído!\n\n${generatedCount} lançamentos gerados.\n${skippedCount} lançamentos já existentes foram ignorados.`);
        } catch (error) {
            console.error("Erro ao gerar lançamentos:", error);
            alert("Ocorreu um erro ao gerar os lançamentos. Verifique o console para mais detalhes.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-6">
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>O que são Custos Fixos?</AlertTitle>
                <AlertDescription>
                    Cadastre aqui suas despesas recorrentes (aluguel, salários, internet). Depois, clique em "Gerar Lançamentos" para criar automaticamente todas as despesas do mês atual na aba "Lançamentos".
                </AlertDescription>
            </Alert>
            
            <div className="flex justify-between items-center">
                <Button onClick={() => { setEditingCost(null); setShowForm(true); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Custo Fixo
                </Button>
                 <Button onClick={handleGenerateTransactions} disabled={isGenerating}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    {isGenerating ? "Gerando..." : `Gerar Lançamentos de ${format(new Date(), 'MMMM')}`}
                </Button>
            </div>
            
            {showForm && (
                <RecurringCostForm
                    cost={editingCost}
                    accounts={accounts}
                    contacts={contacts}
                    onSubmit={handleFormSubmit}
                    onCancel={() => { setShowForm(false); setEditingCost(null); }}
                />
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Modelos de Custos Fixos</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Descrição</TableHead>
                                <TableHead>Valor Mensal</TableHead>
                                <TableHead>Vencimento</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan="5">Carregando...</TableCell></TableRow>
                            ) : (
                                costs.map(cost => (
                                    <TableRow key={cost.id} className={!cost.is_active ? 'bg-slate-50 text-slate-500' : ''}>
                                        <TableCell>{cost.description}</TableCell>
                                        <TableCell>R$ {cost.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                                        <TableCell>Dia {cost.day_of_month}</TableCell>
                                        <TableCell>
                                            <Badge variant={cost.is_active ? 'default' : 'outline'}>{cost.is_active ? 'Ativo' : 'Inativo'}</Badge>
                                        </TableCell>
                                        <TableCell className="flex gap-1">
                                            <Button variant="ghost" size="icon" onClick={() => toggleActive(cost)}>
                                                {cost.is_active ? <PowerOff className="w-4 h-4 text-red-500" /> : <Power className="w-4 h-4 text-green-500" />}
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => { setEditingCost(cost); setShowForm(true); }}>
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(cost.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}