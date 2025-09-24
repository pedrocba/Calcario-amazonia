-- VERIFICAR ESTRUTURA DA TABELA OPERACOES_CAIXA
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. Verificar estrutura atual da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'operacoes_caixa'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar se a tabela existe
SELECT 
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_name = 'operacoes_caixa'
AND table_schema = 'public';

-- 3. Mostrar dados existentes (se houver)
SELECT * FROM public.operacoes_caixa LIMIT 5;

