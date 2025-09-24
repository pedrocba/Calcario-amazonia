
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Fuel, X, Save, Camera, Upload, Image } from "lucide-react";
import { UploadFile } from "@/api/integrations";
import { PostoCombustivel } from "@/api/entities"; // Importar a entidade

export default function FuelingForm({ vehicleId, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    vehicle_id: vehicleId,
    date: new Date().toISOString().slice(0, 16),
    fuel_type: 'diesel_s10',
    liters: '',
    total_cost: '',
    odometer_at_fueling: '',
    supplier: '',
    odometer_photo_url: '',
    responsavel_abastecimento: '' // Campo obrigatório
  });
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedPhoto, setUploadedPhoto] = useState(null);
  const [postos, setPostos] = useState([]); // Estado para os postos

  useEffect(() => {
    // Carregar postos de combustível quando o formulário é montado
    const fetchPostos = async () => {
      try {
        const postosData = await PostoCombustivel.list();
        setPostos(postosData || []);
        // Set initial fuel_type if postos are loaded and default is not valid or prefer first available
        if (postosData && postosData.length > 0) {
          const defaultFuelType = postosData[0].tipo_combustivel;
          setFormData(prev => ({ ...prev, fuel_type: defaultFuelType }));
        }
      } catch (error) {
        console.error("Erro ao carregar postos de combustível:", error);
        // Optionally, alert the user or handle the error gracefully
      }
    };
    fetchPostos();
  }, []);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Verificar se é uma imagem
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem (JPG, PNG, etc.)');
      return;
    }

    // Verificar tamanho do arquivo (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      setFormData(prev => ({ ...prev, odometer_photo_url: file_url }));
      setUploadedPhoto(file_url);
      alert('✅ Foto do hodômetro enviada com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error);
      alert('❌ Erro ao enviar a foto. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  const removePhoto = () => {
    setFormData(prev => ({ ...prev, odometer_photo_url: '' }));
    setUploadedPhoto(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.responsavel_abastecimento) {
        alert("Por favor, informe o nome do responsável pelo abastecimento.");
        return;
    }
    const dataToSubmit = {
      ...formData,
      liters: parseFloat(formData.liters) || 0,
      total_cost: parseFloat(formData.total_cost) || 0,
      odometer_at_fueling: parseInt(formData.odometer_at_fueling, 10) || 0,
    };
    onSubmit(dataToSubmit);
  };

  // Filtrar os tipos de combustível disponíveis nos postos cadastrados
  // Ensure availableFuelTypes is always an array of strings
  const availableFuelTypes = postos.length > 0
    ? [...new Set(postos.map(p => p.tipo_combustivel).filter(Boolean))]
    : ['diesel_s10', 'diesel_s500', 'arla_32', 'gasolina_comum', 'gasolina_aditivada']; // Fallback options if no postos are loaded

  return (
    <Card className="bg-white/95 my-6 shadow-lg border-l-4 border-orange-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Fuel className="w-6 h-6 text-orange-600" /> 
          Novo Abastecimento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data e Hora</Label>
              <Input 
                id="date" 
                type="datetime-local" 
                value={formData.date} 
                onChange={(e) => handleChange('date', e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="odometer_at_fueling">Hodômetro (km)</Label>
              <Input 
                id="odometer_at_fueling" 
                type="number" 
                value={formData.odometer_at_fueling} 
                onChange={(e) => handleChange('odometer_at_fueling', e.target.value)} 
                placeholder="150200" 
                required 
              />
            </div>
          </div>

          {/* Seção de Upload da Foto do Hodômetro */}
          <div className="border-2 border-dashed border-orange-200 rounded-lg p-6 bg-orange-50/50">
            <div className="text-center">
              <Camera className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-orange-900 mb-2">
                Foto do Hodômetro
              </h3>
              <p className="text-sm text-orange-700 mb-4">
                Tire uma foto clara do hodômetro para comprovar a quilometragem
              </p>
              
              {!uploadedPhoto && (
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="odometer-photo"
                    disabled={isUploading}
                  />
                  <label
                    htmlFor="odometer-photo"
                    className={`inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg cursor-pointer hover:bg-orange-700 transition-colors ${
                      isUploading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isUploading ? (
                      <>
                        <Upload className="w-4 h-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Escolher Foto
                      </>
                    )}
                  </label>
                  <p className="text-xs text-orange-600">
                    Formatos aceitos: JPG, PNG, GIF (máx. 5MB)
                  </p>
                </div>
              )}

              {uploadedPhoto && (
                <div className="space-y-3">
                  <div className="relative inline-block">
                    <img 
                      src={uploadedPhoto} 
                      alt="Foto do hodômetro" 
                      className="max-w-full max-h-40 rounded-lg shadow-md"
                    />
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={removePhoto}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Remover
                    </Button>
                    <label
                      htmlFor="odometer-photo"
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-orange-100 text-orange-700 rounded border border-orange-200 cursor-pointer hover:bg-orange-200 transition-colors"
                    >
                      <Image className="w-4 h-4" />
                      Trocar Foto
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fuel_type">Combustível</Label>
              <Select value={formData.fuel_type} onValueChange={(v) => handleChange('fuel_type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {availableFuelTypes.map(type => (
                     <SelectItem key={type} value={type}>
                       {type === 'diesel_s10' && 'Diesel S10'}
                       {type === 'diesel_s500' && 'Diesel S500'}
                       {type === 'arla_32' && 'Arla 32'}
                       {type === 'gasolina_comum' && 'Gasolina Comum'}
                       {type === 'gasolina_aditivada' && 'Gasolina Aditivada'}
                     </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="liters">Litros</Label>
              <Input 
                id="liters" 
                type="number" 
                step="0.01" 
                value={formData.liters} 
                onChange={(e) => handleChange('liters', e.target.value)} 
                placeholder="300.50" 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="total_cost">Custo Total (R$)</Label>
              <Input 
                id="total_cost" 
                type="number" 
                step="0.01" 
                value={formData.total_cost} 
                onChange={(e) => handleChange('total_cost', e.target.value)} 
                placeholder="1500.00" 
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplier">Fornecedor / Posto</Label>
              <Input 
                id="supplier" 
                type="text" 
                value={formData.supplier} 
                onChange={(e) => handleChange('supplier', e.target.value)} 
                placeholder="Posto Shell" 
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="responsavel_abastecimento">Responsável <span className="text-red-500">*</span></Label>
              <Input 
                id="responsavel_abastecimento" 
                type="text" 
                value={formData.responsavel_abastecimento} 
                onChange={(e) => handleChange('responsavel_abastecimento', e.target.value)} 
                placeholder="Nome de quem abasteceu" 
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-orange-600 hover:bg-orange-700"
              disabled={isUploading}
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Abastecimento
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
