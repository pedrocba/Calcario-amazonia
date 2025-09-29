import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Building2, Edit, Trash2, MapPin, Phone, Mail, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/SimpleAuthContext";
import { useCompany } from "../components/common/CompanyContext";
import CompanyForm from "../components/companies/CompanyForm";
import SearchDebounce from "../components/common/SearchDebounce";
import PaginatedList from "../components/common/PaginatedList";
import { Skeleton } from "@/components/ui/skeleton";

export default function CompaniesPage() {
  const { user, isAuthenticated } = useAuth();
  const { currentCompany } = useCompany();
  const [companies, setCompanies] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCompanies = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("🔍 DEBUG - Carregando empresas...");
      console.log("🏢 currentCompany:", currentCompany);
      console.log("🆔 currentCompany.id:", currentCompany?.id);
      
      if (!currentCompany?.id) {
        console.warn("❌ Nenhuma empresa selecionada");
        setCompanies([]);
        return;
      }

      // Filtrar empresas pela empresa atual do usuário
      console.log("🔍 Buscando empresas com empresa_id =", currentCompany.id);
      
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('empresa_id', currentCompany.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("❌ Erro na consulta:", error);
        throw error;
      }

      console.log("✅ Empresas encontradas:", data);
      setCompanies(data || []);
    } catch (err) {
      console.error("❌ Erro ao carregar empresas:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentCompany?.id) {
      loadCompanies();
    }
  }, [currentCompany?.id]);

  const handleNewCompanyClick = () => {
    setEditingCompany(null);
    setShowForm(true);
  };

  const handleEditCompany = (company) => {
    setEditingCompany(company);
    setShowForm(true);
  };

  const handleSubmit = async (companyData) => {
    try {
      if (!isAuthenticated || !user) {
        throw new Error("Usuário não autenticado.");
      }

      if (!currentCompany?.id) {
        throw new Error("Nenhuma empresa selecionada.");
      }

      // Adicionar empresa_id aos dados (a trigger preenche automaticamente)
      const companyDataWithEmpresa = {
        ...companyData
        // empresa_id será preenchido automaticamente pela trigger
      };

      if (editingCompany && editingCompany.id) {
        // MODO UPDATE
        const { error } = await supabase
          .from('companies')
          .update(companyDataWithEmpresa)
          .eq('id', editingCompany.id);

        if (error) throw error;
        alert('Empresa atualizada com sucesso!');
      } else {
        // MODO CREATE
        const { error } = await supabase
          .from('companies')
          .insert([companyDataWithEmpresa]);

        if (error) throw error;
        alert('Empresa cadastrada com sucesso!');
      }

      await loadCompanies();
      setShowForm(false);
      setEditingCompany(null);
    } catch (error) {
      console.error('Erro ao salvar empresa:', error);
      alert(`Erro ao salvar empresa: ${error.message}`);
    }
  };

  const handleDeleteCompany = async (company) => {
    if (!confirm(`Tem certeza que deseja excluir a empresa "${company.name}"?`)) {
      return;
    }

    try {
      if (!currentCompany?.id) {
        throw new Error("Nenhuma empresa selecionada.");
      }

      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', company.id);

      if (error) throw error;

      alert('Empresa excluída com sucesso!');
      await loadCompanies();
    } catch (error) {
      console.error('Erro ao excluir empresa:', error);
      alert(`Erro ao excluir empresa: ${error.message}`);
    }
  };

  const filteredCompanies = companies.filter(company =>
    searchTerm === '' ||
    company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCompanyTypeColor = (type) => {
    return type === 'matriz' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  const getStatusColor = (active) => {
    return active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestão de Empresas</h1>
        <Button onClick={handleNewCompanyClick}>
          <Plus className="w-5 h-5 mr-2" />
          Nova Empresa
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }} 
            className="mb-8 overflow-hidden"
          >
            <CompanyForm 
              company={editingCompany} 
              onSubmit={handleSubmit} 
              onCancel={() => { 
                setShowForm(false); 
                setEditingCompany(null); 
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros e Busca</CardTitle>
        </CardHeader>
        <CardContent>
          <SearchDebounce 
            placeholder="Buscar por nome, código, razão social ou cidade..." 
            onSearch={setSearchTerm} 
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Lista de Empresas ({filteredCompanies.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-24 w-full" count={3} />
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">Erro ao carregar empresas: {error}</p>
              <Button onClick={loadCompanies}>Tentar novamente</Button>
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">
                {searchTerm ? 'Nenhuma empresa encontrada com os filtros aplicados.' : 'Nenhuma empresa cadastrada.'}
              </p>
              {!searchTerm && (
                <Button onClick={handleNewCompanyClick}>
                  <Plus className="w-4 h-4 mr-2" />
                  Cadastrar primeira empresa
                </Button>
              )}
            </div>
          ) : (
            <PaginatedList
              data={filteredCompanies}
              defaultItemsPerPage={10}
              renderItem={(company) => (
                <div key={company.id} className="p-6 border-b hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{company.name}</h3>
                        <Badge className={getCompanyTypeColor(company.type)}>
                          {company.type === 'matriz' ? 'Matriz' : 'Filial'}
                        </Badge>
                        <Badge className={getStatusColor(company.active)}>
                          {company.active ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Código:</strong> {company.code}
                        {company.full_name && (
                          <>
                            <span className="mx-2">•</span>
                            <strong>Razão Social:</strong> {company.full_name}
                          </>
                        )}
                      </p>

                      {company.cnpj && (
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>CNPJ:</strong> {company.cnpj}
                          {company.ie && (
                            <>
                              <span className="mx-2">•</span>
                              <strong>IE:</strong> {company.ie}
                            </>
                          )}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        {company.address && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{company.address}</span>
                            {company.city && <span>, {company.city}</span>}
                            {company.state && <span>- {company.state}</span>}
                          </div>
                        )}
                        
                        {company.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            <span>{company.phone}</span>
                          </div>
                        )}
                        
                        {company.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            <span>{company.email}</span>
                          </div>
                        )}
                        
                        {company.website && (
                          <div className="flex items-center gap-1">
                            <Globe className="w-4 h-4" />
                            <a 
                              href={company.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {company.website}
                            </a>
                          </div>
                        )}
                      </div>

                      {company.notes && (
                        <p className="text-sm text-gray-500 mt-2 italic">
                          {company.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCompany(company)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCompany(company)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

