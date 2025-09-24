-- =====================================================
-- SISTEMA FINANCEIRO DEFINITIVO - CONTAS A PAGAR E RECEBER
-- =====================================================
-- Execute este script no Supabase SQL Editor

-- 1. CRIAR TABELA COMPANIES SE NÃO EXISTIR
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CRIAR TABELA FINANCIAL_ACCOUNTS COMPLETA
DROP TABLE IF EXISTS financial_accounts CASCADE;
CREATE TABLE financial_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'caixa',
  balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT financial_accounts_company_id_fkey 
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  CONSTRAINT financial_accounts_type_check 
    CHECK (type IN ('caixa', 'banco', 'investimento', 'outros'))
);

-- 3. CRIAR TABELA FINANCIAL_TRANSACTIONS COMPLETA
DROP TABLE IF EXISTS financial_transactions CASCADE;
CREATE TABLE financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
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
  contact_id UUID,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT financial_transactions_company_id_fkey 
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 4. CRIAR TABELA SESSOES_CAIXA
DROP TABLE IF EXISTS sessoes_caixa CASCADE;
CREATE TABLE sessoes_caixa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  data_abertura TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_fechamento TIMESTAMP WITH TIME ZONE,
  valor_inicial DECIMAL(15,2) NOT NULL DEFAULT 0,
  valor_final DECIMAL(15,2),
  status VARCHAR(20) NOT NULL DEFAULT 'aberta' CHECK (status IN ('aberta', 'fechada')),
  responsavel VARCHAR(255),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT sessoes_caixa_company_id_fkey 
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 5. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX idx_financial_accounts_company_id ON financial_accounts(company_id);
CREATE INDEX idx_financial_accounts_active ON financial_accounts(active);
CREATE INDEX idx_financial_accounts_type ON financial_accounts(type);

CREATE INDEX idx_financial_transactions_company_id ON financial_transactions(company_id);
CREATE INDEX idx_financial_transactions_type ON financial_transactions(type);
CREATE INDEX idx_financial_transactions_status ON financial_transactions(status);
CREATE INDEX idx_financial_transactions_due_date ON financial_transactions(due_date);
CREATE INDEX idx_financial_transactions_reference ON financial_transactions(reference);
CREATE INDEX idx_financial_transactions_metadata ON financial_transactions USING GIN(metadata);
CREATE INDEX idx_financial_transactions_contact_id ON financial_transactions(contact_id);

CREATE INDEX idx_sessoes_caixa_company_id ON sessoes_caixa(company_id);
CREATE INDEX idx_sessoes_caixa_status ON sessoes_caixa(status);

-- 6. HABILITAR RLS (Row Level Security)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessoes_caixa ENABLE ROW LEVEL SECURITY;

-- 7. CRIAR POLÍTICAS RLS
CREATE POLICY "Enable full access for companies" ON companies FOR ALL USING (true);
CREATE POLICY "Enable full access for financial_accounts" ON financial_accounts FOR ALL USING (true);
CREATE POLICY "Enable full access for financial_transactions" ON financial_transactions FOR ALL USING (true);
CREATE POLICY "Enable full access for sessoes_caixa" ON sessoes_caixa FOR ALL USING (true);

-- 8. CRIAR TRIGGER PARA UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_companies_updated_at 
  BEFORE UPDATE ON companies 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_accounts_updated_at 
  BEFORE UPDATE ON financial_accounts 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_transactions_updated_at 
  BEFORE UPDATE ON financial_transactions 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessoes_caixa_updated_at 
  BEFORE UPDATE ON sessoes_caixa 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 9. INSERIR EMPRESA PRINCIPAL
INSERT INTO companies (id, name, email, phone, address)
VALUES (
  '68cacb91-3d16-9d19-1be6-c90d000000000000'::uuid,
  'Empresa Principal',
  'contato@empresa.com',
  '(11) 99999-9999',
  'Endereço da Empresa'
) ON CONFLICT (id) DO NOTHING;

-- 10. INSERIR CONTAS FINANCEIRAS DE EXEMPLO
INSERT INTO financial_accounts (company_id, name, type, balance, description, active)
VALUES 
  ('68cacb91-3d16-9d19-1be6-c90d000000000000'::uuid, 'Caixa Principal', 'caixa', 15000.00, 'Caixa principal da empresa', true),
  ('68cacb91-3d16-9d19-1be6-c90d000000000000'::uuid, 'Conta Corrente BB', 'banco', 45000.00, 'Conta corrente principal', true),
  ('68cacb91-3d16-9d19-1be6-c90d000000000000'::uuid, 'Caixa de Emergência', 'caixa', 10000.00, 'Reserva de emergência', true),
  ('68cacb91-3d16-9d19-1be6-c90d000000000000'::uuid, 'Poupança', 'investimento', 25000.00, 'Investimentos de longo prazo', true)
ON CONFLICT DO NOTHING;

-- 11. INSERIR CONTAS A PAGAR DE EXEMPLO
INSERT INTO financial_transactions (company_id, type, amount, description, due_date, status, category, notes)
VALUES 
  ('68cacb91-3d16-9d19-1be6-c90d000000000000'::uuid, 'saida', -500.00, 'Pagamento de energia elétrica', '2024-01-15', 'pendente', 'fornecedores', 'Conta de luz do mês'),
  ('68cacb91-3d16-9d19-1be6-c90d000000000000'::uuid, 'saida', -1200.00, 'Aluguel do escritório', '2024-01-10', 'pendente', 'fornecedores', 'Aluguel mensal'),
  ('68cacb91-3d16-9d19-1be6-c90d000000000000'::uuid, 'saida', -300.00, 'Internet e telefone', '2024-01-20', 'pendente', 'servicos', 'Plano mensal de internet'),
  ('68cacb91-3d16-9d19-1be6-c90d000000000000'::uuid, 'saida', -800.00, 'Salários funcionários', '2024-01-05', 'pago', 'outros', 'Folha de pagamento'),
  ('68cacb91-3d16-9d19-1be6-c90d000000000000'::uuid, 'saida', -150.00, 'Material de escritório', '2024-01-25', 'pendente', 'outros', 'Papel, canetas, etc.')
ON CONFLICT DO NOTHING;

-- 12. INSERIR CONTAS A RECEBER DE EXEMPLO
INSERT INTO financial_transactions (company_id, type, amount, description, due_date, status, category, notes)
VALUES 
  ('68cacb91-3d16-9d19-1be6-c90d000000000000'::uuid, 'entrada', 2500.00, 'Venda de produtos - Cliente A', '2024-01-12', 'pendente', 'venda_produto', 'Venda de calcário'),
  ('68cacb91-3d16-9d19-1be6-c90d000000000000'::uuid, 'entrada', 1800.00, 'Serviços prestados - Cliente B', '2024-01-18', 'pendente', 'servico', 'Serviço de transporte'),
  ('68cacb91-3d16-9d19-1be6-c90d000000000000'::uuid, 'entrada', 3200.00, 'Venda de produtos - Cliente C', '2024-01-08', 'pago', 'venda_produto', 'Venda de calcário - Pago'),
  ('68cacb91-3d16-9d19-1be6-c90d000000000000'::uuid, 'entrada', 950.00, 'Serviços prestados - Cliente D', '2024-01-22', 'pendente', 'servico', 'Serviço de consultoria'),
  ('68cacb91-3d16-9d19-1be6-c90d000000000000'::uuid, 'entrada', 1500.00, 'Venda de produtos - Cliente E', '2024-01-30', 'pendente', 'venda_produto', 'Venda de calcário')
ON CONFLICT DO NOTHING;

-- 13. VERIFICAR SE TUDO FUNCIONOU
SELECT 
  '✅ SISTEMA FINANCEIRO CONFIGURADO COM SUCESSO!' as status,
  (SELECT COUNT(*) FROM companies) as total_empresas,
  (SELECT COUNT(*) FROM financial_accounts) as total_contas,
  (SELECT COUNT(*) FROM financial_transactions WHERE type = 'saida') as total_contas_pagar,
  (SELECT COUNT(*) FROM financial_transactions WHERE type = 'entrada') as total_contas_receber;

-- 14. MOSTRAR RESUMO DAS CONTAS
SELECT 
  'RESUMO DAS CONTAS FINANCEIRAS:' as info,
  name,
  type,
  balance,
  active
FROM financial_accounts 
WHERE company_id = '68cacb91-3d16-9d19-1be6-c90d000000000000'::uuid
ORDER BY created_at;

-- 15. MOSTRAR CONTAS A PAGAR
SELECT 
  'CONTAS A PAGAR:' as info,
  description,
  amount,
  due_date,
  status,
  category
FROM financial_transactions 
WHERE company_id = '68cacb91-3d16-9d19-1be6-c90d000000000000'::uuid
  AND type = 'saida'
ORDER BY due_date;

-- 16. MOSTRAR CONTAS A RECEBER
SELECT 
  'CONTAS A RECEBER:' as info,
  description,
  amount,
  due_date,
  status,
  category
FROM financial_transactions 
WHERE company_id = '68cacb91-3d16-9d19-1be6-c90d000000000000'::uuid
  AND type = 'entrada'
ORDER BY due_date;

SELECT '🎉 SISTEMA FINANCEIRO PRONTO PARA USO!' as status_final;
