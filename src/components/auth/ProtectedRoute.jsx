import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/SimpleAuthContext'
import { usePermissions } from '@/hooks/usePermissions'
import { Loader2 } from 'lucide-react'

export default function ProtectedRoute({ 
  children, 
  requiredRole = null, 
  requiredPermission = null 
}) {
  const { user, profile, loading, isAuthenticated } = useAuth()
  const { hasPermission } = usePermissions()
  const location = useLocation()

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  // Se não estiver autenticado, redirecionar para login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Verificar permissão específica se fornecida
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Acesso Negado</h1>
          <p className="text-gray-600">
            Você não tem permissão para acessar esta página.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Permissão necessária: {requiredPermission}
          </p>
        </div>
      </div>
    )
  }

  // Se um papel específico for necessário, verificar se o usuário tem esse papel
  if (requiredRole && profile?.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Acesso Negado</h1>
          <p className="text-gray-600">
            Você não tem permissão para acessar esta página.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Papel necessário: {requiredRole} | Seu papel: {profile?.role || 'N/A'}
          </p>
        </div>
      </div>
    )
  }

  return children
}
