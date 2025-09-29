-- CRIAÇÃO DAS TABELAS PARA SISTEMA DE FATURAMENTO
-- ================================================

-- 1. Tabela de Faturas
CREATE TABLE IF NOT EXISTS faturas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    venda_id UUID NOT NULL REFERENCES vendas(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL,
    total_value DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount DECIMAL(10,2) NOT NULL DEFAULT 0,
    additional_charges DECIMAL(10,2) NOT NULL DEFAULT 0,
    final_value DECIMAL(10,2) NOT NULL DEFAULT 0,
    payment_method VARCHAR(50) NOT NULL,
    payment_conditions VARCHAR(20) NOT NULL CHECK (payment_conditions IN ('a_vista', 'a_prazo')),
    due_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
    notes TEXT,
    company_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de Parcelas
CREATE TABLE IF NOT EXISTS parcelas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    fatura_id UUID NOT NULL REFERENCES faturas(id) ON DELETE CASCADE,
    venda_id UUID NOT NULL REFERENCES vendas(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL,
    installment_number INTEGER NOT NULL,
    due_date DATE NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
    payment_method VARCHAR(50),
    paid_at TIMESTAMP WITH TIME ZONE,
    paid_value DECIMAL(10,2),
    company_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de Contas Bancárias
CREATE TABLE IF NOT EXISTS contas_bancarias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bank_name VARCHAR(100) NOT NULL,
    bank_code VARCHAR(10),
    account_number VARCHAR(20) NOT NULL,
    account_type VARCHAR(20) NOT NULL CHECK (account_type IN ('corrente', 'poupanca', 'investimento')),
    agency VARCHAR(10),
    balance DECIMAL(12,2) NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    company_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de Caixas
CREATE TABLE IF NOT EXISTS caixas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    balance DECIMAL(12,2) NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    company_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabela de Movimentações de Caixa
CREATE TABLE IF NOT EXISTS movimentacoes_caixa (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('entrada', 'saida')),
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    caixa_id UUID NOT NULL REFERENCES caixas(id) ON DELETE CASCADE,
    venda_id UUID REFERENCES vendas(id) ON DELETE SET NULL,
    fatura_id UUID REFERENCES faturas(id) ON DELETE SET NULL,
    company_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabela de Movimentações Bancárias
CREATE TABLE IF NOT EXISTS movimentacoes_bancarias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('entrada', 'saida')),
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    conta_id UUID NOT NULL REFERENCES contas_bancarias(id) ON DELETE CASCADE,
    venda_id UUID REFERENCES vendas(id) ON DELETE SET NULL,
    fatura_id UUID REFERENCES faturas(id) ON DELETE SET NULL,
    company_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_faturas_venda_id ON faturas(venda_id);
CREATE INDEX IF NOT EXISTS idx_faturas_customer_id ON faturas(customer_id);
CREATE INDEX IF NOT EXISTS idx_faturas_status ON faturas(status);
CREATE INDEX IF NOT EXISTS idx_parcelas_fatura_id ON parcelas(fatura_id);
CREATE INDEX IF NOT EXISTS idx_parcelas_due_date ON parcelas(due_date);
CREATE INDEX IF NOT EXISTS idx_parcelas_status ON parcelas(status);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_caixa_caixa_id ON movimentacoes_caixa(caixa_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_caixa_created_at ON movimentacoes_caixa(created_at);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_bancarias_conta_id ON movimentacoes_bancarias(conta_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_bancarias_created_at ON movimentacoes_bancarias(created_at);

-- RLS (Row Level Security) - Aplicar políticas de segurança
ALTER TABLE faturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas_bancarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE caixas ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentacoes_caixa ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentacoes_bancarias ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (ajustar conforme necessário)
CREATE POLICY "Users can view faturas from their company" ON faturas
    FOR SELECT USING (company_id = (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert faturas for their company" ON faturas
    FOR INSERT WITH CHECK (company_id = (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update faturas from their company" ON faturas
    FOR UPDATE USING (company_id = (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

-- Políticas similares para outras tabelas...
CREATE POLICY "Users can view parcelas from their company" ON parcelas
    FOR SELECT USING (company_id = (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert parcelas for their company" ON parcelas
    FOR INSERT WITH CHECK (company_id = (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

-- Inserir dados iniciais
INSERT INTO contas_bancarias (bank_name, bank_code, account_number, account_type, agency, company_id) VALUES
('Banco do Brasil', '001', '12345-6', 'corrente', '1234', '68cacb913d169d191be6c90d'),
('Caixa Econômica', '104', '67890-1', 'corrente', '5678', '68cacb913d169d191be6c90d'),
('Bradesco', '237', '11111-2', 'poupanca', '9999', '68cacb913d169d191be6c90d')
ON CONFLICT DO NOTHING;

INSERT INTO caixas (name, description, company_id) VALUES
('Caixa Principal', 'Caixa principal da empresa', '68cacb913d169d191be6c90d'),
('Caixa Secundário', 'Caixa de reserva', '68cacb913d169d191be6c90d'),
('Caixa de Troco', 'Caixa para troco', '68cacb913d169d191be6c90d')
ON CONFLICT DO NOTHING;














