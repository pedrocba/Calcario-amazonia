-- CORRIGIR STATUS DAS VENDAS PARA PERMITIR FATURAMENTO
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. Verificar status atuais das vendas
SELECT 
    id,
    status,
    created_at,
    updated_at
FROM vendas 
ORDER BY created_at DESC 
LIMIT 10;

-- 2. Verificar quantas vendas têm cada status
SELECT 
    status,
    COUNT(*) as quantidade
FROM vendas 
GROUP BY status
ORDER BY quantidade DESC;

-- 3. Verificar se há vendas com status NULL
SELECT 
    COUNT(*) as vendas_com_status_null
FROM vendas 
WHERE status IS NULL;

-- 4. Corrigir vendas com status NULL para 'pendente'
UPDATE vendas 
SET status = 'pendente'
WHERE status IS NULL;

-- 5. Verificar se há vendas com status em maiúsculo
SELECT 
    id,
    status,
    created_at
FROM vendas 
WHERE status = 'Pendente' OR status = 'Concluida';

-- 6. Corrigir vendas com status em maiúsculo
UPDATE vendas 
SET status = 'pendente'
WHERE status = 'Pendente';

UPDATE vendas 
SET status = 'concluida'
WHERE status = 'Concluida';

-- 7. Verificar constraint da tabela vendas
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.vendas'::regclass 
AND conname LIKE '%status%';

-- 8. Verificar resultado final
SELECT 
    status,
    COUNT(*) as quantidade
FROM vendas 
GROUP BY status
ORDER BY quantidade DESC;

-- 9. Mostrar vendas que podem ser faturadas
SELECT 
    id,
    status,
    final_amount,
    created_at
FROM vendas 
WHERE status IN ('pendente', 'concluida')
ORDER BY created_at DESC;

