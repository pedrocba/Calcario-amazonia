-- SISTEMA FINANCEIRO PROFISSIONAL - INTEGRAÇÃO COM VENDAS
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. Criar tabela financial_transactions se não existir
CREATE TABLE IF NOT EXISTS financial_transactions (
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

-- 2. Criar tabela financial_accounts se não existir
CREATE TABLE IF NOT EXISTS financial_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('receita', 'despesa', 'caixa', 'banco')),
    balance DECIMAL(10,2) DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    company_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_financial_transactions_company_id ON financial_transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_type ON financial_transactions(type);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_status ON financial_transactions(status);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_due_date ON financial_transactions(due_date);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_reference ON financial_transactions(reference);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_metadata ON financial_transactions USING GIN(metadata);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_contact_id ON financial_transactions(contact_id);

CREATE INDEX IF NOT EXISTS idx_financial_accounts_company_id ON financial_accounts(company_id);
CREATE INDEX IF NOT EXISTS idx_financial_accounts_type ON financial_accounts(type);
CREATE INDEX IF NOT EXISTS idx_financial_accounts_active ON financial_accounts(active);

-- 4. Criar conta de receitas padrão para cada empresa
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

-- 5. Criar conta de caixa padrão para cada empresa
INSERT INTO financial_accounts (name, type, company_id, active)
SELECT 
    'Caixa Principal',
    'caixa',
    c.id,
    TRUE
FROM companies c
WHERE NOT EXISTS (
    SELECT 1 FROM financial_accounts 
    WHERE type = 'caixa' AND company_id = c.id
)
ON CONFLICT DO NOTHING;

-- 6. Verificar se as tabelas de faturamento existem
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'faturas') THEN
        RAISE NOTICE 'AVISO: Tabela faturas não existe. Execute o script create-faturamento-tables.sql primeiro.';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'parcelas') THEN
        RAISE NOTICE 'AVISO: Tabela parcelas não existe. Execute o script create-faturamento-tables.sql primeiro.';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vendas') THEN
        RAISE NOTICE 'AVISO: Tabela vendas não existe. Execute o script supabase-schema.sql primeiro.';
    END IF;
END $$;

-- 7. Criar função para sincronizar vendas com financeiro
CREATE OR REPLACE FUNCTION sync_venda_with_finance()
RETURNS TRIGGER AS $$
BEGIN
    -- Esta função será chamada quando uma fatura for criada
    -- A lógica de sincronização será feita pelo frontend
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Criar trigger para sincronização automática (opcional)
-- DROP TRIGGER IF EXISTS trigger_sync_fatura_finance ON faturas;
-- CREATE TRIGGER trigger_sync_fatura_finance
--     AFTER INSERT ON faturas
--     FOR EACH ROW
--     EXECUTE FUNCTION sync_venda_with_finance();

-- 9. Verificar estrutura das tabelas
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
    'vendas' as tabela,
    COUNT(*) as registros
FROM vendas;

-- 10. Mostrar contas financeiras disponíveis
SELECT 
    id,
    name,
    type,
    balance,
    active,
    company_id
FROM financial_accounts 
ORDER BY type, name;

-- 11. Mostrar transações financeiras existentes
SELECT 
    id,
    description,
    amount,
    status,
    due_date,
    created_at
FROM financial_transactions 
ORDER BY created_at DESC 
LIMIT 10;

