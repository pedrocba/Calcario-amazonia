import React from "react";
import StatsCard from "../dashboard/StatsCard";
import { Clock, FileText, CheckCircle, X, ArchiveRestore } from "lucide-react";

export default function RequisicaoStats({ stats, isLoading }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
      <StatsCard 
        title="Pendentes" 
        value={stats.pendentes} 
        icon={Clock} 
        color="orange" 
        trend="Aguardando análise"
        isLoading={isLoading} 
      />
      <StatsCard 
        title="Aguardando Retirada" 
        value={stats.aguardando} 
        icon={FileText} 
        color="blue" 
        trend="Prontas para retirar"
        isLoading={isLoading} 
      />
      <StatsCard 
        title="Aguardando Devolução" 
        value={stats.devolucoes} 
        icon={ArchiveRestore} 
        color="amber" 
        trend="Ferramentas em uso"
        isLoading={isLoading} 
      />
      <StatsCard 
        title="Concluídas" 
        value={stats.concluidas} 
        icon={CheckCircle} 
        color="green" 
        trend="Processos finalizados"
        isLoading={isLoading} 
      />
      <StatsCard 
        title="Recusadas" 
        value={stats.recusadas} 
        icon={X} 
        color="purple" 
        trend="Não atendidas"
        isLoading={isLoading} 
      />
    </div>
  );
}