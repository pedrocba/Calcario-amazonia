import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, Truck, AlertCircle, CheckCircle } from 'lucide-react';
import retiradaService from '@/api/retiradaService';

const RetiradaModal = ({ isOpen, onClose, vendaId, clienteId, companyId }) => {
  const [saldoProdutos, setSaldoProdutos] = useState([]);
  const [retiradas, setRetiradas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState(null);
  const [quantidadeRetirada, setQuantidadeRetirada] = useState('');
  const [responsavelRetirada, setResponsavelRetirada] = useState('');
  const [observacoes, setObservacoes] = useState('');

  useEffect(() => {
    if (isOpen && vendaId) {
      loadData();
    }
  }, [isOpen, vendaId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [saldoData, retiradasData] = await Promise.all([
        retiradaService.getSaldoByVenda(vendaId),
        retiradaService.getRetiradasByVenda(vendaId)
      ]);
      
      setSaldoProdutos(saldoData || []);
      setRetiradas(retiradasData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRetirada = async () => {
    if (!selectedProduto || !quantidadeRetirada || !responsavelRetirada) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    if (parseFloat(quantidadeRetirada) <= 0) {
      alert('Quantidade deve ser maior que zero');
      return;
    }

    if (parseFloat(quantidadeRetirada) > parseFloat(selectedProduto.quantidade_saldo)) {
      alert('Quantidade excede o saldo disponível');
      return;
    }

    try {
      setLoading(true);
      
      await retiradaService.registrarRetirada({
        venda_id: vendaId,
        cliente_id: clienteId,
        saldo_produto_id: selectedProduto.id,
        quantidade_retirada: quantidadeRetirada,
        responsavel_retirada: responsavelRetirada,
        observacoes: observacoes,
        company_id: companyId
      });

      // Limpar formulário
      setSelectedProduto(null);
      setQuantidadeRetirada('');
      setResponsavelRetirada('');
      setObservacoes('');

      // Recarregar dados
      await loadData();
      
      alert('Retirada registrada com sucesso!');
    } catch (error) {
      console.error('Erro ao registrar retirada:', error);
      alert('Erro ao registrar retirada: ' + error.message);
    } finally {
      setLoading(false);
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
    switch (status) {
      case 'ativo':
        return 'bg-green-100 text-green-800';
      case 'finalizado':
        return 'bg-blue-100 text-blue-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Controle de Retiradas
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Saldo de Produtos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Saldo de Produtos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Carregando...</div>
              ) : saldoProdutos.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  Nenhum produto disponível para retirada
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Quantidade Total</TableHead>
                      <TableHead>Quantidade Retirada</TableHead>
                      <TableHead>Saldo Disponível</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {saldoProdutos.map((produto) => (
                      <TableRow key={produto.id}>
                        <TableCell>
                          <div>
                            <p className="font-semibold">{produto.produto?.name}</p>
                            <p className="text-sm text-gray-500">{produto.produto?.code}</p>
                          </div>
                        </TableCell>
                        <TableCell>{produto.quantidade_total} {produto.produto?.unit}</TableCell>
                        <TableCell>{produto.quantidade_retirada} {produto.produto?.unit}</TableCell>
                        <TableCell className="font-semibold">
                          {produto.quantidade_saldo} {produto.produto?.unit}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(produto.status)}>
                            {produto.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => setSelectedProduto(produto)}
                            disabled={produto.status !== 'ativo' || produto.quantidade_saldo <= 0}
                          >
                            Retirar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Formulário de Retirada */}
          {selectedProduto && (
            <Card>
              <CardHeader>
                <CardTitle>Registrar Retirada</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Produto</Label>
                    <Input
                      value={`${selectedProduto.produto?.name} (${selectedProduto.produto?.code})`}
                      disabled
                    />
                  </div>
                  <div>
                    <Label>Saldo Disponível</Label>
                    <Input
                      value={`${selectedProduto.quantidade_saldo} ${selectedProduto.produto?.unit}`}
                      disabled
                    />
                  </div>
                  <div>
                    <Label>Quantidade a Retirar *</Label>
                    <Input
                      type="number"
                      step="0.001"
                      value={quantidadeRetirada}
                      onChange={(e) => setQuantidadeRetirada(e.target.value)}
                      placeholder="Digite a quantidade"
                    />
                  </div>
                  <div>
                    <Label>Responsável pela Retirada *</Label>
                    <Input
                      value={responsavelRetirada}
                      onChange={(e) => setResponsavelRetirada(e.target.value)}
                      placeholder="Nome do responsável"
                    />
                  </div>
                </div>
                <div>
                  <Label>Observações</Label>
                  <Textarea
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    placeholder="Observações sobre a retirada"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Histórico de Retiradas */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Retiradas</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Carregando...</div>
              ) : retiradas.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  Nenhuma retirada registrada
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Responsável</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Observações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {retiradas.map((retirada) => (
                      <TableRow key={retirada.id}>
                        <TableCell>{formatDate(retirada.data_retirada)}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-semibold">{retirada.saldo_produto?.produto?.name}</p>
                            <p className="text-sm text-gray-500">{retirada.saldo_produto?.produto?.code}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {retirada.quantidade_retirada} {retirada.saldo_produto?.produto?.unit}
                        </TableCell>
                        <TableCell>{retirada.responsavel_retirada}</TableCell>
                        <TableCell>
                          <Badge className={retirada.status === 'confirmada' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {retirada.status === 'confirmada' ? 'Confirmada' : 'Cancelada'}
                          </Badge>
                        </TableCell>
                        <TableCell>{retirada.observacoes || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          {selectedProduto && (
            <Button onClick={handleRetirada} disabled={loading}>
              {loading ? 'Registrando...' : 'Registrar Retirada'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RetiradaModal;

