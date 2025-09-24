
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scale, Thermometer, Droplets, Activity, Truck } from "lucide-react";

export default function ScaleMonitor({ connected, currentWeight, selectedTrip, vehicleOnScale }) {
  const formatWeight = (weight) => {
    return (weight / 1000).toFixed(3); // Converter para toneladas
  };

  const getWeightStatus = () => {
    if (!connected) return 'Desconectado';
    if (currentWeight < 100) return 'Vazio';
    if (currentWeight < 1000) return 'Leve';
    if (currentWeight < 10000) return 'Médio';
    return 'Carregado';
  };

  const getWeightColor = () => {
    if (!connected) return 'text-red-600';
    if (currentWeight < 1000) return 'text-green-600';
    if (currentWeight < 25000) return 'text-blue-600';
    return 'text-orange-600';
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <Scale className="w-5 h-5 text-blue-600" />
            Monitor WT3000-i
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="mb-4">
              <div className={`text-6xl font-bold ${getWeightColor()}`}>
                {connected ? formatWeight(currentWeight) : '---'}
              </div>
              <div className="text-lg text-slate-600 mt-2">toneladas</div>
            </div>
            
            <Badge 
              variant="outline" 
              className={connected ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}
            >
              {getWeightStatus()}
            </Badge>
          </div>

          {vehicleOnScale && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="w-4 h-4 text-blue-600" />
                <h4 className="font-medium text-blue-900">Veículo na Balança</h4>
              </div>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Placa:</span> {vehicleOnScale.plate}</p>
                <p><span className="font-medium">Modelo:</span> {vehicleOnScale.brand} {vehicleOnScale.model}</p>
                <p><span className="font-medium">Motorista:</span> {vehicleOnScale.driver_name}</p>
                <p><span className="font-medium">Capacidade:</span> {vehicleOnScale.capacity} t</p>
                {vehicleOnScale.tare_weight_empty > 0 && (
                  <p><span className="font-medium">Peso Vazio Padrão:</span> {(vehicleOnScale.tare_weight_empty / 1000).toFixed(1)} t</p>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Thermometer className="w-4 h-4 text-orange-500" />
                <span className="text-sm text-slate-600">Temperatura</span>
              </div>
              <div className="font-semibold">24°C</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Droplets className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-slate-600">Umidade</span>
              </div>
              <div className="font-semibold">65%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-green-600" />
            Status da Balança
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Conexão</span>
            <Badge variant={connected ? "default" : "destructive"}>
              {connected ? "Conectada" : "Desconectada"}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Estabilidade</span>
            <Badge variant="outline" className="bg-green-50 text-green-700">
              Estável
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Calibração</span>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              OK
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Última Leitura</span>
            <span className="text-sm font-medium">
              {new Date().toLocaleTimeString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
