-- TESTAR TABELA financial_transactions
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. Verificar estrutura da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'financial_transactions'
ORDER BY ordinal_position;

-- 2. Contar registros por tipo
SELECT 
    type,
    COUNT(*) as quantidade
FROM financial_transactions 
GROUP BY type;

-- 3. Mostrar alguns registros
SELECT 
    id,
    type,
    amount,
    description,
    company_id,
    created_at
FROM financial_transactions 
ORDER BY created_at DESC
LIMIT 5;

-- 4. Verificar se há registros do tipo 'saida'
SELECT 
    COUNT(*) as total_saidas
FROM financial_transactions 
WHERE type = 'saida';

-- 5. Mostrar registros do tipo 'saida'
SELECT 
    id,
    type,
    amount,
    description,
    company_id,
    status,
    created_at
FROM financial_transactions 
WHERE type = 'saida'
ORDER BY created_at DESC;

