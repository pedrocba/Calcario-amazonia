
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const setorOptions = [
  { value: 'all', label: 'Todos os setores' },
  { value: 'santarem', label: 'Santarém' },
  { value: 'fazenda', label: 'Fazenda' }
];

const origemOptions = [
  { value: 'all', label: 'Todas as origens' },
  { value: 'compra', label: 'Compra' },
  { value: 'transferencia', label: 'Transferência' },
  { value: 'ajuste', label: 'Ajuste' }
];

const statusOptions = [
  { value: 'all', label: 'Todos os status' },
  { value: 'ativo', label: 'Ativo' },
  { value: 'transferido', label: 'Transferido' },
  { value: 'consumido', label: 'Consumido' },
  { value: 'zerado', label: 'Zerado' }
];

const categoriaOptions = [
  { value: 'all', label: 'Todas as categorias' },
  { value: 'equipamentos', label: 'Equipamentos' },
  { value: 'pecas_reposicao', label: 'Peças de Reposição' },
  { value: 'ferramentas', label: 'Ferramentas' },
  { value: 'epi', label: 'EPI' },
  { value: 'combustiveis', label: 'Combustíveis' },
  { value: 'lubrificantes', label: 'Lubrificantes' },
  { value: 'materia_prima', label: 'Matéria Prima' },
  { value: 'utilidades', label: 'Utilidades' }
];

export default function StockFilters({ filters, onFilterChange }) {
  const handleValueChange = (field, value) => {
    onFilterChange(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Select value={filters.setor} onValueChange={(value) => handleValueChange('setor', value)}>
        <SelectTrigger className="w-full sm:w-36">
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

      <Select value={filters.origem_entrada} onValueChange={(value) => handleValueChange('origem_entrada', value)}>
        <SelectTrigger className="w-full sm:w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {origemOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

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

      <Select value={filters.categoria} onValueChange={(value) => handleValueChange('categoria', value)}>
        <SelectTrigger className="w-full sm:w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {categoriaOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
