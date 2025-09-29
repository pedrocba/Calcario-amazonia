import React, { createContext, useContext, useState } from 'react'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  const signIn = async (email, password) => {
    console.log('=== LOGIN DEBUG ===')
    console.log('Email recebido:', email)
    console.log('Password recebido:', password)
    console.log('Tipo do email:', typeof email)
    console.log('Tipo do password:', typeof password)
    
    setLoading(true)
    
    // Aguardar um pouco para simular chamada de API
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Verificação mais flexível - Super Admin
    const superAdminEmailMatch = email && email.trim() === 'superadmin@calcarioamazonia.com'
    const superAdminPasswordMatch = password && password.trim() === 'admin123'
    
    // Verificação Admin padrão
    const adminEmailMatch = email && email.trim().toLowerCase() === 'admin'
    const adminPasswordMatch = password && password.trim() === 'admin'
    
    console.log('Super Admin match:', superAdminEmailMatch && superAdminPasswordMatch)
    console.log('Admin match:', adminEmailMatch && adminPasswordMatch)
    
    if (superAdminEmailMatch && superAdminPasswordMatch) {
      const mockUser = {
        id: 'super-admin-id',
        email: email.trim(),
        user_metadata: { 
          full_name: 'Super Admin',
          role: 'super_admin'
        }
      }
      
      console.log('Login Super Admin bem-sucedido!')
      setUser(mockUser)
      localStorage.setItem('mockUser', JSON.stringify(mockUser))
      
      setLoading(false)
      return { success: true, data: { user: mockUser } }
    } else if (adminEmailMatch && adminPasswordMatch) {
      const mockUser = {
        id: 'admin-id',
        email: 'admin@calcarioamazonia.com',
        user_metadata: { 
          full_name: 'Administrador',
          role: 'admin'
        }
      }
      
      console.log('Login Admin bem-sucedido!')
      setUser(mockUser)
      localStorage.setItem('mockUser', JSON.stringify(mockUser))
      
      setLoading(false)
      return { success: true, data: { user: mockUser } }
    } else {
      console.log('Credenciais inválidas')
      setLoading(false)
      return { success: false, error: 'Credenciais inválidas' }
    }
  }

  const signOut = async () => {
    setUser(null)
    localStorage.removeItem('mockUser')
    localStorage.removeItem('selectedCompany')
  }

  const value = {
    user,
    profile: user ? {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.email,
      role: user.user_metadata?.role || 'usuario_padrao'
    } : null,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!user,
    isAdmin: user?.user_metadata?.role === 'admin',
    isSuperAdmin: user?.user_metadata?.role === 'super_admin'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}








