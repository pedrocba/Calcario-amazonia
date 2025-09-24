-- CORRIGIR TABELA financial_transactions
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. Verificar se a tabela existe, se não, criar
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'financial_transactions') THEN
        -- Criar tabela financial_transactions se não existir
        CREATE TABLE financial_transactions (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            account_id UUID REFERENCES financial_accounts(id) ON DELETE SET NULL,
            type VARCHAR(20) NOT NULL CHECK (type IN ('entrada', 'saida')),
            amount DECIMAL(15,2) NOT NULL,
            description TEXT NOT NULL,
            reference VARCHAR(255),
            due_date DATE,
            status VARCHAR(20) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'parcial', 'cancelado', 'overdue')),
            payment_date DATE,
            valor_pago DECIMAL(15,2) DEFAULT 0,
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
        CREATE INDEX idx_financial_transactions_contact_id ON financial_transactions(contact_id);
        
        -- Adicionar RLS
        ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Enable full access for company users" ON financial_transactions
        FOR ALL USING (company_id = (SELECT company_id FROM profiles WHERE user_id = auth.uid())) 
        WITH CHECK (company_id = (SELECT company_id FROM profiles WHERE user_id = auth.uid()));
        
    ELSE
        -- Se a tabela existe, verificar se a coluna category existe
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'financial_transactions' AND column_name = 'category') THEN
            -- Adicionar coluna category se não existir
            ALTER TABLE financial_transactions ADD COLUMN category VARCHAR(50) DEFAULT 'outros';
        END IF;
        
        -- Verificar se a coluna metadata existe
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'financial_transactions' AND column_name = 'metadata') THEN
            -- Adicionar coluna metadata se não existir
            ALTER TABLE financial_transactions ADD COLUMN metadata JSONB DEFAULT '{}';
        END IF;
        
        -- Verificar se a coluna contact_id existe
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'financial_transactions' AND column_name = 'contact_id') THEN
            -- Adicionar coluna contact_id se não existir
            ALTER TABLE financial_transactions ADD COLUMN contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL;
        END IF;
        
        -- Verificar se a coluna created_by existe
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'financial_transactions' AND column_name = 'created_by') THEN
            -- Adicionar coluna created_by se não existir
            ALTER TABLE financial_transactions ADD COLUMN created_by UUID;
        END IF;
        
        -- Verificar se a coluna is_recurring existe
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'financial_transactions' AND column_name = 'is_recurring') THEN
            -- Adicionar coluna is_recurring se não existir
            ALTER TABLE financial_transactions ADD COLUMN is_recurring BOOLEAN DEFAULT FALSE;
        END IF;
        
        -- Verificar se a coluna recurring_cost_id existe
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'financial_transactions' AND column_name = 'recurring_cost_id') THEN
            -- Adicionar coluna recurring_cost_id se não existir
            ALTER TABLE financial_transactions ADD COLUMN recurring_cost_id UUID;
        END IF;
        
        -- Atualizar constraint de status se necessário
        ALTER TABLE financial_transactions DROP CONSTRAINT IF EXISTS financial_transactions_status_check;
        ALTER TABLE financial_transactions ADD CONSTRAINT financial_transactions_status_check 
        CHECK (status IN ('pendente', 'pago', 'parcial', 'cancelado', 'overdue'));
        
        -- Atualizar constraint de type se necessário
        ALTER TABLE financial_transactions DROP CONSTRAINT IF EXISTS financial_transactions_type_check;
        ALTER TABLE financial_transactions ADD CONSTRAINT financial_transactions_type_check 
        CHECK (type IN ('entrada', 'saida'));
    END IF;
END
$$;

-- 2. Verificar se as tabelas de apoio existem
DO $$
BEGIN
    -- Criar financial_accounts se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'financial_accounts') THEN
        CREATE TABLE financial_accounts (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            type VARCHAR(20) NOT NULL CHECK (type IN ('caixa', 'banco', 'investimento', 'outros')),
            bank_name VARCHAR(100),
            account_number VARCHAR(50),
            agency VARCHAR(20),
            balance DECIMAL(15,2) DEFAULT 0,
            initial_balance DECIMAL(15,2) DEFAULT 0,
            active BOOLEAN DEFAULT TRUE,
            company_id UUID NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- RLS para financial_accounts
        ALTER TABLE financial_accounts ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Enable full access for company users" ON financial_accounts
        FOR ALL USING (company_id = (SELECT company_id FROM profiles WHERE user_id = auth.uid())) 
        WITH CHECK (company_id = (SELECT company_id FROM profiles WHERE user_id = auth.uid()));
    END IF;
    
    -- Criar financial_categories se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'financial_categories') THEN
        CREATE TABLE financial_categories (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            type VARCHAR(20) NOT NULL CHECK (type IN ('entrada', 'saida')),
            description TEXT,
            color VARCHAR(7) DEFAULT '#3B82F6',
            active BOOLEAN DEFAULT TRUE,
            company_id UUID NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- RLS para financial_categories
        ALTER TABLE financial_categories ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Enable full access for company users" ON financial_categories
        FOR ALL USING (company_id = (SELECT company_id FROM profiles WHERE user_id = auth.uid())) 
        WITH CHECK (company_id = (SELECT company_id FROM profiles WHERE user_id = auth.uid()));
    END IF;
END
$$;

-- 3. Inserir dados padrão
INSERT INTO financial_categories (name, type, description, color, company_id) VALUES
('Venda de Produto', 'entrada', 'Receitas de vendas de produtos', '#10B981', '68cacb913d169d191be6c90d'),
('Serviços', 'entrada', 'Receitas de prestação de serviços', '#3B82F6', '68cacb913d169d191be6c90d'),
('Outros', 'entrada', 'Outras receitas', '#6B7280', '68cacb913d169d191be6c90d'),
('Fornecedores', 'saida', 'Pagamentos a fornecedores', '#EF4444', '68cacb913d169d191be6c90d'),
('Serviços', 'saida', 'Pagamentos de serviços', '#F59E0B', '68cacb913d169d191be6c90d'),
('Impostos', 'saida', 'Pagamentos de impostos e taxas', '#DC2626', '68cacb913d169d191be6c90d'),
('Aluguel', 'saida', 'Pagamentos de aluguel', '#7C3AED', '68cacb913d169d191be6c90d'),
('Energia', 'saida', 'Contas de energia elétrica', '#F97316', '68cacb913d169d191be6c90d'),
('Água', 'saida', 'Contas de água', '#0EA5E9', '68cacb913d169d191be6c90d'),
('Telefone', 'saida', 'Contas de telefone e internet', '#8B5CF6', '68cacb913d169d191be6c90d'),
('Outros', 'saida', 'Outras despesas', '#6B7280', '68cacb913d169d191be6c90d')
ON CONFLICT DO NOTHING;

INSERT INTO financial_accounts (name, type, bank_name, balance, company_id) VALUES
('Caixa', 'caixa', 'Caixa da Empresa', 0, '68cacb913d169d191be6c90d'),
('Conta Corrente Principal', 'banco', 'Banco do Brasil', 0, '68cacb913d169d191be6c90d'),
('Poupança', 'banco', 'Banco do Brasil', 0, '68cacb913d169d191be6c90d'),
('Investimentos', 'investimento', 'Corretora', 0, '68cacb913d169d191be6c90d')
ON CONFLICT DO NOTHING;

-- 4. Verificar estrutura final
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'financial_transactions'
ORDER BY ordinal_position;

-- Mensagem de conclusão
SELECT 'Tabela financial_transactions corrigida com sucesso!' AS status;

