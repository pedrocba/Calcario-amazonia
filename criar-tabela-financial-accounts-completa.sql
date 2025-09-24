-- Script para criar a tabela financial_accounts com estrutura completa
-- Execute este script no Supabase SQL Editor

-- 1. Criar tabela financial_accounts
CREATE TABLE IF NOT EXISTS financial_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'caixa',
  balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_financial_accounts_company_id ON financial_accounts(company_id);
CREATE INDEX IF NOT EXISTS idx_financial_accounts_active ON financial_accounts(active);
CREATE INDEX IF NOT EXISTS idx_financial_accounts_type ON financial_accounts(type);

-- 3. Habilitar RLS (Row Level Security)
ALTER TABLE financial_accounts ENABLE ROW LEVEL SECURITY;

-- 4. Criar política RLS para permitir acesso baseado em company_id
CREATE POLICY IF NOT EXISTS "Users can access financial_accounts for their company" 
ON financial_accounts FOR ALL 
USING (company_id = '68cacb91-3d16-9d19-1be6-c90d000000000000'::uuid);

-- 5. Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER IF NOT EXISTS update_financial_accounts_updated_at 
  BEFORE UPDATE ON financial_accounts 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 6. Inserir contas de exemplo
INSERT INTO financial_accounts (
  company_id,
  name,
  type,
  balance,
  description,
  active
) VALUES 
(
  '68cacb91-3d16-9d19-1be6-c90d000000000000',
  'Caixa Principal',
  'caixa',
  15000.00,
  'Caixa principal da empresa para operações diárias',
  true
),
(
  '68cacb91-3d16-9d19-1be6-c90d000000000000',
  'Conta Corrente - Banco do Brasil',
  'banco',
  45000.00,
  'Conta corrente principal para recebimentos e pagamentos',
  true
),
(
  '68cacb91-3d16-9d19-1be6-c90d000000000000',
  'Caixa de Emergência',
  'caixa',
  10000.00,
  'Reserva de emergência para situações imprevistas',
  true
);

-- 7. Verificar se a tabela foi criada corretamente
SELECT 
  'Tabela criada com sucesso!' as status,
  COUNT(*) as total_contas
FROM financial_accounts 
WHERE company_id = '68cacb91-3d16-9d19-1be6-c90d000000000000';

