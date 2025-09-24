-- CORREÇÃO URGENTE: ADICIONAR COLUNA CATEGORY
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. Adicionar coluna category se não existir
ALTER TABLE financial_transactions 
ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'outros';

-- 2. Adicionar coluna metadata se não existir
ALTER TABLE financial_transactions 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- 3. Adicionar coluna contact_id se não existir
ALTER TABLE financial_transactions 
ADD COLUMN IF NOT EXISTS contact_id UUID;

-- 4. Adicionar coluna created_by se não existir
ALTER TABLE financial_transactions 
ADD COLUMN IF NOT EXISTS created_by UUID;

-- 5. Atualizar registros existentes para ter valor padrão
UPDATE financial_transactions 
SET category = 'outros' 
WHERE category IS NULL;

-- 6. Verificar se as colunas foram adicionadas
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'financial_transactions'
AND column_name IN ('category', 'metadata', 'contact_id', 'created_by')
ORDER BY column_name;

-- Mensagem de sucesso
SELECT 'Colunas adicionadas com sucesso! Teste novamente o formulário.' AS status;

