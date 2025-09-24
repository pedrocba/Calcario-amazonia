-- ADICIONAR COLUNA CATEGORY NA TABELA financial_transactions
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. Verificar se a coluna category existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'financial_transactions' 
        AND column_name = 'category'
    ) THEN
        -- Adicionar coluna category
        ALTER TABLE financial_transactions 
        ADD COLUMN category VARCHAR(50) DEFAULT 'outros';
        
        -- Atualizar registros existentes para ter um valor padrão
        UPDATE financial_transactions 
        SET category = 'outros' 
        WHERE category IS NULL;
        
        RAISE NOTICE 'Coluna category adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna category já existe!';
    END IF;
END
$$;

-- 2. Verificar se a coluna metadata existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'financial_transactions' 
        AND column_name = 'metadata'
    ) THEN
        -- Adicionar coluna metadata
        ALTER TABLE financial_transactions 
        ADD COLUMN metadata JSONB DEFAULT '{}';
        
        RAISE NOTICE 'Coluna metadata adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna metadata já existe!';
    END IF;
END
$$;

-- 3. Verificar se a coluna contact_id existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'financial_transactions' 
        AND column_name = 'contact_id'
    ) THEN
        -- Adicionar coluna contact_id
        ALTER TABLE financial_transactions 
        ADD COLUMN contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL;
        
        RAISE NOTICE 'Coluna contact_id adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna contact_id já existe!';
    END IF;
END
$$;

-- 4. Verificar se a coluna created_by existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'financial_transactions' 
        AND column_name = 'created_by'
    ) THEN
        -- Adicionar coluna created_by
        ALTER TABLE financial_transactions 
        ADD COLUMN created_by UUID;
        
        RAISE NOTICE 'Coluna created_by adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna created_by já existe!';
    END IF;
END
$$;

-- 5. Verificar estrutura final
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'financial_transactions'
ORDER BY ordinal_position;

-- Mensagem de conclusão
SELECT 'Colunas adicionadas com sucesso!' AS status;

