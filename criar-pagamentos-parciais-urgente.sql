-- CRIAR TABELA PAGAMENTOS_PARCIAIS URGENTE
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- Criar a tabela pagamentos_parciais
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

-- Criar índice básico
CREATE INDEX IF NOT EXISTS idx_pagamentos_parciais_venda_id ON pagamentos_parciais(venda_id);

-- Habilitar RLS
ALTER TABLE pagamentos_parciais ENABLE ROW LEVEL SECURITY;

-- Política RLS básica
CREATE POLICY "Users can view pagamentos_parciais from their company" ON pagamentos_parciais
    FOR ALL USING (company_id IN (
        SELECT company_id FROM profiles WHERE user_id = auth.uid()
    ));

-- Verificar se a tabela foi criada
SELECT 'Tabela pagamentos_parciais criada com sucesso!' as status;

