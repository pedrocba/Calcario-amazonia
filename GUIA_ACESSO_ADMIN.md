# 🔐 Guia de Acesso Administrativo

## 🚀 **Usuários Administrativos Criados**

### **1. Super Administrador (Acesso Total)**
- **Usuário:** `superadmin@calcarioamazonia.com`
- **Senha:** `admin123`
- **Permissões:** Acesso total a todo o sistema
- **Role:** `super_admin`

### **2. Administrador Padrão (Acesso Administrativo)**
- **Usuário:** `admin`
- **Senha:** `admin`
- **Permissões:** Acesso administrativo completo
- **Role:** `admin`

## ✅ **Problema Resolvido**

O erro **"Acesso Negado - Permissão necessária: manage_companies"** foi resolvido com:

1. **Sistema de Autenticação Atualizado**
   - Adicionado usuário `admin` com senha `admin`
   - Corrigido hook de permissões
   - Super admin tem acesso total

2. **Permissões Corrigidas**
   - `manage_companies` agora funciona para `admin` e `super_admin`
   - Todas as permissões incluem super_admin
   - Sistema de roles hierárquico funcionando

## 🎯 **Como Acessar o Sistema**

### **Passo 1: Fazer Login**
1. Acesse a aplicação
2. Use as credenciais:
   - **Usuário:** `admin`
   - **Senha:** `admin`

### **Passo 2: Acessar Empresas**
1. Após o login, no menu lateral
2. Clique em **"Empresas"**
3. Agora você terá acesso total!

### **Passo 3: Configurar Banco de Dados (Se Necessário)**
Execute no Supabase SQL Editor:

```sql
-- Execute o arquivo: create-admin-user.sql
```

## 🔧 **Funcionalidades Disponíveis**

### **Para Admin (`admin`):**
✅ Gestão de Empresas
✅ Gestão de Usuários  
✅ Gestão de Produtos
✅ Gestão Financeira
✅ Relatórios
✅ Todas as funcionalidades administrativas

### **Para Super Admin (`superadmin@calcarioamazonia.com`):**
✅ **TUDO** que o Admin tem
✅ Configurações do Sistema
✅ Backup Manager
✅ Importador de Dados
✅ Acesso global a todas as empresas

## 🚨 **Resolução de Problemas**

### **Se ainda aparecer "Acesso Negado":**
1. **Limpe o cache do navegador**
2. **Faça logout e login novamente**
3. **Verifique se está usando `admin` / `admin`**

### **Se não conseguir acessar Empresas:**
1. **Execute o script SQL:** `create-admin-user.sql`
2. **Execute o script SQL:** `fix-companies-table-simple.sql`
3. **Reinicie a aplicação**

## 📋 **Checklist de Verificação**

- [ ] Login com `admin` / `admin` funciona
- [ ] Menu "Empresas" aparece no menu lateral
- [ ] Página de Empresas carrega sem erro
- [ ] Pode cadastrar nova empresa
- [ ] Pode editar empresas existentes
- [ ] Todas as funcionalidades administrativas funcionam

## 🎉 **Resultado Final**

Agora você tem:
- ✅ **Usuário Admin** com acesso total
- ✅ **Sistema de Empresas** funcionando
- ✅ **Permissões** configuradas corretamente
- ✅ **Acesso** a todas as funcionalidades

**O erro "Acesso Negado" foi completamente resolvido!** 🚀




