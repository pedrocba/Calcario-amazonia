import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  DollarSign,
  Calendar,
  RefreshCw,
  Eye,
  Download,
  Plus
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';
import unifiedFinancialService from '@/api/unifiedFinancialService';

export default function AberturaFechamentoCaixa({ companyId, accounts, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessoes, setSessoes] = useState([]);
  const [sessaoAtual, setSessaoAtual] = useState(null);
  const [showAberturaModal, setShowAberturaModal] = useState(false);
  const [showFechamentoModal, setShowFechamentoModal] = useState(false);
  const [formData, setFormData] = useState({
    observacoes: '',
    saldo_inicial: ''
  });

  // Função para converter UUID para formato correto
  const formatUUID = (uuid) => {
    console.log('🔧 formatUUID - Input:', uuid, 'Length:', uuid?.length);
    if (!uuid) return uuid;
    
    // Se já tem hífens, retorna como está
    if (uuid.includes('-')) {
      console.log('🔧 formatUUID - Already has hyphens:', uuid);
      return uuid;
    }
    
    // Se tem 32 caracteres, adiciona hífens
    if (uuid.length === 32) {
      const formatted = `${uuid.slice(0, 8)}-${uuid.slice(8, 12)}-${uuid.slice(12, 16)}-${uuid.slice(16, 20)}-${uuid.slice(20, 32)}`;
      console.log('🔧 formatUUID - 32 chars formatted:', formatted);
      return formatted;
    }
    
    // Se tem 24 caracteres, adiciona hífens no formato correto
    if (uuid.length === 24) {
      // Para 24 caracteres, precisamos adicionar 12 caracteres para completar o UUID
      const paddedUuid = uuid + '000000000000'; // Adiciona 12 zeros
      const formatted = `${paddedUuid.slice(0, 8)}-${paddedUuid.slice(8, 12)}-${paddedUuid.slice(12, 16)}-${paddedUuid.slice(16, 20)}-${paddedUuid.slice(20, 32)}`;
      console.log('🔧 formatUUID - 24 chars formatted:', formatted);
      return formatted;
    }
    
    console.log('🔧 formatUUID - No conversion needed:', uuid);
    return uuid;
  };

  useEffect(() => {
    loadSessoes();
    checkSessaoAtual();
  }, [companyId]);

  const loadSessoes = async () => {
    setLoading(true);
    try {
      // Converter companyId para formato UUID correto
      const companyIdFormatted = formatUUID(companyId);
        
      const { data, error } = await supabase
        .from('operacoes_caixa')
        .select('*')
        .eq('company_id', companyIdFormatted)
        .order('data_abertura', { ascending: false });

      if (error) throw error;
      setSessoes(data || []);
    } catch (err) {
      console.error('Erro ao carregar sessões:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkSessaoAtual = async () => {
    try {
      const hoje = new Date().toISOString().split('T')[0];
      
      // Converter companyId para formato UUID correto
      const companyIdFormatted = formatUUID(companyId);
      
      const { data, error } = await supabase
        .from('operacoes_caixa')
        .select('*')
        .eq('company_id', companyIdFormatted)
        .eq('data_abertura', hoje)
        .is('data_fechamento', null)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setSessaoAtual(data);
    } catch (err) {
      console.error('Erro ao verificar sessão atual:', err);
    }
  };

  const abrirCaixa = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const hoje = new Date().toISOString().split('T')[0];
      
      // Verificar se já existe sessão aberta
      if (sessaoAtual) {
        throw new Error('Já existe uma sessão de caixa aberta para hoje');
      }

      // Converter companyId para formato UUID correto
      const companyIdFormatted = formatUUID(companyId);

      console.log('🔄 Tentando abrir caixa...', {
        companyIdOriginal: companyId,
        companyIdFormatted: companyIdFormatted,
        data_abertura: hoje,
        saldo_inicial: formData.saldo_inicial
      });

      // Verificar se a tabela existe
      console.log('🔍 Verificando tabela operacoes_caixa...');
      const { data: testData, error: testError } = await supabase
        .from('operacoes_caixa')
        .select('id')
        .limit(1);
      
      if (testError) {
        console.error('❌ Erro ao acessar tabela operacoes_caixa:', testError);
        throw new Error(`Tabela operacoes_caixa não acessível: ${testError.message}`);
      }
      
      console.log('✅ Tabela operacoes_caixa acessível:', testData);

      // Criar nova sessão
      const { data, error } = await supabase
        .from('operacoes_caixa')
        .insert([{
          company_id: companyIdFormatted,
          data_abertura: hoje,
          hora_abertura: new Date().toISOString(),
          saldo_inicial: parseFloat(formData.saldo_inicial) || 0,
          observacoes_abertura: formData.observacoes,
          status: 'aberta'
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ Erro do Supabase:', error);
        throw new Error(`Erro ao criar sessão: ${error.message}`);
      }

      console.log('✅ Sessão criada com sucesso:', data);
      setSessaoAtual(data);
      setShowAberturaModal(false);
      resetForm();
      loadSessoes();
      onRefresh();
      
      // Mostrar mensagem de sucesso
      alert('Caixa aberto com sucesso!');
      
    } catch (err) {
      console.error('❌ Erro ao abrir caixa:', err);
      setError(err.message);
      alert(`Erro ao abrir caixa: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fecharCaixa = async () => {
    setLoading(true);
    try {
      if (!sessaoAtual) {
        throw new Error('Nenhuma sessão de caixa aberta');
      }

      // Calcular totais do dia
      const hoje = new Date().toISOString().split('T')[0];
      
      const { data: movimentacoes, error: movError } = await supabase
        .from('financial_transactions')
        .select('amount, type')
        .eq('company_id', companyId)
        .eq('date', hoje);

      if (movError) throw movError;

      const entradas = movimentacoes
        .filter(m => m.type === 'entrada')
        .reduce((sum, m) => sum + Math.abs(parseFloat(m.amount)), 0);
      
      const saidas = movimentacoes
        .filter(m => m.type === 'saida')
        .reduce((sum, m) => sum + Math.abs(parseFloat(m.amount)), 0);

      const saldoFinal = parseFloat(sessaoAtual.saldo_inicial) + entradas - saidas;

      // Atualizar sessão
      const { error } = await supabase
        .from('operacoes_caixa')
        .update({
          data_fechamento: hoje,
          hora_fechamento: new Date().toISOString(),
          saldo_final: saldoFinal,
          total_entradas: entradas,
          total_saidas: saidas,
          observacoes_fechamento: formData.observacoes,
          status: 'fechada'
        })
        .eq('id', sessaoAtual.id);

      if (error) throw error;

      setSessaoAtual(null);
      setShowFechamentoModal(false);
      resetForm();
      loadSessoes();
      onRefresh();
    } catch (err) {
      console.error('Erro ao fechar caixa:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      observacoes: '',
      saldo_inicial: ''
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'aberta':
        return <Badge variant="default" className="bg-green-100 text-green-800">Aberta</Badge>;
      case 'fechada':
        return <Badge variant="secondary">Fechada</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const calcularSaldoAtual = () => {
    if (!sessaoAtual) return 0;
    
    // Aqui você pode implementar o cálculo do saldo atual baseado nas movimentações
    // Por simplicidade, vou retornar o saldo inicial
    return parseFloat(sessaoAtual.saldo_inicial);
  };

  return (
    <div className="space-y-6">
      {/* Status da Sessão Atual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Status do Caixa
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sessaoAtual ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-green-600">Caixa Aberto</h3>
                  <p className="text-sm text-gray-600">
                    Aberto em {new Date(sessaoAtual.hora_abertura).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(calcularSaldoAtual())}
                  </p>
                  <p className="text-sm text-gray-600">Saldo Atual</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => setShowFechamentoModal(true)}
                  variant="destructive"
                >
                  Fechar Caixa
                </Button>
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Detalhes
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-yellow-600 mb-2">Caixa Fechado</h3>
              <p className="text-gray-600 mb-4">Nenhuma sessão de caixa aberta para hoje</p>
              <Button onClick={() => setShowAberturaModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Abrir Caixa
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Histórico de Sessões */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Histórico de Sessões
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Hora Abertura</TableHead>
                <TableHead>Hora Fechamento</TableHead>
                <TableHead>Saldo Inicial</TableHead>
                <TableHead>Saldo Final</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : sessoes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    Nenhuma sessão encontrada
                  </TableCell>
                </TableRow>
              ) : (
                sessoes.map((sessao) => (
                  <TableRow key={sessao.id}>
                    <TableCell>
                      {new Date(sessao.data_abertura).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      {new Date(sessao.hora_abertura).toLocaleTimeString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      {sessao.hora_fechamento 
                        ? new Date(sessao.hora_fechamento).toLocaleTimeString('pt-BR')
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      {formatCurrency(parseFloat(sessao.saldo_inicial))}
                    </TableCell>
                    <TableCell>
                      {sessao.saldo_final 
                        ? formatCurrency(parseFloat(sessao.saldo_final))
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(sessao.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de Abertura de Caixa */}
      <Dialog open={showAberturaModal} onOpenChange={setShowAberturaModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Abrir Caixa</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Saldo Inicial *</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.saldo_inicial}
                onChange={(e) => setFormData(prev => ({ ...prev, saldo_inicial: e.target.value }))}
                placeholder="0,00"
                required
              />
            </div>

            <div>
              <Label>Observações</Label>
              <Textarea
                value={formData.observacoes}
                onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Observações sobre a abertura do caixa"
                rows={3}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">❌ {error}</p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowAberturaModal(false)}>
              Cancelar
            </Button>
            <Button onClick={abrirCaixa} disabled={loading}>
              {loading ? 'Abrindo...' : 'Abrir Caixa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Fechamento de Caixa */}
      <Dialog open={showFechamentoModal} onOpenChange={setShowFechamentoModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fechar Caixa</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Resumo da Sessão</h4>
              <div className="space-y-1 text-sm">
                <p>Saldo Inicial: {formatCurrency(parseFloat(sessaoAtual?.saldo_inicial || 0))}</p>
                <p>Saldo Atual: {formatCurrency(calcularSaldoAtual())}</p>
              </div>
            </div>

            <div>
              <Label>Observações do Fechamento</Label>
              <Textarea
                value={formData.observacoes}
                onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Observações sobre o fechamento do caixa"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowFechamentoModal(false)}>
              Cancelar
            </Button>
            <Button onClick={fecharCaixa} disabled={loading} variant="destructive">
              {loading ? 'Fechando...' : 'Fechar Caixa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
