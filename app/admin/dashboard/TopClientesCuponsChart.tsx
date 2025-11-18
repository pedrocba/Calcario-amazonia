"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface TopClientesCuponsChartProps {
  data: {
    nome_cliente: string;
    quantidade: number;
  }[];
}

// Tooltip customizado
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-md shadow-lg px-3 py-2 text-sm">
        <p className="font-semibold">{label}</p> {/* Mostra o nome do cliente */}
        <p className="text-primary">{`Cupons: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

// Função para truncar nomes longos no eixo Y
const formatYAxisLabel = (value: string) => {
  const maxLength = 25; // Ajuste conforme necessário
  if (value.length > maxLength) {
    return `${value.substring(0, maxLength)}...`;
  }
  return value;
};

export default function TopClientesCuponsChart({ data }: TopClientesCuponsChartProps) {
  const hasData = data && data.length > 0;

  // Inverte os dados para Recharts exibir do maior para o menor em barras horizontais
  const reversedData = hasData ? [...data].reverse() : [];

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Top 10 Clientes por Cupons Gerados</CardTitle>
        <CardDescription>Clientes com maior número de cupons emitidos.</CardDescription>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ResponsiveContainer width="100%" height={400}>
            {/* Altura maior para barras horizontais */}
            <BarChart
              layout="vertical" // <<< Define como barras horizontais
              data={reversedData} // <<< Usa dados invertidos
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} horizontal={false} />
              {/* Eixo X (Quantidade) - fica na parte inferior */}
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
              {/* Eixo Y (Nome do Cliente) - fica na esquerda */}
              <YAxis
                type="category"
                dataKey="nome_cliente" // <<< Usa o nome do cliente
                width={150} // <<< Ajuste a largura para caber nomes
                tick={{ fontSize: 11 }}
                tickFormatter={formatYAxisLabel} // <<< Trunca nomes longos
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--primary) / 0.1)" }} />
              {/* Barra */}
              <Bar dataKey="quantidade" name="Cupons" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} maxBarSize={30}>
                {/* Label DENTRO ou FORA da barra */}
                <LabelList
                  dataKey="quantidade"
                  position="right"
                  style={{ fill: "hsl(var(--foreground))", fontSize: 11 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[400px] text-muted-foreground">
            Nenhum dado de cliente para exibir.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
