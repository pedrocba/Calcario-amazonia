import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Edit, Trash2, User, Wallet, Package } from 'lucide-react';
import ClientBalanceCard from '../clients/ClientBalanceCard';

export default function CustomerList({ customers, isLoading, onEdit, onDelete }) {
    
    const formatCurrency = (value) => {
        return (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    return (
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    <User className="w-5 h-5 text-blue-600" />
                    Lista de Clientes
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Documento</TableHead>
                                <TableHead>Contato</TableHead>
                                <TableHead className="text-right">Saldo em Conta</TableHead>
                                <TableHead className="text-center">Saldo Produtos</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-16 mx-auto" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                                        <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                customers.map(customer => (
                                    <TableRow key={customer.id}>
                                        <TableCell className="font-medium">{customer.name}</TableCell>
                                        <TableCell>{customer.document}</TableCell>
                                        <TableCell>
                                            <p>{customer.phone}</p>
                                            <p className="text-sm text-slate-500">{customer.email}</p>
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            <span className={customer.current_balance > 0 ? 'text-green-600' : customer.current_balance < 0 ? 'text-red-600' : ''}>
                                                {formatCurrency(customer.current_balance)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <ClientBalanceCard 
                                                clientId={customer.id} 
                                                clientName={customer.name}
                                                compact={true}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={customer.active ? "default" : "destructive"}>
                                                {customer.active ? 'Ativo' : 'Inativo'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => onEdit(customer)}><Edit className="w-4 h-4" /></Button>
                                                {customer.active && <Button variant="ghost" size="icon" onClick={() => onDelete(customer)}><Trash2 className="w-4 h-4 text-red-500" /></Button>}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
                {!isLoading && customers.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                        <User className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                        <p>Nenhum cliente encontrado.</p>
                        <p className="text-sm">Clique em "Novo Cliente" para começar.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}