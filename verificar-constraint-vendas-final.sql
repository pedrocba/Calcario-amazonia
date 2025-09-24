-- VERIFICAR E CORRIGIR CONSTRAINT DA TABELA VENDAS
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. Verificar a constraint atual
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.vendas'::regclass 
AND conname LIKE '%status%';

-- 2. Verificar valores atuais de status na tabela
SELECT DISTINCT status, COUNT(*) as quantidade
FROM public.vendas 
GROUP BY status
ORDER BY status;

-- 3. Remover a constraint existente
ALTER TABLE public.vendas DROP CONSTRAINT IF EXISTS vendas_status_check;

-- 4. Atualizar valores problemáticos para 'pendente'
UPDATE public.vendas 
SET status = 'pendente' 
WHERE status IS NULL 
OR status NOT IN ('pendente', 'cancelada', 'faturada', 'concluida', 'pago');

-- 5. Adicionar valor padrão
ALTER TABLE public.vendas 
ALTER COLUMN status SET DEFAULT 'pendente';

-- 6. Garantir que não aceita NULL
ALTER TABLE public.vendas 
ALTER COLUMN status SET NOT NULL;

-- 7. Criar nova constraint
ALTER TABLE public.vendas 
ADD CONSTRAINT vendas_status_check 
CHECK (status IN ('pendente', 'cancelada', 'faturada', 'concluida', 'pago'));

-- 8. Verificar se funcionou
SELECT 'Constraint de status corrigida com sucesso!' as status;

-- 9. Verificar valores finais
SELECT DISTINCT status, COUNT(*) as quantidade
FROM public.vendas 
GROUP BY status
ORDER BY status;

