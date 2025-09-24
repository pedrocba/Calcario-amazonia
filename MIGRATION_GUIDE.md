# Guia de Migração: Base44 → Supabase

Este guia detalha o processo de migração do sistema CBA Mineração do Base44 para Supabase.

## 📋 Pré-requisitos

1. **Conta no Supabase**: Crie uma conta em [supabase.com](https://supabase.com)
2. **Projeto Supabase**: Crie um novo projeto no Supabase
3. **Variáveis de ambiente**: Configure as variáveis necessárias

## 🔧 Configuração Inicial

### 1. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Base44 Configuration (for migration)
BASE44_APP_ID=68954c8b2b3cb8a6182efcdb
BASE44_API_KEY=your_base44_api_key
```

**Como obter as chaves do Supabase:**
1. Acesse seu projeto no Supabase Dashboard
2. Vá em Settings → API
3. Copie a URL do projeto e as chaves anon e service_role

### 2. Executar Schema SQL

1. Acesse o SQL Editor no Supabase Dashboard
2. Execute o conteúdo do arquivo `supabase-schema.sql`
3. Isso criará todas as tabelas necessárias

## 🚀 Processo de Migração

### Passo 1: Executar Script de Migração

```bash
# Testar conexão com Base44
node test-base44-api.js

# Testar migração com entidades limitadas
node test-migration-small.js

# Executar migração completa
node src/scripts/migrate-to-supabase.js
```

### Passo 2: Verificar Migração

Após a migração, verifique no Supabase Dashboard:
- Todas as tabelas foram criadas
- Os dados foram migrados corretamente
- Os usuários foram criados no sistema de auth

## 🔐 Configuração de Autenticação

### 1. Configurar Row Level Security (RLS)

Execute os seguintes comandos SQL no Supabase:

```sql
-- Ativar RLS em todas as tabelas
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
-- ... (repetir para todas as tabelas)

-- Políticas para tabela profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Políticas para tabela companies
CREATE POLICY "Users can view companies" ON companies
  FOR SELECT USING (true);

-- Políticas para tabela products
CREATE POLICY "Users can view products from their company" ON products
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all products" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### 2. Configurar Políticas de Segurança

Crie políticas específicas para cada tabela baseadas nos papéis dos usuários:

- **admin**: Acesso total a todos os dados
- **usuario_padrao**: Acesso apenas aos dados da sua empresa
- **operador_balanca**: Acesso limitado a operações de pesagem
- **gerente_estoque**: Acesso a gestão de estoque
- **financeiro**: Acesso a dados financeiros

## 🔄 Atualização do Frontend

### 1. Substituir Base44 por Supabase

Substitua as importações do Base44 por Supabase:

```javascript
// Antes (Base44)
import { Product } from '@/api/entities';

// Depois (Supabase)
import { supabase } from '@/lib/supabase';
```

### 2. Atualizar Componentes de Autenticação

Os componentes de login precisarão ser atualizados para usar Supabase Auth:

```javascript
// Exemplo de login com Supabase
const { data, error } = await supabase.auth.signInWithPassword({
  email: email,
  password: password
});
```

### 3. Implementar Context de Autenticação

Crie um contexto para gerenciar o estado de autenticação:

```javascript
// src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
```

## 📊 Estrutura de Dados Migrada

### Tabelas Principais

- **companies**: Empresas/filiais
- **profiles**: Perfis de usuário (relacionado com auth.users)
- **products**: Produtos
- **vehicles**: Veículos
- **financial_accounts**: Contas financeiras
- **financial_transactions**: Transações financeiras
- **contacts**: Contatos/clientes
- **stock_entries**: Entradas de estoque
- **transfers**: Transferências
- **weighing_trips**: Viagens de pesagem
- **access_logs**: Logs de acesso
- **activity_logs**: Logs de atividade

### Relacionamentos

- `profiles` → `auth.users` (1:1)
- `profiles` → `companies` (N:1)
- `products` → `companies` (N:1)
- `vehicles` → `companies` (N:1)
- `financial_transactions` → `financial_accounts` (N:1)
- `financial_transactions` → `profiles` (N:1)

## 🔍 Verificação Pós-Migração

### 1. Testes de Autenticação

- [ ] Login com usuários migrados
- [ ] Logout funcionando
- [ ] Sessão persistindo
- [ ] Redirecionamento após login

### 2. Testes de Dados

- [ ] Produtos carregando corretamente
- [ ] Veículos exibindo dados
- [ ] Transações financeiras funcionando
- [ ] Relatórios gerando dados corretos

### 3. Testes de Permissões

- [ ] Usuários vendo apenas dados da sua empresa
- [ ] Admins com acesso total
- [ ] Operadores com acesso limitado
- [ ] RLS funcionando corretamente

## 🚨 Troubleshooting

### Problemas Comuns

1. **Erro de autenticação**: Verifique as chaves do Supabase
2. **Dados não aparecem**: Verifique as políticas RLS
3. **Erro de migração**: Verifique as chaves do Base44
4. **Performance lenta**: Verifique os índices criados

### Logs Úteis

- Console do navegador para erros de frontend
- Logs do Supabase Dashboard
- Logs do script de migração

## 📞 Suporte

Se encontrar problemas durante a migração:

1. Verifique os logs de erro
2. Consulte a documentação do Supabase
3. Verifique se todas as variáveis de ambiente estão corretas
4. Execute os testes de verificação

## 🎯 Próximos Passos

Após a migração bem-sucedida:

1. **Testes extensivos**: Teste todas as funcionalidades
2. **Backup**: Faça backup dos dados migrados
3. **Monitoramento**: Configure alertas no Supabase
4. **Documentação**: Atualize a documentação do sistema
5. **Treinamento**: Treine a equipe nas novas funcionalidades

---

**Importante**: Esta migração é um processo crítico. Recomendamos fazer backup completo dos dados antes de iniciar e testar em ambiente de desenvolvimento primeiro.
