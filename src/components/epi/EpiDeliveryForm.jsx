
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Hand, Save, X, User, Shield, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

export default function EpiDeliveryForm({ epis, funcionarios, onSubmit, onCancel, currentUser }) {
  const [formData, setFormData] = useState({
    funcionario_id: '',
    epi_id: '',
    quantidade: 1,
    proxima_reposicao: '',
    observacao: ''
  });
  const [error, setError] = useState('');

  const selectedEpi = epis.find(e => e.id === formData.epi_id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.funcionario_id || !formData.epi_id) {
      setError("Selecione um funcionário e um EPI.");
      return;
    }

    const funcionario = funcionarios.find(f => f.id === formData.funcionario_id);
    const epi = epis.find(e => e.id === formData.epi_id);

    // Regra: Validar ASO
    if (new Date(funcionario.validade_aso) < new Date()) {
      setError(`ASO do funcionário ${funcionario.nome} está vencido! Não é possível realizar a entrega.`);
      return;
    }

    // Regra: Validar CA do EPI
    if (new Date(epi.validade_ca) < new Date()) {
      setError(`O CA do EPI ${epi.nome} está vencido! Não é possível realizar a entrega.`);
      return;
    }

    // Regra: Validar estoque
    if (epi.estoque_disponivel < formData.quantidade) {
      setError(`Estoque insuficiente para ${epi.nome}. Disponível: ${epi.estoque_disponivel}.`);
      return;
    }

    const deliveryData = {
      ...formData,
      responsavel_entrega: currentUser.full_name,
      epi_nome: epi.nome,
      funcionario_nome: funcionario.nome,
      data_entrega: new Date().toISOString()
    };
    
    onSubmit(deliveryData);
  };

  return (
    <Card className="bg-white/90 backdrop-blur border-0 shadow-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-slate-900">
          <Hand className="w-6 h-6 text-blue-600" />
          Registrar Entrega de EPI
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg flex items-center gap-3">
              <AlertTriangle className="w-5 h-5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="funcionario_id" className="flex items-center gap-2"><User className="w-4 h-4" /> Funcionário *</Label>
              <Select required value={formData.funcionario_id} onValueChange={(value) => setFormData({...formData, funcionario_id: value})}>
                <SelectTrigger><SelectValue placeholder="Selecione o funcionário" /></SelectTrigger>
                <SelectContent>
                  {funcionarios.map(f => (
                    <SelectItem key={f.id} value={f.id}>{f.nome} ({f.cpf_matricula})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="epi_id" className="flex items-center gap-2"><Shield className="w-4 h-4" /> EPI *</Label>
              <Select required value={formData.epi_id} onValueChange={(value) => setFormData({...formData, epi_id: value})}>
                <SelectTrigger><SelectValue placeholder="Selecione o EPI" /></SelectTrigger>
                <SelectContent>
                  {epis.map(e => (
                    <SelectItem key={e.id} value={e.id} disabled={new Date(e.validade_ca) < new Date() || e.estoque_disponivel <= 0}>
                      {e.nome} (CA: {e.ca}) {new Date(e.validade_ca) < new Date() ? ' - VENCIDO' : ` - Estoque: ${e.estoque_disponivel}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="quantidade">Quantidade *</Label>
              <Input
                id="quantidade"
                type="number"
                min="1"
                max={selectedEpi?.estoque_disponivel || 1}
                value={formData.quantidade}
                onChange={(e) => setFormData({...formData, quantidade: parseInt(e.target.value)})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="proxima_reposicao">Próxima Reposição</Label>
              <Input
                id="proxima_reposicao"
                type="date"
                min={format(new Date(), 'yyyy-MM-dd')}
                value={formData.proxima_reposicao}
                onChange={(e) => setFormData({...formData, proxima_reposicao: e.target.value})}
              />
            </div>
          </div>
          
          <div className="space-y-2">
              <Label htmlFor="observacao">Observação</Label>
              <Textarea
                id="observacao"
                value={formData.observacao}
                onChange={(e) => setFormData({...formData, observacao: e.target.value})}
                placeholder="Alguma observação sobre a entrega ou o EPI..."
              />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" /> Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" /> Salvar Entrega
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
