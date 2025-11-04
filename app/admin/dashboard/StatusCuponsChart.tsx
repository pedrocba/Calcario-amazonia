"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { useTheme } from "next-themes";

interface StatusCuponsChartProps {
  data: {
    status: string;
    quantidade: number;
  }[];
}

const BASE_COLORS = {
  light: {
    aptos: "hsl(221.2 83.2% 53.3%)",
    sorteados: "hsl(0 0% 63.9%)"
  },
  dark: {
    aptos: "hsl(217.2 91.2% 59.8%)",
    sorteados: "hsl(0 0% 63.9%)"
  }
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent
}: any) => {
  if (percent < 0.05) return null;

  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="hsl(var(--primary-foreground))"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      className="text-xs font-medium"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background border rounded-md shadow-lg px-3 py-2 text-sm">
        <p className="font-semibold" style={{ color: payload[0].color }}>
          {data.status}
        </p>
        <p>{`Quantidade: ${data.quantidade.toLocaleString("pt-BR")}`}</p>
        <p className="text-muted-foreground">{`Porcentagem: ${(payload[0].percent * 100).toFixed(1)}%`}</p>
      </div>
    );
  }
  return null;
};

export default function StatusCuponsChart({ data }: StatusCuponsChartProps) {
  const { resolvedTheme } = useTheme();
  const themeKey = resolvedTheme === "dark" ? "dark" : "light";
  const colors = BASE_COLORS[themeKey];

  const chartData = data.map((entry) => ({
    ...entry,
    fill: entry.status.toLowerCase().includes("apto") ? colors.aptos : colors.sorteados
  }));

  const hasData = chartData.length > 0;

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Status dos Cupons</CardTitle>
        <CardDescription>Proporção de cupons aptos vs. sorteados.</CardDescription>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: "14px", paddingTop: "20px" }}
                verticalAlign="bottom"
                align="center"
              />
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                dataKey="quantidade"
                nameKey="status"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={2}
                labelLine={false}
                label={renderCustomizedLabel}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} stroke={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Nenhum cupom encontrado para exibir status.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
