-- VERIFICAR ESTRUTURA DA TABELA financial_transactions
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. Verificar se a tabela existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'financial_transactions'
) AS tabela_existe;

-- 2. Verificar estrutura da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'financial_transactions'
ORDER BY ordinal_position;

-- 3. Verificar se a coluna category existe
SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'financial_transactions' 
    AND column_name = 'category'
) AS coluna_category_existe;

