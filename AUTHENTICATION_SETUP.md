# 🔐 Sistema de Autenticação e Controle de Acesso

## ✅ Implementação Concluída

### **Passo 1: Tela de Login e Lógica de Autenticação**
- ✅ Página de login (`/login`) com formulário
- ✅ Integração com Supabase Auth
- ✅ Tratamento de erros e redirecionamento
- ✅ Contexto de autenticação (`AuthContext`)

### **Passo 2: Gerenciamento de Sessão e Rotas Protegidas**
- ✅ Rotas protegidas (`ProtectedRoute`)
- ✅ Verificação automática de autenticação
- ✅ Redirecionamento para login quando não autenticado
- ✅ Botões de logout no layout

### **Passo 3: Controle de Acesso Baseado em Papel (RBAC)**
- ✅ Sistema de permissões baseado em roles
- ✅ Middleware de autenticação para API
- ✅ Políticas de segurança para Supabase (RLS)
- ✅ Filtragem de menu baseada em permissões

## 🚀 Como Usar

### 1. Configuração do Supabase

Execute o arquivo `supabase-rls-policies.sql` no seu projeto Supabase para configurar as políticas de segurança:

```sql
-- Execute no SQL Editor do Supabase
-- Este arquivo contém todas as políticas RLS necessárias
```

### 2. Variáveis de Ambiente

Certifique-se de que seu arquivo `.env` contém:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Estrutura de Roles

O sistema suporta os seguintes roles:

- **`admin`**: Acesso total ao sistema
- **`gerente_patio`**: Gestão de veículos, relatórios e requisições
- **`almoxarife`**: Gestão de produtos, estoque e transferências
- **`usuario_padrao`**: Acesso básico ao sistema

### 4. Uso no Frontend

#### Hook de Permissões
```jsx
import { usePermissions } from '@/hooks/usePermissions'

function MyComponent() {
  const { hasPermission, canManageUsers, isAdmin } = usePermissions()
  
  return (
    <div>
      {hasPermission('manage_users') && <AdminButton />}
      {canManageUsers() && <UserManagement />}
      {isAdmin && <AdminPanel />}
    </div>
  )
}
```

#### Componente de Rota Protegida
```jsx
import ProtectedRoute from '@/components/auth/ProtectedRoute'

// Proteger por role
<ProtectedRoute requiredRole="admin">
  <AdminPage />
</ProtectedRoute>

// Proteger por permissão
<ProtectedRoute requiredPermission="manage_users">
  <UserManagement />
</ProtectedRoute>
```

#### Gate de Permissão
```jsx
import { PermissionGate } from '@/hooks/usePermissions'

<PermissionGate permission="manage_users">
  <AdminButton />
</PermissionGate>
```

### 5. Middleware de API

```jsx
import { withAuth, authenticatedApiCall } from '@/lib/authMiddleware'

// Adicionar token automaticamente
const config = await withAuth({
  method: 'GET',
  url: '/api/users'
})

// Chamada de API com autenticação
const result = await authenticatedApiCall(apiFunction, ...args)
```

## 🔒 Políticas de Segurança

### Row Level Security (RLS)
- Usuários só podem ver seus próprios dados
- Admins podem gerenciar todos os usuários
- Permissões baseadas em roles para diferentes tabelas

### Permissões do Sistema
- **`manage_users`**: Gerenciar usuários (apenas admin)
- **`manage_system_settings`**: Configurações do sistema (apenas admin)
- **`manage_vehicles`**: Gerenciar veículos (admin, gerente)
- **`manage_finance`**: Gerenciar finanças (admin, gerente)
- **`manage_products`**: Gerenciar produtos (admin, almoxarife)
- **`manage_warehouse`**: Gerenciar almoxarifado (admin, almoxarife)
- **`view_reports`**: Ver relatórios (admin, gerente)
- **`use_weighing`**: Usar balança (todos os usuários)

## 🎯 Próximos Passos

1. **Testar o sistema** com diferentes usuários e roles
2. **Configurar as políticas RLS** no Supabase
3. **Personalizar permissões** conforme necessário
4. **Implementar auditoria** de ações do usuário
5. **Adicionar notificações** de segurança

## 🐛 Troubleshooting

### Erro: "Usuário não autenticado"
- Verifique se as variáveis de ambiente estão corretas
- Confirme se o usuário está logado no Supabase

### Erro: "Acesso Negado"
- Verifique se o usuário tem o role correto
- Confirme se as políticas RLS estão configuradas

### Menu não aparece
- Verifique se o usuário tem as permissões necessárias
- Confirme se o mapeamento de roles está correto

## 📚 Arquivos Importantes

- `src/contexts/AuthContext.jsx` - Contexto de autenticação
- `src/hooks/usePermissions.jsx` - Hook de permissões
- `src/components/auth/ProtectedRoute.jsx` - Rota protegida
- `src/lib/authMiddleware.js` - Middleware de API
- `supabase-rls-policies.sql` - Políticas de segurança
- `src/pages/Login.jsx` - Página de login

