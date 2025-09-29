-- ==============================================
-- CORREÇÃO DOS DADOS EXISTENTES DE EMPRESAS
-- ==============================================
-- Execute este script no Supabase SQL Editor

-- 1. Verificar dados atuais
SELECT 
    'Dados atuais antes da correção:' as info,
    id,
    name,
    code,
    owner_company_id,
    parent_company_id,
    created_at
FROM public.companies
ORDER BY created_at;

-- 2. Atualizar todas as empresas existentes para ter owner_company_id = '68cacb913d169d191be6c90d'
-- (assumindo que todas foram criadas pela CBA)
UPDATE public.companies 
SET 
    owner_company_id = '68cacb913d169d191be6c90d',
    parent_company_id = '68cacb913d169d191be6c90d'
WHERE owner_company_id IS NULL OR owner_company_id = '';

-- 3. Garantir que a empresa CBA existe e tem os IDs corretos
INSERT INTO public.companies (
    id, name, code, full_name, type, active, owner_company_id, parent_company_id
)
SELECT 
    '68cacb913d169d191be6c90d',
    'CBA - Santarém (Matriz)',
    'CBA',
    'Calcário Amazônia Ltda',
    'matriz',
    true,
    '68cacb913d169d191be6c90d',
    '68cacb913d169d191be6c90d'
WHERE NOT EXISTS (
    SELECT 1 FROM public.companies 
    WHERE id = '68cacb913d169d191be6c90d'
);

-- 4. Verificar dados após correção
SELECT 
    'Dados após correção:' as info,
    id,
    name,
    code,
    owner_company_id,
    parent_company_id,
    created_at
FROM public.companies
ORDER BY created_at;

-- 5. Verificar se há empresas órfãs (sem owner_company_id)
SELECT 
    'Empresas órfãs (sem owner_company_id):' as info,
    COUNT(*) as count
FROM public.companies
WHERE owner_company_id IS NULL OR owner_company_id = '';



