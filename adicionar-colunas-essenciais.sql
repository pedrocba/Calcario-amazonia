-- ADICIONAR COLUNAS ESSENCIAIS - VERSÃO SIMPLES
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- Adicionar colunas uma por uma
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'outros';
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS contact_id UUID;
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS created_by UUID;

-- Verificar se foram adicionadas
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'financial_transactions' 
AND column_name IN ('category', 'contact_id', 'metadata', 'created_by')
ORDER BY column_name;

-- Mensagem de sucesso
SELECT 'Colunas essenciais adicionadas! Teste o formulário agora.' AS resultado;

