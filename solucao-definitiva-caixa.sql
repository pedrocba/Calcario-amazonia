-- SOLUÇÃO DEFINITIVA - CRIAR TABELAS CORRETAS
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. Dropar todas as tabelas relacionadas
DROP TABLE IF EXISTS public.operacoes_caixa CASCADE;
DROP TABLE IF EXISTS public.sessoes_caixa CASCADE;

-- 2. Criar tabela sessoes_caixa (nome original)
CREATE TABLE public.sessoes_caixa (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL,
    data_abertura DATE NOT NULL,
    hora_abertura TIMESTAMP WITH TIME ZONE NOT NULL,
    data_fechamento DATE,
    hora_fechamento TIMESTAMP WITH TIME ZONE,
    saldo_inicial DECIMAL(15,2) DEFAULT 0,
    saldo_final DECIMAL(15,2),
    total_entradas DECIMAL(15,2) DEFAULT 0,
    total_saidas DECIMAL(15,2) DEFAULT 0,
    observacoes_abertura TEXT,
    observacoes_fechamento TEXT,
    status VARCHAR(20) DEFAULT 'aberta' CHECK (status IN ('aberta', 'fechada')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar índices
CREATE INDEX idx_sessoes_caixa_company_id ON public.sessoes_caixa(company_id);
CREATE INDEX idx_sessoes_caixa_data_abertura ON public.sessoes_caixa(data_abertura);
CREATE INDEX idx_sessoes_caixa_status ON public.sessoes_caixa(status);

-- 4. Habilitar RLS
ALTER TABLE public.sessoes_caixa ENABLE ROW LEVEL SECURITY;

-- 5. Criar política RLS
CREATE POLICY "Allow all operations" ON public.sessoes_caixa
    FOR ALL USING (true);

-- 6. Criar tabela financial_accounts se não existir
CREATE TABLE IF NOT EXISTS public.financial_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0,
    company_id UUID NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Habilitar RLS para financial_accounts
ALTER TABLE public.financial_accounts ENABLE ROW LEVEL SECURITY;

-- 8. Criar política RLS para financial_accounts
CREATE POLICY "Allow all operations" ON public.financial_accounts
    FOR ALL USING (true);

-- 9. Inserir contas de teste
INSERT INTO public.financial_accounts (name, type, balance, company_id, active) VALUES 
  ('Caixa Principal', 'caixa', 50000.00, '68cacb91-3d16-9d19-1be6-c90d0a7b8c1f', true),
  ('Conta Corrente - Banco do Brasil', 'conta_corrente', 25000.00, '68cacb91-3d16-9d19-1be6-c90d0a7b8c1f', true),
  ('Poupança', 'poupanca', 15000.00, '68cacb91-3d16-9d19-1be6-c90d0a7b8c1f', true),
  ('Caixa Pequeno', 'caixa', 5000.00, '68cacb91-3d16-9d19-1be6-c90d0a7b8c1f', true),
  ('Cartão de Crédito', 'cartao_credito', -2000.00, '68cacb91-3d16-9d19-1be6-c90d0a7b8c1f', true)
ON CONFLICT (id) DO NOTHING;

-- 10. Testar inserção na sessoes_caixa
INSERT INTO public.sessoes_caixa (
    company_id,
    data_abertura,
    hora_abertura,
    saldo_inicial,
    observacoes_abertura,
    status
) VALUES (
    '68cacb91-3d16-9d19-1be6-c90d0a7b8c1f',
    CURRENT_DATE,
    NOW(),
    0.00,
    'Teste de criação da tabela',
    'aberta'
);

-- 11. Verificar se funcionou
SELECT 'Tabelas criadas com sucesso!' AS status;
SELECT * FROM public.sessoes_caixa;
SELECT * FROM public.financial_accounts;

