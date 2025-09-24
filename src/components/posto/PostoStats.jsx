import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Fuel, Edit, SlidersHorizontal, TrendingDown, Gauge } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PostoStats({ postos, fuelingRecords, isLoading, onEditPosto, onAjustarEstoque }) {
  
  const getSaidasPorPosto = (tipoCombustivel) => {
    if (!fuelingRecords) return { totalLitros: 0, totalAbastecimentos: 0 };
    
    const saidasDoPosto = fuelingRecords.filter(record => record.fuel_type === tipoCombustivel);
    const totalLitros = saidasDoPosto.reduce((sum, record) => sum + (record.liters || 0), 0);
    const totalAbastecimentos = saidasDoPosto.length;
    
    return { totalLitros, totalAbastecimentos };
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
      {(postos || []).map(posto => {
        const estoqueAtual = posto.estoque_atual || 0;
        const capacidadeTotal = posto.capacidade_total || 1;
        const percentage = (estoqueAtual / capacidadeTotal) * 100;
        const { totalLitros: saidasLitros, totalAbastecimentos } = getSaidasPorPosto(posto.tipo_combustivel);
        
        let progressBarColor = 'bg-green-500';
        let statusColor = 'text-green-700';
        let statusText = 'Normal';
        
        if (percentage < 50) {
          progressBarColor = 'bg-yellow-500';
          statusColor = 'text-yellow-700';
          statusText = 'Médio';
        }
        if (percentage < 25) {
          progressBarColor = 'bg-red-500';
          statusColor = 'text-red-700';
          statusText = 'Baixo';
        }

        return (
          <Card key={posto.id} className="bg-white/80 backdrop-blur border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-bold text-slate-800 mb-1">
                    {posto.nome}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded">
                      {posto.tipo_combustivel.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${statusColor} bg-opacity-10`}>
                      {statusText}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl">
                  <Fuel className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Estoque Atual vs Capacidade */}
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Estoque Atual</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {estoqueAtual.toLocaleString('pt-BR')} L
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 mb-1">Capacidade Total</p>
                    <p className="text-lg font-semibold text-slate-700">
                      {capacidadeTotal.toLocaleString('pt-BR')} L
                    </p>
                  </div>
                </div>
                
                {/* Barra de Progresso Melhorada */}
                <div className="space-y-1">
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div 
                      className={`${progressBarColor} h-3 rounded-full transition-all duration-500 ease-out relative`} 
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    >
                      <div className="absolute -top-6 right-0 text-xs font-semibold text-slate-700">
                        {percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Estatísticas de Saída */}
              <div className="border-t border-slate-100 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-lg mx-auto mb-2">
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    </div>
                    <p className="text-xs text-slate-500 mb-1">Total de Saídas</p>
                    <p className="text-lg font-bold text-red-700">
                      {saidasLitros.toLocaleString('pt-BR')} L
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg mx-auto mb-2">
                      <Gauge className="w-4 h-4 text-purple-600" />
                    </div>
                    <p className="text-xs text-slate-500 mb-1">Abastecimentos</p>
                    <p className="text-lg font-bold text-purple-700">
                      {totalAbastecimentos}
                    </p>
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="border-t border-slate-100 pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onAjustarEstoque(posto)}
                    className="w-full hover:bg-blue-50 hover:border-blue-300"
                  >
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Ajustar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onEditPosto(posto)}
                    className="w-full hover:bg-slate-50 hover:border-slate-300"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}