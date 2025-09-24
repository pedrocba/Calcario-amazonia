import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Database, 
  Sync,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import financialSyncService from '@/api/financialSyncService';

export default function FinancialSyncManager({ companyId, onSyncComplete }) {
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [contasAReceber, setContasAReceber] = useState([]);
  const [integrityCheck, setIntegrityCheck] = useState(null);
  const [lastSync, setLastSync] = useState(null);

  useEffect(() => {
    if (companyId) {
      loadContasAReceber();
      checkIntegrity();
    }
  }, [companyId]);

  const loadContasAReceber = async () => {
    try {
      const data = await financialSyncService.getContasAReceber(companyId);
      setContasAReceber(data);
    } catch (error) {
      console.error('Erro ao carregar contas a receber:', error);
    }
  };

  const checkIntegrity = async () => {
    try {
      const result = await financialSyncService.verificarIntegridade(companyId);
      setIntegrityCheck(result);
    } catch (error) {
      console.error('Erro na verificação de integridade:', error);
    }
  };

  const handleFullSync = async () => {
    setIsLoading(true);
    setSyncStatus({ type: 'loading', message: 'Sincronizando todas as vendas...' });

    try {
      const result = await financialSyncService.syncAllFaturamentoWithFinance(companyId);
      
      setSyncStatus({ 
        type: 'success', 
        message: 'Sincronização completa realizada com sucesso!' 
      });
      
      setLastSync(new Date());
      
      // Recarregar dados
      await loadContasAReceber();
      await checkIntegrity();
      
      if (onSyncComplete) {
        onSyncComplete();
      }

    } catch (error) {
      setSyncStatus({ 
        type: 'error', 
        message: `Erro na sincronização: ${error.message}` 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForceSyncVenda = async (vendaId) => {
    setIsLoading(true);
    setSyncStatus({ type: 'loading', message: `Sincronizando venda ${vendaId}...` });

    try {
      await financialSyncService.forceSyncVenda(vendaId, companyId);
      
      setSyncStatus({ 
        type: 'success', 
        message: `Venda ${vendaId} sincronizada com sucesso!` 
      });
      
      // Recarregar dados
      await loadContasAReceber();
      await checkIntegrity();

    } catch (error) {
      setSyncStatus({ 
        type: 'error', 
        message: `Erro ao sincronizar venda: ${error.message}` 
      });
    } finally {
      setIsLoading(false);
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

  return (
    <div className="space-y-6">
      {/* Status da Sincronização */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sync className="h-5 w-5" />
            Sincronização Financeira
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Botões de Ação */}
          <div className="flex gap-2">
            <Button 
              onClick={handleFullSync}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Sincronizar Tudo
            </Button>
            
            <Button 
              onClick={checkIntegrity}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              Verificar Integridade
            </Button>
          </div>

          {/* Status da Sincronização */}
          {syncStatus && (
            <div className={`p-4 rounded-lg border ${
              syncStatus.type === 'error' ? 'border-red-200 bg-red-50' : 
              syncStatus.type === 'success' ? 'border-green-200 bg-green-50' : 
              'border-blue-200 bg-blue-50'
            }`}>
              <div className="flex items-center gap-2">
                {syncStatus.type === 'error' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                {syncStatus.type === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
                {syncStatus.type === 'loading' && <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />}
                {syncStatus.message}
              </div>
            </div>
          )}

          {/* Informações de Integridade */}
          {integrityCheck && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {integrityCheck.faturasSemTransacao}
                </div>
                <div className="text-sm text-gray-600">Faturas sem Transação</div>
              </div>
              
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {integrityCheck.parcelasSemTransacao}
                </div>
                <div className="text-sm text-gray-600">Parcelas sem Transação</div>
              </div>
              
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {integrityCheck.totalProblemas}
                </div>
                <div className="text-sm text-gray-600">Total de Problemas</div>
              </div>
            </div>
          )}

          {/* Última Sincronização */}
          {lastSync && (
            <div className="text-sm text-gray-600">
              <strong>Última sincronização:</strong> {formatDate(lastSync.toISOString())}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo das Contas a Receber */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Contas a Receber ({contasAReceber.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {contasAReceber.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhuma conta a receber encontrada.</p>
              <p className="text-sm">Execute a sincronização para carregar as vendas faturadas.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {contasAReceber.slice(0, 5).map((conta) => (
                <div key={conta.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{conta.description}</div>
                    <div className="text-sm text-gray-600">
                      {conta.contact?.name || 'Cliente não identificado'} • 
                      Vencimento: {formatDate(conta.due_date)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      {formatCurrency(conta.amount)}
                    </div>
                    <Badge variant={conta.status === 'pago' ? 'default' : 'secondary'}>
                      {conta.status === 'pago' ? 'Pago' : 'Pendente'}
                    </Badge>
                  </div>
                </div>
              ))}
              
              {contasAReceber.length > 5 && (
                <div className="text-center text-sm text-gray-500">
                  ... e mais {contasAReceber.length - 5} contas
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
