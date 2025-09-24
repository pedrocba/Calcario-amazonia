import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FinancialTransaction } from '@/api/entities';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, TrendingUp, TrendingDown } from 'lucide-react';

export default function TransactionList({ transactions, accounts, contacts, isLoading, onEdit, refreshData }) {
    const [filter, setFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const searchTerm = filter.toLowerCase();
            const matchesDesc = t.description.toLowerCase().includes(searchTerm);
            const matchesContact = t.contact_id ? (contacts.find(c => c.id === t.contact_id)?.name || '').toLowerCase().includes(searchTerm) : false;
            const matchesType = typeFilter === 'all' || t.type === typeFilter;
            const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
            return (matchesDesc || matchesContact) && matchesType && matchesStatus;
        });
    }, [transactions, contacts, filter, typeFilter, statusFilter]);

    const getAccountName = (id) => accounts.find(a => a.id === id)?.name || 'N/A';
    const getContactName = (id) => contacts.find(c => c.id === id)?.name || 'N/A';

    const handleDelete = async (id) => {
        if (confirm("Tem certeza que deseja excluir este lançamento?")) {
            try {
                await FinancialTransaction.delete(id);
                await refreshData();
            } catch (error) {
                console.error("Erro ao excluir transação:", error);
            }
        }
    };
    
    return (
        <div className="space-y-4">
            <div className="flex gap-4">
                <Input 
                    placeholder="Filtrar por descrição ou contato..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos os Tipos</SelectItem>
                        <SelectItem value="receita">Receita</SelectItem>
                        <SelectItem value="despesa">Despesa</SelectItem>
                    </SelectContent>
                </Select>
                 <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos os Status</SelectItem>
                        <SelectItem value="pago">Pago</SelectItem>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="atrasado">Atrasado</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Vencimento</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow><TableCell colSpan="5">Carregando...</TableCell></TableRow>
                    ) : (
                        filteredTransactions.map(transaction => (
                            <TableRow key={transaction.id}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {transaction.type === 'receita' ? 
                                            <TrendingUp className="w-5 h-5 text-green-500" /> : 
                                            <TrendingDown className="w-5 h-5 text-red-500" />}
                                        <div>
                                            <p className="font-medium">{transaction.description}</p>
                                            <p className="text-sm text-slate-500">
                                                {getContactName(transaction.contact_id) || getAccountName(transaction.account_id)}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className={`font-bold ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    R$ {Math.abs(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </TableCell>
                                <TableCell>{format(new Date(transaction.due_date), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                                <TableCell>
                                    <Badge variant={transaction.status === 'pago' ? 'default' : 'outline'}>{transaction.status}</Badge>
                                </TableCell>
                                <TableCell className="flex gap-1">
                                    <Button variant="ghost" size="icon" onClick={() => onEdit(transaction)}>
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(transaction.id)}>
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}