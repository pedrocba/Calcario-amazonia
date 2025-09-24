import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { X, Save } from "lucide-react";

export default function AjusteEstoqueForm({ posto, onSubmit, onCancel }) {
  const [novoEstoque, setNovoEstoque] = useState(posto.estoque_atual || '');
  const [motivo, setMotivo] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!motivo) {
        alert("O motivo do ajuste é obrigatório.");
        return;
    }
    onSubmit({
      posto_id: posto.id,
      valor_anterior: posto.estoque_atual,
      valor_novo: parseFloat(novoEstoque),
      motivo,
    });
  };

  return (
    <Card className="my-6 border-l-4 border-yellow-500">
      <CardHeader>
        <CardTitle>Ajustar Estoque de "{posto.nome}"</CardTitle>
        <CardDescription>
          Corrija o valor do estoque atual. O valor anterior era {posto.estoque_atual.toLocaleString('pt-BR')} L.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="novo_estoque">Novo Estoque (L)</Label>
            <Input id="novo_estoque" type="number" step="0.01" value={novoEstoque} onChange={(e) => setNovoEstoque(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="motivo">Motivo do Ajuste</Label>
            <Textarea id="motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ex: Correção de entrada não registrada no dia X" required />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" /> Cancelar
            </Button>
            <Button type="submit" className="bg-yellow-600 hover:bg-yellow-700">
              <Save className="w-4 h-4 mr-2" /> Salvar Ajuste
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}