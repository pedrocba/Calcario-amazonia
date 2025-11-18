"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface CuponsPorDiaChartProps {
  data: {
    dia: string;
    quantidade: number;
  }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-md border bg-background px-3 py-2 text-sm shadow-lg">
        <p className="font-semibold">{label}</p>
        <p className="text-primary">{`Cupons: ${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
};

export default function CuponsPorDiaChart({ data }: CuponsPorDiaChartProps) {
  const hasData = data && data.length > 0;

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Cupons emitidos por dia</CardTitle>
        <CardDescription>Evolução diária dos cupons gerados.</CardDescription>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ResponsiveContainer width="100%" height={360}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
              <XAxis dataKey="dia" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "hsl(var(--primary))" }} />
              <Line
                type="monotone"
                dataKey="quantidade"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[360px] items-center justify-center text-muted-foreground">
            Nenhum dado de cupons para exibir.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
