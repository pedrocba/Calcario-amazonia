-- CORRIGIR TODAS AS COLUNAS DA TABELA financial_transactions
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. Adicionar coluna category
ALTER TABLE financial_transactions 
ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'outros';

-- 2. Adicionar coluna contact_id
ALTER TABLE financial_transactions 
ADD COLUMN IF NOT EXISTS contact_id UUID;

-- 3. Adicionar coluna metadata
ALTER TABLE financial_transactions 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- 4. Adicionar coluna created_by
ALTER TABLE financial_transactions 
ADD COLUMN IF NOT EXISTS created_by UUID;

-- 5. Adicionar coluna is_recurring
ALTER TABLE financial_transactions 
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;

-- 6. Adicionar coluna recurring_cost_id
ALTER TABLE financial_transactions 
ADD COLUMN IF NOT EXISTS recurring_cost_id UUID;

-- 7. Atualizar registros existentes
UPDATE financial_transactions 
SET category = 'outros' 
WHERE category IS NULL;

UPDATE financial_transactions 
SET metadata = '{}' 
WHERE metadata IS NULL;

-- 8. Verificar todas as colunas
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'financial_transactions'
ORDER BY ordinal_position;

-- 9. Mensagem de sucesso
SELECT 'Todas as colunas adicionadas com sucesso! Teste o formulário agora.' AS resultado;

