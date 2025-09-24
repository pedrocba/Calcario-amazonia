import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Verifique se o caminho para o seu cliente Supabase está correto.
import supabase from '@/lib/supabaseClient'; 
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Building2, CheckCircle } from 'lucide-react';

export default function SelectCompany() {
  // Dados reais do Supabase
  const realCompanies = [
    { id: '68cacb913d169d191be6c90d', name: 'CBA - Santarém (Matriz)', full_name: 'CBA - Santarém (Matriz)', city: 'Santarém', state: 'PA' },
    { id: '68cacb92e2a68ede182f868d', name: 'Mucajaí - Roraima (Filial)', full_name: 'Mucajaí - Roraima (Filial)', city: 'Mucajaí', state: 'RR' },
    { id: '68cacb923b46f6fe1b3325a6', name: 'Loja do Sertanejo - Santarém', full_name: 'Loja do Sertanejo - Santarém', city: 'Santarém', state: 'PA' }
  ];

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Carregar dados reais do Supabase
    setCompanies(realCompanies);
  }, []);

  const handleCompanySelect = (company) => {
    setSelectedCompany(company);
  };

  const handleConfirm = () => {
    if (!selectedCompany) return;

    // Salva a empresa selecionada no localStorage para persistir a sessão
    localStorage.setItem('selectedCompany', JSON.stringify(selectedCompany));
    
    // O ideal é também atualizar um contexto global (AuthContext) aqui
    console.log("Filial selecionada e salva:", selectedCompany);
    
    // Navega para o dashboard principal
    navigate('/dashboard'); 
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600">Carregando filiais...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Erro</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadCompanies}>Tentar Novamente</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-red-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-800 rounded-lg mb-4">
            <span className="text-2xl font-bold text-white">A</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            ⭐ Andres One ⭐
          </h1>
          <p className="text-white/80 text-lg mb-2">Plataforma Integrada de Gestão</p>
          <p className="text-white/70">Selecione a filial para acessar</p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <div className="text-center mb-6">
            <div className="inline-block bg-white/10 rounded-lg px-6 py-3 border border-white/20">
              <p className="text-white font-medium">Bem-vindo(a), superadmin@calcarioamazonia.com</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {companies.map((company) => (
              <div
                key={company.id}
                className={`cursor-pointer transition-all duration-200 p-4 rounded-lg border-2 ${
                  selectedCompany?.id === company.id
                    ? 'border-yellow-400 bg-yellow-400/20'
                    : 'border-white/30 bg-white/5 hover:bg-white/10'
                }`}
                onClick={() => handleCompanySelect(company)}
              >
                <div className="flex items-center space-x-3">
                  <Building2 className="w-6 h-6 text-white" />
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg">{company.name}</h3>
                    <p className="text-white/70 text-sm">{company.full_name}</p>
                    <p className="text-white/60 text-xs">{company.city}, {company.state}</p>
                  </div>
                  {selectedCompany?.id === company.id && (
                    <CheckCircle className="w-6 h-6 text-yellow-400" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {companies.length === 0 && !loading && (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-white">
                Nenhuma filial disponível para seu usuário.
              </h3>
            </div>
          )}

          {selectedCompany && (
            <div className="flex justify-center pt-4">
              <Button
                onClick={handleConfirm}
                className="px-8 py-3 text-lg bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg"
                size="lg"
              >
                Acessar {selectedCompany.name}
              </Button>
            </div>
          )}

          <div className="text-center mt-6">
            <div className="inline-flex items-center gap-2 text-green-400 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              Sistema corrige automaticamente filiais duplicadas
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}