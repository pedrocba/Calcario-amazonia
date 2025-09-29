# 🔐 Configuração do Super Admin

## ✅ **Passo 1: Configurar o Super Admin no Supabase**

### 1.1 Executar o SQL de Configuração
Execute o arquivo `supabase-super-admin-setup.sql` no SQL Editor do Supabase:

```sql
-- Este arquivo contém:
-- 1. Criação do usuário super_admin
-- 2. Função get_user_companies com lógica especial
-- 3. Políticas RLS atualizadas
-- 4. Funções auxiliares
```

### 1.2 Verificar o Usuário Super Admin
Após executar o SQL, verifique se o usuário foi criado:
- **Email:** `superadmin@calcarioamazonia.com`
- **Role:** `super_admin`
- **ID:** `00000000-0000-0000-0000-000000000001`

### 1.3 Criar Senha para o Super Admin
No painel do Supabase:
1. Vá para **Authentication > Users**
2. Encontre o usuário `superadmin@calcarioamazonia.com`
3. Clique em **"..." > "Reset Password"**
4. Defina uma senha (ex: `SuperAdmin123!`)

## 🚀 **Passo 2: Testar o Sistema**

### 2.1 Login como Super Admin
1. Acesse: `http://localhost:5173/login`
2. Use as credenciais:
   - **Email:** `superadmin@calcarioamazonia.com`
   - **Senha:** `SuperAdmin123!`

### 2.2 Verificar Redirecionamento
- Super admin deve ser redirecionado para `/admin/dashboard`
- Usuários normais devem ir para `/select-company`

### 2.3 Testar Funcionalidades
- ✅ Acesso irrestrito a todas as filiais
- ✅ Dashboard de administração global
- ✅ Bypass das regras de filial
- ✅ Gerenciamento de usuários

## 🔧 **Passo 3: Configurar Filiais de Teste**

### 3.1 Criar Filiais no Supabase
Execute no SQL Editor:

```sql
-- Inserir filiais de teste
INSERT INTO companies (id, name, description, created_at, updated_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Filial Norte', 'Filial da Região Norte', NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222', 'Filial Sul', 'Filial da Região Sul', NOW(), NOW()),
  ('33333333-3333-3333-3333-333333333333', 'Filial Centro', 'Filial da Região Centro', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
```

### 3.2 Testar Seleção de Filial
1. Crie um usuário normal (role: `usuario_padrao`)
2. Faça login
3. Verifique se aparece a tela de seleção de filial
4. Teste a seleção de diferentes filiais

## 🎯 **Funcionalidades Implementadas**

### **Super Admin:**
- ✅ Acesso irrestrito a todas as filiais
- ✅ Dashboard de administração global
- ✅ Bypass das regras RLS
- ✅ Gerenciamento de usuários
- ✅ Redirecionamento automático para `/admin/dashboard`

### **Usuários Normais:**
- ✅ Seleção de filial obrigatória
- ✅ Acesso limitado à filial selecionada
- ✅ Redirecionamento para `/select-company` se não houver filial selecionada

### **Sistema de RLS:**
- ✅ Políticas inteligentes baseadas em role
- ✅ Super admin bypassa todas as restrições
- ✅ Usuários normais filtrados por filial

## 🐛 **Troubleshooting**

### Erro: "Função get_user_companies não existe"
- Execute o arquivo `supabase-super-admin-setup.sql` no Supabase

### Erro: "Usuário não encontrado"
- Verifique se o usuário super_admin foi criado
- Confirme se o email está correto

### Erro: "Acesso negado"
- Verifique se o role está definido como `super_admin`
- Confirme se as políticas RLS foram aplicadas

### Redirecionamento incorreto
- Verifique se o `AuthRedirect` está funcionando
- Confirme se o `isSuperAdmin` está retornando true

## 📚 **Arquivos Importantes**

- `supabase-super-admin-setup.sql` - Configuração do banco
- `src/pages/admin/AdminDashboard.jsx` - Dashboard do super admin
- `src/pages/SelectCompany.jsx` - Seleção de filial
- `src/components/auth/AuthRedirect.jsx` - Redirecionamento inteligente
- `src/hooks/usePermissions.jsx` - Sistema de permissões atualizado

## 🎉 **Próximos Passos**

1. **Implementar gerenciamento de usuários** no dashboard de admin
2. **Criar sistema de convites** para novos usuários
3. **Implementar auditoria** de ações do super admin
4. **Adicionar relatórios globais** para o super admin
5. **Configurar notificações** de segurança






















