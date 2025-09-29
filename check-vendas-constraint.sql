-- Verificar a constraint de status da tabela vendas
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.vendas'::regclass 
AND conname LIKE '%status%';

-- Verificar os valores permitidos na constraint
SELECT 
    conname,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'public.vendas'::regclass 
AND contype = 'c';












