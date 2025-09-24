
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Truck, X, Save, QrCode, Radio } from "lucide-react";

export default function VehicleForm({ vehicle, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(vehicle || {
    plate: '',
    model: '',
    brand: '',
    year: new Date().getFullYear(),
    fleet: 'Própria',
    capacity: 0,
    odometer: 0,
    driver_name: '',
    driver_cnh: '',
    company: 'CBA Mineração',
    cost_center: 'Operação Mina',
    status: 'ativo',
    vehicle_code: '',
    rfid_tag: '',
    qr_code: '',
    tare_weight_empty: 0,
    last_maintenance: '',
    gps_integration_code: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateRFID = () => {
    const rfid = `RFID${Date.now()}`;
    setFormData(prev => ({ ...prev, rfid_tag: rfid }));
  };

  const generateQR = () => {
    const qr = `QR${formData.vehicle_code || 'VEI'}${Date.now()}`;
    setFormData(prev => ({ ...prev, qr_code: qr }));
  };

  const brands = ['Scania', 'Volvo', 'Mercedes-Benz', 'Ford', 'Iveco', 'MAN', 'DAF', 'Volkswagen', 'Randon', 'Librelato', 'Guerra'];
  const companies = ['CBA Mineração', 'Transportes Terceirizados', 'Próprio'];
  const fleets = ['Própria', 'Agregada', 'Alugada'];
  const costCenters = ['Operação Mina', 'Transporte Interno', 'Administrativo', 'Manutenção'];
  const statuses = [
      { value: 'ativo', label: 'Ativo' },
      { value: 'parado', label: 'Parado' },
      { value: 'manutencao', label: 'Em Manutenção' },
  ];

  return (
    <Card className="bg-white/90 backdrop-blur border-0 shadow-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <Truck className="w-6 h-6 text-blue-600" />
          {vehicle ? 'Editar Veículo' : 'Novo Veículo'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="plate">Placa *</Label>
              <Input 
                id="plate" 
                required
                value={formData.plate} 
                onChange={(e) => handleChange('plate', e.target.value.toUpperCase())} 
                placeholder="ABC-1234"
                maxLength={8}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="brand">Marca *</Label>
              <Input
                id="brand"
                required
                value={formData.brand}
                onChange={(e) => handleChange('brand', e.target.value)}
                placeholder="Digite ou selecione a marca"
                list="brands-list"
              />
              <datalist id="brands-list">
                {brands.map(brand => (
                  <option key={brand} value={brand} />
                ))}
              </datalist>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Modelo *</Label>
              <Input 
                id="model" 
                required
                value={formData.model} 
                onChange={(e) => handleChange('model', e.target.value)} 
                placeholder="R 440, FH 460, etc."
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="year">Ano</Label>
              <Input 
                id="year" 
                type="number"
                value={formData.year} 
                onChange={(e) => handleChange('year', parseInt(e.target.value) || 0)} 
                placeholder="2023"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fleet">Frota</Label>
              <Select value={formData.fleet} onValueChange={(value) => handleChange('fleet', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fleets.map(f => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
             <div className="space-y-2">
              <Label htmlFor="status">Status de Operação</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacidade (toneladas) *</Label>
              <Input 
                id="capacity" 
                type="number"
                required
                min="1"
                step="0.1"
                value={formData.capacity} 
                onChange={(e) => handleChange('capacity', parseFloat(e.target.value) || 0)} 
                placeholder="25.0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tare_weight_empty">Peso Vazio (kg)</Label>
              <Input 
                id="tare_weight_empty" 
                type="number"
                min="0"
                step="10"
                value={formData.tare_weight_empty} 
                onChange={(e) => handleChange('tare_weight_empty', parseFloat(e.target.value) || 0)} 
                placeholder="12500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="odometer">Hodômetro (km)</Label>
              <Input 
                id="odometer" 
                type="number"
                min="0"
                value={formData.odometer} 
                onChange={(e) => handleChange('odometer', parseInt(e.target.value) || 0)} 
                placeholder="150000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="driver_name">Nome do Motorista</Label>
              <Input 
                id="driver_name" 
                value={formData.driver_name} 
                onChange={(e) => handleChange('driver_name', e.target.value)} 
                placeholder="João Silva"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="driver_cnh">CNH do Motorista</Label>
              <Input 
                id="driver_cnh" 
                value={formData.driver_cnh} 
                onChange={(e) => handleChange('driver_cnh', e.target.value.replace(/\D/g, ''))} 
                placeholder="12345678901"
                maxLength={11}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="company">Empresa</Label>
              <Select value={formData.company} onValueChange={(value) => handleChange('company', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {companies.map(company => (
                    <SelectItem key={company} value={company}>{company}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost_center">Centro de Custo</Label>
              <Select value={formData.cost_center} onValueChange={(value) => handleChange('cost_center', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {costCenters.map(cc => (
                    <SelectItem key={cc} value={cc}>{cc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Radio className="w-5 h-5 text-green-600" />
              Identificação e Integração
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label htmlFor="vehicle_code">Código do Veículo *</Label>
                <Input 
                  id="vehicle_code" 
                  required
                  value={formData.vehicle_code} 
                  onChange={(e) => handleChange('vehicle_code', e.target.value.toUpperCase())} 
                  placeholder="VEI001"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rfid_tag">Tag RFID</Label>
                <div className="flex gap-2">
                  <Input 
                    id="rfid_tag" 
                    value={formData.rfid_tag} 
                    onChange={(e) => handleChange('rfid_tag', e.target.value)} 
                    placeholder="RFID123456789"
                  />
                  <Button type="button" variant="outline" onClick={generateRFID}>
                    <Radio className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="qr_code">Código QR</Label>
                <div className="flex gap-2">
                  <Input 
                    id="qr_code" 
                    value={formData.qr_code} 
                    onChange={(e) => handleChange('qr_code', e.target.value)} 
                    placeholder="QR123456789"
                  />
                  <Button type="button" variant="outline" onClick={generateQR}>
                    <QrCode className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gps_integration_code">Código GPS</Label>
                <Input 
                  id="gps_integration_code" 
                  value={formData.gps_integration_code} 
                  onChange={(e) => handleChange('gps_integration_code', e.target.value)} 
                  placeholder="Código de integração"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel} className="flex items-center gap-2">
              <X className="w-4 h-4" />
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
              <Save className="w-4 h-4" />
              {vehicle ? 'Atualizar' : 'Cadastrar'} Veículo
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
