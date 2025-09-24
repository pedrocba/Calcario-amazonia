
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Fuel, Image, ChevronDown, Printer, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function FuelingList({ records, isLoading, onPrintTicket, onDeleteFueling }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [openItems, setOpenItems] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [motivoExclusao, setMotivoExclusao] = useState('');

  const toggleItem = (id) => {
    setOpenItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    return format(new Date(dateStr), "dd/MM/yy HH:mm", { locale: ptBR });
  };

  const getFuelTypeLabel = (type) => {
    switch (type) {
      case 'diesel_s10': return 'Diesel S10';
      case 'diesel_s500': return 'Diesel S500';
      case 'arla_32': return 'Arla 32';
      case 'gasolina_comum': return 'Gasolina Comum';
      case 'gasolina_aditivada': return 'Gasolina Aditivada';
      default: return type;
    }
  };

  const getFuelTypeBadge = (type) => {
    switch (type) {
      case 'diesel_s10': return 'bg-blue-100 text-blue-800';
      case 'diesel_s500': return 'bg-green-100 text-green-800';
      case 'arla_32': return 'bg-purple-100 text-purple-800';
      case 'gasolina_comum': return 'bg-red-100 text-red-800';
      case 'gasolina_aditivada': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteClick = (record) => {
    setRecordToDelete(record);
    setMotivoExclusao('');
    setDialogOpen(true);
  };

  const confirmDelete = () => {
    if (recordToDelete) {
      onDeleteFueling(recordToDelete, motivoExclusao);
    }
    setDialogOpen(false);
  };
  
  return (
    <>
      <Card className="bg-white/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Fuel className="w-5 h-5 text-orange-500" /> 
            Histórico de Abastecimentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mobile View */}
          <div className="md:hidden space-y-3">
            {isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : records.length === 0 ? (
               <p className="text-center text-slate-500 py-4">Nenhum abastecimento.</p>
            ) : (
              records.map(rec => (
                <div key={rec.id} className="border rounded-lg bg-white p-3 shadow-sm">
                  <div 
                    className="flex justify-between items-center cursor-pointer" 
                    onClick={() => toggleItem(rec.id)}
                  >
                    <div>
                      <p className="font-semibold text-slate-800">{formatDateTime(rec.date)}</p>
                      <p className="text-lg font-bold text-green-700">R$ {(rec.total_cost || 0).toFixed(2)}</p>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${openItems[rec.id] ? 'rotate-180' : ''}`} />
                  </div>
                  {openItems[rec.id] && (
                    <div className="mt-3 pt-3 border-t text-sm space-y-2">
                      <p><strong>Hodômetro:</strong> {(rec.odometer_at_fueling || 0).toLocaleString('pt-BR')} km</p>
                      <p><strong>Litros:</strong> {(rec.liters || 0).toFixed(2)} L</p>
                      <p><strong>Combustível:</strong> <Badge className={getFuelTypeBadge(rec.fuel_type)}>{getFuelTypeLabel(rec.fuel_type)}</Badge></p>
                      <p><strong>Fornecedor:</strong> {rec.supplier || 'N/A'}</p>
                      <p><strong>Responsável:</strong> {rec.responsavel_abastecimento || 'N/A'}</p>
                      <div className="flex items-center gap-2 mt-2">
                          {rec.odometer_photo_url ? (
                              <Dialog>
                                  <DialogTrigger asChild>
                                  <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="flex-1" 
                                      onClick={() => setSelectedPhoto(rec.odometer_photo_url)}
                                  >
                                      <Image className="w-4 h-4 mr-2" /> Ver Foto
                                  </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                      <DialogHeader>
                                          <DialogTitle>
                                          Foto do Hodômetro - {formatDateTime(rec.date)}
                                          </DialogTitle>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                          <img 
                                          src={rec.odometer_photo_url} 
                                          alt={`Hodômetro em ${rec.odometer_at_fueling} km`}
                                          className="w-full max-h-96 object-contain rounded-lg"
                                          />
                                          <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-lg">
                                          <div>
                                              <span className="font-medium">Hodômetro:</span>
                                              <p>{(rec.odometer_at_fueling || 0).toLocaleString('pt-BR')} km</p>
                                          </div>
                                          <div>
                                              <span className="font-medium">Data/Hora:</span>
                                              <p>{formatDateTime(rec.date)}</p>
                                          </div>
                                          <div>
                                              <span className="font-medium">Combustível:</span>
                                              <p>{getFuelTypeLabel(rec.fuel_type)}</p>
                                          </div>
                                          <div>
                                              <span className="font-medium">Litros:</span>
                                              <p>{(rec.liters || 0).toFixed(2)} L</p>
                                          </div>
                                          </div>
                                      </div>
                                  </DialogContent>
                              </Dialog>
                          ) : (
                            <span className="flex-1 text-center text-slate-400 text-sm">
                              Sem foto
                            </span>
                          )}
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => onPrintTicket(rec)}>
                              <Printer className="w-4 h-4 mr-2" /> Imprimir
                          </Button>
                          <Button variant="destructive" size="sm" className="flex-1" onClick={() => handleDeleteClick(rec)}>
                            <Trash2 className="w-4 h-4 mr-2" /> Excluir
                          </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          
          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Hodômetro</TableHead>
                  <TableHead>Combustível</TableHead>
                  <TableHead>Litros</TableHead>
                  <TableHead>Custo</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan="7">
                      <Skeleton className="h-20" />
                    </TableCell>
                  </TableRow>
                ) : records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan="7" className="text-center h-24">
                      Nenhum abastecimento registrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map(rec => (
                    <TableRow key={rec.id}>
                      <TableCell className="font-medium">
                        {formatDateTime(rec.date)}
                      </TableCell>
                      <TableCell className="font-mono">
                        {(rec.odometer_at_fueling || 0).toLocaleString('pt-BR')} km
                      </TableCell>
                      <TableCell>
                        <Badge className={getFuelTypeBadge(rec.fuel_type)}>
                          {getFuelTypeLabel(rec.fuel_type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {(rec.liters || 0).toFixed(2)} L
                      </TableCell>
                      <TableCell className="font-medium text-green-700">
                        R$ {(rec.total_cost || 0).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {rec.responsavel_abastecimento || 'Não informado'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                        {rec.odometer_photo_url ? (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="icon"
                                className="flex items-center gap-1"
                                onClick={() => setSelectedPhoto(rec.odometer_photo_url)}
                              >
                                <Image className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>
                                  Foto do Hodômetro - {formatDateTime(rec.date)}
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <img 
                                  src={rec.odometer_photo_url} 
                                  alt={`Hodômetro em ${rec.odometer_at_fueling} km`}
                                  className="w-full max-h-96 object-contain rounded-lg"
                                />
                                <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-lg">
                                  <div>
                                    <span className="font-medium">Hodômetro:</span>
                                    <p>{(rec.odometer_at_fueling || 0).toLocaleString('pt-BR')} km</p>
                                  </div>
                                  <div>
                                    <span className="font-medium">Data/Hora:</span>
                                    <p>{formatDateTime(rec.date)}</p>
                                  </div>
                                  <div>
                                    <span className="font-medium">Combustível:</span>
                                    <p>{getFuelTypeLabel(rec.fuel_type)}</p>
                                  </div>
                                  <div>
                                    <span className="font-medium">Litros:</span>
                                    <p>{(rec.liters || 0).toFixed(2)} L</p>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <div className="w-9 h-9"></div>
                        )}
                         <Button 
                            variant="outline" 
                            size="icon"
                            className="flex items-center gap-1"
                            onClick={() => onPrintTicket(rec)}
                          >
                            <Printer className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="icon"
                            className="flex items-center gap-1"
                            onClick={() => handleDeleteClick(rec)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Deletion Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Registro de Abastecimento</DialogTitle>
            <DialogDescription>
              Esta ação é irreversível. O valor abastecido será estornado ao tanque de origem.
              Por favor, informe o motivo da exclusão.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="motivo" className="text-right">
              Motivo da Exclusão
            </Label>
            <Textarea
              id="motivo"
              value={motivoExclusao}
              onChange={(e) => setMotivoExclusao(e.target.value)}
              placeholder="Ex: Lançamento duplicado, erro de digitação nos litros, etc."
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={!motivoExclusao.trim()}
            >
              Confirmar Exclusão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
