-- ==============================================
-- CORREÇÃO SIMPLES DA TABELA COMPANIES
-- ==============================================
-- Execute este script no Supabase SQL Editor

-- 1. Adicionar coluna owner_company_id se não existir
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS owner_company_id UUID;

-- 2. Adicionar coluna parent_company_id se não existir  
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS parent_company_id UUID;

-- 3. Atualizar empresas existentes para ter owner_company_id = id (empresa própria)
UPDATE public.companies 
SET owner_company_id = id, parent_company_id = id
WHERE owner_company_id IS NULL;

-- 4. Verificar se a empresa CBA existe, se não, criar
INSERT INTO public.companies (
    id, name, code, full_name, type, active, owner_company_id, parent_company_id
)
SELECT 
    '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid,
    'CBA - Santarém (Matriz)',
    'CBA',
    'Calcário Amazônia Ltda',
    'matriz',
    true,
    '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid,
    '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid
WHERE NOT EXISTS (
    SELECT 1 FROM public.companies 
    WHERE code = 'CBA' OR name LIKE '%CBA%'
);

-- 5. Verificar resultado
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