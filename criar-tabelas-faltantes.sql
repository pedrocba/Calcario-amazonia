-- CRIAR APENAS AS TABELAS QUE ESTÃO FALTANDO
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. Tabela de Pagamentos Parciais (que está causando o erro)
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

-- 2. Tabela de Saldo de Produtos (se não existir)
CREATE TABLE IF NOT EXISTS saldo_produtos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    venda_id UUID NOT NULL REFERENCES vendas(id) ON DELETE CASCADE,
    cliente_id UUID NOT NULL,
    produto_id UUID NOT NULL,
    quantidade_total DECIMAL(10,3) NOT NULL,
    quantidade_retirada DECIMAL(10,3) NOT NULL DEFAULT 0,
    quantidade_saldo DECIMAL(10,3) NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'finalizado', 'cancelado')),
    company_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de Retiradas (se não existir)
CREATE TABLE IF NOT EXISTS retiradas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    venda_id UUID NOT NULL REFERENCES vendas(id) ON DELETE CASCADE,
    cliente_id UUID NOT NULL,
    saldo_produto_id UUID NOT NULL REFERENCES saldo_produtos(id) ON DELETE CASCADE,
    quantidade_retirada DECIMAL(10,3) NOT NULL,
    data_retirada TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    responsavel_retirada VARCHAR(255),
    observacoes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'confirmada' CHECK (status IN ('confirmada', 'cancelada')),
    company_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices básicos
CREATE INDEX IF NOT EXISTS idx_pagamentos_parciais_venda_id ON pagamentos_parciais(venda_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_parciais_cliente_id ON pagamentos_parciais(cliente_id);

CREATE INDEX IF NOT EXISTS idx_saldo_produtos_venda_id ON saldo_produtos(venda_id);
CREATE INDEX IF NOT EXISTS idx_saldo_produtos_cliente_id ON saldo_produtos(cliente_id);

CREATE INDEX IF NOT EXISTS idx_retiradas_venda_id ON retiradas(venda_id);
CREATE INDEX IF NOT EXISTS idx_retiradas_cliente_id ON retiradas(cliente_id);

-- RLS básico
ALTER TABLE pagamentos_parciais ENABLE ROW LEVEL SECURITY;
ALTER TABLE saldo_produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE retiradas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas
CREATE POLICY "Users can view pagamentos_parciais from their company" ON pagamentos_parciais
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

-- Verificar se as tabelas foram criadas
SELECT 'Tabelas criadas com sucesso!' as status;

