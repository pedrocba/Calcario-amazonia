import React from 'react';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function TransferenciaTicket({ transferencia }) {
  if (!transferencia) return null;

  return (
    <div className="font-mono text-xs bg-white p-2 font-bold" style={{ width: '80mm' }}>
        <div className="text-center mb-2">
            <h1 className="font-extrabold text-sm">CBA MINERACAO</h1>
            <p className="font-extrabold">TRANSFERENCIA SIMPLES</p>
        </div>
        <div className="my-1 text-center">----------------------------------------</div>
        <p>Numero..: {transferencia.numero_transferencia}</p>
        <p>Data....: {format(new Date(transferencia.data_envio), "dd/MM/yy HH:mm", { locale: ptBR })}</p>
        <p>Enviado.: {transferencia.enviado_por}</p>
        <div className="my-1 text-center">----------------------------------------</div>
        <p className="font-extrabold">PRODUTO</p>
        <p>{transferencia.produto_nome}</p>
        <p>Qtd.....: {transferencia.quantidade} {transferencia.unidade_medida}</p>
        {transferencia.observacoes_origem && (
            <p>Obs.....: {transferencia.observacoes_origem}</p>
        )}
        <div className="my-1 text-center">----------------------------------------</div>
        <div className="mt-8 space-y-8">
            <div>
                <div className="border-b border-black border-dotted"></div>
                <p className="text-center text-xs mt-1">Assinatura Envio (Matriz)</p>
            </div>
            <div>
                <div className="border-b border-black border-dotted"></div>
                <p className="text-center text-xs mt-1">Assinatura Recebimento (Fazenda)</p>
            </div>
        </div>
    </div>
  );
}