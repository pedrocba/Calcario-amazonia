-- VERIFICAR COMPANY_ID NAS TRANSAÇÕES FINANCEIRAS
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
ORDER BY created_at DESC
LIMIT 10;

-- 2. Verificar se company_id está NULL
SELECT 
    COUNT(*) as total_registros,
    COUNT(company_id) as com_company_id,
    COUNT(*) - COUNT(company_id) as sem_company_id
FROM financial_transactions;

-- 3. Atualizar registros sem company_id
UPDATE financial_transactions 
SET company_id = '68cacb913d169d191be6c90d'
WHERE company_id IS NULL;

-- 4. Verificar novamente
SELECT 
    COUNT(*) as total_registros,
    COUNT(company_id) as com_company_id,
    COUNT(*) - COUNT(company_id) as sem_company_id
FROM financial_transactions;

-- 5. Mostrar registros atualizados
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

-- Mensagem de conclusão
SELECT 'Company_id verificado e atualizado!' AS resultado;

