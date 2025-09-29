-- 1. Primeiro, vamos verificar a constraint atual
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.vendas'::regclass 
AND conname LIKE '%status%';

-- 2. Remover a constraint existente (se existir)
ALTER TABLE public.vendas DROP CONSTRAINT IF EXISTS vendas_status_check;

-- 3. Adicionar valor padrão para a coluna status
ALTER TABLE public.vendas 
ALTER COLUMN status SET DEFAULT 'Pendente';

-- 4. Criar uma nova constraint mais permissiva
ALTER TABLE public.vendas 
ADD CONSTRAINT vendas_status_check 
CHECK (status IN ('Pendente', 'Faturada', 'Cancelada', 'Concluida', 'Em Andamento'));

-- 5. Verificar se a coluna status permite NULL
ALTER TABLE public.vendas 
ALTER COLUMN status SET NOT NULL;

-- 6. Atualizar registros existentes que possam ter status NULL
UPDATE public.vendas 
SET status = 'Pendente' 
WHERE status IS NULL;












