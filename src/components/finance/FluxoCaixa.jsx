import React, { useState, useEffect, useMemo } from 'react';
import { FinancialTransaction, FinancialAccount } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpDown,
  Building2
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function FluxoCaixa({ transactions, accounts, isLoading, refreshData }) {
  
  // Calcular saldos das contas
  const accountBalances = useMemo(() => {
    if (!accounts || !transactions) return [];
    
    return accounts.map(account => {
      const accountTransactions = transactions.filter(t => t.account_id === account.id && t.status === 'pago');
      const balance = accountTransactions.reduce((total, t) => total + t.amount, account.initial_balance || 0);
      return {
        ...account,
        current_balance: balance
      };
    });
  }, [accounts, transactions]);

  const totalBalance = accountBalances.reduce((total, account) => total + account.current_balance, 0);

  // Transações recentes (apenas pagas)
  const recentTransactions = useMemo(() => {
    if (!transactions) return [];
    return transactions
      .filter(t => t.status === 'pago')
      .sort((a, b) => new Date(b.payment_date || b.created_date) - new Date(a.payment_date || a.created_date))
      .slice(0, 10);
  }, [transactions]);

  const getAccountIcon = (type) => {
    switch(type) {
      case 'banco': return <Building2 className="w-4 h-4" />;
      case 'caixa': return <Wallet className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const getAccountName = (id) => accounts?.find(a => a.id === id)?.name || 'N/A';

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-slate-500">Carregando dados do fluxo de caixa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Fluxo de Caixa</h2>
        <p className="text-slate-600">Visualize entradas e saídas já realizadas</p>
      </div>

      {/* Resumo dos Saldos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-2">Saldo Total</p>
                <p className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {Math.abs(totalBalance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <ArrowUpDown className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-2">Contas Ativas</p>
                <p className="text-2xl font-bold text-green-700">{accounts?.filter(a => a.active).length || 0}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 mb-2">Movimentações Pagas</p>
                <p className="text-2xl font-bold text-purple-700">{recentTransactions.length}</p>
              </div>
              <ArrowUpDown className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Saldos por Conta */}
      <Card>
        <CardHeader>
          <CardTitle>Saldo das Contas</CardTitle>
        </CardHeader>
        <CardContent>
          {accountBalances.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p>Nenhuma conta financeira cadastrada.</p>
              <p className="text-sm">Cadastre contas na aba "Contas" para visualizar os saldos.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Conta</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Saldo Inicial</TableHead>
                  <TableHead className="text-right">Saldo Atual</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accountBalances.map(account => (
                  <TableRow key={account.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                          {getAccountIcon(account.type)}
                        </div>
                        <span className="font-medium">{account.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {account.type === 'banco' ? 'Bancária' : account.type === 'caixa' ? 'Caixa' : 'Digital'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      R$ {(account.initial_balance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className={`text-right font-mono font-bold ${account.current_balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      R$ {Math.abs(account.current_balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={account.active ? "default" : "destructive"}>
                        {account.active ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Movimentações Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Últimas Movimentações Realizadas</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p>Nenhuma movimentação paga encontrada.</p>
              <p className="text-sm">As movimentações aparecerão aqui após serem marcadas como "pagas".</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Conta</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map(transaction => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {format(new Date(transaction.payment_date || transaction.created_date), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-slate-500">{transaction.category}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {transaction.type === 'receita' ? 
                          <TrendingUp className="w-4 h-4 text-green-500" /> : 
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        }
                        <span className={transaction.type === 'receita' ? 'text-green-700' : 'text-red-700'}>
                          {transaction.type === 'receita' ? 'Entrada' : 'Saída'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{getAccountName(transaction.account_id)}</TableCell>
                    <TableCell className={`text-right font-mono font-bold ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      R$ {Math.abs(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}