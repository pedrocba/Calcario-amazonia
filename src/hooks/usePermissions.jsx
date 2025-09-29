import { useAuth } from '@/contexts/SimpleAuthContext'

/**
 * Hook para gerenciar permissões baseadas em roles
 */
export const usePermissions = () => {
  const { profile, isAdmin } = useAuth()

  // Mapear roles do Supabase para permissões do sistema
  const roleHierarchy = {
    'admin': ['admin', 'gerente_patio', 'almoxarife', 'usuario_padrao'],
    'gerente_patio': ['gerente_patio', 'almoxarife', 'usuario_padrao'],
    'almoxarife': ['almoxarife', 'usuario_padrao'],
    'usuario_padrao': ['usuario_padrao']
  }

  const checkPermission = (requiredRole) => {
    if (!profile?.role) return false
    
    // Super admin tem acesso a tudo
    if (profile.role === 'super_admin') return true
    
    const userRoles = roleHierarchy[profile.role] || ['usuario_padrao']
    return userRoles.includes(requiredRole)
  }

  const hasPermission = (permission) => {
    if (!profile?.role) return false

    // Super admin tem acesso a tudo
    if (profile.role === 'super_admin') return true

    const permissions = {
      // Permissões de administração
      'manage_users': ['super_admin', 'admin'],
      'manage_companies': ['super_admin', 'admin'],
      'manage_system_settings': ['super_admin', 'admin'],
      'view_admin_panel': ['super_admin', 'admin'],
      
      // Permissões de gestão
      'manage_vehicles': ['super_admin', 'admin', 'gerente_patio'],
      'manage_finance': ['super_admin', 'admin', 'gerente_patio'],
      'view_reports': ['super_admin', 'admin', 'gerente_patio'],
      'manage_requisitions': ['super_admin', 'admin', 'gerente_patio', 'almoxarife'],
      
      // Permissões de almoxarifado
      'manage_products': ['super_admin', 'admin', 'almoxarife'],
      'manage_inventory': ['super_admin', 'admin', 'almoxarife'],
      'manage_transfers': ['super_admin', 'admin', 'almoxarife'],
      'manage_warehouse': ['super_admin', 'admin', 'almoxarife'],
      
      // Permissões básicas
      'view_dashboard': ['super_admin', 'admin', 'gerente_patio', 'almoxarife', 'usuario_padrao'],
      'use_weighing': ['super_admin', 'admin', 'gerente_patio', 'almoxarife', 'usuario_padrao'],
      'view_own_data': ['super_admin', 'admin', 'gerente_patio', 'almoxarife', 'usuario_padrao']
    }

    const allowedRoles = permissions[permission] || []
    return allowedRoles.includes(profile.role)
  }

  // Funções de conveniência
  const canManageUsers = () => hasPermission('manage_users')
  const canManageCompanies = () => hasPermission('manage_companies')
  const canManageVehicles = () => hasPermission('manage_vehicles')
  const canManageFinance = () => hasPermission('manage_finance')
  const canManageProducts = () => hasPermission('manage_products')
  const canManageInventory = () => hasPermission('manage_inventory')
  const canManageTransfers = () => hasPermission('manage_transfers')
  const canManageWarehouse = () => hasPermission('manage_warehouse')
  const canViewReports = () => hasPermission('view_reports')
  const canViewAdminPanel = () => hasPermission('view_admin_panel')
  const canUseWeighing = () => hasPermission('use_weighing')
  const canAccessAllCompanies = () => profile?.role === 'super_admin'
  const canManageGlobalSettings = () => profile?.role === 'super_admin'

  return {
    profile,
    isAdmin,
    checkPermission,
    hasPermission,
    canManageUsers,
    canManageCompanies,
    canManageVehicles,
    canManageFinance,
    canManageProducts,
    canManageInventory,
    canManageTransfers,
    canManageWarehouse,
    canViewReports,
    canViewAdminPanel,
    canUseWeighing,
    canAccessAllCompanies,
    canManageGlobalSettings
  }
}

/**
 * Componente para renderização condicional baseada em permissões
 */
export const PermissionGate = ({ permission, children, fallback = null }) => {
  const { hasPermission } = usePermissions()
  
  if (hasPermission(permission)) {
    return children
  }
  
  return fallback
}

/**
 * Hook para verificar se o usuário pode acessar uma rota específica
 */
export const useRoutePermissions = () => {
  const { hasPermission } = usePermissions()

  const routePermissions = {
    '/users': 'manage_users',
    '/backup-manager': 'manage_system_settings',
    '/data-importer': 'manage_system_settings',
    '/vehicles': 'manage_vehicles',
    '/finance': 'manage_finance',
    '/products': 'manage_products',
    '/warehouse': 'manage_warehouse',
    '/transfers': 'manage_transfers',
    '/reports': 'view_reports',
    '/weighing': 'use_weighing'
  }

  const canAccessRoute = (route) => {
    const permission = routePermissions[route]
    if (!permission) return true // Rota pública
    
    return hasPermission(permission)
  }

  return { canAccessRoute }
}
