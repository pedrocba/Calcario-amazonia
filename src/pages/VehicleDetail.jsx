import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Vehicle } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function VehicleDetail() {
  const { vehicleId } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("VehicleDetail montado, vehicleId:", vehicleId);
    loadVehicleData();
  }, [vehicleId]);

  const loadVehicleData = async () => {
    try {
      console.log("Buscando veículos...");
      const vehicles = await Vehicle.list();
      console.log("Veículos encontrados:", vehicles.length);
      
      const foundVehicle = vehicles.find(v => v.id === vehicleId);
      console.log("Veículo encontrado:", foundVehicle);
      
      setVehicle(foundVehicle);
    } catch (err) {
      console.error('Erro ao carregar veículo:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  console.log("Renderizando VehicleDetail - Loading:", isLoading, "Vehicle:", vehicle, "Error:", error);

  if (error) {
    return (
      <div className="p-6">
        <h1>Erro: {error}</h1>
        <Link to="/vehicles">
          <Button>Voltar</Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <h1>Carregando...</h1>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="p-6">
        <h1>Veículo não encontrado</h1>
        <p>ID procurado: {vehicleId}</p>
        <Link to="/vehicles">
          <Button>Voltar</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Link to="/vehicles">
        <Button variant="outline" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </Link>
      
      <h1 className="text-2xl font-bold mb-4">Detalhes do Veículo</h1>
      
      <div className="space-y-2">
        <p><strong>Placa:</strong> {vehicle.plate}</p>
        <p><strong>Modelo:</strong> {vehicle.brand} {vehicle.model}</p>
        <p><strong>Ano:</strong> {vehicle.year || 'Não informado'}</p>
        <p><strong>Motorista:</strong> {vehicle.driver_name || 'Não informado'}</p>
        <p><strong>Status:</strong> {vehicle.status}</p>
        <p><strong>Capacidade:</strong> {vehicle.capacity} toneladas</p>
      </div>
    </div>
  );
}