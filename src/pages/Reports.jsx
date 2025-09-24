
import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Fuel, Package, Activity, ArrowRightLeft, ClipboardList, Truck, Repeat } from 'lucide-react';

const reportOptions = [
  {
    title: 'Relatório de Combustível',
    description: 'Analise detalhada de abastecimentos, custos e consumo por veículo.',
    icon: Fuel,
    url: createPageUrl('FuelReport'),
    color: 'text-orange-600'
  },
  {
    title: 'Relatório de Estoque',
    description: 'Posição atual, valores e análise detalhada do inventário.',
    icon: Package,
    url: createPageUrl('InventoryReport'),
    color: 'text-blue-600'
  },
  {
    title: 'Relatório de Transferências',
    description: 'Movimentações entre Santarém e Fazenda com análise de tempo.',
    icon: ArrowRightLeft,
    url: createPageUrl('TransferReport'),
    color: 'text-purple-600'
  },
  {
    title: 'Relatório de Requisições',
    description: 'Análise de saídas, devoluções e performance por setor.',
    icon: ClipboardList,
    url: createPageUrl('RequisitionReport'),
    color: 'text-green-600'
  },
  {
    title: 'Relatório de Veículos',
    description: 'Performance da frota, custos e análise de produtividade.',
    icon: Truck,
    url: createPageUrl('VehicleReport'),
    color: 'text-indigo-600'
  },
  {
    title: 'Relatório de Custos Fixos',
    description: 'Análise de despesas recorrentes como salários e aluguel.',
    icon: Repeat,
    url: createPageUrl('FixedCostReport'),
    color: 'text-teal-600'
  },
  {
    title: 'Relatório de Atividades',
    description: 'Audite as ações realizadas pelos usuários no sistema.',
    icon: Activity,
    url: createPageUrl('ActivityReport'),
    color: 'text-red-600'
  },
];

const ReportCard = ({ title, description, icon: Icon, url, color }) => (
  <Card className="bg-white/70 backdrop-blur border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer">
    <Link to={url} className="block h-full">
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="p-3 rounded-lg bg-slate-100">
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-slate-600 text-sm">{description}</p>
      </CardContent>
    </Link>
  </Card>
);

export default function Reports() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            Central de Relatórios
          </h1>
          <p className="text-slate-600">Selecione um relatório para análises detalhadas e tomada de decisão.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportOptions.map(report => (
            <ReportCard key={report.title} {...report} />
          ))}
        </div>
      </div>
    </div>
  );
}
