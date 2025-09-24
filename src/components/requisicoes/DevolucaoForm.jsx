
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const conditionOptions = [
  { value: 'bom', label: 'Bom estado' },
  { value: 'danificado', label: 'Danificado' },
  { value: 'incompleto', label: 'Incompleto' },
  { value: 'vazio', label: 'Vazio (ex: botijão)' }
];

export default function DevolucaoForm({ isOpen, onClose, requisicao, items, products, onConfirm }) {
    const [devolucoes, setDevolucoes] = useState({});

    React.useEffect(() => {
        if (items) {
            const initialDevolucoes = {};
            items.filter(item => item.status_devolucao === 'pendente').forEach(item => {
                initialDevolucoes[item.id] = {
                    condicao: 'bom',
                    observacao: ''
                };
            });
            setDevolucoes(initialDevolucoes);
        }
    }, [items]);

    const handleConfirm = () => {
        onConfirm(devolucoes);
    };

    const itemsPendentes = items.filter(item => item.status_devolucao === 'pendente');

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Registrar Devolução - {requisicao?.numero_requisicao}</DialogTitle>
                    <DialogDescription>
                        Confirme a condição dos itens que estão sendo devolvidos.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto">
                    {itemsPendentes.length > 0 ? itemsPendentes.map(item => {
                        const product = products.find(p => p.id === item.produto_id);
                        return (
                            <div key={item.id} className="p-4 border rounded-lg space-y-4">
                                <h4 className="font-semibold">{product?.name} ({item.quantidade_atendida} UN)</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Condição na Devolução</Label>
                                        <Select
                                            value={devolucoes[item.id]?.condicao || 'bom'}
                                            onValueChange={(value) => setDevolucoes(prev => ({ ...prev, [item.id]: { ...prev[item.id], condicao: value } }))}
                                        >
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {conditionOptions.map(option => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Observação</Label>
                                        <Textarea
                                            value={devolucoes[item.id]?.observacao || ''}
                                            onChange={(e) => setDevolucoes(prev => ({ ...prev, [item.id]: { ...prev[item.id], observacao: e.target.value } }))}
                                            placeholder="Algum detalhe sobre a devolução?"
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    }) : <p className="text-center text-gray-500">Nenhum item pendente de devolução.</p>}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleConfirm} disabled={itemsPendentes.length === 0}>Confirmar Devolução</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
