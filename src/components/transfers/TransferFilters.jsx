import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statusOptions = [
  { value: 'all', label: 'Todos os status' },
  { value: 'enviado', label: 'Enviado' },
  { value: 'recebido', label: 'Recebido' },
  { value: 'cancelado', label: 'Cancelado' }
];

const setorOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'santarem', label: 'Santarém' },
  { value: 'fazenda', label: 'Fazenda' }
];

export default function TransferFilters({ filters, onFilterChange }) {
  const handleValueChange = (field, value) => {
    onFilterChange(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Select value={filters.status} onValueChange={(value) => handleValueChange('status', value)}>
        <SelectTrigger className="w-full sm:w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.setor_origem} onValueChange={(value) => handleValueChange('setor_origem', value)}>
        <SelectTrigger className="w-full sm:w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {setorOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.setor_destino} onValueChange={(value) => handleValueChange('setor_destino', value)}>
        <SelectTrigger className="w-full sm:w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {setorOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}