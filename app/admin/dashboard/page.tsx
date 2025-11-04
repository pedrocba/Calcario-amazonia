import "server-only";

import { Separator } from "@/components/ui/separator";
import { createClient } from "@/utils/supabase/server";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Ticket, FileText, TicketCheck, Trophy } from "lucide-react";

import CuponsPorDiaChart from "./CuponsPorDiaChart";
import TopClientesCuponsChart from "./TopClientesCuponsChart";
import StatusCuponsChart from "./StatusCuponsChart";
import DashboardGraficoFilial from "./DashboardGraficoFilial";

type CuponsPorDiaData = {
  dia: string;
  quantidade: number;
}[];

type NotasPorFilialData = {
  filial: string;
  total: number;
}[];

type TopClientesData = {
  cnpj_cliente: string;
  nome_cliente: string;
  quantidade: number;
}[];

type StatusCuponsData = {
  status: string;
  quantidade: number;
}[];

type DashboardError = { message: string };

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    usuariosResponse,
    notasResponse,
    cuponsResponse,
    cuponsAptosResponse,
    cuponsSorteadosResponse
  ] = await Promise.all([
    supabase.from("usuarios").select("*", { count: "exact", head: true }),
    supabase.from("notas_fiscais").select("*", { count: "exact", head: true }),
    supabase.from("cupons").select("*", { count: "exact", head: true }),
    supabase
      .from("cupons")
      .select("*", { count: "exact", head: true })
      .is("sorteado_em", null),
    supabase
      .from("cupons")
      .select("*", { count: "exact", head: true })
      .not("sorteado_em", "is", null)
  ]);

  const totalUsuarios = usuariosResponse.count ?? 0;
  const totalNotas = notasResponse.count ?? 0;
  const totalCupons = cuponsResponse.count ?? 0;
  const totalCuponsAptos = cuponsAptosResponse.count ?? 0;
  const totalCuponsSorteados = cuponsSorteadosResponse.count ?? 0;

  const errorUsuarios = usuariosResponse.error;
  const errorNotas = notasResponse.error;
  const errorCupons = cuponsResponse.error;
  const errorCuponsAptos = cuponsAptosResponse.error;
  const errorCuponsSorteados = cuponsSorteadosResponse.error;

  let notasPorFilial: NotasPorFilialData = [];
  let cuponsPorDia: CuponsPorDiaData = [];
  let topClientesData: TopClientesData = [];
  let statusCuponsData: StatusCuponsData = [];

  let errorNotasPorFilial: DashboardError | null = null;
  let errorCuponsPorDia: DashboardError | null = null;
  let errorTopClientes: DashboardError | null = null;
  let errorStatusCupons: DashboardError | null = null;

  try {
    const { data, error } = await supabase.rpc("get_notas_por_filial");

    if (error) throw error;

    notasPorFilial = ((data as NotasPorFilialData) ?? []).map((item) => ({
      filial: String((item as { filial?: string }).filial ?? ""),
      total: Number((item as { total?: number }).total ?? 0)
    }));
  } catch (err: any) {
    console.error("Erro ao buscar notas por filial:", err);
    errorNotasPorFilial = { message: err?.message ?? "Erro ao buscar notas por filial." };
  }

  try {
    const { data, error } = await supabase.rpc("get_cupons_por_dia");

    if (error) throw error;

    cuponsPorDia = ((data as CuponsPorDiaData) ?? []).map((item) => ({
      dia: String((item as { dia?: string }).dia ?? ""),
      quantidade: Number((item as { quantidade?: number }).quantidade ?? 0)
    }));
  } catch (err: any) {
    console.error("Erro ao buscar cupons por dia:", err);
    errorCuponsPorDia = { message: err?.message ?? "Erro ao buscar cupons por dia." };
  }

  try {
    const { data, error } = await supabase.rpc("get_top_clientes_cupons", { limite: 10 });

    if (error) throw error;

    topClientesData = ((data as TopClientesData) ?? []).map((item) => ({
      cnpj_cliente: String((item as { cnpj_cliente?: string }).cnpj_cliente ?? ""),
      nome_cliente: String((item as { nome_cliente?: string }).nome_cliente ?? ""),
      quantidade: Number((item as { quantidade?: number }).quantidade ?? 0)
    }));
  } catch (err: any) {
    console.error("Erro ao buscar top clientes por cupons:", err);
    errorTopClientes = { message: err?.message ?? "Erro ao buscar top clientes." };
  }

  try {
    const { data, error } = await supabase.rpc("get_status_cupons");

    if (error) throw error;

    statusCuponsData = ((data as StatusCuponsData) ?? []).map((item) => ({
      status: String((item as { status?: string }).status ?? ""),
      quantidade: Number((item as { quantidade?: number }).quantidade ?? 0)
    }));
  } catch (err: any) {
    console.error("Erro ao buscar status dos cupons:", err);
    errorStatusCupons = { message: err?.message ?? "Erro ao buscar status dos cupons." };
  }

  const errors = [
    errorUsuarios,
    errorNotas,
    errorCupons,
    errorCuponsAptos,
    errorCuponsSorteados,
    errorNotasPorFilial,
    errorCuponsPorDia,
    errorTopClientes,
    errorStatusCupons
  ]
    .filter(Boolean)
    .map((err) => {
      if (err instanceof Error) return err;
      return new Error((err as DashboardError).message);
    });

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard administrativo</h1>
        <p className="text-muted-foreground">
          Acompanhe o desempenho de usuários, notas fiscais e cupons da campanha.
        </p>
      </div>

      <Separator />

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

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {errorUsuarios ? "Erro" : totalUsuarios.toLocaleString("pt-BR")}
            </div>
            <CardDescription>Usuários cadastrados na plataforma</CardDescription>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notas fiscais</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {errorNotas ? "Erro" : totalNotas.toLocaleString("pt-BR")}
            </div>
            <CardDescription>Documentos fiscais registrados</CardDescription>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cupons emitidos</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {errorCupons ? "Erro" : totalCupons.toLocaleString("pt-BR")}
            </div>
            <CardDescription>Cupons gerados para os clientes</CardDescription>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cupons aptos</CardTitle>
            <TicketCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {errorCuponsAptos ? "Erro" : totalCuponsAptos.toLocaleString("pt-BR")}
            </div>
            <p className="text-xs text-muted-foreground">Aguardando sorteio</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cupons sorteados</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {errorCuponsSorteados ? "Erro" : totalCuponsSorteados.toLocaleString("pt-BR")}
            </div>
            <p className="text-xs text-muted-foreground">Já contemplados</p>
          </CardContent>
        </Card>
      </div>

      {errorCuponsPorDia ? (
        <Alert variant="destructive">
          <AlertTitle>Erro ao carregar cupons por dia</AlertTitle>
          <AlertDescription>{errorCuponsPorDia.message}</AlertDescription>
        </Alert>
      ) : (
        <CuponsPorDiaChart data={cuponsPorDia} />
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {errorTopClientes ? (
          <Alert variant="destructive">
            <AlertTitle>Erro ao carregar Top Clientes</AlertTitle>
            <AlertDescription>{errorTopClientes.message}</AlertDescription>
          </Alert>
        ) : (
          <TopClientesCuponsChart data={topClientesData} />
        )}

        {errorStatusCupons ? (
          <Alert variant="destructive">
            <AlertTitle>Erro ao carregar Status dos Cupons</AlertTitle>
            <AlertDescription>{errorStatusCupons.message}</AlertDescription>
          </Alert>
        ) : (
          <StatusCuponsChart data={statusCuponsData} />
        )}
      </div>

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
