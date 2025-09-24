import React, { useState, useEffect } from "react";
import { ItemDaRequisicao } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Save, X, Package } from "lucide-react";

export default function DevolucaoForm({ retirada, products, onSubmit, onCancel }) {
    const [itens, setItens] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [observacaoDevolucao, setObservacaoDevolucao] = useState('');

    useEffect(() => {
        const fetchItems = async () => {
            setIsLoading(true);
            try {
                const itemsData = await ItemDaRequisicao.filter({ retirada_id: retirada.id });
                setItens(itemsData.map(item => ({
                    ...item,
                    quantidade_devolvida: item.quantidade - (item.quantidade_devolvida || 0),
                    estado_na_devolucao: 'bom'
                })));
            } catch (error) {
                console.error("Erro ao buscar itens para devolução:", error);
            }
            setIsLoading(false);
        };
        fetchItems();
    }, [retirada.id]);

    const handleItemChange = (itemId, field, value) => {
        setItens(prev => prev.map(item => 
            item.id === itemId ? { ...item, [field]: value } : item
        ));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const todosItensDevolvidos = itens.every(item => 
            (item.quantidade_devolvida || 0) >= item.quantidade
        );

        onSubmit({
            itens: itens.map(item => ({
                item_id: item.id,
                quantidade_devolvida: parseFloat(item.quantidade_devolvida) || 0,
                estado_na_devolucao: item.estado_na_devolucao
            })),
            observacao_devolucao: observacaoDevolucao,
            todosItensDevolvidos
        });
    };
    
    const getProductName = (productId) => products.find(p => p.id === productId)?.name || 'Desconhecido';

    return (
        <Card className="bg-white/70 backdrop-blur border-0 shadow-xl mb-8">
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-blue-600" />
                    Registrar Devolução - {retirada.numero_retirada}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50">
                                    <TableHead>Produto</TableHead>
                                    <TableHead>Qtd. a Devolver</TableHead>
                                    <TableHead>Estado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={3}><Skeleton className="h-8 w-full"/></TableCell>
                                    </TableRow>
                                ) : (
                                    itens.map(item => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{getProductName(item.produto_id)}</TableCell>
                                            <TableCell>
                                                <Input 
                                                    type="number"
                                                    value={item.quantidade_devolvida}
                                                    max={item.quantidade - (item.quantidade_devolvida || 0)}
                                                    min={0}
                                                    onChange={(e) => handleItemChange(item.id, 'quantidade_devolvida', e.target.value)}
                                                    className="w-24"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Select value={item.estado_na_devolucao} onValueChange={(value) => handleItemChange(item.id, 'estado_na_devolucao', value)}>
                                                    <SelectTrigger className="w-36">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="bom">Bom</SelectItem>
                                                        <SelectItem value="danificado">Danificado</SelectItem>
                                                        <SelectItem value="faltando_peca">Faltando Peça</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div>
                        <Label>Observações da Devolução</Label>
                        <Textarea 
                            value={observacaoDevolucao}
                            onChange={(e) => setObservacaoDevolucao(e.target.value)}
                            placeholder="Descreva o estado dos itens, se necessário."
                        />
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-6 border-t">
                        <Button type="button" variant="outline" onClick={onCancel}>
                            <X className="w-4 h-4 mr-2" />
                            Cancelar
                        </Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                            <Save className="w-4 h-4 mr-2" />
                            Confirmar Devolução
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}