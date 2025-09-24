-- VERIFICAR TABELAS NECESSÁRIAS PARA FATURAMENTO
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. Verificar se a tabela itens_venda existe
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'itens_venda'
ORDER BY ordinal_position;

-- 2. Verificar se a tabela faturas existe
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'faturas'
ORDER BY ordinal_position;

-- 3. Verificar se a tabela parcelas existe
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'parcelas'
ORDER BY ordinal_position;

-- 4. Verificar se a tabela saldo_produtos existe
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'saldo_produtos'
ORDER BY ordinal_position;

-- 5. Verificar se a tabela retiradas existe
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'retiradas'
ORDER BY ordinal_position;

-- 6. Verificar se a tabela pagamentos_parciais existe
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'pagamentos_parciais'
ORDER BY ordinal_position;

-- 7. Listar todas as tabelas do schema public
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

