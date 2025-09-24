-- CORREÇÃO URGENTE - CONSTRAINT DE STATUS DA TABELA VENDAS
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. Primeiro, vamos verificar a constraint atual
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.vendas'::regclass 
AND conname LIKE '%status%';

-- 2. Remover a constraint existente
ALTER TABLE public.vendas DROP CONSTRAINT IF EXISTS vendas_status_check;

-- 3. Atualizar registros existentes para usar valores válidos
UPDATE public.vendas 
SET status = 'pendente' 
WHERE status IS NULL 
OR status NOT IN ('pendente', 'cancelada', 'faturada', 'concluida', 'pago');

-- 4. Adicionar valor padrão para a coluna status
ALTER TABLE public.vendas 
ALTER COLUMN status SET DEFAULT 'pendente';

-- 5. Garantir que não aceita NULL
ALTER TABLE public.vendas 
ALTER COLUMN status SET NOT NULL;

-- 6. Criar nova constraint que permite todos os valores necessários
ALTER TABLE public.vendas 
ADD CONSTRAINT vendas_status_check 
CHECK (status IN ('pendente', 'cancelada', 'faturada', 'concluida', 'pago'));

-- 7. Verificar se funcionou
SELECT 'Constraint de status corrigida com sucesso!' as status;

-- 8. Verificar valores atuais
SELECT DISTINCT status, COUNT(*) as quantidade
FROM public.vendas 
GROUP BY status
ORDER BY status;

