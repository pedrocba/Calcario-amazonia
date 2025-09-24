-- Verificar a constraint atual de status
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.vendas'::regclass 
AND conname LIKE '%status%';

-- Remover a constraint existente se necessário
-- ALTER TABLE public.vendas DROP CONSTRAINT IF EXISTS vendas_status_check;

-- Criar uma nova constraint mais permissiva
-- ALTER TABLE public.vendas 
-- ADD CONSTRAINT vendas_status_check 
-- CHECK (status IN ('Pendente', 'Faturada', 'Cancelada', 'Concluida'));

-- Verificar se a coluna status tem valor padrão
-- ALTER TABLE public.vendas 
-- ALTER COLUMN status SET DEFAULT 'Pendente';