import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { QrCode, Radio, Scan, Truck, CheckCircle, AlertCircle } from "lucide-react";

export default function VehicleIdentification({ vehicles, onVehicleIdentified, scannedCode, setScannedCode }) {
  const [identificationHistory, setIdentificationHistory] = useState([
    { time: '14:35:22', vehicle: 'ABC-1234', method: 'RFID', status: 'Sucesso' },
    { time: '14:32:15', vehicle: 'XYZ-5678', method: 'QR Code', status: 'Sucesso' },
    { time: '14:28:45', vehicle: 'DEF-9876', method: 'Manual', status: 'Sucesso' }
  ]);

  const [currentVehicle, setCurrentVehicle] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleManualIdentification = () => {
    if (!scannedCode.trim()) return;
    
    const vehicle = vehicles.find(v => 
      v.vehicle_code === scannedCode.toUpperCase() || 
      v.rfid_tag === scannedCode || 
      v.qr_code === scannedCode ||
      v.plate === scannedCode.toUpperCase()
    );
    
    if (vehicle) {
      setCurrentVehicle(vehicle);
      setIdentificationHistory(prev => [{
        time: new Date().toLocaleTimeString(),
        vehicle: vehicle.plate,
        method: 'Manual',
        status: 'Sucesso'
      }, ...prev]);
      onVehicleIdentified(scannedCode);
    } else {
      setCurrentVehicle(null);
      setIdentificationHistory(prev => [{
        time: new Date().toLocaleTimeString(),
        vehicle: scannedCode,
        method: 'Manual',
        status: 'Erro'
      }, ...prev]);
    }
  };

  const simulateRFIDScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const randomVehicle = vehicles[Math.floor(Math.random() * vehicles.length)];
      if (randomVehicle && randomVehicle.rfid_tag) {
        setScannedCode(randomVehicle.rfid_tag);
        setCurrentVehicle(randomVehicle);
        setIdentificationHistory(prev => [{
          time: new Date().toLocaleTimeString(),
          vehicle: randomVehicle.plate,
          method: 'RFID',
          status: 'Sucesso'
        }, ...prev]);
        onVehicleIdentified(randomVehicle.rfid_tag);
      }
      setIsScanning(false);
    }, 2000);
  };

  const simulateQRScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const randomVehicle = vehicles[Math.floor(Math.random() * vehicles.length)];
      if (randomVehicle && randomVehicle.qr_code) {
        setScannedCode(randomVehicle.qr_code);
        setCurrentVehicle(randomVehicle);
        setIdentificationHistory(prev => [{
          time: new Date().toLocaleTimeString(),
          vehicle: randomVehicle.plate,
          method: 'QR Code',
          status: 'Sucesso'
        }, ...prev]);
        onVehicleIdentified(randomVehicle.qr_code);
      }
      setIsScanning(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <Scan className="w-5 h-5 text-blue-600" />
              Identificação do Veículo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button 
                  onClick={simulateRFIDScan}
                  disabled={isScanning}
                  className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                >
                  <Radio className="w-4 h-4" />
                  {isScanning ? 'Lendo RFID...' : 'Ler RFID'}
                </Button>
                
                <Button 
                  onClick={simulateQRScan}
                  disabled={isScanning}
                  className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                >
                  <QrCode className="w-4 h-4" />
                  {isScanning ? 'Lendo QR...' : 'Ler QR Code'}
                </Button>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <h4 className="font-medium text-slate-900">Identificação Manual</h4>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Digite placa, código ou tag..." 
                    value={scannedCode} 
                    onChange={(e) => setScannedCode(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleManualIdentification}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Scan className="w-4 h-4" />
                    Identificar
                  </Button>
                </div>
              </div>
            </div>

            {currentVehicle && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h4 className="font-medium text-green-900">Veículo Identificado!</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Placa:</span> {currentVehicle.plate}</p>
                  <p><span className="font-medium">Modelo:</span> {currentVehicle.brand} {currentVehicle.model}</p>
                  <p><span className="font-medium">Motorista:</span> {currentVehicle.driver_name}</p>
                  <p><span className="font-medium">Capacidade:</span> {currentVehicle.capacity} toneladas</p>
                  {currentVehicle.tare_weight_empty > 0 && (
                    <p><span className="font-medium">Peso Vazio:</span> {(currentVehicle.tare_weight_empty / 1000).toFixed(1)} t</p>
                  )}
                </div>
              </div>
            )}

            {scannedCode && !currentVehicle && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <h4 className="font-medium text-red-900">Veículo não encontrado!</h4>
                </div>
                <p className="text-sm text-red-700 mt-1">
                  O código "{scannedCode}" não está cadastrado no sistema.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-green-600" />
              Veículos Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {vehicles.filter(v => v.active).map((vehicle) => (
                <div key={vehicle.id} className="p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-slate-900">{vehicle.plate}</p>
                      <p className="text-sm text-slate-600">{vehicle.brand} {vehicle.model}</p>
                      <p className="text-sm text-slate-500">{vehicle.driver_name}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      {vehicle.rfid_tag && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">
                          <Radio className="w-3 h-3 mr-1" />
                          RFID
                        </Badge>
                      )}
                      {vehicle.qr_code && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs">
                          <QrCode className="w-3 h-3 mr-1" />
                          QR
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <Scan className="w-5 h-5 text-blue-600" />
            Histórico de Identificações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {identificationHistory.map((log, index) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                <div className="text-sm font-mono text-slate-600 min-w-0">
                  {log.time}
                </div>
                <div className="text-sm font-medium text-slate-900">
                  {log.vehicle}
                </div>
                <Badge 
                  variant="outline" 
                  className={
                    log.method === 'RFID' ? 'bg-green-100 text-green-800' :
                    log.method === 'QR Code' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }
                >
                  {log.method}
                </Badge>
                <Badge 
                  variant="outline" 
                  className={
                    log.status === 'Sucesso' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }
                >
                  {log.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}