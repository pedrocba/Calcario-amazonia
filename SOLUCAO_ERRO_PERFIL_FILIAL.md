# 🔧 SOLUÇÃO RÁPIDA - Erro "Perfil ou filial do usuário não encontrados"

## ❌ **PROBLEMA IDENTIFICADO**

O erro **"Erro ao gerar novo código de produto: Perfil ou filial do usuário não encontrados"** ocorre porque:

1. **Tabela `profiles` não existe** ou não é acessível
2. **Usuário não tem perfil** na tabela `profiles`
3. **Perfil não tem `company_id`** válido
4. **Empresa não existe** na tabela `companies`

## ✅ **SOLUÇÃO RÁPIDA**

### **Opção 1: Script Automático (Recomendado)**

Execute o script de correção automática:

```bash
node fix-profile-error.js
```

### **Opção 2: Correção Manual no Supabase**

#### **1. Criar tabela companies (se não existir)**
```sql
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  full_name TEXT,
  type TEXT DEFAULT 'matriz',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **2. Criar tabela profiles (se não existir)**
```sql
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **3. Criar empresa padrão**
```sql
INSERT INTO public.companies (id, name, code, full_name, type, active) 
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Empresa Padrão',
  'DEFAULT001',
  'Empresa Padrão Ltda',
  'matriz',
  true
) ON CONFLICT (id) DO NOTHING;
```

#### **4. Criar perfil para o usuário**
```sql
-- Substitua 'SEU_USER_ID' pelo ID real do usuário
INSERT INTO public.profiles (user_id, company_id, full_name, email, role)
VALUES (
  'SEU_USER_ID',
  '00000000-0000-0000-0000-000000000001',
  'Nome do Usuário',
  'email@exemplo.com',
  'admin'
) ON CONFLICT (user_id) DO UPDATE SET
  company_id = EXCLUDED.company_id,
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  role = EXCLUDED.role;
```

## 🔍 **COMO IDENTIFICAR O PROBLEMA**

Execute o script de diagnóstico:

```bash
node diagnose-profile-error.js
```

Este script irá:
- ✅ Verificar se o usuário está autenticado
- ✅ Verificar se as tabelas existem
- ✅ Verificar se o perfil existe
- ✅ Verificar se a empresa existe
- ✅ Testar a geração de código

## 🎯 **RESULTADO ESPERADO**

Após executar a correção:

✅ **Tabelas criadas/verificadas**  
✅ **Empresa padrão configurada**  
✅ **Perfil do usuário criado**  
✅ **Geração de código funcionando**  
✅ **Erro resolvido**  

## 🚀 **PRÓXIMOS PASSOS**

1. **Execute o script de correção**
2. **Teste criar um produto** na aplicação
3. **Verifique se o erro desapareceu**

## 📋 **CHECKLIST DE VERIFICAÇÃO**

- [ ] **Usuário está autenticado**
- [ ] **Tabela `companies` existe**
- [ ] **Tabela `profiles` existe**
- [ ] **Empresa padrão criada**
- [ ] **Perfil do usuário criado**
- [ ] **Teste de geração de código funcionando**

---

## 🆘 **SE O PROBLEMA PERSISTIR**

1. **Verifique o console do navegador** para erros adicionais
2. **Execute o script de diagnóstico** para identificar o problema específico
3. **Verifique se as permissões RLS** estão configuradas corretamente
4. **Teste com um usuário diferente** para isolar o problema






