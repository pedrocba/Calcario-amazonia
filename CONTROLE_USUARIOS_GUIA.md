# 🔐 GUIA COMPLETO: Controle de Usuários e Permissões

## 📍 **ONDE ALTERAR PERMISSÕES DE USUÁRIO**

### **1. 🎯 CONTROLE PRINCIPAL - Menu de Navegação**
**Arquivo:** `src/config/navigation.js`

```javascript
// Exemplo: Restringir acesso ao módulo de Produtos
{
  id: 'products',
  path: '/Products',
  title: 'Produtos',
  icon: Package,
  roles: ['super_admin', 'admin', 'almoxarife'], // ← AQUI você controla quem pode ver
  description: 'Gestão de produtos e catálogo'
}
```

**Como alterar:**
- Adicione/remova roles no array `roles`
- Roles disponíveis: `super_admin`, `admin`, `gerente_patio`, `almoxarife`, `usuario_padrao`

### **2. 🛡️ CONTROLE DE FUNCIONALIDADES**
**Arquivo:** `src/lib/authMiddleware.js`

```javascript
// Hierarquia de permissões
const roleHierarchy = {
  'admin': ['admin', 'gerente_patio', 'almoxarife', 'usuario_padrao'],
  'gerente_patio': ['gerente_patio', 'almoxarife', 'usuario_padrao'],
  'almoxarife': ['almoxarife', 'usuario_padrao'],
  'usuario_padrao': ['usuario_padrao']
}
```

**Como alterar:**
- Modifique a hierarquia para dar mais/menos permissões
- Adicione novos roles se necessário

### **3. 🗄️ CONTROLE NO BANCO DE DADOS**
**Tabela:** `profiles` no Supabase

```sql
-- Alterar role de um usuário
UPDATE profiles 
SET role = 'admin' 
WHERE id = 'user-uuid-here';

-- Ver todos os usuários e seus roles
SELECT id, email, full_name, role, created_at 
FROM profiles 
ORDER BY created_at DESC;
```

### **4. 🎨 CONTROLE NA INTERFACE**
**Arquivo:** `src/pages/Layout.jsx`

```javascript
// Mapeamento de roles para exibição
const mapSupabaseRoleToSystemRole = (supabaseRole) => {
  const roleMap = {
    'admin': 'Administrador',
    'usuario_padrao': 'Operador de Balança',
    'gerente_patio': 'Gerente de Pátio',
    'almoxarife': 'Almoxarife'
  };
  return roleMap[supabaseRole] || 'Operador de Balança';
};
```

## 🎯 **ROLES DISPONÍVEIS NO SISTEMA**

### **1. 👑 SUPER_ADMIN**
- **Acesso:** Total a tudo
- **Pode:** Ver todos os menus, gerenciar usuários, acessar relatórios
- **Uso:** Administradores do sistema

### **2. 🔧 ADMIN**
- **Acesso:** Quase tudo exceto configurações críticas
- **Pode:** Gerenciar produtos, estoque, veículos, relatórios
- **Uso:** Gerentes gerais

### **3. 🏗️ GERENTE_PATIO**
- **Acesso:** Operações de pátio e logística
- **Pode:** Gerenciar veículos, transferências, pesagens
- **Uso:** Supervisores de pátio

### **4. 📦 ALMOXARIFE**
- **Acesso:** Gestão de estoque e produtos
- **Pode:** Gerenciar produtos, movimentações de estoque
- **Uso:** Responsáveis pelo almoxarifado

### **5. 👤 USUARIO_PADRAO**
- **Acesso:** Básico, apenas dashboard
- **Pode:** Visualizar dashboard, operar balança
- **Uso:** Operadores de balança

## 🛠️ **COMO ALTERAR PERMISSÕES**

### **Método 1: Via Interface (Recomendado)**
1. Acesse o Supabase Dashboard
2. Vá para `Authentication` → `Users`
3. Encontre o usuário
4. Edite o campo `role` na tabela `profiles`

### **Método 2: Via SQL**
```sql
-- Dar permissão de admin para um usuário
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'usuario@exemplo.com';

-- Remover permissões (voltar para usuário padrão)
UPDATE profiles 
SET role = 'usuario_padrao' 
WHERE email = 'usuario@exemplo.com';
```

### **Método 3: Via Código (Para novos módulos)**
1. Edite `src/config/navigation.js`
2. Adicione/remova roles no array `roles`
3. Reinicie o servidor

## 🔍 **VERIFICAR PERMISSÕES ATUAIS**

### **No Console do Navegador:**
```javascript
// Abra F12 → Console e digite:
console.log('🔍 Debug Navigation:', {
  profile: window.localStorage.getItem('user'),
  navigationItems: document.querySelectorAll('[data-testid="menu-item"]').length
});
```

### **No Supabase:**
```sql
-- Ver todos os usuários e suas permissões
SELECT 
  p.email,
  p.full_name,
  p.role,
  p.created_at,
  CASE 
    WHEN p.role = 'super_admin' THEN '👑 Super Admin'
    WHEN p.role = 'admin' THEN '🔧 Admin'
    WHEN p.role = 'gerente_patio' THEN '🏗️ Gerente Pátio'
    WHEN p.role = 'almoxarife' THEN '📦 Almoxarife'
    WHEN p.role = 'usuario_padrao' THEN '👤 Usuário Padrão'
    ELSE '❓ Desconhecido'
  END as role_display
FROM profiles p
ORDER BY p.created_at DESC;
```

## ⚠️ **IMPORTANTE**

1. **Sempre teste** as permissões após alterar
2. **Faça backup** antes de alterações em massa
3. **Use roles específicos** para cada função
4. **Monitore logs** para verificar se as permissões estão funcionando

## 🚀 **EXEMPLO PRÁTICO**

Para dar acesso completo a um usuário:
```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'novo.admin@empresa.com';
```

Para restringir acesso a apenas operações básicas:
```sql
UPDATE profiles 
SET role = 'usuario_padrao' 
WHERE email = 'operador@empresa.com';
```

**Agora você tem controle total sobre as permissões dos usuários!** 🎉





















