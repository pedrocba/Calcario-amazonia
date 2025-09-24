
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Truck, Scale, Activity, Wifi, WifiOff } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function VehicleWeighing({
  vehicles,
  selectedVehicle,
  currentWeight,
  scaleConnected,
  vehicleReadings,
  onVehicleSelect,
  onCaptureWeight,
  scaleMessage // Nova prop
}) {

  const formatWeight = (weight) => {
    if (typeof weight !== 'number') return '0.000';
    return (weight / 1000).toFixed(3);
  };

  return (
    <div className="space-y-6">
      {/* Status da Balança */}
      <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`text-5xl font-bold ${scaleConnected ? 'text-green-600' : 'text-red-600'}`}>
                {scaleConnected ? formatWeight(currentWeight) : '---'}
              </div>
              <div>
                <p className="text-lg text-slate-600">toneladas</p>
                <Badge
                  variant="outline"
                  className={scaleConnected ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}
                >
                  {scaleConnected ? <><Wifi className="w-3 h-3 mr-1" />Balança Online</> : <><WifiOff className="w-3 h-3 mr-1" />{scaleMessage}</>}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600">Balança WT3000-i</p>
              <p className="text-xs text-slate-500">Ponte Local: localhost:9001</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Veículos Clicáveis */}
      <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <Truck className="w-5 h-5 text-blue-600" />
            Selecione o Veículo para Pesagem
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                onClick={() => onVehicleSelect(vehicle.id)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedVehicle?.id === vehicle.id
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-slate-200 bg-white hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Truck className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{vehicle.plate}</h3>
                    <p className="text-sm text-slate-600">{vehicle.brand} {vehicle.model}</p>
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Motorista:</span> {vehicle.driver_name}</p>
                  <p><span className="font-medium">Capacidade:</span> {vehicle.capacity}t</p>
                  {vehicle.tare_weight_empty > 0 && (
                    <p><span className="font-medium">Peso Vazio:</span> {(vehicle.tare_weight_empty / 1000).toFixed(1)}t</p>
                  )}
                </div>
                {selectedVehicle?.id === vehicle.id && (
                  <Badge className="mt-2 bg-blue-600">
                    Selecionado
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Controles de Pesagem - Aparecem só quando veículo selecionado */}
      {selectedVehicle && (
        <Card className="bg-white/70 backdrop-blur border-0 shadow-xl border-l-4 border-l-blue-500">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <Scale className="w-5 h-5 text-green-600" />
              Capturar Peso - {selectedVehicle.plate}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Informações do Veículo */}
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900">Veículo Selecionado</h4>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm"><span className="font-medium">Placa:</span> {selectedVehicle.plate}</p>
                  <p className="text-sm"><span className="font-medium">Modelo:</span> {selectedVehicle.brand} {selectedVehicle.model}</p>
                  <p className="text-sm"><span className="font-medium">Motorista:</span> {selectedVehicle.driver_name}</p>
                  <p className="text-sm"><span className="font-medium">Capacidade:</span> {selectedVehicle.capacity} toneladas</p>
                </div>
              </div>

              {/* Peso Atual */}
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900">Peso Atual</h4>
                <div className="text-center p-6 bg-slate-50 rounded-lg">
                  <div className="text-4xl font-bold text-slate-900 mb-2">
                    {scaleConnected ? formatWeight(currentWeight) : '---'}
                  </div>
                  <p className="text-slate-600">toneladas</p>
                </div>
              </div>

              {/* Botões de Captura */}
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900">Capturar Peso</h4>
                <div className="space-y-3">
                  <Button
                    onClick={() => onCaptureWeight('tara')}
                    disabled={!scaleConnected}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                    size="lg"
                  >
                    <Scale className="w-5 h-5 mr-2" />
                    Capturar TARA (Vazio)
                  </Button>

                  <Button
                    onClick={() => onCaptureWeight('bruto')}
                    disabled={!scaleConnected}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    size="lg"
                  >
                    <Scale className="w-5 h-5 mr-2" />
                    Capturar BRUTO (Carregado)
                  </Button>

                  {!scaleConnected && (
                    <p className="text-xs text-red-600 text-center">
                      Balança desconectada. Verifique se o programa 'balanca_bridge.py' está em execução no computador.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Histórico de Pesagens do Veículo Selecionado */}
      {selectedVehicle && vehicleReadings.length > 0 && (
        <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-green-600" />
              Histórico de Pesagens - {selectedVehicle.plate}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Peso (t)</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicleReadings.slice(0, 10).map((reading) => (
                    <TableRow key={reading.id}>
                      <TableCell className="font-mono text-sm">
                        {format(new Date(reading.reading_datetime), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={reading.reading_type === 'tara' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}
                        >
                          {reading.reading_type === 'tara' ? 'TARA' : 'BRUTO'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono font-medium text-lg">
                        {formatWeight(reading.weight)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          {reading.stability_status === 'stable' ? 'Estável' : 'Instável'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mensagem quando nenhum veículo selecionado */}
      {!selectedVehicle && (
        <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
          <CardContent className="text-center py-12">
            <Truck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhum veículo selecionado</h3>
            <p className="text-slate-500">Clique em um veículo acima para iniciar a pesagem</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
