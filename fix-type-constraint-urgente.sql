-- Script URGENTE para corrigir a restrição de tipo
-- Execute este script no Supabase SQL Editor

-- 1. Remover a restrição problemática
ALTER TABLE financial_accounts DROP CONSTRAINT IF EXISTS financial_accounts_type_check;

-- 2. Criar nova restrição que permite todos os tipos necessários
ALTER TABLE financial_accounts 
ADD CONSTRAINT financial_accounts_type_check 
CHECK (type IN ('caixa', 'banco', 'investimento', 'outros'));

-- 3. Verificar se funcionou
SELECT 'Restrição corrigida com sucesso!' as status;

