
import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Scale, 
  Truck, 
  Plus, 
  CheckCircle, 
  Clock,
  Activity,
  Wifi,
  WifiOff
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import WeighingForm from "../components/weighing/WeighingForm";
import WeighingList from "../components/weighing/WeighingList";
import WeighingStats from "../components/weighing/WeighingStats";
import VehicleWeighing from "../components/weighing/VehicleWeighing";
import TicketPrintView from "../components/weighing/TicketPrintView";
import { useInterval } from '../components/hooks/useInterval';

export default function Weighing() {
  // Dados de exemplo (mock data) para substituir as chamadas de API
  const mockVehicles = [
    { id: 1, plate: 'ABC-1234', brand: 'Volvo', model: 'FH 460', year: 2020, driver_name: 'João Silva', active: true, capacity: 25 },
    { id: 2, plate: 'DEF-5678', brand: 'Scania', model: 'R 450', year: 2019, driver_name: 'Maria Santos', active: true, capacity: 30 },
    { id: 3, plate: 'GHI-9012', brand: 'Mercedes', model: 'Actros 2651', year: 2021, driver_name: 'Pedro Costa', active: true, capacity: 35 }
  ];

  const mockProducts = [
    { id: 1, name: 'Cimento Portland', code: 'PROD000001', category: 'Cimento' },
    { id: 2, name: 'Areia Fina', code: 'PROD000002', category: 'Agregados' },
    { id: 3, name: 'Brita 1', code: 'PROD000003', category: 'Agregados' }
  ];

  const mockTrips = [
    { id: 1, trip_number: 'VG000001', vehicle_id: 1, product_id: 1, gross_weight: 25000, tare_weight: 8000, net_weight: 17000, status: 'concluida', created_date: '2024-01-15T10:00:00Z' },
    { id: 2, trip_number: 'VG000002', vehicle_id: 2, product_id: 2, gross_weight: 30000, tare_weight: 9000, net_weight: 21000, status: 'concluida', created_date: '2024-01-14T14:30:00Z' },
    { id: 3, trip_number: 'VG000003', vehicle_id: 3, product_id: 3, gross_weight: 35000, tare_weight: 10000, net_weight: 25000, status: 'em_andamento', created_date: '2024-01-13T09:15:00Z' }
  ];

  const mockScaleReadings = [
    { id: 1, reading_id: 'RD001', vehicle_id: 1, weight: 25000, reading_datetime: '2024-01-15T10:00:00Z', reading_type: 'gross', scale_id: 'WT3000-i-001' },
    { id: 2, reading_id: 'RD002', vehicle_id: 1, weight: 8000, reading_datetime: '2024-01-15T10:05:00Z', reading_type: 'tare', scale_id: 'WT3000-i-001' },
    { id: 3, reading_id: 'RD003', vehicle_id: 2, weight: 30000, reading_datetime: '2024-01-14T14:30:00Z', reading_type: 'gross', scale_id: 'WT3000-i-001' }
  ];

  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [products, setProducts] = useState([]);
  const [scaleReadings, setScaleReadings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('individual');
  const [scaleStatus, setScaleStatus] = useState({ connected: true, weight: 25000, message: 'Conectada' });
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [ticketToPrint, setTicketToPrint] = useState(null);

  useEffect(() => {
    // Carregar dados de exemplo
    setTrips(mockTrips);
    setVehicles(mockVehicles);
    setProducts(mockProducts);
    setScaleReadings(mockScaleReadings);

    const handleAfterPrint = () => {
      setTicketToPrint(null);
    };

    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  // Hook para verificar o status da balança (simulado)
  useInterval(async () => {
    try {
      // Simular status da balança
      const randomWeight = Math.floor(Math.random() * 50000) + 10000; // Peso aleatório entre 10-60 toneladas
      setScaleStatus({ connected: true, weight: randomWeight, message: 'Conectada' });
    } catch (error) {
      setScaleStatus({ connected: false, weight: 0, message: 'Balança simulada' });
    }
  }, 3000);

  const handleVehicleSelect = (vehicleId) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    setSelectedVehicle(vehicle);
  };

  const handleCaptureWeight = async (weighingType) => {
    if (!selectedVehicle || !scaleStatus.connected) {
      alert('Erro: Veículo não selecionado ou balança desconectada!');
      return;
    }

    try {
      const readingId = `RD${Date.now()}`;
      const currentDateTime = new Date().toISOString();
      
      // Simular criação de leitura da balança
      const newReading = {
        id: Math.max(...scaleReadings.map(r => r.id)) + 1,
        reading_id: readingId,
        vehicle_id: selectedVehicle.id,
        weight: scaleStatus.weight,
        reading_datetime: currentDateTime,
        reading_type: weighingType,
        scale_id: "WT3000-i-001",
        operator: "Operador Sistema",
        stability_status: "stable",
        raw_data: `WT3000-i|${scaleStatus.weight}|${currentDateTime}|STABLE|${selectedVehicle.plate}`
      };
      
      setScaleReadings([...scaleReadings, newReading]);

      // Feedback visual
      const tipoTexto = weighingType === 'tara' ? 'TARA (Vazio)' : 'BRUTO (Carregado)';
      alert(`✅ ${tipoTexto} capturado com sucesso!\n\n` +
            `Veículo: ${selectedVehicle.plate}\n` +
            `Peso: ${(scaleStatus.weight / 1000).toFixed(3)} toneladas\n` +
            `Data/Hora: ${new Date().toLocaleString('pt-BR')}`);
    } catch (error) {
      console.error('Erro ao capturar peso:', error);
      alert('❌ Erro ao capturar peso. Tente novamente.');
    }
  };

  const handleSubmit = async (tripData) => {
    try {
      const lastTrip = trips[0];
      const lastNumber = lastTrip ? parseInt(lastTrip.trip_number.replace(/\D/g, ''), 10) : 0;
      const nextNumber = lastNumber + 1;
      tripData.trip_number = `VG${String(nextNumber).padStart(6, '0')}`;
      
      // Simular criação
      const newId = Math.max(...trips.map(t => t.id)) + 1;
      const newTrip = { id: newId, ...tripData };
      setTrips([newTrip, ...trips]);
      
      setShowForm(false);
      alert('Viagem criada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar viagem:', error);
    }
  };

  const handlePrintTicket = (trip) => {
    setTicketToPrint(trip);
    setTimeout(() => {
      window.print();
    }, 100); // Aguarda um instante para o componente renderizar
  };

  const completedTrips = useMemo(() => {
    return trips.filter(t => t.status === 'concluida');
  }, [trips]);

  const vehicleReadings = useMemo(() => {
    if (!selectedVehicle) return [];
    return scaleReadings.filter(r => r.vehicle_id === selectedVehicle.id);
  }, [scaleReadings, selectedVehicle]);

  const getTripDetailsForPrint = (trip) => {
    if (!trip) return {};
    const vehicle = vehicles.find(v => v.id === trip.vehicle_id);
    const product = products.find(p => p.id === trip.product_id);
    return { trip, vehicle, product };
  };

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-ticket, .printable-ticket * {
            visibility: visible;
          }
          .printable-ticket {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
      
      <div className={ticketToPrint ? 'hidden' : ''}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Sistema de Pesagem WT3000-i</h1>
                <p className="text-slate-600">Pesagem individual simplificada - Clique no veículo e capture o peso</p>
              </div>
              <div className="flex items-center gap-4">
                <Badge 
                  variant="outline" 
                  className={scaleStatus.connected ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}
                >
                  <div className={`w-2 h-2 rounded-full mr-2 ${scaleStatus.connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                  {scaleStatus.connected ? <><Wifi className="w-3 h-3 mr-1" />Balança Conectada</> : <><WifiOff className="w-3 h-3 mr-1" />{scaleStatus.message}</>}
                </Badge>
                {selectedVehicle && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    <Truck className="w-3 h-3 mr-1" />
                    {selectedVehicle.plate}
                  </Badge>
                )}
              </div>
            </div>

            <WeighingStats trips={trips} isLoading={isLoading} />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 lg:w-96">
                <TabsTrigger value="individual" className="flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Pesagem
                </TabsTrigger>
                <TabsTrigger value="viagens" className="flex items-center gap-2">
                  <Scale className="w-4 h-4" />
                  Viagens
                </TabsTrigger>
                <TabsTrigger value="monitor" className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Monitor
                </TabsTrigger>
                <TabsTrigger value="historico" className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Histórico
                </TabsTrigger>
              </TabsList>

              <TabsContent value="individual" className="space-y-6">
                <VehicleWeighing 
                  vehicles={vehicles}
                  selectedVehicle={selectedVehicle}
                  currentWeight={scaleStatus.weight}
                  scaleConnected={scaleStatus.connected}
                  vehicleReadings={vehicleReadings}
                  onVehicleSelect={handleVehicleSelect}
                  onCaptureWeight={handleCaptureWeight}
                  scaleMessage={scaleStatus.message}
                />
              </TabsContent>

              <TabsContent value="viagens" className="space-y-6">
                <div className="flex justify-end">
                  <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 shadow-lg">
                    <Plus className="w-5 h-5 mr-2" />
                    Nova Viagem
                  </Button>
                </div>

                <AnimatePresence>
                  {showForm && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <WeighingForm 
                        vehicles={vehicles}
                        products={products}
                        onSubmit={handleSubmit} 
                        onCancel={() => setShowForm(false)} 
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <WeighingList 
                  trips={trips} 
                  vehicles={vehicles}
                  products={products}
                  isLoading={isLoading}
                  title="Todas as Viagens"
                  onPrintTicket={handlePrintTicket}
                />
              </TabsContent>

              <TabsContent value="monitor" className="space-y-6">
                {/* Scale connection is now handled globally via useInterval hook.
                    This tab could show detailed scale diagnostics if needed. */}
              </TabsContent>

              <TabsContent value="historico" className="space-y-6">
                <WeighingList 
                  trips={completedTrips} 
                  vehicles={vehicles}
                  products={products}
                  isLoading={isLoading}
                  showDetails={true}
                  title={`Viagens Concluídas (${completedTrips.length})`}
                  onPrintTicket={handlePrintTicket}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {ticketToPrint && (
        <div className="printable-ticket">
          <TicketPrintView {...getTripDetailsForPrint(ticketToPrint)} />
        </div>
      )}
    </>
  );
}
