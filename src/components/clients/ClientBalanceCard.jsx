import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, DollarSign, Calendar, Eye } from 'lucide-react';
import financialIntegrationService from '@/api/financialIntegrationService';

export default function ClientBalanceCard({ clientId, clientName, compact = false }) {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Usar empresa fixa para simplificar
  const currentCompany = {
    id: '68cacb913d169d191be6c90d',
    name: 'CBA - Santarém (Matriz)'
  };

  useEffect(() => {
    if (clientId && currentCompany?.id) {
      loadClientBalance();
    }
  }, [clientId, currentCompany?.id]);

  const loadClientBalance = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const summary = await financialIntegrationService.getClientFinancialSummary(
        clientId, 
        currentCompany.id
      );
      
      setBalance(summary);
    } catch (err) {
      console.error('Erro ao carregar saldo do cliente:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    if (compact) {
      return (
        <div className="flex items-center justify-center py-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        </div>
      );
    }
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Saldo do Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    if (compact) {
      return (
        <div className="text-center py-2">
          <p className="text-xs text-red-600">Erro</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadClientBalance}
            className="mt-1 text-xs px-2 py-1"
          >
            Tentar
          </Button>
        </div>
      );
    }
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Saldo do Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center py-2">
            <p className="text-sm text-red-600">Erro ao carregar dados</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadClientBalance}
              className="mt-2"
            >
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!balance || (balance.totalVendas === 0 && balance.totalSaldoProdutos === 0)) {
    if (compact) {
      return (
        <div className="text-center py-2">
          <p className="text-xs text-gray-500">Sem vendas</p>
        </div>
      );
    }
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Saldo do Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center py-2">
            <p className="text-sm text-gray-500">Nenhuma venda registrada</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className="text-center py-2 space-y-1">
        <div className="flex items-center justify-center gap-1">
          <Package className="h-3 w-3 text-blue-600" />
          <span className="text-xs font-medium text-gray-600">
            {balance.saldoProdutos} item(s)
          </span>
        </div>
        <div className="text-xs text-gray-500">
          {balance.totalSaldoProdutos.toFixed(2)} ton
        </div>
        {balance.totalPendente > 0 && (
          <div className="text-xs text-orange-600 font-medium">
            R$ {balance.totalPendente.toFixed(2)} pendente
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
          <Package className="h-4 w-4" />
          Saldo do Cliente
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {/* Resumo Financeiro */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Total de Vendas:</span>
            <span className="text-sm font-medium">{formatCurrency(balance.totalVendas)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Valor Pago:</span>
            <span className="text-sm font-medium text-green-600">
              {formatCurrency(balance.totalPago)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Valor Pendente:</span>
            <span className="text-sm font-medium text-orange-600">
              {formatCurrency(balance.totalPendente)}
            </span>
          </div>
        </div>

        {/* Saldo de Produtos */}
        <div className="border-t pt-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-600">Saldo de Produtos:</span>
            <Badge variant="outline" className="text-xs">
              {balance.saldoProdutos} item(s)
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Quantidade Total:</span>
            <span className="text-sm font-medium">
              {balance.totalSaldoProdutos.toFixed(2)} ton
            </span>
          </div>
        </div>

        {/* Última Venda */}
        {balance.ultimaVenda && (
          <div className="border-t pt-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Última Venda:</span>
              <span className="text-xs text-gray-500">
                {formatDate(balance.ultimaVenda)}
              </span>
            </div>
          </div>
        )}

        {/* Botão para ver detalhes */}
        <div className="pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-xs"
            onClick={() => {
              // Aqui você pode implementar navegação para detalhes do cliente
              console.log('Ver detalhes do cliente:', clientId);
            }}
          >
            <Eye className="h-3 w-3 mr-1" />
            Ver Detalhes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
