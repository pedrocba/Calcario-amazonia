import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Clock, ChevronDown, ChevronUp, User, Printer, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ItemDaRequisicao } from "@/api/entities";

const getStatusColor = (status) => {
    switch (status) {
        case 'aguardando_entrega': return 'bg-yellow-100 text-yellow-800';
        case 'entregue': return 'bg-blue-100 text-blue-800';
        case 'devolvido': return 'bg-green-100 text-green-800';
        case 'atrasado': return 'bg-red-100 text-red-800';
        case 'extraviado': return 'bg-purple-100 text-purple-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const RetiradaItemDetails = ({ retirada, products }) => {
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    React.useEffect(() => {
        const fetchItems = async () => {
            setIsLoading(true);
            try {
                const itemsData = await ItemDaRequisicao.filter({ retirada_id: retirada.id });
                setItems(itemsData);
            } catch (error) {
                console.error("Erro ao carregar itens da retirada:", error);
            }
            setIsLoading(false);
        };
        fetchItems();
    }, [retirada.id]);

    const getProductName = (productId) => products.find(p => p.id === productId)?.name || 'Desconhecido';

    if (isLoading) {
        return <div className="p-4"><Skeleton className="h-8 w-full" /></div>;
    }

    return (
        <div className="bg-slate-50 p-4">
            <h4 className="font-semibold mb-2 text-slate-800">Itens da Retirada</h4>
            <ul className="space-y-2">
                {items.map(item => (
                    <li key={item.id} className="text-sm flex justify-between">
                        <span>{getProductName(item.produto_id)}</span>
                        <span className="font-medium">{item.quantidade} {item.unidade_medida}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};


export default function RetiradaList({ retiradas, products, isLoading, title, showActions, showDetails, onDevolucao, onPrint }) {
    const [expandedId, setExpandedId] = useState(null);

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    if (isLoading) {
        return (
            <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
                <CardHeader>
                    <CardTitle>{title || 'Carregando...'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                </CardContent>
            </Card>
        );
    }

    if (retiradas.length === 0) {
        return (
            <div className="text-center py-12">
                <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhuma retirada encontrada</h3>
                <p className="text-slate-500">Não há retiradas para exibir com os filtros atuais.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {retiradas.map((retirada) => (
                <Card key={retirada.id} className="bg-white/70 backdrop-blur border-0 shadow-lg overflow-hidden">
                    <div className="p-4 grid grid-cols-2 md:grid-cols-5 gap-4 items-center">
                        <div className="col-span-2 md:col-span-1">
                            <p className="font-bold text-slate-900">{retirada.numero_retirada}</p>
                            <p className="text-sm text-slate-600 flex items-center gap-1">
                                <User className="w-3 h-3"/> {retirada.solicitante_nome}
                            </p>
                        </div>
                        <div className="hidden md:block">
                            <Badge variant="outline">{retirada.tipo_de_retirada === 'peca_consumo' ? 'Consumo' : 'Ferramenta'}</Badge>
                        </div>
                        <div className="hidden md:block text-sm text-slate-700">
                           {retirada.finalidade}
                        </div>
                        <div className="text-right md:text-left">
                            <Badge className={getStatusColor(retirada.status)}>{retirada.status.replace('_', ' ')}</Badge>
                        </div>
                        <div className="flex items-center justify-end gap-2 col-span-2 md:col-span-1">
                            {showActions && (
                                <Button size="sm" variant="outline" onClick={() => onDevolucao(retirada)}>
                                    <ArrowLeft className="w-4 h-4 mr-2"/>
                                    Devolver
                                </Button>
                            )}
                            <Button size="sm" variant="ghost" onClick={() => onPrint(retirada)}>
                                <Printer className="w-4 h-4"/>
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => toggleExpand(retirada.id)}>
                                {expandedId === retirada.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </Button>
                        </div>
                    </div>
                    {expandedId === retirada.id && <RetiradaItemDetails retirada={retirada} products={products} />}
                </Card>
            ))}
        </div>
    );
}