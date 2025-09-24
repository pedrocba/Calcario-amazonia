import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Search, Shield, UserPlus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function UsersPage() {
  // Dados de exemplo (mock data) para substituir as chamadas de API
  const mockUsers = [
    { id: 1, full_name: 'Administrador Sistema', email: 'admin@exemplo.com', funcao: 'Administrador', setor: 'ambos', active: true, role: 'admin' },
    { id: 2, full_name: 'João Silva', email: 'joao@exemplo.com', funcao: 'Gerente de Pátio', setor: 'santarem', active: true, role: 'user' },
    { id: 3, full_name: 'Maria Santos', email: 'maria@exemplo.com', funcao: 'Almoxarife', setor: 'fazenda', active: true, role: 'user' },
    { id: 4, full_name: 'Pedro Costa', email: 'pedro@exemplo.com', funcao: 'Operador de Balança', setor: 'santarem', active: true, role: 'user' },
    { id: 5, full_name: 'Ana Oliveira', email: 'ana@exemplo.com', funcao: 'Almoxarife', setor: 'ambos', active: false, role: 'user' }
  ];

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState({ id: 1, full_name: 'Administrador Sistema', email: 'admin@exemplo.com', role: 'admin', funcao: 'Administrador' });

  useEffect(() => {
    // Carregar dados de exemplo
    setUsers(mockUsers);
  }, []);

  const handleUserUpdate = async (userId, partialData) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) throw new Error('Usuário não encontrado');

      const data = {
        full_name: user.full_name,
        email: user.email,
        role: user.role || "user",
        ...partialData,
      };

      console.log("Atualizando usuário:", data);

      // Simular atualização
      setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, ...data } : u));
      alert('Usuário atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      alert(`Erro ao atualizar usuário: ${error.message}`);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [users, searchTerm]);

  const getRoleColor = (funcao) => {
    switch (funcao) {
      case 'Administrador': return 'bg-red-100 text-red-800 border-red-200';
      case 'Gerente de Pátio': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Almoxarife': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Operador de Balança': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSetorColor = (setor) => {
    switch (setor) {
      case 'santarem': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'fazenda': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ambos': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const canManageUsers = currentUser?.role === 'admin' || currentUser?.funcao === 'Administrador';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
              <Users className="w-6 md:w-8 h-6 md:h-8 text-blue-600" />
              Gerenciamento de Usuários
            </h1>
            <p className="text-slate-600 text-sm md:text-base">Controle de acesso e permissões do sistema.</p>
          </div>
          <Alert className="max-w-md bg-blue-50 border-blue-200">
            <UserPlus className="h-4 w-4 text-blue-700" />
            <AlertTitle className="text-blue-900">Como adicionar usuários?</AlertTitle>
            <AlertDescription className="text-blue-800">
              Para criar um usuário, convide-o pelo painel da Base44. Depois, defina a Função e o Setor dele aqui.
            </AlertDescription>
          </Alert>
        </div>

        <Card className="mb-6 bg-white/70 backdrop-blur border-0 shadow-lg">
          <CardContent className="p-4 md:p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Lista de Usuários ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Nome</TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Setor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array(5).fill(0).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name}</TableCell>
                      <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                      <TableCell>
                        {canManageUsers ? (
                          <Select
                            value={user.funcao || ''}
                            onValueChange={(newFuncao) => handleUserUpdate(user.id, { funcao: newFuncao })}
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Definir função" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Operador de Balança">Operador de Balança</SelectItem>
                              <SelectItem value="Almoxarife">Almoxarife</SelectItem>
                              <SelectItem value="Gerente de Pátio">Gerente de Pátio</SelectItem>
                              <SelectItem value="Administrador">Administrador</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant="outline" className={getRoleColor(user.funcao)}>{user.funcao || 'Não definido'}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {canManageUsers ? (
                          <Select
                            value={user.setor || ''}
                            onValueChange={(newSetor) => handleUserUpdate(user.id, { setor: newSetor })}
                          >
                            <SelectTrigger className="w-36">
                              <SelectValue placeholder="Definir setor" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="santarem">Santarém</SelectItem>
                              <SelectItem value="fazenda">Fazenda</SelectItem>
                              <SelectItem value="ambos">Ambos</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant="outline" className={getSetorColor(user.setor)}>{user.setor || 'Não definido'}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant={user.active ? "outline" : "secondary"}
                          size="sm"
                          onClick={() => canManageUsers && handleUserUpdate(user.id, { active: !user.active })}
                          disabled={!canManageUsers}
                          className={`w-24 ${user.active ? 'border-green-500 text-green-600 hover:bg-green-50' : 'border-red-500 text-red-600 hover:bg-red-50'}`}
                        >
                          {user.active ? 'Ativo' : 'Inativo'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}