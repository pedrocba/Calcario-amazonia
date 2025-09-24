-- ADICIONAR COLUNAS FALTANTES - VERSÃO SIMPLES
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- Adicionar todas as colunas que estão faltando
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS due_date DATE;
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS payment_date DATE;
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS valor_pago DECIMAL(15,2) DEFAULT 0;
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'outros';
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS recurring_cost_id UUID;
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS contact_id UUID;
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Verificar se foram adicionadas
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'financial_transactions' 
ORDER BY ordinal_position;

-- Mensagem de sucesso
SELECT 'Todas as colunas adicionadas! Teste o formulário agora.' AS resultado;

