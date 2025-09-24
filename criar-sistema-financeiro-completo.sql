-- SISTEMA FINANCEIRO COMPLETO E PROFISSIONAL
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. Verificar e criar tabela financial_categories
DO $$
BEGIN
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
        
        -- Índices
        CREATE INDEX idx_financial_categories_company_id ON financial_categories(company_id);
        CREATE INDEX idx_financial_categories_type ON financial_categories(type);
        
        -- RLS
        ALTER TABLE financial_categories ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Enable full access for company users" ON financial_categories
        FOR ALL USING (company_id = (SELECT company_id FROM profiles WHERE user_id = auth.uid())) 
        WITH CHECK (company_id = (SELECT company_id FROM profiles WHERE user_id = auth.uid()));
    END IF;
END
$$;

-- 2. Verificar e criar tabela financial_accounts
DO $$
BEGIN
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
        
        -- Índices
        CREATE INDEX idx_financial_accounts_company_id ON financial_accounts(company_id);
        CREATE INDEX idx_financial_accounts_type ON financial_accounts(type);
        
        -- RLS
        ALTER TABLE financial_accounts ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Enable full access for company users" ON financial_accounts
        FOR ALL USING (company_id = (SELECT company_id FROM profiles WHERE user_id = auth.uid())) 
        WITH CHECK (company_id = (SELECT company_id FROM profiles WHERE user_id = auth.uid()));
    END IF;
END
$$;

-- 3. Verificar e criar tabela financial_transactions (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'financial_transactions') THEN
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
        
        -- Índices
        CREATE INDEX idx_financial_transactions_company_id ON financial_transactions(company_id);
        CREATE INDEX idx_financial_transactions_type ON financial_transactions(type);
        CREATE INDEX idx_financial_transactions_status ON financial_transactions(status);
        CREATE INDEX idx_financial_transactions_due_date ON financial_transactions(due_date);
        CREATE INDEX idx_financial_transactions_reference ON financial_transactions(reference);
        CREATE INDEX idx_financial_transactions_metadata ON financial_transactions USING GIN(metadata);
        CREATE INDEX idx_financial_transactions_contact_id ON financial_transactions(contact_id);
        
        -- RLS
        ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Enable full access for company users" ON financial_transactions
        FOR ALL USING (company_id = (SELECT company_id FROM profiles WHERE user_id = auth.uid())) 
        WITH CHECK (company_id = (SELECT company_id FROM profiles WHERE user_id = auth.uid()));
    END IF;
END
$$;

-- 4. Inserir categorias padrão
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

-- 5. Inserir contas padrão
INSERT INTO financial_accounts (name, type, bank_name, balance, company_id) VALUES
('Caixa', 'caixa', 'Caixa da Empresa', 0, '68cacb913d169d191be6c90d'),
('Conta Corrente Principal', 'banco', 'Banco do Brasil', 0, '68cacb913d169d191be6c90d'),
('Poupança', 'banco', 'Banco do Brasil', 0, '68cacb913d169d191be6c90d'),
('Investimentos', 'investimento', 'Corretora', 0, '68cacb913d169d191be6c90d')
ON CONFLICT DO NOTHING;

-- 6. Criar função para atualizar saldo das contas
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar saldo da conta quando uma transação é inserida/atualizada/deletada
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE financial_accounts 
        SET balance = (
            SELECT COALESCE(SUM(amount), 0) 
            FROM financial_transactions 
            WHERE account_id = NEW.account_id 
            AND status = 'pago'
        )
        WHERE id = NEW.account_id;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        UPDATE financial_accounts 
        SET balance = (
            SELECT COALESCE(SUM(amount), 0) 
            FROM financial_transactions 
            WHERE account_id = OLD.account_id 
            AND status = 'pago'
        )
        WHERE id = OLD.account_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 7. Criar trigger para atualizar saldo automaticamente
DROP TRIGGER IF EXISTS trigger_update_account_balance ON financial_transactions;
CREATE TRIGGER trigger_update_account_balance
    AFTER INSERT OR UPDATE OR DELETE ON financial_transactions
    FOR EACH ROW EXECUTE FUNCTION update_account_balance();

-- 8. Criar função para marcar transações vencidas
CREATE OR REPLACE FUNCTION mark_overdue_transactions()
RETURNS void AS $$
BEGIN
    UPDATE financial_transactions 
    SET status = 'overdue'
    WHERE status = 'pendente' 
    AND due_date < CURRENT_DATE
    AND type = 'saida';
END;
$$ LANGUAGE plpgsql;

-- 9. Criar função para buscar contatos (se não existir)
CREATE OR REPLACE FUNCTION get_contacts(company_uuid UUID)
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    document VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    SELECT c.id, c.name, c.email, c.phone, c.document
    FROM contacts c
    WHERE c.company_id = company_uuid
    AND c.active = true
    ORDER BY c.name;
END;
$$ LANGUAGE plpgsql;

-- 10. Mensagem de conclusão
SELECT 'Sistema financeiro completo criado com sucesso!' AS status;

