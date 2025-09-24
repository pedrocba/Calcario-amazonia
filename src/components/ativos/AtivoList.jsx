import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, HardDrive, User, MapPin } from "lucide-react";

const statusMeta = {
  "Em uso": { color: 'bg-green-100 text-green-800 border-green-200' },
  "Em estoque": { color: 'bg-blue-100 text-blue-800 border-blue-200' },
  "Manutenção": { color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  "Baixado": { color: 'bg-red-100 text-red-800 border-red-200' },
};

export default function AtivoList({ ativos, isLoading, onEdit }) {
  const getMeta = (map, key) => map[key] || { color: 'bg-gray-100 text-gray-800' };

  return (
    <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <HardDrive className="w-5 h-5 text-blue-600" />
          Lista de Ativos ({isLoading ? '...' : ativos.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-100">
                <TableHead>Ativo</TableHead>
                <TableHead>Série / Patrimônio</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 rounded" /></TableCell>
                  </TableRow>
                ))
              ) : (
                ativos.map((ativo) => (
                  <TableRow key={ativo.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900">{ativo.nome}</p>
                        <p className="text-sm text-slate-500">{ativo.marca} {ativo.modelo}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p><span className="font-semibold">S/N:</span> {ativo.numero_serie || 'N/A'}</p>
                        <p><span className="font-semibold">Patr:</span> {ativo.patrimonio || 'N/A'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getMeta(statusMeta, ativo.status).color}>
                        {ativo.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-slate-500" />
                          <span>{ativo.localizacao || 'Não informado'}</span>
                        </div>
                    </TableCell>
                     <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-slate-500" />
                          <span>{ativo.usuario_responsavel || 'Ninguém'}</span>
                        </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => onEdit(ativo)} className="hover:bg-blue-50 hover:text-blue-700">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {!isLoading && ativos.length === 0 && (
            <div className="text-center py-12">
              <HardDrive className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhum ativo de TI encontrado</h3>
              <p className="text-slate-500">Clique em "Cadastrar Novo Ativo" para começar.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}