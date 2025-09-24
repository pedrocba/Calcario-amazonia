-- CORRIGIR CONSTRAINT DE STATUS DA TABELA VENDAS
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- Remover a constraint atual
ALTER TABLE vendas DROP CONSTRAINT IF EXISTS vendas_status_check;

-- Criar nova constraint que permite mais valores
ALTER TABLE vendas ADD CONSTRAINT vendas_status_check 
CHECK (status IN ('pendente', 'cancelada', 'faturada', 'concluida', 'pago'));

-- Verificar se funcionou
SELECT 'Constraint de status corrigida com sucesso!' as status;




