-- 1. Primeiro, vamos ver os valores atuais de status na tabela vendas
SELECT DISTINCT status, COUNT(*) as quantidade
FROM public.vendas 
GROUP BY status
ORDER BY status;

-- 2. Ver a constraint atual
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.vendas'::regclass 
AND conname LIKE '%status%';

-- 3. Ver registros que podem estar causando problema
SELECT id, status, created_at
FROM public.vendas 
WHERE status IS NULL 
OR status NOT IN ('Pendente', 'Faturada', 'Cancelada', 'Concluida', 'Em Andamento')
LIMIT 10;





