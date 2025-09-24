-- CORRIGIR COMPANY_ID SIMPLES
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. Verificar registros existentes
SELECT 
    id,
    type,
    amount,
    description,
    company_id,
    created_at
FROM financial_transactions 
ORDER BY created_at DESC;

-- 2. Atualizar todos os registros para ter company_id
UPDATE financial_transactions 
SET company_id = '68cacb913d169d191be6c90d'
WHERE company_id IS NULL OR company_id = '';

-- 3. Verificar se foi atualizado
SELECT 
    COUNT(*) as total,
    COUNT(company_id) as com_company_id
FROM financial_transactions;

-- 4. Mostrar alguns registros
SELECT 
    id,
    type,
    amount,
    description,
    company_id
FROM financial_transactions 
LIMIT 5;

-- Mensagem
SELECT 'Company_id corrigido!' AS resultado;

