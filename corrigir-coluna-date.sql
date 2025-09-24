-- CORRIGIR COLUNA DATE NA TABELA financial_transactions
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. Verificar se existe coluna 'date' e se é obrigatória
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'financial_transactions' 
AND column_name = 'date';

-- 2. Se a coluna 'date' existir e for obrigatória, torná-la opcional
ALTER TABLE financial_transactions 
ALTER COLUMN date DROP NOT NULL;

-- 3. Ou adicionar valor padrão para a coluna 'date'
ALTER TABLE financial_transactions 
ALTER COLUMN date SET DEFAULT CURRENT_DATE;

-- 4. Verificar se a coluna 'created_at' existe (que é o que devemos usar)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'financial_transactions' 
AND column_name IN ('date', 'created_at', 'due_date')
ORDER BY column_name;

-- 5. Se não existir coluna 'created_at', adicionar
ALTER TABLE financial_transactions 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 6. Se não existir coluna 'updated_at', adicionar
ALTER TABLE financial_transactions 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 7. Atualizar registros existentes que tenham 'date' NULL
UPDATE financial_transactions 
SET date = created_at::DATE 
WHERE date IS NULL AND created_at IS NOT NULL;

-- 8. Se ainda houver registros com 'date' NULL, usar data atual
UPDATE financial_transactions 
SET date = CURRENT_DATE 
WHERE date IS NULL;

-- Mensagem de sucesso
SELECT 'Coluna date corrigida! Teste o formulário agora.' AS resultado;

