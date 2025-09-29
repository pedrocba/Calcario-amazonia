import React, { createContext, useContext, useEffect, useState } from 'react'
import supabase from '@/lib/supabaseClient'

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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar se há um usuário mock no localStorage primeiro
    const mockUser = localStorage.getItem('mockUser')
    if (mockUser) {
      try {
        const user = JSON.parse(mockUser)
        console.log('Usuário mock encontrado:', user)
        setUser(user)
        setLoading(false)
        return
      } catch (error) {
        console.error('Erro ao parsear usuário mock:', error)
        localStorage.removeItem('mockUser')
      }
    }

    // Verificar se há uma sessão ativa do Supabase
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        console.log('Sessão encontrada:', session)
        
        if (session?.user) {
          setUser(session.user)
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Mudança de auth:', event, session)
        
        if (session?.user) {
          setUser(session.user)
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    try {
      setLoading(true)
      console.log('Tentando fazer login com:', email)
      
      // Verificação para usuário admin (mock)
      if (email === 'admin' && password === 'admin') {
        console.log('Login admin mock bem-sucedido!')
        const mockUser = {
          id: 'admin-id',
          email: 'admin@calcarioamazonia.com',
          user_metadata: { 
            full_name: 'Administrador',
            role: 'admin'
          }
        }
        setUser(mockUser)
        localStorage.setItem('mockUser', JSON.stringify(mockUser))
        setLoading(false)
        return { success: true, data: { user: mockUser } }
      }
      
      // Verificação para super admin (mock)
      if (email === 'superadmin@calcarioamazonia.com' && password === 'admin123') {
        console.log('Login super admin mock bem-sucedido!')
        const mockUser = {
          id: 'super-admin-id',
          email: 'superadmin@calcarioamazonia.com',
          user_metadata: { 
            full_name: 'Super Admin',
            role: 'super_admin'
          }
        }
        setUser(mockUser)
        localStorage.setItem('mockUser', JSON.stringify(mockUser))
        setLoading(false)
        return { success: true, data: { user: mockUser } }
      }
      
      // Login real com Supabase para outros usuários
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Erro de autenticação:', error)
        throw error
      }

      console.log('Login bem-sucedido:', data.user?.id)
      
      // Aguardar o setUser ser processado
      setUser(data.user)
      
      // Aguardar um pouco para garantir que o estado foi atualizado
      await new Promise(resolve => setTimeout(resolve, 100))
      
      return { success: true, data }
    } catch (error) {
      console.error('Erro no login:', error)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      
      // Se for usuário mock, apenas limpar localStorage
      const mockUser = localStorage.getItem('mockUser')
      if (mockUser) {
        localStorage.removeItem('mockUser')
        setUser(null)
        localStorage.removeItem('selectedCompany')
        setLoading(false)
        return
      }
      
      // Logout do Supabase para usuários reais
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw error
      }
      setUser(null)
      // Limpar empresa selecionada do localStorage para garantir sessão limpa
      localStorage.removeItem('selectedCompany')
    } catch (error) {
      console.error('Erro no logout:', error)
    } finally {
      setLoading(false)
    }
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

  console.log('AuthContext value:', value)

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
