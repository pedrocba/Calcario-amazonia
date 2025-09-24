import React, { useState, useEffect } from "react";
import { UserPermission } from "@/api/entities";
import { AccessLog } from "@/api/entities";
import { Company } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, LogIn, Shield, Building2 } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function AcessoSistemaPage() {
  const [loginForm, setLoginForm] = useState({
    usuario: "",
    senha: "",
    empresa: ""
  });
  const [companies, setCompanies] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const companiesData = await Company.list();
        setCompanies(companiesData.filter(c => c.active));
        setIsLoadingCompanies(false);
      } catch (error) {
        console.error("Erro ao carregar empresas:", error);
        // Criar empresas padrão se não existirem
        try {
          await Company.create({
            name: "Calcário Amazônia - Santarém",
            code: "STM",
            type: "matriz",
            active: true
          });
          await Company.create({
            name: "Calcário Amazônia - Fazenda",
            code: "FZD", 
            type: "filial",
            active: true
          });
          const newCompaniesData = await Company.list();
          setCompanies(newCompaniesData.filter(c => c.active));
        } catch (createError) {
          console.error("Erro ao criar empresas padrão:", createError);
        }
        setIsLoadingCompanies(false);
      }
    };

    loadCompanies();
  }, []);

  useEffect(() => {
    try {
      const usuarioLogado = localStorage.getItem("usuarioLogado");
      if (usuarioLogado) {
        window.location.href = createPageUrl("Dashboard");
      }
    } catch (error) {
      console.error("Erro ao verificar usuário logado:", error);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSelectChange = (name, value) => {
    setLoginForm(prev => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const logar = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const user = loginForm.usuario;
      const pass = loginForm.senha;
      const empresa = loginForm.empresa;

      if (!user || !pass || !empresa) {
        setError("Todos os campos são obrigatórios");
        return;
      }

      // Tratamento especial para o administrador do sistema
      if (user === "admin" && pass === "admin123") {
        const dadosUsuario = {
          user: "admin@cba.com",
          name: "Administrador do Sistema",
          company_id: empresa,
          permissions: {
            can_manage_products: true,
            can_manage_warehouse: true,
            can_manage_vehicles: true,
            can_manage_weighing: true,
            can_manage_finance: true,
            can_manage_users: true,
            can_view_reports: true
          },
          loginTime: new Date().toISOString(),
          isSystemAdmin: true,
          role: "Administrador"
        };
        localStorage.setItem("usuarioLogado", JSON.stringify(dadosUsuario));
        localStorage.setItem("selectedCompanyId", empresa);
        
        try {
          await AccessLog.create({
            company_id: empresa,
            user_email: "admin@cba.com",
            user_name: "Administrador do Sistema",
            action: "login",
            details: `Login de administrador do sistema`,
            timestamp: new Date().toISOString(),
            success: true
          });
        } catch (logError) {
          console.warn("Erro ao registrar log de acesso:", logError);
        }

        window.location.href = createPageUrl("Dashboard");
        return;
      }

      // Fluxo normal de verificação de usuário
      const userPermissions = await UserPermission.filter({ user_email: user });
      
      if (userPermissions.length === 0) {
        setError("Usuário não encontrado no sistema");
        return;
      }

      const userPermission = userPermissions[0];

      if (userPermission.status !== "ativo") {
        setError(`Usuário ${userPermission.status}. Entre em contato com o administrador.`);
        return;
      }

      // Verificar se o usuário tem acesso à empresa selecionada
      if (userPermission.company_id !== empresa) {
        setError("Usuário não tem acesso à empresa selecionada");
        return;
      }
      
      const dadosUsuario = {
        user: user,
        name: userPermission.user_name,
        company_id: empresa,
        permissions: userPermission.permissions || {},
        role: userPermission.role || "Operador de Balança",
        loginTime: new Date().toISOString()
      };
      
      localStorage.setItem("usuarioLogado", JSON.stringify(dadosUsuario));
      localStorage.setItem("selectedCompanyId", empresa);
      
      try {
        await AccessLog.create({
          company_id: empresa,
          user_email: user,
          user_name: userPermission.user_name,
          action: "login",
          details: `Login realizado com sucesso`,
          timestamp: new Date().toISOString(),
          success: true
        });

        await UserPermission.update(userPermission.id, { 
          last_login: new Date().toISOString() 
        });
      } catch (logError) {
        console.warn("Erro ao registrar atividade:", logError);
      }
      
      window.location.href = createPageUrl("Dashboard");

    } catch (error) {
      console.error("Erro no login:", error);
      setError("Erro interno. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-md p-4">
        <Card className="shadow-2xl bg-white/90 backdrop-blur border-0">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">
              Acesso ao Sistema
            </CardTitle>
            <p className="text-slate-600 text-sm mt-2">
              CBA Mineração - Sistema de Gestão
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={logar} className="space-y-6">
              <div>
                <Label htmlFor="empresa" className="flex items-center mb-2 text-sm font-medium text-slate-700">
                  <Building2 className="h-4 w-4 mr-2 text-slate-500" />
                  Empresa/Filial
                </Label>
                {isLoadingCompanies ? (
                  <div className="flex items-center justify-center py-3 border rounded-lg h-12 bg-slate-50">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <Select 
                    name="empresa"
                    value={loginForm.empresa} 
                    onValueChange={(value) => handleSelectChange("empresa", value)}
                    required
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Selecione a empresa/filial" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-slate-500" />
                            {company.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div>
                <Label htmlFor="usuario" className="text-sm font-medium text-slate-700 mb-2 block">
                  Email/Usuário
                </Label>
                <Input
                  type="text"
                  name="usuario"
                  id="usuario"
                  value={loginForm.usuario}
                  onChange={handleInputChange}
                  placeholder="seu.email@empresa.com"
                  required
                  disabled={isLoading}
                  className="h-12"
                />
              </div>

              <div>
                <Label htmlFor="senha" className="text-sm font-medium text-slate-700 mb-2 block">
                  Senha
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="senha"
                    id="senha"
                    value={loginForm.senha}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                    className="h-12 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-500 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-red-700 text-sm bg-red-50 p-4 rounded-lg border border-red-200">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading || isLoadingCompanies}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Entrando...
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5 mr-2" />
                    Entrar no Sistema
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-200">
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-2">
                  Usuário de teste: <code className="bg-slate-100 px-2 py-1 rounded text-xs">admin</code>
                </p>
                <p className="text-xs text-slate-500">
                  Senha de teste: <code className="bg-slate-100 px-2 py-1 rounded text-xs">admin123</code>
                </p>
              </div>
            </div>

            <div className="mt-6 text-center text-xs text-slate-400">
              Sistema desenvolvido para CBA Mineração
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}