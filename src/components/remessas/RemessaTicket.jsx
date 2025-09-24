
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function RemessaTicket({ remessa, items }) {
    if (!remessa) return null;

    const formatDateTime = (dateStr) => {
        if (!dateStr) return 'N/A';
        return format(new Date(dateStr), "dd/MM/yy HH:mm", { locale: ptBR });
    };

    return (
        <div className="font-mono text-xs bg-white p-2 font-bold" style={{ width: '72mm' }}>
            <div className="text-center">
                <h1 className="font-extrabold">CBA MINERACAO</h1>
                <p>MANIFESTO DE REMESSA</p>
            </div>
            <div className="my-1 text-center">----------------------------------</div>
            <p>Remessa..: {remessa.numero_remessa}</p>
            <p>Data.....: {formatDateTime(remessa.data_remessa)}</p>
            <p>Status...: {remessa.status.toUpperCase()}</p>
            <div className="my-1 text-center">----------------------------------</div>
            <p className="text-center font-extrabold">ITENS DA REMESSA</p>
            {items && items.length > 0 ? (
                items.map(item => (
                    <div key={item.id} className="my-1 py-1 border-t border-dotted">
                        <p>Item: {item.produto_nome}</p>
                        <p>Qtd.: {item.quantidade} {item.unidade_medida}</p>
                        <p>Ref.: {item.numero_transferencia}</p>
                    </div>
                ))
            ) : (
                <p className="text-center">Nenhum item na remessa.</p>
            )}
            <div className="my-1 text-center">----------------------------------</div>
            <p>Total de Itens: {items ? items.length : 0}</p>

            <div className="mt-6 mb-4">
                <div className="border-b border-black border-dotted w-full mb-1"></div>
                <p className="text-center text-xs">Assinatura do Responsável</p>
            </div>
        </div>
    );
}
