import React, { useState, useEffect } from 'react';
import { ItemDaRequisicao } from "@/api/entities";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Package, Truck, User } from "lucide-react";

export default function TicketRetirada({ retirada, products }) {
    const [items, setItems] = useState([]);

    useEffect(() => {
        const fetchItems = async () => {
            if (retirada) {
                const itemsData = await ItemDaRequisicao.filter({ retirada_id: retirada.id });
                setItems(itemsData);
            }
        };
        fetchItems();
    }, [retirada]);
    
    const getProductName = (productId) => products.find(p => p.id === productId)?.name || 'Desconhecido';

    if (!retirada) return null;

    return (
        <div className="bg-white p-8 font-sans w-[210mm] h-[297mm] mx-auto shadow-lg">
            {/* Cabeçalho */}
            <div className="flex justify-between items-center border-b-2 pb-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                        <Truck className="w-10 h-10 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">CBA Mineração</h1>
                        <p className="text-slate-600">Comprovante de Retirada de Material</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="font-bold text-xl">{retirada.numero_retirada}</p>
                    <p className="text-sm">{format(new Date(retirada.data_retirada), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                </div>
            </div>

            {/* Informações do Solicitante */}
            <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-slate-50 p-4 rounded-lg">
                    <h2 className="font-semibold text-lg mb-2 border-b pb-2">Solicitante</h2>
                    <p><strong>Nome:</strong> {retirada.solicitante_nome}</p>
                    <p><strong>Setor:</strong> {retirada.setor}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                    <h2 className="font-semibold text-lg mb-2 border-b pb-2">Detalhes da Retirada</h2>
                    <p><strong>Tipo:</strong> {retirada.tipo_de_retirada === 'peca_consumo' ? 'Peça de Consumo' : 'Ferramenta com Devolução'}</p>
                    <p><strong>Finalidade:</strong> {retirada.finalidade}</p>
                </div>
            </div>

            {/* Itens Retirados */}
            <div>
                <h2 className="font-semibold text-lg mb-2">Itens Retirados</h2>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-100">
                            <th className="p-2 border">Produto</th>
                            <th className="p-2 border text-center">Quantidade</th>
                            <th className="p-2 border">Observação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(item => (
                            <tr key={item.id}>
                                <td className="p-2 border">{getProductName(item.produto_id)}</td>
                                <td className="p-2 border text-center">{item.quantidade} {item.unidade_medida}</td>
                                <td className="p-2 border">{item.observacao || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Rodapé */}
            <div className="mt-12">
                {retirada.tipo_de_retirada === 'ferramenta_devolucao' && (
                    <div className="bg-yellow-100 p-4 rounded-lg text-yellow-800 text-center mb-8">
                        <strong>ATENÇÃO:</strong> A devolução desta ferramenta está prevista para <strong>{format(new Date(retirada.data_prevista_devolucao), 'dd/MM/yyyy', { locale: ptBR })}</strong>.
                    </div>
                )}
                <div className="grid grid-cols-2 gap-8">
                    <div className="text-center">
                        <div className="border-b-2 w-full h-16"></div>
                        <p className="mt-2 font-semibold">{retirada.solicitante_nome}</p>
                        <p className="text-sm text-slate-600">(Assinatura do Solicitante)</p>
                    </div>
                    <div className="text-center">
                        <div className="border-b-2 w-full h-16"></div>
                        <p className="mt-2 font-semibold">{retirada.entregue_por}</p>
                        <p className="text-sm text-slate-600">(Assinatura do Almoxarife)</p>
                    </div>
                </div>
            </div>
        </div>
    );
}