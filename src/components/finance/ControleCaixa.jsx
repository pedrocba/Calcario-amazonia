
import React, { useState, useEffect, useMemo } from 'react';
import { OperacaoCaixa, FinancialTransaction, FinancialAccount, User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Wallet,
  Clock,
  DollarSign,
  Calculator,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Printer
} from 'lucide-react';
import { format, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCompany } from "../common/CompanyContext";

export default function ControleCaixa() {
  const { currentCompany } = useCompany();
  const [operacoesCaixa, setOperacoesCaixa] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [caixaAberto, setCaixaAberto] = useState(null);
  const [showAbertura, setShowAbertura] = useState(false);
  const [showFechamento, setShowFechamento] = useState(false);
  const [showDetalhes, setShowDetalhes] = useState(false);
  const [operacaoSelecionada, setOperacaoSelecionada] = useState(null);
  
  const [aberturaData, setAberturaData] = useState({
    account_id: '',
    saldo_inicial: '',
    observacoes_abertura: ''
  });

  const [fechamentoData, setFechamentoData] = useState({
    saldo_final_informado: '',
    observacoes_fechamento: ''
  });

  const [movimentacoesDia, setMovimentacoesDia] = useState([]);

  useEffect(() => {
    if (currentCompany) {
      loadData();
      loadCurrentUser();
    }
  }, [currentCompany]);

  const loadCurrentUser = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const companyFilter = { company_id: currentCompany.id };
      const [operacoesData, accountsData] = await Promise.all([
        OperacaoCaixa.filter(companyFilter, '-data_operacao'),
        FinancialAccount.filter({ ...companyFilter, type: 'caixa' })
      ]);
      
      setOperacoesCaixa(operacoesData || []);
      
      // Se não há contas de caixa, criar uma automaticamente
      let accounts = accountsData || [];
      if (accounts.length === 0) {
        console.log("Criando conta de caixa automaticamente...");
        const novaConta = await FinancialAccount.create({
          company_id: currentCompany.id,
          company_name: currentCompany.name,
          name: `Caixa Geral - ${currentCompany.name}`,
          type: 'caixa',
          initial_balance: 0,
          active: true
        });
        accounts = [novaConta];
      }
      
      setAccounts(accounts);
      
      // Verificar se há caixa aberto hoje
      const hoje = format(new Date(), 'yyyy-MM-dd');
      const caixaHoje = operacoesData?.find(op => 
        op.data_operacao === hoje && op.status === 'aberto'
      );
      setCaixaAberto(caixaHoje || null);
      
      // Carregar movimentações do dia se houver caixa aberto
      if (caixaHoje) {
        await loadMovimentacoesDia(caixaHoje.account_id, hoje);
      }
      
    } catch (error) {
      console.error("Erro ao carregar dados do controle de caixa:", error);
    }
    setIsLoading(false);
  };

  const loadMovimentacoesDia = async (accountId, data) => {
    try {
      const startDate = startOfDay(new Date(data));
      const endDate = endOfDay(new Date(data));
      
      const movimentacoes = await FinancialTransaction.filter({
        account_id: accountId,
        status: 'pago',
        payment_date: {
          gte: format(startDate, 'yyyy-MM-dd'),
          lte: format(endDate, 'yyyy-MM-dd')
        }
      }, '-payment_date');
      
      setMovimentacoesDia(movimentacoes || []);
    } catch (error) {
      console.error('Erro ao carregar movimentações do dia:', error);
    }
  };

  const handleAbrirCaixa = async () => {
    if (!aberturaData.account_id || !aberturaData.saldo_inicial) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const hoje = format(new Date(), 'yyyy-MM-dd');
      const agora = format(new Date(), 'HH:mm');
      const account = accounts.find(a => a.id === aberturaData.account_id);

      const operacao = await OperacaoCaixa.create({
        company_id: currentCompany.id,
        company_name: currentCompany.name,
        data_operacao: hoje,
        tipo: 'abertura',
        account_id: aberturaData.account_id,
        account_name: account?.name,
        saldo_inicial: parseFloat(aberturaData.saldo_inicial),
        operador_abertura: currentUser?.full_name || 'Sistema',
        hora_abertura: agora,
        observacoes_abertura: aberturaData.observacoes_abertura,
        status: 'aberto'
      });

      setShowAbertura(false);
      setAberturaData({ account_id: '', saldo_inicial: '', observacoes_abertura: '' });
      await loadData();
      alert('Caixa aberto com sucesso!');
    } catch (error) {
      console.error('Erro ao abrir caixa:', error);
      alert('Erro ao abrir caixa. Tente novamente.');
    }
  };

  const handleFecharCaixa = async () => {
    if (!fechamentoData.saldo_final_informado) {
      alert('Informe o saldo final do caixa.');
      return;
    }

    try {
      const saldoInformado = parseFloat(fechamentoData.saldo_final_informado);
      const saldoCalculado = caixaAberto.saldo_inicial + resumoDia.total_entradas + resumoDia.total_saidas;
      const diferenca = saldoInformado - saldoCalculado;
      const agora = format(new Date(), 'HH:mm');

      await OperacaoCaixa.update(caixaAberto.id, {
        tipo: 'fechamento',
        saldo_final_informado: saldoInformado,
        saldo_final_calculado: saldoCalculado,
        diferenca: diferenca,
        total_entradas: resumoDia.total_entradas,
        total_saidas: Math.abs(resumoDia.total_saidas),
        numero_transacoes: resumoDia.numero_transacoes,
        operador_fechamento: currentUser?.full_name || 'Sistema',
        hora_fechamento: agora,
        observacoes_fechamento: fechamentoData.observacoes_fechamento,
        status: 'fechado'
      });

      setShowFechamento(false);
      setFechamentoData({ saldo_final_informado: '', observacoes_fechamento: '' });
      await loadData();
      
      const mensagem = diferenca === 0 ? 
        'Caixa fechado! Valores conferem perfeitamente.' :
        `Caixa fechado! ${diferenca > 0 ? 'Sobra' : 'Falta'} de R$ ${Math.abs(diferenca).toFixed(2)}.`;
      alert(mensagem);
    } catch (error) {
      console.error('Erro ao fechar caixa:', error);
      alert('Erro ao fechar caixa. Tente novamente.');
    }
  };

  const resumoDia = useMemo(() => {
    const entradas = movimentacoesDia.filter(m => m.amount > 0).reduce((sum, m) => sum + m.amount, 0);
    const saidas = movimentacoesDia.filter(m => m.amount < 0).reduce((sum, m) => sum + m.amount, 0);
    
    return {
      total_entradas: entradas,
      total_saidas: saidas,
      numero_transacoes: movimentacoesDia.length,
      saldo_calculado: caixaAberto ? caixaAberto.saldo_inicial + entradas + saidas : 0
    };
  }, [movimentacoesDia, caixaAberto]);

  const visualizarDetalhes = (operacao) => {
    setOperacaoSelecionada(operacao);
    setShowDetalhes(true);
  };

  const getStatusBadge = (operacao) => {
    if (operacao.status === 'aberto') {
      return <Badge className="bg-green-100 text-green-800">Aberto</Badge>;
    }
    
    if (operacao.diferenca === 0) {
      return <Badge className="bg-blue-100 text-blue-800">Fechado - OK</Badge>;
    } else if (operacao.diferenca > 0) {
      return <Badge className="bg-yellow-100 text-yellow-800">Fechado - Sobra</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">Fechado - Falta</Badge>;
    }
  };

  if (!currentCompany) {
    return <div className="p-6 text-center">Selecione uma filial para gerenciar o caixa.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Status Atual do Caixa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Wallet className="w-6 h-6 text-blue-600" />
            Status do Caixa - {format(new Date(), 'dd/MM/yyyy')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {caixaAberto ? (
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Caixa Aberto</strong> - {caixaAberto.account_name} | 
                  Saldo Inicial: R$ {caixaAberto.saldo_inicial.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} |
                  Aberto às {caixaAberto.hora_abertura} por {caixaAberto.operador_abertura}
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600">Saldo Inicial</p>
                        <p className="text-xl font-bold text-blue-700">
                          R$ {caixaAberto.saldo_inicial.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <DollarSign className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600">Entradas do Dia</p>
                        <p className="text-xl font-bold text-green-700">
                          R$ {resumoDia.total_entradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-red-50 border-red-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-red-600">Saídas do Dia</p>
                        <p className="text-xl font-bold text-red-700">
                          R$ {Math.abs(resumoDia.total_saidas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <XCircle className="w-8 h-8 text-red-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-600">Saldo Atual</p>
                        <p className="text-xl font-bold text-purple-700">
                          R$ {resumoDia.saldo_calculado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <Calculator className="w-8 h-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button onClick={() => setShowFechamento(true)} className="bg-red-600 hover:bg-red-700">
                  <XCircle className="w-4 h-4 mr-2" />
                  Fechar Caixa
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Alert className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Caixa Fechado</strong> - Nenhum caixa está aberto hoje.
                </AlertDescription>
              </Alert>
              <Button onClick={() => setShowAbertura(true)} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                Abrir Caixa
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Movimentações do Dia */}
      {caixaAberto && movimentacoesDia.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Movimentações de Hoje ({movimentacoesDia.length} transações)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hora</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movimentacoesDia.map(mov => (
                  <TableRow key={mov.id}>
                    <TableCell>{format(new Date(mov.payment_date), 'HH:mm')}</TableCell>
                    <TableCell>{mov.description}</TableCell>
                    <TableCell>
                      <Badge className={mov.amount > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {mov.amount > 0 ? 'Entrada' : 'Saída'}
                      </Badge>
                    </TableCell>
                    <TableCell className={`text-right font-mono ${mov.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      R$ {Math.abs(mov.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Histórico de Operações */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Operações de Caixa</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Conta</TableHead>
                <TableHead>Operador</TableHead>
                <TableHead>Saldo Inicial</TableHead>
                <TableHead>Entradas</TableHead>
                <TableHead>Saídas</TableHead>
                <TableHead>Saldo Final</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {operacoesCaixa.map(operacao => (
                <TableRow key={operacao.id}>
                  <TableCell>{format(new Date(operacao.data_operacao), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{operacao.account_name}</TableCell>
                  <TableCell className="text-sm">
                    <div>
                      <p>{operacao.operador_abertura}</p>
                      {operacao.operador_fechamento && (
                        <p className="text-slate-500">{operacao.operador_fechamento}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">
                    R$ {operacao.saldo_inicial.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="font-mono text-green-600">
                    R$ {(operacao.total_entradas || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="font-mono text-red-600">
                    R$ {(operacao.total_saidas || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="font-mono">
                    {operacao.saldo_final_informado ? 
                      `R$ ${operacao.saldo_final_informado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 
                      '-'
                    }
                  </TableCell>
                  <TableCell>{getStatusBadge(operacao)}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => visualizarDetalhes(operacao)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de Abertura */}
      <Dialog open={showAbertura} onOpenChange={setShowAbertura}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Abrir Caixa - {format(new Date(), 'dd/MM/yyyy')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="account_id">Conta de Caixa *</Label>
              <Select value={aberturaData.account_id} onValueChange={(value) => setAberturaData(prev => ({...prev, account_id: value}))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a conta de caixa" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="saldo_inicial">Saldo Inicial (R$) *</Label>
              <Input
                id="saldo_inicial"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={aberturaData.saldo_inicial}
                onChange={(e) => setAberturaData(prev => ({...prev, saldo_inicial: e.target.value}))}
              />
              <p className="text-xs text-slate-500 mt-1">Informe o valor em dinheiro no caixa</p>
            </div>
            
            <div>
              <Label htmlFor="observacoes_abertura">Observações</Label>
              <Textarea
                id="observacoes_abertura"
                placeholder="Observações sobre a abertura do caixa..."
                value={aberturaData.observacoes_abertura}
                onChange={(e) => setAberturaData(prev => ({...prev, observacoes_abertura: e.target.value}))}
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAbertura(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAbrirCaixa} className="bg-green-600 hover:bg-green-700">
                Abrir Caixa
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Fechamento */}
      <Dialog open={showFechamento} onOpenChange={setShowFechamento}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fechar Caixa - {format(new Date(), 'dd/MM/yyyy')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Resumo do Dia</h4>
              <div className="space-y-1 text-sm">
                <p>Saldo Inicial: R$ {caixaAberto?.saldo_inicial.toFixed(2)}</p>
                <p className="text-green-600">Entradas: R$ {resumoDia.total_entradas.toFixed(2)}</p>
                <p className="text-red-600">Saídas: R$ {Math.abs(resumoDia.total_saidas).toFixed(2)}</p>
                <p className="font-bold border-t pt-1">Saldo Calculado: R$ {resumoDia.saldo_calculado.toFixed(2)}</p>
                <p className="text-xs text-slate-500">{resumoDia.numero_transacoes} transações realizadas</p>
              </div>
            </div>
            
            <div>
              <Label htmlFor="saldo_final_informado">Saldo Final - Contagem Física (R$) *</Label>
              <Input
                id="saldo_final_informado"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={fechamentoData.saldo_final_informado}
                onChange={(e) => setFechamentoData(prev => ({...prev, saldo_final_informado: e.target.value}))}
              />
              <p className="text-xs text-slate-500 mt-1">Conte o dinheiro físico no caixa</p>
            </div>

            {fechamentoData.saldo_final_informado && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm">
                  <strong>Diferença: </strong>
                  <span className={`font-bold ${
                    (parseFloat(fechamentoData.saldo_final_informado) - resumoDia.saldo_calculado) === 0 ? 'text-green-600' :
                    (parseFloat(fechamentoData.saldo_final_informado) - resumoDia.saldo_calculado) > 0 ? 'text-blue-600' : 'text-red-600'
                  }`}>
                    R$ {(parseFloat(fechamentoData.saldo_final_informado) - resumoDia.saldo_calculado).toFixed(2)}
                    {(parseFloat(fechamentoData.saldo_final_informado) - resumoDia.saldo_calculado) > 0 && ' (Sobra)'}
                    {(parseFloat(fechamentoData.saldo_final_informado) - resumoDia.saldo_calculado) < 0 && ' (Falta)'}
                    {(parseFloat(fechamentoData.saldo_final_informado) - resumoDia.saldo_calculado) === 0 && ' (Confere!)'}
                  </span>
                </p>
              </div>
            )}
            
            <div>
              <Label htmlFor="observacoes_fechamento">Observações</Label>
              <Textarea
                id="observacoes_fechamento"
                placeholder="Observações sobre o fechamento..."
                value={fechamentoData.observacoes_fechamento}
                onChange={(e) => setFechamentoData(prev => ({...prev, observacoes_fechamento: e.target.value}))}
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowFechamento(false)}>
                Cancelar
              </Button>
              <Button onClick={handleFecharCaixa} className="bg-red-600 hover:bg-red-700">
                Fechar Caixa
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalhes */}
      <Dialog open={showDetalhes} onOpenChange={setShowDetalhes}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Detalhes do Caixa - {operacaoSelecionada ? format(new Date(operacaoSelecionada.data_operacao), 'dd/MM/yyyy') : ''}
            </DialogTitle>
          </DialogHeader>
          {operacaoSelecionada && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Conta:</Label>
                  <p className="font-medium">{operacaoSelecionada.account_name}</p>
                </div>
                <div>
                  <Label>Status:</Label>
                  <div className="mt-1">{getStatusBadge(operacaoSelecionada)}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Abertura:</Label>
                  <p>{operacaoSelecionada.hora_abertura} - {operacaoSelecionada.operador_abertura}</p>
                </div>
                {operacaoSelecionada.operador_fechamento && (
                  <div>
                    <Label>Fechamento:</Label>
                    <p>{operacaoSelecionada.hora_fechamento} - {operacaoSelecionada.operador_fechamento}</p>
                  </div>
                )}
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Resumo Financeiro</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p>Saldo Inicial: <span className="font-mono">R$ {operacaoSelecionada.saldo_inicial.toFixed(2)}</span></p>
                    <p>Total Entradas: <span className="font-mono text-green-600">R$ {(operacaoSelecionada.total_entradas || 0).toFixed(2)}</span></p>
                    <p>Total Saídas: <span className="font-mono text-red-600">R$ {(operacaoSelecionada.total_saidas || 0).toFixed(2)}</span></p>
                  </div>
                  {operacaoSelecionada.status === 'fechado' && (
                    <div>
                      <p>Saldo Calculado: <span className="font-mono">R$ {operacaoSelecionada.saldo_final_calculado.toFixed(2)}</span></p>
                      <p>Saldo Informado: <span className="font-mono">R$ {operacaoSelecionada.saldo_final_informado.toFixed(2)}</span></p>
                      <p className={`font-bold ${
                        operacaoSelecionada.diferenca === 0 ? 'text-green-600' :
                        operacaoSelecionada.diferenca > 0 ? 'text-blue-600' : 'text-red-600'
                      }`}>
                        Diferença: R$ {operacaoSelecionada.diferenca.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {(operacaoSelecionada.observacoes_abertura || operacaoSelecionada.observacoes_fechamento) && (
                <div>
                  <Label>Observações:</Label>
                  {operacaoSelecionada.observacoes_abertura && (
                    <p className="text-sm mt-1"><strong>Abertura:</strong> {operacaoSelecionada.observacoes_abertura}</p>
                  )}
                  {operacaoSelecionada.observacoes_fechamento && (
                    <p className="text-sm mt-1"><strong>Fechamento:</strong> {operacaoSelecionada.observacoes_fechamento}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
