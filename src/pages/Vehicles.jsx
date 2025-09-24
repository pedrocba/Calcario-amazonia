
import React, { useState, useEffect, useMemo, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Truck, QrCode, Radio, ArrowLeft, Activity, Fuel, Wrench, Printer } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

import VehicleForm from "../components/vehicles/VehicleForm";
import VehicleList from "../components/vehicles/VehicleList";
import VehicleIdentification from "../components/vehicles/VehicleIdentification";
import VehicleStats from "../components/vehicles/VehicleStats";
import FuelingForm from "../components/vehicles/FuelingForm";
import FuelingList from "../components/vehicles/FuelingList";
import VehicleExpenseForm from "../components/vehicles/VehicleExpenseForm";
import VehicleExpenseList from "../components/vehicles/VehicleExpenseList";
import FuelingTicket from "../components/vehicles/FuelingTicket";
import PrintTicketStyle from "../components/ui/PrintTicketStyle";
import { useCompany } from "../components/common/CompanyContext";

export default function Vehicles() {
  // Dados de exemplo (mock data) para substituir as chamadas de API
  const mockVehicles = [
    { id: 1, plate: 'ABC-1234', brand: 'Volvo', model: 'FH 460', year: 2020, driver_name: 'João Silva', driver_cnh: '12345678901', vehicle_code: 'VEI001', rfid_tag: 'RFID001ABC1234', qr_code: 'QR001ABC1234', status: 'ativo', capacity: 25, odometer: 150000, fleet: 'Frota A', company: 'Empresa Exemplo', cost_center: 'Centro A' },
    { id: 2, plate: 'DEF-5678', brand: 'Scania', model: 'R 450', year: 2019, driver_name: 'Maria Santos', driver_cnh: '98765432109', vehicle_code: 'VEI002', rfid_tag: 'RFID002DEF5678', qr_code: 'QR002DEF5678', status: 'ativo', capacity: 30, odometer: 200000, fleet: 'Frota B', company: 'Empresa Exemplo', cost_center: 'Centro B' },
    { id: 3, plate: 'GHI-9012', brand: 'Mercedes', model: 'Actros 2651', year: 2021, driver_name: 'Pedro Costa', driver_cnh: '11223344556', vehicle_code: 'VEI003', rfid_tag: 'RFID003GHI9012', qr_code: 'QR003GHI9012', status: 'manutencao', capacity: 35, odometer: 80000, fleet: 'Frota C', company: 'Empresa Exemplo', cost_center: 'Centro C' }
  ];

  const mockFuelingRecords = [
    { id: 1, vehicle_id: 1, fuel_type: 'Diesel', liters: 200, price_per_liter: 4.50, total_cost: 900.00, date: '2024-01-15T10:00:00Z', location: 'Posto Central' },
    { id: 2, vehicle_id: 2, fuel_type: 'Diesel', liters: 150, price_per_liter: 4.50, total_cost: 675.00, date: '2024-01-14T14:30:00Z', location: 'Posto Central' },
    { id: 3, vehicle_id: 1, fuel_type: 'Diesel', liters: 180, price_per_liter: 4.50, total_cost: 810.00, date: '2024-01-13T09:15:00Z', location: 'Posto Central' }
  ];

  const mockVehicleExpenses = [
    { id: 1, vehicle_id: 1, type: 'Manutenção', description: 'Troca de óleo', cost: 150.00, date: '2024-01-15T10:00:00Z' },
    { id: 2, vehicle_id: 2, type: 'Pneu', description: 'Troca de pneus', cost: 800.00, date: '2024-01-14T14:30:00Z' },
    { id: 3, vehicle_id: 3, type: 'Manutenção', description: 'Revisão geral', cost: 1200.00, date: '2024-01-13T09:15:00Z' }
  ];

  const [vehicles, setVehicles] = useState([]);
  const [fuelingRecords, setFuelingRecords] = useState([]);
  const [vehicleExpenses, setVehicleExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('cadastro');
  const [scannedCode, setScannedCode] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showFuelingForm, setShowFuelingForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [detailTab, setDetailTab] = useState('overview');
  const [fuelingTicketToPrint, setFuelingTicketToPrint] = useState(null);
  const [currentUser, setCurrentUser] = useState({ id: 1, email: 'admin@exemplo.com', full_name: 'Administrador' });
  const { currentCompany } = useCompany();

  useEffect(() => {
    if (currentCompany) {
      // Carregar dados de exemplo
      setVehicles(mockVehicles);
      setFuelingRecords(mockFuelingRecords);
      setVehicleExpenses(mockVehicleExpenses);
    }
    
    const handleAfterPrint = () => {
      setFuelingTicketToPrint(null);
    };

    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [currentCompany]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle => {
      const searchMatch = searchTerm === '' ||
        vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.driver_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (vehicle.vehicle_code && vehicle.vehicle_code.toLowerCase().includes(searchTerm.toLowerCase()));

      return searchMatch;
    });
  }, [vehicles, searchTerm]);

  const handleSubmit = async (vehicleData) => {
    if (!currentCompany) {
      alert('Erro: Nenhuma empresa selecionada para salvar o veículo.');
      return;
    }

    const dataToSave = {
      ...vehicleData,
      company_id: currentCompany.id,
      company_name: currentCompany.name,
    };

    try {
      if (editingVehicle) {
        // Simular atualização
        const updatedVehicles = vehicles.map(v => 
          v.id === editingVehicle.id 
            ? { ...v, ...dataToSave }
            : v
        );
        setVehicles(updatedVehicles);
        alert('Veículo atualizado com sucesso!');
      } else {
        // Simular criação
        const newId = Math.max(...vehicles.map(v => v.id)) + 1;
        if (!dataToSave.vehicle_code) {
          const lastCodeNum = vehicles.reduce((max, v) => {
              if (v.vehicle_code && v.vehicle_code.startsWith('VEI')) {
                  const num = parseInt(v.vehicle_code.replace('VEI', ''), 10);
                  return isNaN(num) ? max : Math.max(max, num);
              }
              return max;
          }, 0);
          const nextCode = lastCodeNum + 1;
          dataToSave.vehicle_code = `VEI${String(nextCode).padStart(3, '0')}`;
        }

        if (!dataToSave.rfid_tag) {
          dataToSave.rfid_tag = `RFID${dataToSave.vehicle_code}${Date.now().toString().slice(-6)}`;
        }

        if (!dataToSave.qr_code) {
          dataToSave.qr_code = `QR${dataToSave.vehicle_code}${dataToSave.plate.replace('-', '')}`;
        }

        const newVehicle = { id: newId, ...dataToSave };
        setVehicles([...vehicles, newVehicle]);
        alert('Veículo criado com sucesso!');
      }

      setShowForm(false);
      setEditingVehicle(null);
    } catch (error) {
      console.error('Erro ao salvar veículo:', error);
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setShowForm(true);
  };

  const handleVehicleIdentified = (vehicleCode) => {
    const identifiedVehicle = vehicles.find(v =>
      v.company_id === currentCompany.id && ( // Adiciona filtro por empresa
      (v.vehicle_code && v.vehicle_code === vehicleCode) ||
      (v.rfid_tag && v.rfid_tag === vehicleCode) ||
      (v.qr_code && v.qr_code === vehicleCode) ||
      v.plate === vehicleCode
      )
    );

    if (identifiedVehicle) {
      alert(`Veículo identificado: ${identifiedVehicle.plate} - ${identifiedVehicle.driver_name}\nRedirecionando para pesagem...`);
    } else {
      alert('Veículo não encontrado no sistema para a empresa atual!');
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingVehicle(null);
  };

  const handleFuelingSubmit = async (fuelingData) => {
    if (!currentCompany) {
      alert('Erro: Nenhuma empresa selecionada para registrar o abastecimento.');
      return;
    }
    
    try {
      const dataToSave = {
        ...fuelingData,
        company_id: currentCompany.id,
        company_name: currentCompany.name,
      };
      
      // Simular criação
      const newId = Math.max(...fuelingRecords.map(r => r.id)) + 1;
      const newRecord = { id: newId, ...dataToSave };
      setFuelingRecords([...fuelingRecords, newRecord]);
      
      console.log('🚛 Abastecimento registrado, ID:', newId);
      
      setShowFuelingForm(false);
      handlePrintFuelingTicket(newRecord);
      alert('✅ Abastecimento registrado com sucesso!');

    } catch (error) { 
      console.error('❌ Erro ao salvar abastecimento:', error);
      alert('Erro ao registrar o abastecimento.');
    }
  };

  const handleDeleteFueling = async (record) => {
    const motivo = prompt('Por favor, insira o motivo da exclusão deste abastecimento:');
    if (!motivo || motivo.trim() === '') {
      alert('O motivo da exclusão é obrigatório.');
      return;
    }

    try {
      // Simular exclusão
      const updatedRecords = fuelingRecords.filter(r => r.id !== record.id);
      setFuelingRecords(updatedRecords);

      alert('Abastecimento excluído com sucesso!');
    } catch (error) {
      console.error("Erro ao excluir abastecimento:", error);
      alert("Falha ao excluir o registro. Tente novamente.");
    }
  };

  const handlePrintFuelingTicket = (record) => {
    const vehicle = vehicles.find(v => v.id === record.vehicle_id);
    setFuelingTicketToPrint({ record, vehicle });
    setTimeout(() => window.print(), 300);
  };

  const handleExpenseSubmit = async (expenseData) => {
    if (!currentCompany) {
      alert('Erro: Nenhuma empresa selecionada para registrar a despesa.');
      return;
    }
    try {
      const dataToSave = {
        ...expenseData,
        company_id: currentCompany.id,
        company_name: currentCompany.name,
      };
      
      // Simular criação
      const newId = Math.max(...vehicleExpenses.map(e => e.id)) + 1;
      const newExpense = { id: newId, ...dataToSave };
      setVehicleExpenses([...vehicleExpenses, newExpense]);
      
      setShowExpenseForm(false);
      alert('Despesa registrada com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar despesa:', error);
    }
  };

  const handleViewDetails = (vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800';
      case 'parado': return 'bg-yellow-100 text-yellow-800';
      case 'manutencao': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (fuelingTicketToPrint) {
    return (
      <>
        <PrintTicketStyle />
        <div className="printable-ticket">
          <FuelingTicket {...fuelingTicketToPrint} />
        </div>
      </>
    );
  }

  if (selectedVehicle) {
    const currentVehicleFueling = fuelingRecords.filter(r => r.vehicle_id === selectedVehicle.id);
    const currentVehicleExpenses = vehicleExpenses.filter(e => e.vehicle_id === selectedVehicle.id);
    const totalFuelingCost = currentVehicleFueling.reduce((sum, record) => sum + (record.total_cost || 0), 0);
    const totalExpenseCost = currentVehicleExpenses.reduce((sum, expense) => sum + (expense.cost || 0), 0);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-3 sm:p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col space-y-4 mb-6 lg:mb-8">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedVehicle(null)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Voltar</span>
              </Button>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-2 lg:gap-3">
                  <Truck className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600" />
                  <span className="truncate">{selectedVehicle.plate}</span>
                </h1>
                <p className="text-sm sm:text-base text-slate-600 truncate">
                  {selectedVehicle.brand} {selectedVehicle.model} - {selectedVehicle.year || 'Ano não informado'}
                </p>
              </div>
            </div>
            <div className="flex justify-center">
              <Badge className={`${getStatusColor(selectedVehicle.status)} text-xs sm:text-sm`}>
                {selectedVehicle.status === 'ativo' ? 'Ativo' :
                  selectedVehicle.status === 'parado' ? 'Parado' :
                    selectedVehicle.status === 'manutencao' ? 'Em Manutenção' : selectedVehicle.status}
              </Badge>
            </div>
          </div>

          <Tabs value={detailTab} onValueChange={setDetailTab} className="space-y-4 lg:space-y-6">
            <TabsList className="grid w-full grid-cols-3 h-auto p-1">
              <TabsTrigger value="overview" className="text-xs sm:text-sm py-2">
                <span className="hidden sm:inline">Visão Geral</span>
                <span className="sm:hidden">Info</span>
              </TabsTrigger>
              <TabsTrigger value="fueling" className="text-xs sm:text-sm py-2">
                <span className="hidden sm:inline">Abastecimentos</span>
                <span className="sm:hidden">Combustível</span>
              </TabsTrigger>
              <TabsTrigger value="expenses" className="text-xs sm:text-sm py-2">
                <span className="hidden sm:inline">Despesas</span>
                <span className="sm:hidden">Gastos</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 lg:space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
                <Card className="bg-white/70 backdrop-blur border-0 shadow-lg">
                  <CardContent className="p-3 lg:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="mb-2 lg:mb-0">
                        <p className="text-xs lg:text-sm font-medium text-slate-600">Hodômetro</p>
                        <p className="text-sm lg:text-2xl font-bold text-slate-900">
                          {selectedVehicle.odometer ? `${selectedVehicle.odometer.toLocaleString('pt-BR')} km` : '0 km'}
                        </p>
                      </div>
                      <Activity className="w-5 h-5 lg:w-8 lg:h-8 text-blue-600 self-end lg:self-auto" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/70 backdrop-blur border-0 shadow-lg">
                  <CardContent className="p-3 lg:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="mb-2 lg:mb-0">
                        <p className="text-xs lg:text-sm font-medium text-slate-600">Capacidade</p>
                        <p className="text-sm lg:text-2xl font-bold text-slate-900">{selectedVehicle.capacity} t</p>
                      </div>
                      <Truck className="w-5 h-5 lg:w-8 lg:h-8 text-green-600 self-end lg:self-auto" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/70 backdrop-blur border-0 shadow-lg">
                  <CardContent className="p-3 lg:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="mb-2 lg:mb-0">
                        <p className="text-xs lg:text-sm font-medium text-slate-600">Abastecimentos</p>
                        <p className="text-sm lg:text-xl font-bold text-slate-900">{currentVehicleFueling.length}</p>
                        <p className="text-xs text-green-600 truncate">
                          {totalFuelingCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                      </div>
                      <Fuel className="w-5 h-5 lg:w-8 lg:h-8 text-orange-600 self-end lg:self-auto" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/70 backdrop-blur border-0 shadow-lg">
                  <CardContent className="p-3 lg:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="mb-2 lg:mb-0">
                        <p className="text-xs lg:text-sm font-medium text-slate-600">Despesas</p>
                        <p className="text-sm lg:text-xl font-bold text-slate-900">{currentVehicleExpenses.length}</p>
                        <p className="text-xs text-red-600 truncate">
                          {totalExpenseCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                      </div>
                      <Wrench className="w-5 h-5 lg:w-8 lg:h-8 text-purple-600 self-end lg:self-auto" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6">
                <Card className="bg-white/70 backdrop-blur border-0 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Informações do Veículo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 lg:gap-4">
                      <div>
                        <p className="text-xs lg:text-sm font-medium text-slate-600">Marca</p>
                        <p className="text-sm lg:text-lg text-slate-900 truncate">{selectedVehicle.brand}</p>
                      </div>
                      <div>
                        <p className="text-xs lg:text-sm font-medium text-slate-600">Modelo</p>
                        <p className="text-sm lg:text-lg text-slate-900 truncate">{selectedVehicle.model}</p>
                      </div>
                      <div>
                        <p className="text-xs lg:text-sm font-medium text-slate-600">Ano</p>
                        <p className="text-sm lg:text-lg text-slate-900">{selectedVehicle.year || 'Não informado'}</p>
                      </div>
                      <div>
                        <p className="text-xs lg:text-sm font-medium text-slate-600">Frota</p>
                        <p className="text-sm lg:text-lg text-slate-900 truncate">{selectedVehicle.fleet || 'Não informado'}</p>
                      </div>
                      <div>
                        <p className="text-xs lg:text-sm font-medium text-slate-600">Empresa</p>
                        <p className="text-sm lg:text-lg text-slate-900 truncate">{selectedVehicle.company || 'Não informado'}</p>
                      </div>
                      <div>
                        <p className="text-xs lg:text-sm font-medium text-slate-600">Centro de Custo</p>
                        <p className="text-sm lg:text-lg text-slate-900 truncate">{selectedVehicle.cost_center || 'Não informado'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/70 backdrop-blur border-0 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Motorista e Identificação</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs lg:text-sm font-medium text-slate-600">Motorista</p>
                        <p className="text-sm lg:text-lg text-slate-900 truncate">{selectedVehicle.driver_name || 'Não informado'}</p>
                      </div>
                      <div>
                        <p className="text-xs lg:text-sm font-medium text-slate-600">CNH</p>
                        <p className="text-sm lg:text-lg text-slate-900 truncate">{selectedVehicle.driver_cnh || 'Não informado'}</p>
                      </div>
                      <div>
                        <p className="text-xs lg:text-sm font-medium text-slate-600">Código do Veículo</p>
                        <p className="text-sm lg:text-lg text-slate-900 truncate">{selectedVehicle.vehicle_code || 'Não informado'}</p>
                      </div>
                      <div>
                        <p className="text-xs lg:text-sm font-medium text-slate-600">Tag RFID</p>
                        <p className="text-sm lg:text-lg text-slate-900 truncate">{selectedVehicle.rfid_tag || 'Não informado'}</p>
                      </div>
                      <div>
                        <p className="text-xs lg:text-sm font-medium text-slate-600">Código QR</p>
                        <p className="text-sm lg:text-lg text-slate-900 truncate">{selectedVehicle.qr_code || 'Não informado'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="fueling" className="space-y-4 lg:space-y-6">
              <div className="flex justify-center lg:justify-end">
                <Button
                  onClick={() => setShowFuelingForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 shadow-lg w-full sm:w-auto"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Novo Abastecimento</span>
                  <span className="sm:hidden">Novo</span>
                </Button>
              </div>
              <AnimatePresence>
                {showFuelingForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <FuelingForm
                      vehicleId={selectedVehicle.id}
                      onSubmit={handleFuelingSubmit}
                      onCancel={() => setShowFuelingForm(false)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              <FuelingList
                records={currentVehicleFueling}
                isLoading={isLoading}
                onPrintTicket={handlePrintFuelingTicket}
                onDeleteFueling={handleDeleteFueling}
              />
            </TabsContent>

            <TabsContent value="expenses" className="space-y-4 lg:space-y-6">
              <div className="flex justify-center lg:justify-end">
                <Button
                  onClick={() => setShowExpenseForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 shadow-lg w-full sm:w-auto"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Nova Despesa</span>
                  <span className="sm:hidden">Nova</span>
                </Button>
              </div>
              <AnimatePresence>
                {showExpenseForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <VehicleExpenseForm
                      vehicleId={selectedVehicle.id}
                      onSubmit={handleExpenseSubmit}
                      onCancel={() => setShowExpenseForm(false)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              <VehicleExpenseList records={currentVehicleExpenses} isLoading={isLoading} />
            </TabsContent>

          </Tabs>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col space-y-4 mb-6 lg:mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">Gestão de Veículos</h1>
            <p className="text-sm lg:text-base text-slate-600">Cadastro de caminhões e identificação na balança</p>
          </div>
        </div>

        <VehicleStats vehicles={vehicles} isLoading={isLoading} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 lg:space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-3 lg:w-96 h-auto p-1">
              <TabsTrigger value="cadastro" className="flex items-center gap-2 text-xs sm:text-sm py-2">
                <Truck className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Cadastro</span>
                <span className="sm:hidden">Novo</span>
              </TabsTrigger>
              <TabsTrigger value="identificacao" className="flex items-center gap-2 text-xs sm:text-sm py-2">
                <QrCode className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Identificação</span>
                <span className="sm:hidden">ID</span>
              </TabsTrigger>
              <TabsTrigger value="lista" className="flex items-center gap-2 text-xs sm:text-sm py-2">
                <Search className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Lista</span>
                <span className="sm:hidden">Ver</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="cadastro" className="space-y-4 lg:space-y-6">
            <div className="flex justify-center lg:justify-end">
              <Button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700 shadow-lg w-full sm:w-auto"
              >
                <Plus className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">Novo Veículo</span>
                <span className="sm:hidden">Novo</span>
              </Button>
            </div>

            <AnimatePresence>
              {showForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <VehicleForm
                    vehicle={editingVehicle}
                    onSubmit={handleSubmit}
                    onCancel={cancelForm}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <VehicleList
              vehicles={vehicles.slice(0, 10)}
              isLoading={isLoading}
              onEdit={handleEdit}
              onViewDetails={handleViewDetails}
              showActions={true}
            />
          </TabsContent>

          <TabsContent value="identificacao" className="space-y-4 lg:space-y-6">
            <VehicleIdentification
              vehicles={vehicles}
              onVehicleIdentified={handleVehicleIdentified}
              scannedCode={scannedCode}
              setScannedCode={setScannedCode}
            />
          </TabsContent>

          <TabsContent value="lista" className="space-y-4 lg:space-y-6">
            <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <Search className="w-5 h-5 text-blue-600" />
                  Buscar Veículos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar por placa, modelo, motorista ou código..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            <VehicleList
              vehicles={filteredVehicles}
              isLoading={isLoading}
              onEdit={handleEdit}
              onViewDetails={handleViewDetails}
              showActions={false}
              showDetails={true}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
