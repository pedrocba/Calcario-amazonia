-- ADICIONAR COLUNA CATEGORY - VERSÃO SIMPLES
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- Adicionar coluna category
ALTER TABLE financial_transactions 
ADD COLUMN category VARCHAR(50) DEFAULT 'outros';

-- Verificar se foi adicionada
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'financial_transactions' 
AND column_name = 'category';

-- Mensagem de sucesso
SELECT 'Coluna category adicionada! Teste o formulário agora.' AS resultado;

