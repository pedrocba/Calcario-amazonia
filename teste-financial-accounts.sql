-- TESTE SIMPLES - CRIAR TABELA FINANCIAL_ACCOUNTS
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. Criar tabela financial_accounts
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

-- 2. Habilitar RLS
ALTER TABLE public.financial_accounts ENABLE ROW LEVEL SECURITY;

-- 3. Criar política simples
CREATE POLICY "Allow all" ON public.financial_accounts
    FOR ALL USING (true);

-- 4. Inserir contas de teste
INSERT INTO public.financial_accounts (name, type, balance, company_id, active) VALUES 
  ('Caixa Principal', 'caixa', 50000.00, '68cacb91-3d16-9d19-1be6-c90d0a7b8c1f', true),
  ('Conta Corrente', 'conta_corrente', 25000.00, '68cacb91-3d16-9d19-1be6-c90d0a7b8c1f', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Verificar se inseriu
SELECT * FROM public.financial_accounts;

-- Mensagem final
SELECT 'Tabela financial_accounts criada!' AS resultado;

