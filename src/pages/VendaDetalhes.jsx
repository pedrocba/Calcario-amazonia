import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Calendar, User, DollarSign, Package, FileText } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import BillingModal from '../components/sales/BillingModal';
import BillingInfo from '../components/sales/BillingInfo';
import RetiradaModal from '../components/sales/RetiradaModal';
import PagamentoParcialModal from '../components/sales/PagamentoParcialModal';
import billingService from '../api/billingService';
import retiradaService from '../api/retiradaService';

const VendaDetalhes = () => {
  const { id } = useParams();
  const [venda, setVenda] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [billingInfo, setBillingInfo] = useState(null);
  const [showRetiradaModal, setShowRetiradaModal] = useState(false);
  const [showPagamentoModal, setShowPagamentoModal] = useState(false);
  const [companyId, setCompanyId] = useState(null);

  useEffect(() => {
    if (id) {
      loadVendaDetails();
      loadBillingInfo();
      loadCompanyId();
    }
  }, [id]);

  const loadCompanyId = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('user_id', user.id)
          .single();
        
        if (profile?.company_id) {
          setCompanyId(profile.company_id);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar company_id:', error);
    }
  };

  const loadVendaDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar dados da venda com cliente e itens
      const { data: vendaData, error: vendaError } = await supabase
        .from('vendas')
        .select(`
          *,
          client:contacts!client_id (
            id,
            name,
            email,
            phone,
            document
          ),
          itens_venda (
            id,
            product_id,
            quantity,
            unit_price,
            total_price,
            discount,
            products (
              id,
              name,
              code,
              unit_of_measure
            )
          )
        `)
        .eq('id', id)
        .single();

      if (vendaError) throw vendaError;

      if (!vendaData) {
        throw new Error('Venda não encontrada');
      }

      setVenda(vendaData);
    } catch (err) {
      console.error('Erro ao carregar detalhes da venda:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadBillingInfo = async () => {
    try {
      const billing = await billingService.getBillingBySale(id);
      setBillingInfo(billing);
    } catch (error) {
      console.error('Erro ao carregar informações de faturamento:', error);
    }
  };

  const handleBillingSuccess = async (billingData) => {
    try {
      const result = await billingService.processBilling(id, billingData);
      
      // Atualizar dados da venda
      await loadVendaDetails();
      await loadBillingInfo();
      
      alert(result.message);
    } catch (error) {
      console.error('Erro ao processar faturamento:', error);
      alert('Erro ao processar faturamento: ' + error.message);
    }
  };

  const handleCancelBilling = async (faturaId) => {
    if (!confirm('Tem certeza que deseja cancelar esta fatura?')) {
      return;
    }

    try {
      await billingService.cancelBilling(faturaId);
      
      // Atualizar dados
      await loadVendaDetails();
      await loadBillingInfo();
      
      alert('Fatura cancelada com sucesso!');
    } catch (error) {
      console.error('Erro ao cancelar fatura:', error);
      alert('Erro ao cancelar fatura: ' + error.message);
    }
  };

  const handleUpdateStatus = async (faturaId, newStatus) => {
    if (!confirm(`Tem certeza que deseja marcar esta fatura como ${newStatus === 'paid' ? 'pago' : newStatus}?`)) {
      return;
    }

    try {
      await billingService.updateFaturaStatus(faturaId, newStatus);
      
      // Atualizar dados
      await loadVendaDetails();
      await loadBillingInfo();
      
      alert('Status da fatura atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar status da fatura:', error);
      alert('Erro ao atualizar status da fatura: ' + error.message);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'faturada':
        return 'bg-blue-100 text-blue-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      case 'concluida':
        return 'bg-blue-100 text-blue-800';
      case 'pago':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando detalhes da venda...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <FileText className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold">Erro ao carregar venda</h2>
            <p className="text-gray-600 mt-2">{error}</p>
          </div>
          <Link to="/Vendas">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Vendas
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!venda) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Venda não encontrada</h2>
          <Link to="/Vendas">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Vendas
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/Vendas">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Detalhes da Venda #{venda.id.slice(0, 8)}
            </h1>
            <p className="text-gray-600">Informações completas da venda</p>
          </div>
        </div>
        <Badge className={`${getStatusColor(venda.status)} text-sm px-3 py-1`}>
          {venda.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações da Venda */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dados do Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Dados do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Nome</label>
                  <p className="text-lg font-semibold">{venda.client?.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-lg">{venda.client?.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Telefone</label>
                  <p className="text-lg">{venda.client?.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Documento</label>
                  <p className="text-lg">{venda.client?.document || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Itens da Venda */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Itens da Venda
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead className="text-right">Qtd</TableHead>
                      <TableHead className="text-right">Preço Unit.</TableHead>
                      <TableHead className="text-right">Desconto</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {venda.itens_venda?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono text-sm">
                          {item.products?.code || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.products?.name || 'Produto não encontrado'}</p>
                            <p className="text-sm text-gray-500">
                              {item.products?.unit_of_measure || 'UN'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(item.unit_price)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(item.discount)}
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold">
                          {formatCurrency(item.total_price)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumo da Venda */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Resumo da Venda
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Data da Venda:</span>
                <span className="font-semibold">{formatDate(venda.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <Badge className={getStatusColor(venda.status)}>
                  {venda.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Forma de Pagamento:</span>
                <span className="font-semibold capitalize">
                  {venda.payment_method?.replace('_', ' ') || 'N/A'}
                </span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Valor Total:</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(venda.final_amount)}
                  </span>
                </div>
                {venda.discount > 0 && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Desconto:</span>
                    <span>-{formatCurrency(venda.discount)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Informações de Faturamento */}
          <BillingInfo 
            billingInfo={billingInfo}
            onCancelBilling={handleCancelBilling}
            onUpdateStatus={handleUpdateStatus}
            vendaId={venda?.id}
          />

          {/* Observações */}
          {venda.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Observações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{venda.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Ações */}
          <Card>
            <CardHeader>
              <CardTitle>Ações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Imprimir Comprovante
              </Button>
              {(venda.status === 'pendente' || venda.status === 'concluida') && (
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => setShowBillingModal(true)}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  {venda.status === 'concluida' ? 'Refaturar Venda' : 'Faturar Venda'}
                </Button>
              )}
              
              {/* Botões para vendas faturadas */}
              {(venda.status === 'faturada' || venda.status === 'concluida' || venda.status === 'pago') && (
                <>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => setShowRetiradaModal(true)}
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Controle de Retiradas
                  </Button>
                  
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => setShowPagamentoModal(true)}
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Pagamentos Parciais
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Faturamento */}
      <BillingModal
        isOpen={showBillingModal}
        onClose={() => setShowBillingModal(false)}
        venda={venda}
        onBillingSuccess={handleBillingSuccess}
      />

      {/* Modal de Retiradas */}
      <RetiradaModal
        isOpen={showRetiradaModal}
        onClose={() => setShowRetiradaModal(false)}
        vendaId={venda?.id}
        clienteId={venda?.client_id}
        companyId={companyId}
      />

      {/* Modal de Pagamentos Parciais */}
      <PagamentoParcialModal
        isOpen={showPagamentoModal}
        onClose={() => setShowPagamentoModal(false)}
        vendaId={venda?.id}
        clienteId={venda?.client_id}
        companyId={companyId}
        faturaId={billingInfo?.[0]?.id}
      />
    </div>
  );
};

export default VendaDetalhes;