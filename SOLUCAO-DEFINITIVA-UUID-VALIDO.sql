-- =====================================================
-- SOLUÇÃO DEFINITIVA COM UUID VÁLIDO
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

-- 3. INSERIR A EMPRESA PRINCIPAL COM UUID VÁLIDO
INSERT INTO companies (id, name, email, phone, address)
VALUES (
  gen_random_uuid(),
  'Empresa Principal',
  'contato@empresa.com',
  '(11) 99999-9999',
  'Endereço da Empresa'
);

-- 4. OBTER O ID DA EMPRESA CRIADA
DO $$
DECLARE
    empresa_id UUID;
BEGIN
    -- Buscar o ID da empresa que acabamos de criar
    SELECT id INTO empresa_id FROM companies WHERE name = 'Empresa Principal' LIMIT 1;
    
    -- Criar tabela financial_accounts
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

    -- Criar índices para performance
    CREATE INDEX idx_financial_accounts_company_id ON financial_accounts(company_id);
    CREATE INDEX idx_financial_accounts_active ON financial_accounts(active);
    CREATE INDEX idx_financial_accounts_type ON financial_accounts(type);

    -- Habilitar RLS (Row Level Security)
    ALTER TABLE financial_accounts ENABLE ROW LEVEL SECURITY;
    ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

    -- Criar políticas RLS
    EXECUTE 'CREATE POLICY "Users can access financial_accounts for their company" 
    ON financial_accounts FOR ALL 
    USING (company_id = ''' || empresa_id || '''::uuid)';

    CREATE POLICY "Users can access companies" 
    ON companies FOR ALL 
    USING (true);

    -- Criar chave estrangeira
    ALTER TABLE financial_accounts 
    ADD CONSTRAINT financial_accounts_company_id_fkey 
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

    -- Criar restrição de tipo correta
    ALTER TABLE financial_accounts 
    ADD CONSTRAINT financial_accounts_type_check 
    CHECK (type IN ('caixa', 'banco', 'investimento', 'outros'));

    -- Criar trigger para updated_at
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

    -- Inserir contas de exemplo
    INSERT INTO financial_accounts (company_id, name, type, balance, description, active)
    VALUES 
      (empresa_id, 'Caixa Principal', 'caixa', 15000.00, 'Caixa principal da empresa', true),
      (empresa_id, 'Conta Corrente BB', 'banco', 45000.00, 'Conta corrente principal', true),
      (empresa_id, 'Caixa de Emergência', 'caixa', 10000.00, 'Reserva de emergência', true),
      (empresa_id, 'Poupança', 'investimento', 25000.00, 'Investimentos de longo prazo', true);

    -- Testar inserção
    INSERT INTO financial_accounts (company_id, name, type, balance, description, active)
    VALUES (
      empresa_id,
      'Teste Final',
      'banco',
      1000.00,
      'Teste de funcionamento',
      true
    );

    -- Mostrar resultado
    RAISE NOTICE 'Sistema configurado com sucesso! ID da empresa: %', empresa_id;
END $$;

-- 5. VERIFICAR SE TUDO FUNCIONOU
SELECT 
  '✅ SISTEMA CONFIGURADO COM SUCESSO!' as status,
  c.id as empresa_id,
  c.name as empresa_nome,
  COUNT(fa.id) as total_contas_criadas
FROM companies c
LEFT JOIN financial_accounts fa ON fa.company_id = c.id
WHERE c.name = 'Empresa Principal'
GROUP BY c.id, c.name;

-- 6. MOSTRAR CONTAS CRIADAS
SELECT 
  'Contas criadas:' as info,
  fa.name,
  fa.type,
  fa.balance,
  fa.active,
  c.name as empresa
FROM financial_accounts fa
JOIN companies c ON c.id = fa.company_id
WHERE c.name = 'Empresa Principal'
ORDER BY fa.created_at;

-- 7. LIMPAR CONTA DE TESTE
DELETE FROM financial_accounts WHERE name = 'Teste Final';

SELECT '🎉 SISTEMA PRONTO PARA USO!' as status_final;

