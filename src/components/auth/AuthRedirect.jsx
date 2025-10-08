import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/SimpleAuthContext'
import { Loader2 } from 'lucide-react'

export default function AuthRedirect() {
  const { profile, isAuthenticated, isSuperAdmin, loading } = useAuth()
  const [hasRedirected, setHasRedirected] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const originPath = location.state?.from?.pathname || null
  const profileTimeoutRef = useRef(null)
  const hasRedirectedRef = useRef(false)

  useEffect(() => {
    return () => {
      if (profileTimeoutRef.current) {
        clearTimeout(profileTimeoutRef.current)
        profileTimeoutRef.current = null
      }
    }
  }, [])

  const performRedirect = (path) => {
    if (hasRedirectedRef.current) {
      return
    }

    hasRedirectedRef.current = true
    setHasRedirected(true)
    navigate(path, { replace: true })
  }

  useEffect(() => {
    // Evitar múltiplos redirecionamentos
    if (hasRedirected) return

    // Aguardar o contexto carregar
    if (loading) {
      console.log('Aguardando contexto carregar...')
      return
    }

    console.log('Estado atual:', { isAuthenticated, isSuperAdmin, profile: !!profile, loading })

    // Aguardar um pouco mais para garantir que o estado foi atualizado após login
    const timeout = setTimeout(() => {
      console.log('Estado após timeout:', { isAuthenticated, isSuperAdmin, profile: !!profile, loading })

      // Se não estiver autenticado, ir para login
      if (!isAuthenticated) {
        console.log('Usuário não autenticado, redirecionando para login')
        performRedirect('/login')
        return
      }

      // Se não tem perfil ainda, aguardar mais um pouco
      if (!profile) {
        console.log('Aguardando perfil...')

        if (profileTimeoutRef.current) {
          clearTimeout(profileTimeoutRef.current)
        }

        // Aguardar até 3 segundos pelo perfil
        profileTimeoutRef.current = setTimeout(() => {
          console.log('Timeout aguardando perfil, redirecionando para login')
          performRedirect('/login')
        }, 3000)

        return
      }

      if (profileTimeoutRef.current) {
        clearTimeout(profileTimeoutRef.current)
        profileTimeoutRef.current = null
      }

      console.log('Perfil carregado:', profile.role)

      // Priorizar retorno para rota original se houver
      if (originPath) {
        console.log('Redirecionando para rota original:', originPath)
        performRedirect(originPath)
        return
      }

      // Se for super admin, ir direto para o dashboard de admin
      if (isSuperAdmin) {
        console.log('Redirecionando super admin para dashboard de admin')
        performRedirect('/admin/dashboard')
        return
      }

      // Verificar se há uma filial selecionada
      const selectedCompany = localStorage.getItem('selectedCompany')

      if (selectedCompany) {
        // Se há filial selecionada, ir para o dashboard normal
        console.log('Redirecionando para dashboard com filial selecionada')
        performRedirect('/dashboard')
      } else {
        // Se não há filial selecionada, ir para seleção de filial
        console.log('Redirecionando para seleção de filial')
        performRedirect('/select-company')
      }
    }, 200) // Aguardar 200ms para garantir que o estado foi atualizado

    return () => clearTimeout(timeout)
  }, [
    hasRedirected,
    isAuthenticated,
    isSuperAdmin,
    loading,
    navigate,
    originPath,
    profile,
  ])

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
