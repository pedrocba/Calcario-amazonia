-- ==============================================
-- CORREÇÃO PARA SISTEMA COM AUTENTICAÇÃO MOCK
-- ==============================================
-- Execute este script no Supabase SQL Editor

-- 1. Remover todas as políticas RLS existentes
DROP POLICY IF EXISTS "Authenticated users can view companies" ON public.companies;
DROP POLICY IF EXISTS "Admins can manage companies" ON public.companies;
DROP POLICY IF EXISTS "Users can view their company's companies" ON public.companies;
DROP POLICY IF EXISTS "Users can manage their company's companies" ON public.companies;
DROP POLICY IF EXISTS "Users can insert their company's companies" ON public.companies;
DROP POLICY IF EXISTS "Users can update their company's companies" ON public.companies;
DROP POLICY IF EXISTS "Users can delete their company's companies" ON public.companies;

-- 2. Desabilitar RLS temporariamente para permitir operações
ALTER TABLE public.companies DISABLE ROW LEVEL SECURITY;

-- 3. Limpar dados existentes (CUIDADO: isso apaga todas as empresas)
-- DELETE FROM public.companies;

-- 4. Garantir que a empresa CBA existe com dados corretos
INSERT INTO public.companies (
    id, name, code, full_name, type, active, owner_company_id, parent_company_id
)
VALUES (
    '68cacb913d169d191be6c90d',
    'CBA - Santarém (Matriz)',
    'CBA',
    'Calcário Amazônia Ltda',
    'matriz',
    true,
    '68cacb913d169d191be6c90d',
    '68cacb913d169d191be6c90d'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    code = EXCLUDED.code,
    full_name = EXCLUDED.full_name,
    type = EXCLUDED.type,
    active = EXCLUDED.active,
    owner_company_id = EXCLUDED.owner_company_id,
    parent_company_id = EXCLUDED.parent_company_id;

-- 5. Atualizar todas as empresas existentes para pertencer à CBA
UPDATE public.companies 
SET 
    owner_company_id = '68cacb913d169d191be6c90d',
    parent_company_id = '68cacb913d169d191be6c90d'
WHERE id != '68cacb913d169d191be6c90d';

-- 6. Verificar resultado
SELECT 
    'Empresas após correção:' as info,
    id,
    name,
    code,
    owner_company_id,
    parent_company_id,
    created_at
FROM public.companies
ORDER BY created_at;



