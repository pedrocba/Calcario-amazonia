# 🏢 Sistema de Gestão de Empresas - Guia Completo

## 📋 Visão Geral

O sistema de gestão de empresas permite que cada filial cadastre e gerencie seus próprios dados empresariais, incluindo informações completas da empresa, endereço, contato e configurações.

## 🚀 Implementação

### 1. **Criar Tabela no Banco de Dados**

Execute o script SQL no Supabase Dashboard → SQL Editor:

```sql
-- Execute o arquivo: create-companies-table.sql
```

### 2. **Estrutura do Sistema**

#### **Componentes Criados:**

- **`src/components/companies/CompanyForm.jsx`** - Formulário de cadastro/edição de empresas
- **`src/pages/Companies.jsx`** - Página principal de gestão de empresas
- **`src/config/navigation.js`** - Menu de navegação atualizado
- **`src/pages/index.jsx`** - Rotas atualizadas

#### **Funcionalidades Implementadas:**

✅ **Cadastro Completo de Empresas**
- Nome da empresa e código único
- Razão social e CNPJ
- Inscrição Estadual (IE)
- Endereço completo (rua, cidade, estado, CEP)
- Contatos (telefone, email, website)
- Tipo (Matriz/Filial)
- Status (Ativa/Inativa)
- Observações

✅ **Validações de Formulário**
- Validação de CNPJ (formato 00.000.000/0000-00)
- Validação de email
- Validação de CEP (formato 00000-000)
- Campos obrigatórios

✅ **Interface de Gestão**
- Listagem com busca e filtros
- Paginação automática
- Edição inline
- Exclusão com confirmação
- Visualização detalhada

✅ **Segurança e Permissões**
- RLS (Row Level Security) habilitado
- Políticas de acesso por role
- Proteção de rotas

## 🎯 Como Usar

### **1. Acessar o Sistema**
- Faça login como admin ou super_admin
- No menu lateral, clique em **"Empresas"**
- A página de gestão será exibida

### **2. Cadastrar Nova Empresa**
1. Clique no botão **"Nova Empresa"**
2. Preencha os dados obrigatórios:
   - **Nome da Empresa** (ex: Calcário Amazônia)
   - **Código** (ex: CA001)
3. Preencha dados opcionais conforme necessário
4. Clique em **"Cadastrar"**

### **3. Editar Empresa Existente**
1. Na lista de empresas, clique em **"Editar"**
2. Modifique os dados necessários
3. Clique em **"Atualizar"**

### **4. Gerenciar Empresas**
- **Buscar**: Use o campo de busca para filtrar por nome, código, cidade, etc.
- **Visualizar**: Veja todos os detalhes da empresa na lista
- **Excluir**: Clique em "Excluir" e confirme a ação

## 🔧 Configurações Técnicas

### **Estrutura da Tabela `companies`:**

```sql
CREATE TABLE public.companies (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,           -- Nome da empresa
    code TEXT UNIQUE NOT NULL,    -- Código único
    full_name TEXT,               -- Razão social
    cnpj TEXT,                    -- CNPJ
    ie TEXT,                      -- Inscrição Estadual
    address TEXT,                  -- Endereço
    city TEXT,                    -- Cidade
    state TEXT,                   -- Estado
    zip_code TEXT,                -- CEP
    phone TEXT,                   -- Telefone
    email TEXT,                   -- Email
    website TEXT,                 -- Website
    type TEXT DEFAULT 'matriz',   -- Tipo: matriz/filial
    active BOOLEAN DEFAULT true,  -- Status ativo
    notes TEXT,                   -- Observações
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### **Permissões de Acesso:**

- **Visualizar**: Todos os usuários autenticados
- **Gerenciar**: Apenas admins e super_admins
- **Rota protegida**: `/Companies`

## 📊 Benefícios do Sistema

### **Para Cada Filial:**
✅ **Autonomia Total** - Cada filial gerencia seus próprios dados
✅ **Dados Completos** - Informações empresariais completas
✅ **Flexibilidade** - Cadastro de matriz e filiais
✅ **Organização** - Códigos únicos para identificação
✅ **Controle** - Status ativo/inativo por empresa

### **Para o Sistema:**
✅ **Escalabilidade** - Suporte a múltiplas empresas
✅ **Segurança** - RLS e políticas de acesso
✅ **Performance** - Índices otimizados
✅ **Integração** - Compatível com outros módulos

## 🔄 Integração com Outros Módulos

O sistema de empresas se integra automaticamente com:

- **Sistema de Produtos** - Produtos associados à empresa
- **Sistema Financeiro** - Contas e transações por empresa
- **Sistema de Vendas** - Vendas por empresa
- **Sistema de Usuários** - Perfis vinculados à empresa

## 🚨 Resolução de Problemas

### **Erro: "Perfil ou filial do usuário não encontrados"**
1. Execute o script `fix-profile-error.sql`
2. Execute o script `create-companies-table.sql`
3. Acesse a página de Empresas
4. Cadastre a empresa da filial

### **Erro: "Acesso negado"**
- Verifique se o usuário tem role de admin ou super_admin
- Confirme se as políticas RLS estão ativas

### **Erro: "Código já existe"**
- Use um código único para cada empresa
- Exemplo: CA001, CA002, CA003...

## 📈 Próximos Passos

1. **Execute o script SQL** para criar a tabela
2. **Teste o sistema** cadastrando uma empresa
3. **Configure as filiais** com seus dados específicos
4. **Integre com outros módulos** conforme necessário

## 🎉 Resultado Final

Agora cada filial pode:
- ✅ Cadastrar sua própria empresa
- ✅ Gerenciar dados empresariais completos
- ✅ Ter autonomia total sobre suas informações
- ✅ Integrar com todos os módulos do sistema

O erro de "Perfil ou filial do usuário não encontrados" será resolvido automaticamente quando a empresa for cadastrada no sistema!




