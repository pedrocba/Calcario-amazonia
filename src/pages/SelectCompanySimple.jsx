import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import supabase from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Building2, CheckCircle } from 'lucide-react'

export default function SelectCompanySimple() {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [error, setError] = useState('')
  
  const navigate = useNavigate()

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      setLoading(true)
      
      // Usar apenas empresas fixas com UUIDs válidos
      const fixedCompanies = [
        {
          id: '68cacb91-3d16-9d19-1be6-c90d00000000',
          name: 'CBA - Santarém (Matriz)',
          full_name: 'CBA - Santarém (Matriz)',
          city: 'Santarém',
          state: 'PA',
          type: 'matriz',
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
      
      setCompanies(fixedCompanies)
    } catch (error) {
      console.error('Erro ao buscar empresas:', error)
      
      // Em caso de erro, usar empresas de exemplo
      const exampleCompanies = [
        {
          id: '1',
          name: 'Filial Principal',
          description: 'Filial principal da empresa',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2', 
          name: 'Filial Secundária',
          description: 'Filial secundária da empresa',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
      
      setCompanies(exampleCompanies)
    } finally {
      setLoading(false)
    }
  }

  const handleCompanySelect = (company) => {
    setSelectedCompany(company)
  }

  const handleConfirm = () => {
    if (!selectedCompany) return

    // Salvar empresa selecionada no localStorage
    localStorage.setItem('selectedCompany', JSON.stringify(selectedCompany))
    
    // Redirecionar para o dashboard
    navigate('/dashboard')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600">Carregando filiais...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Selecionar Filial
          </h1>
          <p className="text-gray-600">
            Escolha a filial que você deseja acessar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <Card 
              key={company.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedCompany?.id === company.id 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => handleCompanySelect(company)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{company.name}</CardTitle>
                    {company.description && (
                      <CardDescription className="text-sm">
                        {company.description}
                      </CardDescription>
                    )}
                  </div>
                  {selectedCompany?.id === company.id && (
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xs text-gray-500">
                  ID: {company.id.slice(0, 8)}...
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {companies.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma filial disponível
            </h3>
            <p className="text-gray-600">
              Entre em contato com o administrador para obter acesso a uma filial.
            </p>
          </div>
        )}

        {selectedCompany && (
          <div className="flex justify-center">
            <Button 
              onClick={handleConfirm}
              className="px-8 py-3 text-lg"
              size="lg"
            >
              Acessar {selectedCompany.name}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}



















