import "server-only";

import { createClient } from "@supabase/supabase-js";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import CuponsPorDiaChart from "./CuponsPorDiaChart";
import TopClientesCuponsChart from "./TopClientesCuponsChart";
import DashboardGraficoFilial from "./DashboardGraficoFilial";

type KPIStats = {
  totalCupons: number;
  totalNotas: number;
  faturamentoTotal: number;
};

type CuponsPorDiaData = {
  dia: string;
  quantidade: number;
}[];

type NotasPorFilialData = {
  filial: string;
  total: number;
}[];

// NOVO: Tipo para dados do Top Clientes
type TopClientesData = {
  cnpj_cliente: string;
  nome_cliente: string;
  quantidade: number;
}[];

type DashboardLoadResult = {
  kpis: KPIStats | null;
  notasPorFilial: NotasPorFilialData;
  cuponsPorDia: CuponsPorDiaData;
  topClientes: TopClientesData;
  errorKpis: Error | null;
  errorNotasPorFilial: Error | null;
  errorCuponsPorDia: Error | null;
  errorTopClientes: Error | null;
};

function createSupabaseServerClient() {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Configurações do Supabase não encontradas para o dashboard administrativo.");
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

async function carregarDashboardDados(): Promise<DashboardLoadResult> {
  const supabase = createSupabaseServerClient();

  let kpis: KPIStats | null = null;
  let notasPorFilial: NotasPorFilialData = [];
  let cuponsPorDia: CuponsPorDiaData = [];
  let topClientes: TopClientesData = [];

  let errorKpis: Error | null = null;
  let errorNotasPorFilial: Error | null = null;
  let errorCuponsPorDia: Error | null = null;
  let errorTopClientes: Error | null = null;

  try {
    const { data, error } = await supabase.rpc("get_admin_dashboard_kpis");

    if (error) throw error;

    const payload = (data as Partial<KPIStats>) ?? {};

    kpis = {
      totalCupons: Number(payload.totalCupons ?? 0),
      totalNotas: Number(payload.totalNotas ?? 0),
      faturamentoTotal: Number(payload.faturamentoTotal ?? 0)
    };
  } catch (err) {
    if (err instanceof Error) {
      console.error("Erro ao buscar KPIs do dashboard:", err);
      errorKpis = err;
    }
  }

  try {
    const { data, error } = await supabase.rpc("get_notas_por_filial");

    if (error) throw error;

    notasPorFilial = ((data as NotasPorFilialData) ?? []).map((item) => ({
      filial: String((item as { filial?: string }).filial ?? ""),
      total: Number((item as { total?: number }).total ?? 0)
    }));
  } catch (err) {
    if (err instanceof Error) {
      console.error("Erro ao buscar notas por filial:", err);
      errorNotasPorFilial = err;
    }
  }

  try {
    const { data, error } = await supabase.rpc("get_cupons_por_dia");

    if (error) throw error;

    cuponsPorDia = ((data as CuponsPorDiaData) ?? []).map((item) => ({
      dia: String((item as { dia?: string }).dia ?? ""),
      quantidade: Number((item as { quantidade?: number }).quantidade ?? 0)
    }));
  } catch (err) {
    if (err instanceof Error) {
      console.error("Erro ao buscar cupons por dia:", err);
      errorCuponsPorDia = err;
    }
  }

  // --- BUSCA NOVA: Top Clientes por Cupons ---
  try {
    const { data, error } = await supabase.rpc("get_top_clientes_cupons", { limite: 10 });

    if (error) throw error;

    topClientes = ((data as TopClientesData) ?? []).map((item) => ({
      cnpj_cliente: String((item as { cnpj_cliente?: string }).cnpj_cliente ?? ""),
      nome_cliente: String((item as { nome_cliente?: string }).nome_cliente ?? ""),
      quantidade: Number((item as { quantidade?: number }).quantidade ?? 0)
    }));
  } catch (err) {
    if (err instanceof Error) {
      console.error("Erro ao buscar top clientes por cupons:", err);
      errorTopClientes = err;
    }
  }
  // --- FIM DA BUSCA NOVA ---

  return {
    kpis,
    notasPorFilial,
    cuponsPorDia,
    topClientes,
    errorKpis,
    errorNotasPorFilial,
    errorCuponsPorDia,
    errorTopClientes
  };
}

export default async function AdminDashboardPage() {
  const {
    kpis,
    notasPorFilial,
    cuponsPorDia,
    topClientes,
    errorKpis,
    errorNotasPorFilial,
    errorCuponsPorDia,
    errorTopClientes
  } = await carregarDashboardDados();

  const errors = [errorKpis, errorNotasPorFilial, errorCuponsPorDia, errorTopClientes].filter(
    Boolean
  ) as Error[];

  return (
    <div className="space-y-6">
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertTitle>Não foi possível carregar todas as informações</AlertTitle>
          <AlertDescription>
            <ul className="list-disc space-y-1 pl-4">
              {errors.map((error) => (
                <li key={error.message}>{error.message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Cupons emitidos</CardTitle>
            <CardDescription>Quantidade total de cupons gerados</CardDescription>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{kpis?.totalCupons ?? 0}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Notas fiscais</CardTitle>
            <CardDescription>Total de notas geradas</CardDescription>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{kpis?.totalNotas ?? 0}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Faturamento (R$)</CardTitle>
            <CardDescription>Receita consolidada</CardDescription>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">
              {(kpis?.faturamentoTotal ?? 0).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL"
              })}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Cupons por Dia */}
      {errorCuponsPorDia ? (
        <Alert variant="destructive">
          <AlertTitle>Erro ao carregar cupons por dia</AlertTitle>
          <AlertDescription>{errorCuponsPorDia.message}</AlertDescription>
        </Alert>
      ) : (
        <CuponsPorDiaChart data={cuponsPorDia} />
      )}

      {/* --- NOVO: Renderização Top Clientes --- */}
      <div className="grid gap-6 md:grid-cols-2">
        {errorTopClientes ? (
          <Alert variant="destructive">
            <AlertTitle>Erro ao carregar Top Clientes</AlertTitle>
            <AlertDescription>{errorTopClientes.message}</AlertDescription>
          </Alert>
        ) : (
          <TopClientesCuponsChart data={topClientes} />
        )}
        {/* Aqui pode entrar o próximo gráfico (Notas por Valor) */}
      </div>
      {/* --- FIM NOVO Top Clientes --- */}

      {/* Gráfico de barras por filial */}
      {errorNotasPorFilial ? (
        <Alert variant="destructive">
          <AlertTitle>Erro ao carregar notas por filial</AlertTitle>
          <AlertDescription>{errorNotasPorFilial.message}</AlertDescription>
        </Alert>
      ) : (
        <DashboardGraficoFilial data={notasPorFilial} />
      )}
    </div>
  );
}
