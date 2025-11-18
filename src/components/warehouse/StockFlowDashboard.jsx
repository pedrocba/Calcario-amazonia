import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, Ship, Warehouse, Package, Truck, Clock } from "lucide-react";

const metricConfig = [
  {
    key: "totalPurchasedTonnage",
    label: "Comprado (t)",
    description: "Carga total contratada em balsas",
    icon: Ship,
    tone: "text-slate-700",
  },
  {
    key: "totalUnloadedTonnage",
    label: "Descarga (t)",
    description: "Toneladas já descarregadas no pátio",
    icon: Warehouse,
    tone: "text-emerald-600",
  },
  {
    key: "inTransitTonnage",
    label: "Em Trânsito (t)",
    description: "Saldo ainda embarcado aguardando descarga",
    icon: Clock,
    tone: "text-blue-600",
  },
  {
    key: "rawYardInventory",
    label: "Estoque Bruto (t)",
    description: "Matéria-prima disponível para beneficiamento",
    icon: Package,
    tone: "text-amber-600",
  },
  {
    key: "finishedYardInventory",
    label: "Estoque Processado (t)",
    description: "Calcário pronto para expedição",
    icon: TrendingUp,
    tone: "text-emerald-700",
  },
  {
    key: "scheduledOutboundTonnage",
    label: "Saídas Agendadas (t)",
    description: "Pedidos liberados aguardando transporte",
    icon: Truck,
    tone: "text-orange-600",
  },
];

const timelineBadges = {
  purchase: { tone: "bg-blue-50 text-blue-700", label: "Compra" },
  unload: { tone: "bg-emerald-50 text-emerald-700", label: "Descarga" },
  processing: { tone: "bg-amber-50 text-amber-700", label: "Processo" },
  outbound: { tone: "bg-slate-100 text-slate-700", label: "Saída" },
};

function formatTonnage(value) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function StockFlowDashboard({ metrics, productBreakdown, timelineEvents }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
      <Card className="xl:col-span-2 border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Fluxo Operacional do Calcário</CardTitle>
          <CardDescription>
            Controle integrado das balsas compradas, descargas, processamento e expedição.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {metricConfig.map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.key} className="p-4 rounded-lg border border-slate-100 bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-500">{metric.label}</span>
                    <Icon className={`w-4 h-4 ${metric.tone}`} />
                  </div>
                  <p className="text-2xl font-semibold text-slate-900">
                    {formatTonnage(metrics[metric.key] || 0)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{metric.description}</p>
                </div>
              );
            })}
          </div>

          <Separator className="my-6" />

          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Saldo por Produto</h3>
            <div className="overflow-x-auto rounded-lg border border-slate-100">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Produto</th>
                    <th className="px-4 py-3 font-semibold">Comprado Bruto (t)</th>
                    <th className="px-4 py-3 font-semibold">Disponível Bruto (t)</th>
                    <th className="px-4 py-3 font-semibold">Processado (t)</th>
                    <th className="px-4 py-3 font-semibold">Comprometido (t)</th>
                    <th className="px-4 py-3 font-semibold">Disponível Líquido (t)</th>
                  </tr>
                </thead>
                <tbody>
                  {productBreakdown.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                        Nenhum movimento registrado até o momento.
                      </td>
                    </tr>
                  )}
                  {productBreakdown.map((product) => (
                    <tr key={product.product_id} className="border-t border-slate-100">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{product.product_name}</div>
                        <p className="text-xs text-slate-500">ID #{product.product_id}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{formatTonnage(product.rawPurchased)}</td>
                      <td className="px-4 py-3 text-emerald-700 font-medium">
                        {formatTonnage(product.rawAvailable)}
                      </td>
                      <td className="px-4 py-3 text-blue-700 font-medium">
                        {formatTonnage(product.finishedAvailable)}
                      </td>
                      <td className="px-4 py-3 text-orange-600 font-medium">
                        {formatTonnage(product.committed)}
                      </td>
                      <td className="px-4 py-3 text-slate-800 font-semibold">
                        {formatTonnage(product.netFinishedAvailable)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Linha do Tempo Operacional</CardTitle>
          <CardDescription>Principais eventos da compra à expedição.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
            {timelineEvents.length === 0 && (
              <p className="text-sm text-slate-500">Ainda não há eventos registrados.</p>
            )}
            {timelineEvents.map((event, index) => {
              const badge = timelineBadges[event.type] || timelineBadges.outbound;
              return (
                <div key={`${event.label}-${index}`} className="p-3 rounded-lg border border-slate-100 bg-white shadow-sm">
                  <div className="flex items-center justify-between">
                    <Badge className={`${badge.tone} font-medium`}>{badge.label}</Badge>
                    <span className="text-xs text-slate-500">
                      {event.date ? event.date.toLocaleDateString("pt-BR") : "Data não informada"}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 mt-2">{event.label}</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{event.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
