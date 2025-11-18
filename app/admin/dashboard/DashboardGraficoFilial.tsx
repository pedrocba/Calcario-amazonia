"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardGraficoFilialProps {
  data: {
    filial: string;
    total: number;
  }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-md border bg-background px-3 py-2 text-sm shadow-lg">
        <p className="font-semibold">{label}</p>
        <p className="text-primary">{`Notas: ${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
};

export default function DashboardGraficoFilial({ data }: DashboardGraficoFilialProps) {
  const hasData = data && data.length > 0;

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Notas fiscais por filial</CardTitle>
        <CardDescription>Distribuição das notas emitidas em cada unidade.</CardDescription>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
              <XAxis dataKey="filial" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--primary) / 0.1)" }} />
              <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[360px] items-center justify-center text-muted-foreground">
            Nenhum dado de filial para exibir.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
