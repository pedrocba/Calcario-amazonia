-- ==============================================
-- VERIFICAR CAMPOS REAIS DA TABELA COMPANIES
-- ==============================================
-- Execute este script no Supabase SQL Editor

-- 1. Verificar estrutura da tabela companies
SELECT 
    'Estrutura da tabela companies:' as info,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'companies' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar dados existentes na tabela companies
SELECT 
    'Dados atuais na tabela companies:' as info,
    *
FROM companies
LIMIT 3;

-- 3. Verificar se existem constraints ou índices
SELECT 
    'Constraints da tabela companies:' as info,
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'companies'::regclass;



