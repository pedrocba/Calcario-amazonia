-- ==============================================
-- CORREÇÃO SIMPLES DE TIPOS DE DADOS
-- ==============================================
-- Execute este script no Supabase SQL Editor

-- 1. Manter companies.id como TEXT (mais compatível)
ALTER TABLE public.companies 
ALTER COLUMN id SET DATA TYPE TEXT;

-- 2. Adicionar valor padrão para gerar IDs automaticamente
ALTER TABLE public.companies 
ALTER COLUMN id SET DEFAULT 'comp_' || substr(gen_random_uuid()::text, 1, 8);

-- 3. Garantir que a coluna não aceita NULL
ALTER TABLE public.companies 
ALTER COLUMN id SET NOT NULL;

-- 4. Adicionar as colunas de isolamento como TEXT
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS owner_company_id TEXT;

ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS parent_company_id TEXT;

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



