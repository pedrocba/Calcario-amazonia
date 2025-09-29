import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/SimpleAuthContext'
import { Loader2 } from 'lucide-react'

export default function AuthRedirect() {
  const { user, profile, isAuthenticated, isSuperAdmin, loading } = useAuth()
  const [hasRedirected, setHasRedirected] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Evitar múltiplos redirecionamentos
    if (hasRedirected) return

    // Aguardar o contexto carregar
    if (loading) {
      console.log('Aguardando contexto carregar...')
      return
    }

    console.log('Estado atual:', { isAuthenticated, isSuperAdmin, profile: !!profile, loading, user: !!user })

    // Aguardar um pouco mais para garantir que o estado foi atualizado após login
    const timeout = setTimeout(() => {
      console.log('Estado após timeout:', { isAuthenticated, isSuperAdmin, profile: !!profile, loading, user: !!user })

      // Se não estiver autenticado, ir para login
      if (!isAuthenticated) {
        console.log('Usuário não autenticado, redirecionando para login')
        setHasRedirected(true)
        navigate('/login')
        return
      }

      // Se não tem perfil ainda, aguardar mais um pouco
      if (!profile) {
        console.log('Aguardando perfil...')
        // Aguardar até 3 segundos pelo perfil
        const profileTimeout = setTimeout(() => {
          console.log('Timeout aguardando perfil, redirecionando para login')
          setHasRedirected(true)
          navigate('/login')
        }, 3000)
        
        return () => clearTimeout(profileTimeout)
      }

      console.log('Perfil carregado:', profile.role)
      setHasRedirected(true)

      // Se for super admin, ir direto para o dashboard de admin
      if (isSuperAdmin) {
        console.log('Redirecionando super admin para dashboard de admin')
        navigate('/admin/dashboard')
        return
      }

      // Verificar se há uma filial selecionada
      const selectedCompany = localStorage.getItem('selectedCompany')
      
      if (selectedCompany) {
        // Se há filial selecionada, ir para o dashboard normal
        console.log('Redirecionando para dashboard com filial selecionada')
        navigate('/dashboard')
      } else {
        // Se não há filial selecionada, ir para seleção de filial
        console.log('Redirecionando para seleção de filial')
        navigate('/select-company')
      }
    }, 200) // Aguardar 200ms para garantir que o estado foi atualizado

    return () => clearTimeout(timeout)
  }, [isAuthenticated, isSuperAdmin, profile, loading, navigate, hasRedirected, user])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return null
}
