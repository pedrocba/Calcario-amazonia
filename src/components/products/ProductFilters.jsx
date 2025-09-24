
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const conditions = [ { value: 'all', label: 'Todas as condições' }, { value: 'novo', label: 'Novo' }, { value: 'usado', label: 'Usado' }, { value: 'recondicionado', label: 'Recondicionado' } ];
const statusOptions = [ { value: 'all', label: 'Todos os status' }, { value: 'true', label: 'Ativo' }, { value: 'false', label: 'Inativo' } ];

export default function ProductFilters({ filters, onFilterChange, categories }) {
  const handleValueChange = (field, value) => {
    onFilterChange(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Select value={filters.category} onValueChange={(value) => handleValueChange('category', value)}>
        <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
        <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {(categories || []).map(cat => (
                <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
            ))}
        </SelectContent>
      </Select>
      <Select value={filters.condition} onValueChange={(value) => handleValueChange('condition', value)}>
        <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
        <SelectContent>{conditions.map(cond => (<SelectItem key={cond.value} value={cond.value}>{cond.label}</SelectItem>))}</SelectContent>
      </Select>
      <Select value={filters.active} onValueChange={(value) => handleValueChange('active', value)}>
        <SelectTrigger className="w-full sm:w-32"><SelectValue /></SelectTrigger>
        <SelectContent>{statusOptions.map(status => (<SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>))}</SelectContent>
      </Select>
    </div>
  );
}
