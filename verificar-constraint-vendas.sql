-- VERIFICAR CONSTRAINT ATUAL DA TABELA VENDAS
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. Verificar a constraint atual
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.vendas'::regclass 
AND conname LIKE '%status%';

-- 2. Verificar valores atuais de status na tabela
SELECT DISTINCT status, COUNT(*) as quantidade
FROM public.vendas 
GROUP BY status
ORDER BY status;

-- 3. Verificar se a coluna status permite NULL
SELECT 
    column_name, 
    is_nullable, 
    column_default,
    data_type
FROM information_schema.columns 
WHERE table_name = 'vendas' 
AND column_name = 'status';

