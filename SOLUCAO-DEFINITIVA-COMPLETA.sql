-- =====================================================
-- SOLUÇÃO DEFINITIVA E COMPLETA - EXECUTE UMA VEZ SÓ
-- =====================================================
-- Execute este script no Supabase SQL Editor

-- 1. REMOVER TODAS AS RESTRIÇÕES PROBLEMÁTICAS
ALTER TABLE financial_accounts DROP CONSTRAINT IF EXISTS financial_accounts_type_check;
ALTER TABLE financial_accounts DROP CONSTRAINT IF EXISTS financial_accounts_company_id_fkey;

-- 2. CRIAR TABELA COMPANIES COMPLETA
DROP TABLE IF EXISTS companies CASCADE;
CREATE TABLE companies (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. INSERIR A EMPRESA PRINCIPAL
INSERT INTO companies (id, name, email, phone, address)
VALUES (
  '68cacb91-3d16-9d19-1be6-c90d000000000000'::uuid,
  'Empresa Principal',
  'contato@empresa.com',
  '(11) 99999-9999',
  'Endereço da Empresa'
);

-- 4. RECRIAR TABELA FINANCIAL_ACCOUNTS COMPLETA
DROP TABLE IF EXISTS financial_accounts CASCADE;
CREATE TABLE financial_accounts (
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

-- 5. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX idx_financial_accounts_company_id ON financial_accounts(company_id);
CREATE INDEX idx_financial_accounts_active ON financial_accounts(active);
CREATE INDEX idx_financial_accounts_type ON financial_accounts(type);

-- 6. HABILITAR RLS (Row Level Security)
ALTER TABLE financial_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- 7. CRIAR POLÍTICAS RLS
CREATE POLICY "Users can access financial_accounts for their company" 
ON financial_accounts FOR ALL 
USING (company_id = '68cacb91-3d16-9d19-1be6-c90d000000000000'::uuid);

CREATE POLICY "Users can access companies" 
ON companies FOR ALL 
USING (true);

-- 8. CRIAR CHAVE ESTRANGEIRA
ALTER TABLE financial_accounts 
ADD CONSTRAINT financial_accounts_company_id_fkey 
FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

-- 9. CRIAR RESTRIÇÃO DE TIPO CORRETA
ALTER TABLE financial_accounts 
ADD CONSTRAINT financial_accounts_type_check 
CHECK (type IN ('caixa', 'banco', 'investimento', 'outros'));

-- 10. CRIAR TRIGGER PARA UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_financial_accounts_updated_at 
  BEFORE UPDATE ON financial_accounts 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at 
  BEFORE UPDATE ON companies 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 11. INSERIR CONTAS DE EXEMPLO
INSERT INTO financial_accounts (company_id, name, type, balance, description, active)
VALUES 
  ('68cacb91-3d16-9d19-1be6-c90d000000000000'::uuid, 'Caixa Principal', 'caixa', 15000.00, 'Caixa principal da empresa', true),
  ('68cacb91-3d16-9d19-1be6-c90d000000000000'::uuid, 'Conta Corrente BB', 'banco', 45000.00, 'Conta corrente principal', true),
  ('68cacb91-3d16-9d19-1be6-c90d000000000000'::uuid, 'Caixa de Emergência', 'caixa', 10000.00, 'Reserva de emergência', true),
  ('68cacb91-3d16-9d19-1be6-c90d000000000000'::uuid, 'Poupança', 'investimento', 25000.00, 'Investimentos de longo prazo', true);

-- 12. TESTAR INSERÇÃO
INSERT INTO financial_accounts (company_id, name, type, balance, description, active)
VALUES (
  '68cacb91-3d16-9d19-1be6-c90d000000000000'::uuid,
  'Teste Final',
  'banco',
  1000.00,
  'Teste de funcionamento',
  true
);

-- 13. VERIFICAR SE TUDO FUNCIONOU
SELECT 
  '✅ SISTEMA CONFIGURADO COM SUCESSO!' as status,
  COUNT(*) as total_contas_criadas
FROM financial_accounts 
WHERE company_id = '68cacb91-3d16-9d19-1be6-c90d000000000000'::uuid;

-- 14. LIMPAR CONTA DE TESTE
DELETE FROM financial_accounts WHERE name = 'Teste Final';

-- 15. MOSTRAR CONTAS CRIADAS
SELECT 
  'Contas criadas:' as info,
  name,
  type,
  balance,
  active
FROM financial_accounts 
WHERE company_id = '68cacb91-3d16-9d19-1be6-c90d000000000000'::uuid
ORDER BY created_at;

SELECT '🎉 SISTEMA PRONTO PARA USO!' as status_final;

