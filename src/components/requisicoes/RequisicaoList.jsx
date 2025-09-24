
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Eye, User, Calendar, Truck, Wrench } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function RequisicaoList({ 
  requisicoes,
  products,
  vehicles, // NEW
  isLoading,
  statusConfig,
  actions = {},
  showDetails = false,
}) {
  const [expandedRows, setExpandedRows] = useState(new Set());

  const toggleExpanded = (reqId) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      newSet.has(reqId) ? newSet.delete(reqId) : newSet.add(reqId);
      return newSet;
    });
  };

  const getProductName = (productId) => (products || []).find(p => p.id === productId)?.name || 'N/A';
  const getVehiclePlate = (vehicleId) => (vehicles || []).find(v => v.id === vehicleId)?.plate || 'N/A'; // NEW
  
  const renderActionButtons = (requisicao) => {
    const buttons = [];
    if (actions.primary) {
      buttons.push(
        <Button key="primary" size="sm" variant={actions.primary.variant} onClick={() => actions.primary.handler(requisicao)} className="gap-2">
          <actions.primary.icon className="w-4 h-4" />
          {actions.primary.label}
        </Button>
      );
    }
    if (actions.secondary) {
      buttons.push(
        <Button key="secondary" size="sm" variant={actions.secondary.variant} onClick={() => actions.secondary.handler(requisicao)} className="gap-2">
          <actions.secondary.icon className="w-4 h-4" />
          {actions.secondary.label}
        </Button>
      );
    }
    if (actions.tertiary) {
      buttons.push(
        <Button key="tertiary" size="sm" variant={actions.tertiary.variant} onClick={() => actions.tertiary.handler(requisicao)} className="gap-2">
          <actions.tertiary.icon className="w-4 h-4" />
          {actions.tertiary.label}
        </Button>
      );
    }
    return buttons;
  };

  return (
    <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-blue-600" />
          {isLoading ? 'Carregando...' : `Requisições (${(requisicoes || []).length})`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Número</TableHead>
                <TableHead>Solicitante</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Itens</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-28 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                  </TableRow>
                ))
              ) : (requisicoes || []).length === 0 ? (
                <TableRow>
                    <TableCell colSpan="6" className="text-center py-12">
                        <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhuma requisição encontrada</h3>
                        <p className="text-slate-500">Não há requisições para exibir nesta categoria.</p>
                    </TableCell>
                </TableRow>
              ) : (
                (requisicoes || []).map((requisicao) => (
                  <React.Fragment key={requisicao.id}>
                    <TableRow className="hover:bg-slate-50">
                      <TableCell className="font-mono text-sm font-medium">{requisicao.numero_requisicao}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400" />
                          <span className="font-medium">{requisicao.solicitante_nome}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {format(new Date(requisicao.data_solicitacao), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </div>
                      </TableCell>
                      <TableCell><span className="font-medium">{requisicao.total_itens}</span></TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusConfig[requisicao.status]?.color || 'bg-gray-100'}>
                          {statusConfig[requisicao.status]?.label || requisicao.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1.5 items-center">
                          <Button variant="ghost" size="icon" onClick={() => toggleExpanded(requisicao.id)}><Eye className="w-4 h-4" /></Button>
                          {renderActionButtons(requisicao)}
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedRows.has(requisicao.id) && (
                      <TableRow>
                        <TableCell colSpan="6" className="bg-slate-50 p-0">
                          <div className="p-4">
                            <h4 className="font-medium mb-3">Detalhes da Requisição {requisicao.numero_requisicao}</h4>
                            <div className="space-y-3 mb-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="font-medium text-slate-600">Solicitante:</span>
                                  <p className="text-slate-900">{requisicao.solicitante_nome}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-slate-600">Setor:</span>
                                  <p className="text-slate-900 capitalize">{requisicao.setor}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-slate-600">Local de Uso:</span>
                                  <p className="text-slate-900 font-medium text-blue-700">{requisicao.local_uso || 'Não informado'}</p>
                                </div>
                              </div>
                            </div>
                            <h4 className="font-medium mb-3">Itens da Requisição</h4>
                            <div className="space-y-2">
                              {(requisicao.items || []).map((item, index) => (
                                <div key={index} className="flex justify-between items-start p-3 bg-white rounded border">
                                  <div className="flex-1">
                                    <span className="font-medium">{getProductName(item.produto_id)}</span>
                                    <p className="text-sm text-slate-600">Qtd: {item.quantidade_solicitada} {item.unidade_medida}</p>
                                    {item.observacao_item && <p className="text-xs text-slate-500 mt-1">Obs: {item.observacao_item}</p>}
                                    
                                    {/* NEW: Detalhes de Manutenção */}
                                    {item.veiculo_id && (
                                      <div className="mt-2 p-2 bg-cyan-50 border-l-2 border-cyan-500 text-xs text-cyan-900 space-y-1">
                                        <div className="flex items-center gap-2">
                                          <Truck className="w-3.5 h-3.5"/> <strong>Veículo:</strong> {getVehiclePlate(item.veiculo_id)}
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Wrench className="w-3.5 h-3.5"/> <strong>Serviço:</strong> {item.tipo_servico} ({item.hodometro_horimetro?.toLocaleString('pt-BR')} km/h)
                                        </div>
                                      </div>
                                    )}

                                  </div>
                                  <div className="text-right flex-shrink-0 ml-4">
                                     {item.status_devolucao === 'pendente' && (
                                        <Badge variant="outline" className="bg-orange-100 text-orange-800">Aguardando Devolução</Badge>
                                     )}
                                     {item.status_devolucao === 'devolvido' && (
                                        <Badge variant="outline" className="bg-green-100 text-green-800">Devolvido</Badge>
                                     )}
                                     {item.data_devolucao_prevista && (
                                        <p className="text-xs text-orange-600">Devolver até: {format(new Date(item.data_devolucao_prevista), 'dd/MM/yyyy', { locale: ptBR })}</p>
                                     )}
                                  </div>
                                </div>
                              ))}
                            </div>
                            {requisicao.observacao && (
                              <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
                                <p className="text-sm"><strong>Observação Geral:</strong> {requisicao.observacao}</p>
                              </div>
                            )}
                             {showDetails && requisicao.motivo_recusa && (
                                <div className="mt-4 p-3 bg-red-50 rounded border border-red-200">
                                    <p className="text-sm"><strong>Motivo da Recusa:</strong> {requisicao.motivo_recusa}</p>
                                </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
