-- ==============================================
-- CORREÇÃO SIMPLES DO ISOLAMENTO
-- ==============================================
-- Execute este script no Supabase SQL Editor

-- 1. Desabilitar RLS para evitar problemas
ALTER TABLE public.companies DISABLE ROW LEVEL SECURITY;

-- 2. Limpar dados existentes (CUIDADO: apaga todas as empresas)
DELETE FROM public.companies;

-- 3. Inserir apenas a empresa CBA
INSERT INTO public.companies (
    id, name, code, full_name, type, active, owner_company_id, parent_company_id
) VALUES (
    '68cacb913d169d191be6c90d',
    'CBA - Santarém (Matriz)',
    'CBA',
    'Calcário Amazônia Ltda',
    'matriz',
    true,
    '68cacb913d169d191be6c90d',
    '68cacb913d169d191be6c90d'
);

-- 4. Verificar resultado
SELECT 
    'Empresas após limpeza:' as info,
    id,
    name,
    code,
    owner_company_id,
    parent_company_id
FROM public.companies
ORDER BY created_at;



