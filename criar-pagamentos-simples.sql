-- CRIAR TABELA PAGAMENTOS_PARCIAIS SIMPLES
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- Criar a tabela pagamentos_parciais
CREATE TABLE pagamentos_parciais (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    venda_id UUID NOT NULL,
    fatura_id UUID,
    cliente_id UUID NOT NULL,
    valor_pago DECIMAL(10,2) NOT NULL,
    data_pagamento TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    forma_pagamento VARCHAR(50) NOT NULL,
    observacoes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'confirmado',
    company_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verificar se a tabela foi criada
SELECT 'Tabela pagamentos_parciais criada!' as resultado;

