-- CRIAR TODAS AS TABELAS NECESSÁRIAS PARA FATURAMENTO
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

-- 3. Tabela de Saldo de Produtos (estoque do cliente)
CREATE TABLE IF NOT EXISTS saldo_produtos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    venda_id UUID NOT NULL REFERENCES vendas(id) ON DELETE CASCADE,
    cliente_id UUID NOT NULL,
    produto_id UUID NOT NULL,
    quantidade_total DECIMAL(10,3) NOT NULL, -- Quantidade total comprada
    quantidade_retirada DECIMAL(10,3) NOT NULL DEFAULT 0, -- Quantidade já retirada
    quantidade_saldo DECIMAL(10,3) NOT NULL, -- Saldo restante (calculado)
    preco_unitario DECIMAL(10,2) NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'finalizado', 'cancelado')),
    company_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de Retiradas
CREATE TABLE IF NOT EXISTS retiradas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    venda_id UUID NOT NULL REFERENCES vendas(id) ON DELETE CASCADE,
    cliente_id UUID NOT NULL,
    saldo_produto_id UUID NOT NULL REFERENCES saldo_produtos(id) ON DELETE CASCADE,
    quantidade_retirada DECIMAL(10,3) NOT NULL,
    data_retirada TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    responsavel_retirada VARCHAR(255), -- Nome da pessoa que retirou
    observacoes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'confirmada' CHECK (status IN ('confirmada', 'cancelada')),
    company_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabela de Pagamentos Parciais
CREATE TABLE IF NOT EXISTS pagamentos_parciais (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    venda_id UUID NOT NULL REFERENCES vendas(id) ON DELETE CASCADE,
    fatura_id UUID REFERENCES faturas(id) ON DELETE CASCADE,
    cliente_id UUID NOT NULL,
    valor_pago DECIMAL(10,2) NOT NULL,
    data_pagamento TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    forma_pagamento VARCHAR(50) NOT NULL,
    observacoes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'confirmado' CHECK (status IN ('confirmado', 'cancelado')),
    company_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_faturas_venda_id ON faturas(venda_id);
CREATE INDEX IF NOT EXISTS idx_faturas_customer_id ON faturas(customer_id);
CREATE INDEX IF NOT EXISTS idx_faturas_status ON faturas(status);

CREATE INDEX IF NOT EXISTS idx_parcelas_fatura_id ON parcelas(fatura_id);
CREATE INDEX IF NOT EXISTS idx_parcelas_venda_id ON parcelas(venda_id);
CREATE INDEX IF NOT EXISTS idx_parcelas_due_date ON parcelas(due_date);
CREATE INDEX IF NOT EXISTS idx_parcelas_status ON parcelas(status);

CREATE INDEX IF NOT EXISTS idx_saldo_produtos_venda_id ON saldo_produtos(venda_id);
CREATE INDEX IF NOT EXISTS idx_saldo_produtos_cliente_id ON saldo_produtos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_saldo_produtos_produto_id ON saldo_produtos(produto_id);
CREATE INDEX IF NOT EXISTS idx_saldo_produtos_status ON saldo_produtos(status);

CREATE INDEX IF NOT EXISTS idx_retiradas_venda_id ON retiradas(venda_id);
CREATE INDEX IF NOT EXISTS idx_retiradas_cliente_id ON retiradas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_retiradas_saldo_produto_id ON retiradas(saldo_produto_id);
CREATE INDEX IF NOT EXISTS idx_retiradas_data ON retiradas(data_retirada);

CREATE INDEX IF NOT EXISTS idx_pagamentos_parciais_venda_id ON pagamentos_parciais(venda_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_parciais_cliente_id ON pagamentos_parciais(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_parciais_data ON pagamentos_parciais(data_pagamento);

-- RLS (Row Level Security)
ALTER TABLE faturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE saldo_produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE retiradas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos_parciais ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (ajustar conforme sua estrutura de autenticação)
CREATE POLICY "Users can view faturas from their company" ON faturas
    FOR SELECT USING (company_id IN (
        SELECT company_id FROM profiles WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can view parcelas from their company" ON parcelas
    FOR SELECT USING (company_id IN (
        SELECT company_id FROM profiles WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can view saldo_produtos from their company" ON saldo_produtos
    FOR SELECT USING (company_id IN (
        SELECT company_id FROM profiles WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can view retiradas from their company" ON retiradas
    FOR SELECT USING (company_id IN (
        SELECT company_id FROM profiles WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can view pagamentos_parciais from their company" ON pagamentos_parciais
    FOR SELECT USING (company_id IN (
        SELECT company_id FROM profiles WHERE user_id = auth.uid()
    ));

-- Função para calcular saldo automaticamente
CREATE OR REPLACE FUNCTION calcular_saldo_produto()
RETURNS TRIGGER AS $$
BEGIN
    -- Calcular saldo restante
    NEW.quantidade_saldo = NEW.quantidade_total - NEW.quantidade_retirada;
    
    -- Atualizar status baseado no saldo
    IF NEW.quantidade_saldo <= 0 THEN
        NEW.status = 'finalizado';
    ELSIF NEW.quantidade_saldo > 0 THEN
        NEW.status = 'ativo';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular saldo automaticamente
CREATE TRIGGER trigger_calcular_saldo_produto
    BEFORE INSERT OR UPDATE ON saldo_produtos
    FOR EACH ROW
    EXECUTE FUNCTION calcular_saldo_produto();

-- Função para atualizar saldo quando houver retirada
CREATE OR REPLACE FUNCTION atualizar_saldo_apos_retirada()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar quantidade retirada no saldo_produtos
    UPDATE saldo_produtos 
    SET quantidade_retirada = quantidade_retirada + NEW.quantidade_retirada,
        updated_at = NOW()
    WHERE id = NEW.saldo_produto_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar saldo após retirada
CREATE TRIGGER trigger_atualizar_saldo_apos_retirada
    AFTER INSERT ON retiradas
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_saldo_apos_retirada();

-- Verificar se as tabelas foram criadas
SELECT 'Tabelas criadas com sucesso!' as status;

