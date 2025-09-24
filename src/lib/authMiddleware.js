import supabase from './supabaseClient'

/**
 * Middleware para adicionar token de autenticação nas requisições
 */
export const withAuth = async (requestConfig) => {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session?.access_token) {
    throw new Error('Usuário não autenticado')
  }

  return {
    ...requestConfig,
    headers: {
      ...requestConfig.headers,
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    }
  }
}

/**
 * Hook para verificar se o usuário tem permissão para uma ação
 */
export const usePermissions = () => {
  const checkPermission = (requiredRole) => {
    const { user, profile } = useAuth()
    
    if (!user || !profile) {
      return false
    }

    // TODOS os usuários têm acesso a TODAS as funcionalidades
    return true
  }

  // TODOS os usuários têm acesso total
  const isAdmin = () => true
  const isManager = () => true
  const isWarehouse = () => true
  const isUser = () => true

  return {
    checkPermission,
    isAdmin,
    isManager,
    isWarehouse,
    isUser
  }
}

/**
 * Wrapper para chamadas à API com autenticação automática
 */
export const authenticatedApiCall = async (apiFunction, ...args) => {
  try {
    const authConfig = await withAuth({})
    return await apiFunction(authConfig, ...args)
  } catch (error) {
    if (error.message === 'Usuário não autenticado') {
      // Redirecionar para login
      window.location.href = '/login'
      return
    }
    throw error
  }
}
