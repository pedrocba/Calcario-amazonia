import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  RefreshCw,
  Database,
  Settings,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import unifiedFinancialService from '@/api/unifiedFinancialService';

export default function FinancialDiagnostic({ companyId }) {
  const [diagnosticos, setDiagnosticos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (companyId) {
      executarDiagnostico();
    }
  }, [companyId]);

  const executarDiagnostico = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Executando diagnóstico do sistema financeiro...');
      const resultados = await unifiedFinancialService.diagnosticarSistema(companyId);
      setDiagnosticos(resultados);
      console.log('✅ Diagnóstico concluído:', resultados);
    } catch (err) {
      console.error('❌ Erro no diagnóstico:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (tipo) => {
    switch (tipo) {
      case 'sucesso':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'erro':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (tipo) => {
    switch (tipo) {
      case 'sucesso':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'erro':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getModuloIcon = (modulo) => {
    switch (modulo) {
      case 'Banco de Dados':
        return <Database className="h-4 w-4" />;
      case 'Empresa':
        return <Settings className="h-4 w-4" />;
      case 'Contas Financeiras':
        return <DollarSign className="h-4 w-4" />;
      case 'Transações':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const diagnosticosPorModulo = diagnosticos.reduce((acc, diag) => {
    if (!acc[diag.modulo]) {
      acc[diag.modulo] = [];
    }
    acc[diag.modulo].push(diag);
    return acc;
  }, {});

  const totalErros = diagnosticos.filter(d => d.tipo === 'erro').length;
  const totalSucessos = diagnosticos.filter(d => d.tipo === 'sucesso').length;
  const totalInfos = diagnosticos.filter(d => d.tipo === 'info').length;

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Diagnóstico do Sistema Financeiro</h2>
          <p className="text-gray-600">Verificação completa de todos os módulos financeiros</p>
        </div>
        <Button 
          onClick={executarDiagnostico} 
          disabled={loading}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Executando...' : 'Executar Diagnóstico'}
        </Button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Verificações</p>
                <p className="text-2xl font-bold text-gray-900">{diagnosticos.length}</p>
              </div>
              <Info className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sucessos</p>
                <p className="text-2xl font-bold text-green-600">{totalSucessos}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Erros</p>
                <p className="text-2xl font-bold text-red-600">{totalErros}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Informações</p>
                <p className="text-2xl font-bold text-blue-600">{totalInfos}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Geral */}
      {totalErros === 0 ? (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Sistema funcionando perfeitamente!</strong> Todos os módulos financeiros estão operacionais.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Problemas encontrados!</strong> {totalErros} erro(s) detectado(s) que precisam ser corrigidos.
          </AlertDescription>
        </Alert>
      )}

      {/* Erro de carregamento */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Erro no diagnóstico:</strong> {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Resultados por Módulo */}
      <div className="space-y-4">
        {Object.entries(diagnosticosPorModulo).map(([modulo, diags]) => (
          <Card key={modulo}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getModuloIcon(modulo)}
                {modulo}
                <Badge variant="outline" className="ml-auto">
                  {diags.length} verificação(ões)
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {diags.map((diag, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg border ${getStatusColor(diag.tipo)}`}
                  >
                    <div className="flex items-start gap-3">
                      {getStatusIcon(diag.tipo)}
                      <div className="flex-1">
                        <p className="font-medium">{diag.mensagem}</p>
                        {diag.solucao && (
                          <p className="text-sm mt-1 opacity-80">
                            <strong>Solução:</strong> {diag.solucao}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ações Rápidas */}
      {totalErros > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ações Recomendadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Com base nos erros encontrados, aqui estão as ações recomendadas:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                {diagnosticos
                  .filter(d => d.tipo === 'erro' && d.solucao)
                  .map((diag, index) => (
                    <li key={index}>{diag.solucao}</li>
                  ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
