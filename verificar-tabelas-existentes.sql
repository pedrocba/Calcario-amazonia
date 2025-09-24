-- VERIFICAR TABELAS EXISTENTES NO BANCO
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. Listar todas as tabelas que contêm 'caixa' no nome
SELECT 
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_name ILIKE '%caixa%'
AND table_schema = 'public'
ORDER BY table_name;

-- 2. Listar todas as tabelas que contêm 'sessao' no nome
SELECT 
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_name ILIKE '%sessao%'
OR table_name ILIKE '%session%'
AND table_schema = 'public'
ORDER BY table_name;

-- 3. Listar todas as tabelas do schema public
SELECT 
    table_name
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 4. Verificar se existe a tabela operacoes_caixa
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'operacoes_caixa'
AND table_schema = 'public'
ORDER BY ordinal_position;

