# 🔧 Solução para Erro de Foreign Key Constraint

## ❌ **PROBLEMA IDENTIFICADO**

O erro "violates foreign key constraint" ocorre porque o `company_id` não está sendo enviado corretamente ao tentar salvar um novo produto.

## ✅ **SOLUÇÃO IMPLEMENTADA**

Modifiquei a função `handleSubmit` no arquivo `src/pages/Products.jsx` para:

### **1. Buscar company_id diretamente da tabela profiles**
```javascript
// Buscar o company_id do usuário logado diretamente da tabela profiles
const { data: { user }, error: authError } = await supabase.auth.getUser();

const { data: profileData, error: profileError } = await supabase
  .from('profiles')
  .select('company_id')
  .eq('user_id', user.id)
  .single();

const company_id = profileData.company_id;
```

### **2. Usar company_id obtido do perfil**
```javascript
const productToSave = {
  ...productData,
  company_id: company_id, // Usar o company_id obtido do perfil
  active: true,
  condition: productData.condition || 'novo'
};
```

### **3. Tratamento de erros robusto**
- ✅ Verifica se o usuário está autenticado
- ✅ Verifica se o perfil existe na tabela `profiles`
- ✅ Exibe mensagens de erro claras
- ✅ Logs detalhados para debug

---

## 🧪 **COMO TESTAR A SOLUÇÃO**

### **1. Execute o script de teste**
```javascript
// No console do navegador, execute:
// Cole o conteúdo do arquivo test-product-submit.js
```

### **2. Verifique se a tabela profiles existe**
```sql
-- No Supabase SQL Editor:
SELECT * FROM public.profiles LIMIT 5;
```

### **3. Confirme se o usuário tem perfil**
```sql
-- Substitua 'SEU_USER_ID' pelo ID real do usuário
SELECT * FROM public.profiles WHERE user_id = 'SEU_USER_ID';
```

---

## 🔍 **POSSÍVEIS PROBLEMAS E SOLUÇÕES**

### **Problema 1: "Usuário não autenticado"**
**Solução:**
- Faça login novamente na aplicação
- Verifique se a sessão não expirou

### **Problema 2: "Perfil do usuário não encontrado"**
**Solução:**
```sql
-- Criar perfil para o usuário
INSERT INTO public.profiles (id, company_id, full_name, email, role)
VALUES (
    'SEU_USER_ID_AQUI',
    '00000000-0000-0000-0000-000000000001',
    'Nome do Usuário',
    'email@exemplo.com',
    'admin'
);
```

### **Problema 3: "Tabela profiles não existe"**
**Solução:**
```sql
-- Criar tabela profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Problema 4: "Company não existe"**
**Solução:**
```sql
-- Criar empresa de teste
INSERT INTO public.companies (id, name, code, full_name, type, active) 
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Empresa Teste',
    'TESTE001',
    'Empresa Teste Ltda',
    'matriz',
    true
) ON CONFLICT (id) DO NOTHING;
```

---

## 📋 **CHECKLIST DE VERIFICAÇÃO**

- [ ] **Tabela `profiles` existe**
- [ ] **Tabela `companies` existe**
- [ ] **Usuário tem perfil na tabela `profiles`**
- [ ] **Perfil está associado a uma empresa válida**
- [ ] **Empresa existe na tabela `companies`**
- [ ] **Usuário está autenticado**
- [ ] **Função `handleSubmit` foi atualizada**

---

## 🎯 **RESULTADO ESPERADO**

Após implementar a solução:

✅ **Produtos são criados com sucesso**  
✅ **company_id é obtido automaticamente do perfil**  
✅ **Não há mais erros de foreign key constraint**  
✅ **Função é autossuficiente** (não depende do contexto)  
✅ **Tratamento de erros robusto**  

---

## 🚀 **PRÓXIMOS PASSOS**

1. **Execute o script de teste** para verificar se tudo está funcionando
2. **Teste criar um produto** na interface
3. **Verifique se não há mais erros** de foreign key
4. **Confirme que o produto aparece** na lista

**A função `handleSubmit` agora é totalmente autossuficiente e não depende mais do contexto `currentCompany`!** 🎉


















