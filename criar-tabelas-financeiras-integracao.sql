-- CRIAR TABELAS FINANCEIRAS PARA INTEGRAÇÃO COM VENDAS
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. Verificar se a tabela financial_transactions existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'financial_transactions') THEN
        -- Criar tabela financial_transactions se não existir
        CREATE TABLE financial_transactions (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            account_id UUID REFERENCES financial_accounts(id) ON DELETE SET NULL,
            type VARCHAR(20) NOT NULL CHECK (type IN ('entrada', 'saida')),
            amount DECIMAL(10,2) NOT NULL,
            description TEXT NOT NULL,
            reference VARCHAR(255),
            due_date DATE,
            status VARCHAR(20) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'parcial', 'cancelado')),
            payment_date DATE,
            valor_pago DECIMAL(10,2) DEFAULT 0,
            category VARCHAR(50) DEFAULT 'outros',
            notes TEXT,
            metadata JSONB DEFAULT '{}',
            is_recurring BOOLEAN DEFAULT FALSE,
            recurring_cost_id UUID,
            contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
            company_id UUID NOT NULL,
            created_by UUID,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Criar índices
        CREATE INDEX idx_financial_transactions_company_id ON financial_transactions(company_id);
        CREATE INDEX idx_financial_transactions_type ON financial_transactions(type);
        CREATE INDEX idx_financial_transactions_status ON financial_transactions(status);
        CREATE INDEX idx_financial_transactions_due_date ON financial_transactions(due_date);
        CREATE INDEX idx_financial_transactions_reference ON financial_transactions(reference);
        CREATE INDEX idx_financial_transactions_metadata ON financial_transactions USING GIN(metadata);
        
        RAISE NOTICE 'Tabela financial_transactions criada com sucesso!';
    ELSE
        RAISE NOTICE 'Tabela financial_transactions já existe.';
    END IF;
END $$;

-- 2. Verificar se a tabela financial_accounts existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'financial_accounts') THEN
        -- Criar tabela financial_accounts se não existir
        CREATE TABLE financial_accounts (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            type VARCHAR(20) NOT NULL CHECK (type IN ('receita', 'despesa', 'caixa', 'banco')),
            balance DECIMAL(10,2) DEFAULT 0,
            active BOOLEAN DEFAULT TRUE,
            company_id UUID NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Criar índices
        CREATE INDEX idx_financial_accounts_company_id ON financial_accounts(company_id);
        CREATE INDEX idx_financial_accounts_type ON financial_accounts(type);
        CREATE INDEX idx_financial_accounts_active ON financial_accounts(active);
        
        RAISE NOTICE 'Tabela financial_accounts criada com sucesso!';
    ELSE
        RAISE NOTICE 'Tabela financial_accounts já existe.';
    END IF;
END $$;

-- 3. Criar conta de receitas padrão se não existir
INSERT INTO financial_accounts (name, type, company_id, active)
SELECT 
    'Receitas de Vendas',
    'receita',
    c.id,
    TRUE
FROM companies c
WHERE NOT EXISTS (
    SELECT 1 FROM financial_accounts 
    WHERE type = 'receita' AND company_id = c.id
)
ON CONFLICT DO NOTHING;

-- 4. Verificar se as tabelas de faturamento existem
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'faturas') THEN
        RAISE NOTICE 'AVISO: Tabela faturas não existe. Execute o script create-faturamento-tables.sql primeiro.';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'parcelas') THEN
        RAISE NOTICE 'AVISO: Tabela parcelas não existe. Execute o script create-faturamento-tables.sql primeiro.';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'saldo_produtos') THEN
        RAISE NOTICE 'AVISO: Tabela saldo_produtos não existe. Execute o script create-retirada-tables.sql primeiro.';
    END IF;
END $$;

-- 5. Verificar estrutura das tabelas
SELECT 
    'financial_transactions' as tabela,
    COUNT(*) as registros
FROM financial_transactions
UNION ALL
SELECT 
    'financial_accounts' as tabela,
    COUNT(*) as registros
FROM financial_accounts
UNION ALL
SELECT 
    'faturas' as tabela,
    COUNT(*) as registros
FROM faturas
UNION ALL
SELECT 
    'parcelas' as tabela,
    COUNT(*) as registros
FROM parcelas
UNION ALL
SELECT 
    'saldo_produtos' as tabela,
    COUNT(*) as registros
FROM saldo_produtos;

-- 6. Mostrar contas de receitas disponíveis
SELECT 
    id,
    name,
    type,
    balance,
    active,
    company_id
FROM financial_accounts 
WHERE type = 'receita' 
ORDER BY name;

