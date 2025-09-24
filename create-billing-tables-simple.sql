-- CRIAÇÃO SIMPLIFICADA DAS TABELAS DE FATURAMENTO
-- Execute este SQL no Supabase Dashboard > SQL Editor

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

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_faturas_venda_id ON faturas(venda_id);
CREATE INDEX IF NOT EXISTS idx_faturas_customer_id ON faturas(customer_id);
CREATE INDEX IF NOT EXISTS idx_faturas_status ON faturas(status);
CREATE INDEX IF NOT EXISTS idx_parcelas_fatura_id ON parcelas(fatura_id);
CREATE INDEX IF NOT EXISTS idx_parcelas_due_date ON parcelas(due_date);
CREATE INDEX IF NOT EXISTS idx_parcelas_status ON parcelas(status);

-- RLS (Row Level Security)
ALTER TABLE faturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcelas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas
CREATE POLICY "Users can view faturas from their company" ON faturas
    FOR SELECT USING (company_id::text = (SELECT company_id::text FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert faturas for their company" ON faturas
    FOR INSERT WITH CHECK (company_id::text = (SELECT company_id::text FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update faturas from their company" ON faturas
    FOR UPDATE USING (company_id::text = (SELECT company_id::text FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can view parcelas from their company" ON parcelas
    FOR SELECT USING (company_id::text = (SELECT company_id::text FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert parcelas for their company" ON parcelas
    FOR INSERT WITH CHECK (company_id::text = (SELECT company_id::text FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update parcelas from their company" ON parcelas
    FOR UPDATE USING (company_id::text = (SELECT company_id::text FROM profiles WHERE user_id = auth.uid()));

-- Verificar se as tabelas foram criadas
SELECT 'Tabelas criadas com sucesso!' as status;
