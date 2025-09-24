-- ==============================================
-- POLÍTICAS RLS PARA TABELA PRODUCTS
-- ==============================================
-- Execute este SQL no Supabase SQL Editor para implementar a segurança

-- ==============================================
-- 1. VERIFICAR E CRIAR ESTRUTURA NECESSÁRIA
-- ==============================================

-- Verificar se a tabela products tem a coluna company_id
-- Se não tiver, você precisará adicioná-la primeiro:
-- ALTER TABLE public.products ADD COLUMN company_id UUID REFERENCES public.companies(id);

-- Verificar se a tabela profiles existe
-- Se não existir, criar:
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- 2. HABILITAR ROW LEVEL SECURITY
-- ==============================================

-- Habilitar RLS na tabela products
-- (Se já estiver habilitado, este comando não fará nada de mal)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- 3. CRIAR POLÍTICAS DE SEGURANÇA
-- ==============================================

-- Política para SELECT (visualizar produtos)
-- Esta política permite que um usuário veja um produto se a company_id do produto
-- for a mesma company_id associada ao perfil do usuário.
CREATE POLICY "Users can view products from their own company"
ON public.products FOR SELECT
USING (
  (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()) = company_id
);

-- Política para INSERT (criar produtos)
-- Esta política permite que um usuário crie um produto apenas se o company_id
-- for o mesmo da empresa do usuário.
CREATE POLICY "Users can create products in their own company"
ON public.products FOR INSERT
WITH CHECK (
  (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()) = company_id
);

-- Política para UPDATE (editar produtos)
-- Esta política permite que um usuário edite um produto apenas se o produto
-- pertencer à empresa do usuário.
CREATE POLICY "Users can update products from their own company"
ON public.products FOR UPDATE
USING (
  (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()) = company_id
)
WITH CHECK (
  (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()) = company_id
);

-- Política para DELETE (deletar produtos)
-- Esta política permite que um usuário delete um produto apenas se o produto
-- pertencer à empresa do usuário.
CREATE POLICY "Users can delete products from their own company"
ON public.products FOR DELETE
USING (
  (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()) = company_id
);

-- ==============================================
-- 4. CRIAR POLÍTICAS PARA OUTRAS TABELAS RELACIONADAS
-- ==============================================

-- Habilitar RLS na tabela product_categories
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- Política para product_categories
CREATE POLICY "Users can view categories from their own company"
ON public.product_categories FOR SELECT
USING (
  (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()) = company_id
);

CREATE POLICY "Users can create categories in their own company"
ON public.product_categories FOR INSERT
WITH CHECK (
  (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()) = company_id
);

CREATE POLICY "Users can update categories from their own company"
ON public.product_categories FOR UPDATE
USING (
  (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()) = company_id
)
WITH CHECK (
  (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()) = company_id
);

CREATE POLICY "Users can delete categories from their own company"
ON public.product_categories FOR DELETE
USING (
  (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()) = company_id
);

-- ==============================================
-- 5. CRIAR DADOS DE TESTE (OPCIONAL)
-- ==============================================

-- Inserir empresa de teste se não existir
INSERT INTO public.companies (id, name, code, full_name, type, active) 
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Empresa Teste',
    'TESTE001',
    'Empresa Teste Ltda',
    'matriz',
    true
) ON CONFLICT (id) DO NOTHING;

-- Inserir categorias de teste
INSERT INTO public.product_categories (id, name, description, company_id, active) 
VALUES 
    ('00000000-0000-0000-0000-000000000002', 'Cimento', 'Produtos de cimento', '00000000-0000-0000-0000-000000000001', true),
    ('00000000-0000-0000-0000-000000000003', 'Agregados', 'Areia, brita e argila', '00000000-0000-0000-0000-000000000001', true),
    ('00000000-0000-0000-0000-000000000004', 'Cal', 'Produtos de cal', '00000000-0000-0000-0000-000000000001', true)
ON CONFLICT (id) DO NOTHING;

-- ==============================================
-- 6. VERIFICAR POLÍTICAS CRIADAS
-- ==============================================

-- Verificar se as políticas foram criadas corretamente
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('products', 'product_categories')
ORDER BY tablename, policyname;

-- ==============================================
-- INSTRUÇÕES DE EXECUÇÃO
-- ==============================================
/*
1. Copie todo este SQL
2. Cole no Supabase SQL Editor
3. Execute o script completo
4. Verifique se não há erros
5. Teste a página de produtos

IMPORTANTE: 
- Certifique-se de que a tabela products tem a coluna company_id
- Crie um perfil na tabela profiles associando um usuário a uma empresa
- As políticas RLS garantem que cada usuário só veja produtos de sua empresa
*/











