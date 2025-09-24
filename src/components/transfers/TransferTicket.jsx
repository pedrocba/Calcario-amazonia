
import React from 'react';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const SeparatorLine = () => (
  <div className="text-center my-1">----------------------------------</div>
);

export default function TransferTicket({ transfer, product, originEntry }) {
  if (!transfer || !product) {
    return null;
  }

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    return format(new Date(dateStr), "dd/MM/yy HH:mm", { locale: ptBR });
  };

  const getSetorName = (setor) => {
    return setor === 'santarem' ? 'SANTARÉM (MATRIZ)' : 'FAZENDA (FILIAL)';
  };

  const padRight = (text, length) => {
    return text.padEnd(length, ' ');
  };

  return (
    // Container com classes para simular o papel da impressora
    <div className="font-mono text-xs bg-white p-2 font-bold" style={{ width: '72mm' }}>
      <div className="text-center">
        <h1 className="font-extrabold">CBA MINERACAO</h1>
        <p className="font-extrabold">COMPROVANTE DE TRANSFERENCIA</p>
      </div>

      <SeparatorLine />
      
      <div>
        <span>{padRight(`Ref: ${transfer.transfer_reference}`, 24)}</span>
        <span>Data: {formatDateTime(transfer.sent_date)}</span>
      </div>
      <p>Operador: {transfer.sent_by || "Sistema"}</p>
      
      <SeparatorLine />
      
      <p className="font-extrabold">PRODUTO:</p>
      <p>{product.name}</p>
      <p>Cod: {product.code}</p>
      <p>Condicao: {transfer.condicao}</p>
      
      <SeparatorLine />
      
      <p className="font-extrabold">MOVIMENTACAO:</p>
      <p>Origem: {getSetorName(transfer.setor_origem)}</p>
      <p>Destino: {getSetorName(transfer.setor_destino)}</p>
      
      <SeparatorLine />
      
      <div className="text-center my-2">
        <p className="font-extrabold">QTD. TRANSFERIDA</p>
        <p className="font-extrabold text-lg">{transfer.quantity_sent} UN</p>
      </div>

      {transfer.reason && (
        <>
          <SeparatorLine />
          <p>Motivo: {transfer.reason}</p>
        </>
      )}

      <SeparatorLine />
      
      <div className="mt-6 mb-4">
        <div className="border-b border-black border-dotted w-full"></div>
        <p className="text-center text-xs mt-1">Ass. Responsavel (Envio)</p>
      </div>
      
      <div className="mt-6 mb-4">
        <div className="border-b border-black border-dotted w-full"></div>
        <p className="text-center text-xs mt-1">Ass. Responsavel (Receb.)</p>
      </div>
      
      <SeparatorLine />
      
      <p className="text-center text-xs mt-2">
        CONTROLE INTERNO - VIA DO TRANSPORTE
      </p>
    </div>
  );
}
