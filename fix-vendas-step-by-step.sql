-- PASSO 1: Verificar valores atuais de status
SELECT DISTINCT status, COUNT(*) as quantidade
FROM public.vendas 
GROUP BY status
ORDER BY status;

-- PASSO 2: Ver a constraint atual
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.vendas'::regclass 
AND conname LIKE '%status%';

-- PASSO 3: Remover a constraint existente
ALTER TABLE public.vendas DROP CONSTRAINT IF EXISTS vendas_status_check;

-- PASSO 4: Atualizar valores problemáticos para 'Pendente'
UPDATE public.vendas 
SET status = 'Pendente' 
WHERE status IS NULL 
OR status NOT IN ('Pendente', 'Faturada', 'Cancelada', 'Concluida', 'Em Andamento');

-- PASSO 5: Verificar se ainda há valores problemáticos
SELECT DISTINCT status, COUNT(*) as quantidade
FROM public.vendas 
GROUP BY status
ORDER BY status;

-- PASSO 6: Adicionar valor padrão
ALTER TABLE public.vendas 
ALTER COLUMN status SET DEFAULT 'Pendente';

-- PASSO 7: Criar nova constraint
ALTER TABLE public.vendas 
ADD CONSTRAINT vendas_status_check 
CHECK (status IN ('Pendente', 'Faturada', 'Cancelada', 'Concluida', 'Em Andamento'));

-- PASSO 8: Garantir que não aceita NULL
ALTER TABLE public.vendas 
ALTER COLUMN status SET NOT NULL;





