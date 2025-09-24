-- =====================================================
-- SISTEMA FINANCEIRO FINAL - EXECUTE UMA VEZ
-- =====================================================
-- Execute este script no Supabase SQL Editor

-- 1. LIMPAR TUDO E RECRIAR
DROP TABLE IF EXISTS financial_transactions CASCADE;
DROP TABLE IF EXISTS financial_accounts CASCADE;
DROP TABLE IF EXISTS sessoes_caixa CASCADE;
DROP TABLE IF EXISTS companies CASCADE;

-- 2. CRIAR TABELA COMPANIES
CREATE TABLE companies (
  id TEXT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CRIAR TABELA FINANCIAL_ACCOUNTS
CREATE TABLE financial_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT NOT NULL,
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

-- 4. CRIAR TABELA FINANCIAL_TRANSACTIONS
CREATE TABLE financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT NOT NULL,
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

-- 5. CRIAR TABELA SESSOES_CAIXA
CREATE TABLE sessoes_caixa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT NOT NULL,
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

-- 6. CRIAR ÍNDICES
CREATE INDEX idx_financial_accounts_company_id ON financial_accounts(company_id);
CREATE INDEX idx_financial_accounts_active ON financial_accounts(active);
CREATE INDEX idx_financial_accounts_type ON financial_accounts(type);

CREATE INDEX idx_financial_transactions_company_id ON financial_transactions(company_id);
CREATE INDEX idx_financial_transactions_type ON financial_transactions(type);
CREATE INDEX idx_financial_transactions_status ON financial_transactions(status);
CREATE INDEX idx_financial_transactions_due_date ON financial_transactions(due_date);

CREATE INDEX idx_sessoes_caixa_company_id ON sessoes_caixa(company_id);
CREATE INDEX idx_sessoes_caixa_status ON sessoes_caixa(status);

-- 7. HABILITAR RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessoes_caixa ENABLE ROW LEVEL SECURITY;

-- 8. CRIAR POLÍTICAS RLS
CREATE POLICY "Enable full access for companies" ON companies FOR ALL USING (true);
CREATE POLICY "Enable full access for financial_accounts" ON financial_accounts FOR ALL USING (true);
CREATE POLICY "Enable full access for financial_transactions" ON financial_transactions FOR ALL USING (true);
CREATE POLICY "Enable full access for sessoes_caixa" ON sessoes_caixa FOR ALL USING (true);

-- 9. CRIAR TRIGGER PARA UPDATED_AT
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

-- 10. INSERIR DADOS INICIAIS
INSERT INTO companies (id, name, email, phone, address)
VALUES (
  '68cacb91-3d16-9d19-1be6-c90d000000000000',
  'Empresa Principal',
  'contato@empresa.com',
  '(11) 99999-9999',
  'Endereço da Empresa'
);

INSERT INTO financial_accounts (company_id, name, type, balance, description, active)
VALUES 
  ('68cacb91-3d16-9d19-1be6-c90d000000000000', 'Caixa Principal', 'caixa', 15000.00, 'Caixa principal da empresa', true),
  ('68cacb91-3d16-9d19-1be6-c90d000000000000', 'Conta Corrente BB', 'banco', 45000.00, 'Conta corrente principal', true),
  ('68cacb91-3d16-9d19-1be6-c90d000000000000', 'Caixa de Emergência', 'caixa', 10000.00, 'Reserva de emergência', true),
  ('68cacb91-3d16-9d19-1be6-c90d000000000000', 'Poupança', 'investimento', 25000.00, 'Investimentos de longo prazo', true),
  ('68cacb91-3d16-9d19-1be6-c90d000000000000', 'Cartão de Crédito', 'outros', -2000.00, 'Cartão de crédito', true);

INSERT INTO financial_transactions (company_id, type, amount, description, due_date, status, category, notes)
VALUES 
  ('68cacb91-3d16-9d19-1be6-c90d000000000000', 'saida', -500.00, 'Pagamento de energia elétrica', '2024-01-15', 'pendente', 'fornecedores', 'Conta de luz do mês'),
  ('68cacb91-3d16-9d19-1be6-c90d000000000000', 'saida', -1200.00, 'Aluguel do escritório', '2024-01-10', 'pendente', 'fornecedores', 'Aluguel mensal'),
  ('68cacb91-3d16-9d19-1be6-c90d000000000000', 'saida', -300.00, 'Internet e telefone', '2024-01-20', 'pendente', 'servicos', 'Plano mensal de internet'),
  ('68cacb91-3d16-9d19-1be6-c90d000000000000', 'saida', -800.00, 'Salários funcionários', '2024-01-05', 'pago', 'outros', 'Folha de pagamento'),
  ('68cacb91-3d16-9d19-1be6-c90d000000000000', 'saida', -150.00, 'Material de escritório', '2024-01-25', 'pendente', 'outros', 'Papel, canetas, etc.'),
  ('68cacb91-3d16-9d19-1be6-c90d000000000000', 'entrada', 2500.00, 'Venda de produtos - Cliente A', '2024-01-12', 'pendente', 'venda_produto', 'Venda de calcário'),
  ('68cacb91-3d16-9d19-1be6-c90d000000000000', 'entrada', 1800.00, 'Serviços prestados - Cliente B', '2024-01-18', 'pendente', 'servico', 'Serviço de transporte'),
  ('68cacb91-3d16-9d19-1be6-c90d000000000000', 'entrada', 3200.00, 'Venda de produtos - Cliente C', '2024-01-08', 'pago', 'venda_produto', 'Venda de calcário - Pago'),
  ('68cacb91-3d16-9d19-1be6-c90d000000000000', 'entrada', 950.00, 'Serviços prestados - Cliente D', '2024-01-22', 'pendente', 'servico', 'Serviço de consultoria'),
  ('68cacb91-3d16-9d19-1be6-c90d000000000000', 'entrada', 1500.00, 'Venda de produtos - Cliente E', '2024-01-30', 'pendente', 'venda_produto', 'Venda de calcário');

-- 11. VERIFICAR RESULTADO
SELECT 
  '✅ SISTEMA FINANCEIRO CONFIGURADO COM SUCESSO!' as status,
  (SELECT COUNT(*) FROM companies) as total_empresas,
  (SELECT COUNT(*) FROM financial_accounts) as total_contas,
  (SELECT COUNT(*) FROM financial_transactions WHERE type = 'saida') as total_contas_pagar,
  (SELECT COUNT(*) FROM financial_transactions WHERE type = 'entrada') as total_contas_receber;

-- 12. MOSTRAR CONTAS FINANCEIRAS
SELECT 
  'CONTAS FINANCEIRAS DISPONÍVEIS:' as info,
  id,
  name,
  type,
  balance,
  description
FROM financial_accounts 
WHERE company_id = '68cacb91-3d16-9d19-1be6-c90d000000000000'
ORDER BY created_at;

SELECT '🎉 SISTEMA FINANCEIRO PRONTO PARA USO!' as status_final;
