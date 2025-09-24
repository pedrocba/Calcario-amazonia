import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Building2, 
  Settings, 
  Shield, 
  BarChart3, 
  Activity,
  Plus,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'

export default function AdminDashboard() {
  const { user, profile, isSuperAdmin } = useAuth()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCompanies: 0,
    totalProducts: 0,
    recentActivity: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isSuperAdmin) {
      fetchDashboardData()
    }
  }, [isSuperAdmin])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      // Aqui você pode implementar chamadas para buscar estatísticas
      // Por enquanto, vamos usar dados mockados
      setStats({
        totalUsers: 25,
        totalCompanies: 3,
        totalProducts: 150,
        recentActivity: [
          { id: 1, action: 'Usuário criado', user: 'João Silva', time: '2 min atrás' },
          { id: 2, action: 'Produto atualizado', user: 'Maria Santos', time: '5 min atrás' },
          { id: 3, action: 'Filial adicionada', user: 'Pedro Costa', time: '1 hora atrás' }
        ]
      })
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-600 mb-2">Acesso Negado</h1>
          <p className="text-gray-600">
            Apenas super administradores podem acessar esta área.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Painel de Administração Global
          </h1>
          <p className="text-gray-600">
            Bem-vindo, {profile?.full_name || user?.email}. Você tem acesso total ao sistema.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                +2 desde ontem
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Filiais</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCompanies}</div>
              <p className="text-xs text-muted-foreground">
                Ativas no sistema
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produtos</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                Cadastrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Atividade</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                Ações hoje
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Usuários</CardTitle>
              <CardDescription>
                Gerencie usuários, permissões e convites
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Button className="flex-1">
                  <Users className="w-4 h-4 mr-2" />
                  Ver Usuários
                </Button>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Convidar
                </Button>
              </div>
              <div className="text-sm text-gray-600">
                {stats.totalUsers} usuários cadastrados no sistema
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Filiais</CardTitle>
              <CardDescription>
                Configure e gerencie filiais do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Button className="flex-1">
                  <Building2 className="w-4 h-4 mr-2" />
                  Ver Filiais
                </Button>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Filial
                </Button>
              </div>
              <div className="text-sm text-gray-600">
                {stats.totalCompanies} filiais configuradas
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>
              Últimas ações realizadas no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-gray-500">por {activity.user}</p>
                  </div>
                  <div className="text-xs text-gray-400">
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}















