-- CRIAR TABELA FINANCIAL_ACCOUNTS
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
CREATE POLICY "Allow all operations" ON public.financial_accounts
    FOR ALL USING (true);

-- 4. Inserir contas de teste
INSERT INTO public.financial_accounts (name, type, balance, company_id, active) VALUES 
  ('Caixa Principal', 'caixa', 50000.00, '68cacb91-3d16-9d19-1be6-c90d0a7b8c1f', true),
  ('Conta Corrente - Banco do Brasil', 'conta_corrente', 25000.00, '68cacb91-3d16-9d19-1be6-c90d0a7b8c1f', true),
  ('Poupança', 'poupanca', 15000.00, '68cacb91-3d16-9d19-1be6-c90d0a7b8c1f', true),
  ('Caixa Pequeno', 'caixa', 5000.00, '68cacb91-3d16-9d19-1be6-c90d0a7b8c1f', true),
  ('Cartão de Crédito', 'cartao_credito', -2000.00, '68cacb91-3d16-9d19-1be6-c90d0a7b8c1f', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Verificar se funcionou
SELECT * FROM public.financial_accounts;

-- Mensagem de sucesso
SELECT 'Tabela financial_accounts criada com sucesso!' AS status;

