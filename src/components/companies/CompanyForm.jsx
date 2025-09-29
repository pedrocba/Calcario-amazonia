import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Save, X } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

export default function CompanyForm({ company, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    full_name: '',
    cnpj: '',
    ie: '', // Inscrição Estadual
    address: '',
    city: '',
    state: '',
    zip_code: '',
    phone: '',
    email: '',
    website: '',
    type: 'matriz',
    active: true,
    notes: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        code: company.code || '',
        full_name: company.full_name || '',
        cnpj: company.cnpj || '',
        ie: company.ie || '',
        address: company.address || '',
        city: company.city || '',
        state: company.state || '',
        zip_code: company.zip_code || '',
        phone: company.phone || '',
        email: company.email || '',
        website: company.website || '',
        type: company.type || 'matriz',
        active: company.active !== undefined ? company.active : true,
        notes: company.notes || ''
      });
    }
  }, [company]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome da empresa é obrigatório';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Código da empresa é obrigatório';
    }

    if (formData.cnpj && !/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(formData.cnpj)) {
      newErrors.cnpj = 'CNPJ deve estar no formato 00.000.000/0000-00';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email deve ter um formato válido';
    }

    if (formData.zip_code && !/^\d{5}-?\d{3}$/.test(formData.zip_code)) {
      newErrors.zip_code = 'CEP deve estar no formato 00000-000';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Erro ao salvar empresa:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatCNPJ = (value) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  const formatCEP = (value) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/^(\d{5})(\d{3})$/, '$1-$2');
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          {company ? 'Editar Empresa' : 'Cadastrar Nova Empresa'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Empresa *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Ex: Calcário Amazônia"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Código da Empresa *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                placeholder="Ex: CA001"
                className={errors.code ? 'border-red-500' : ''}
              />
              {errors.code && <p className="text-sm text-red-500">{errors.code}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Razão Social</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleChange('full_name', e.target.value)}
                placeholder="Ex: Calcário Amazônia Ltda"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={formData.cnpj}
                onChange={(e) => handleChange('cnpj', formatCNPJ(e.target.value))}
                placeholder="00.000.000/0000-00"
                maxLength={18}
                className={errors.cnpj ? 'border-red-500' : ''}
              />
              {errors.cnpj && <p className="text-sm text-red-500">{errors.cnpj}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ie">Inscrição Estadual</Label>
              <Input
                id="ie"
                value={formData.ie}
                onChange={(e) => handleChange('ie', e.target.value)}
                placeholder="Ex: 123456789"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="matriz">Matriz</SelectItem>
                  <SelectItem value="filial">Filial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Endereço</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="Rua, número, bairro"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="Ex: Santarém"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value.toUpperCase())}
                  placeholder="Ex: PA"
                  maxLength={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zip_code">CEP</Label>
                <Input
                  id="zip_code"
                  value={formData.zip_code}
                  onChange={(e) => handleChange('zip_code', formatCEP(e.target.value))}
                  placeholder="00000-000"
                  maxLength={9}
                  className={errors.zip_code ? 'border-red-500' : ''}
                />
                {errors.zip_code && <p className="text-sm text-red-500">{errors.zip_code}</p>}
              </div>
            </div>
          </div>

          {/* Contato */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contato</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="(93) 99999-9999"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="contato@empresa.com"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  placeholder="https://www.empresa.com"
                />
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Informações adicionais sobre a empresa..."
              rows={3}
            />
          </div>

          {/* Status */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => handleChange('active', e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="active">Empresa ativa</Label>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Salvando...' : (company ? 'Atualizar' : 'Cadastrar')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}




