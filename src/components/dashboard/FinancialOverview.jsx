import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, PieChart } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

export default function FinancialOverview({ revenue, expenses, netProfit, transactions, isLoading }) {
  const COLORS = ['#22C55E', '#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6'];
  
  // Dados para gráfico de categorias de despesas
  const expensesByCategory = transactions
    .filter(t => t.type === 'despesa' && t.status === 'pago')
    .reduce((acc, transaction) => {
      const category = transaction.category || 'outros';
      acc[category] = (acc[category] || 0) + Math.abs(transaction.amount);
      return acc;
    }, {});

  const expenseData = Object.keys(expensesByCategory).map((category, index) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    value: expensesByCategory[category],
    fill: COLORS[index % COLORS.length]
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Revenue Card */}
      <Card className="bg-gradient-to-br from-[var(--color-success)]/10 to-[var(--color-success)]/5 border-[var(--color-success)]/20 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-muted)] uppercase tracking-wider mb-2">
                Receitas do Mês
              </p>
              <p className="text-2xl font-bold text-[var(--color-success)]">
                R$ {revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-12 h-12 bg-[var(--color-success)]/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-[var(--color-success)]" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Card */}
      <Card className="bg-gradient-to-br from-[var(--color-danger)]/10 to-[var(--color-danger)]/5 border-[var(--color-danger)]/20 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-muted)] uppercase tracking-wider mb-2">
                Despesas do Mês
              </p>
              <p className="text-2xl font-bold text-[var(--color-danger)]">
                R$ {expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-12 h-12 bg-[var(--color-danger)]/20 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-[var(--color-danger)]" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Net Profit Card */}
      <Card className={`bg-gradient-to-br ${netProfit >= 0 ? 'from-[var(--color-primary)]/10 to-[var(--color-primary)]/5 border-[var(--color-primary)]/20' : 'from-[var(--color-warning)]/10 to-[var(--color-warning)]/5 border-[var(--color-warning)]/20'} shadow-xl`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-muted)] uppercase tracking-wider mb-2">
                Resultado Líquido
              </p>
              <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-[var(--color-primary)]' : 'text-[var(--color-warning)]'}`}>
                R$ {Math.abs(netProfit).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className={`w-12 h-12 ${netProfit >= 0 ? 'bg-[var(--color-primary)]/20' : 'bg-[var(--color-warning)]/20'} rounded-xl flex items-center justify-center`}>
              <DollarSign className={`w-6 h-6 ${netProfit >= 0 ? 'text-[var(--color-primary)]' : 'text-[var(--color-warning)]'}`} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expense Breakdown */}
      <Card className="bg-[var(--color-surface)]/80 backdrop-blur border-0 shadow-xl">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm text-[var(--color-foreground)]">
            <PieChart className="w-4 h-4 text-[var(--color-primary)]" />
            Despesas por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          {expenseData.length > 0 ? (
            <ResponsiveContainer width="100%" height={120}>
              <RechartsPieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={45}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Valor']}
                  contentStyle={{ 
                    backgroundColor: 'var(--color-surface)', 
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-[var(--color-muted)]">
              <p className="text-xs">Sem dados de despesas</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}