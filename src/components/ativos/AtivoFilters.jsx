import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const tipos = ["all", "Computador", "Notebook", "Impressora", "Nobreak", "Monitor", "Roteador", "Outro"];
const statusOptions = ["all", "Em estoque", "Em uso", "Manutenção", "Baixado"];

export default function AtivoFilters({ filters, onFilterChange }) {
  const handleValueChange = (field, value) => {
    onFilterChange(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Select value={filters.tipo} onValueChange={(value) => handleValueChange('tipo', value)}>
        <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
        <SelectContent>
          {tipos.map(t => (<SelectItem key={t} value={t}>{t === 'all' ? 'Todos os tipos' : t}</SelectItem>))}
        </SelectContent>
      </Select>
      <Select value={filters.status} onValueChange={(value) => handleValueChange('status', value)}>
        <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
        <SelectContent>
          {statusOptions.map(s => (<SelectItem key={s} value={s}>{s === 'all' ? 'Todos os status' : s}</SelectItem>))}
        </SelectContent>
      </Select>
    </div>
  );
}