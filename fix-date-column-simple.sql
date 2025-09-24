-- CORRIGIR COLUNA DATE - VERSÃO SIMPLES
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. Tornar coluna 'date' opcional
ALTER TABLE financial_transactions 
ALTER COLUMN date DROP NOT NULL;

-- 2. Adicionar valor padrão para coluna 'date'
ALTER TABLE financial_transactions 
ALTER COLUMN date SET DEFAULT CURRENT_DATE;

-- 3. Atualizar registros existentes com 'date' NULL
UPDATE financial_transactions 
SET date = CURRENT_DATE 
WHERE date IS NULL;

-- 4. Verificar se foi corrigida
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'financial_transactions' 
AND column_name = 'date';

-- Mensagem de sucesso
SELECT 'Coluna date corrigida! Teste o formulário agora.' AS resultado;

