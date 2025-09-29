-- ==============================================
-- CORREÇÃO DA GERAÇÃO AUTOMÁTICA DE ID
-- ==============================================
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a coluna id é UUID
ALTER TABLE public.companies 
ALTER COLUMN id SET DATA TYPE UUID USING id::UUID;

-- 2. Adicionar valor padrão para gerar UUID automaticamente
ALTER TABLE public.companies 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 3. Garantir que a coluna não aceita NULL
ALTER TABLE public.companies 
ALTER COLUMN id SET NOT NULL;

-- 4. Adicionar as colunas de isolamento se ainda não existirem
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS owner_company_id UUID;

ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS parent_company_id UUID;

-- 5. Atualizar empresas existentes
UPDATE public.companies 
SET owner_company_id = id, parent_company_id = id
WHERE owner_company_id IS NULL;

-- 6. Verificar resultado
SELECT 
    'Empresas após correção:' as status,
    id,
    name,
    code,
    type,
    owner_company_id,
    parent_company_id
FROM public.companies
ORDER BY created_at;



