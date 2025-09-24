-- =====================================================
-- CONFIGURAR FILIAIS PARA PRODUÇÃO
-- =====================================================
-- Execute este script no Supabase SQL Editor

-- 1. CRIAR FILIAIS REAIS
INSERT INTO companies (id, name, email, phone, address, created_at)
VALUES 
  (gen_random_uuid(), 'Matriz - São Paulo', 'matriz@empresa.com', '(11) 99999-9999', 'Av. Paulista, 1000 - São Paulo/SP', NOW()),
  (gen_random_uuid(), 'Filial - Rio de Janeiro', 'rj@empresa.com', '(21) 88888-8888', 'Av. Copacabana, 500 - Rio de Janeiro/RJ', NOW()),
  (gen_random_uuid(), 'Filial - Belo Horizonte', 'bh@empresa.com', '(31) 77777-7777', 'Av. Afonso Pena, 2000 - Belo Horizonte/MG', NOW()),
  (gen_random_uuid(), 'Filial - Brasília', 'bsb@empresa.com', '(61) 66666-6666', 'Esplanada dos Ministérios, 100 - Brasília/DF', NOW()),
  (gen_random_uuid(), 'Filial - Salvador', 'salvador@empresa.com', '(71) 55555-5555', 'Av. Oceânica, 200 - Salvador/BA', NOW());

-- 2. VERIFICAR FILIAIS CRIADAS
SELECT 
  'FILIAIS CRIADAS:' as info,
  id,
  name,
  email,
  phone,
  address
FROM companies 
ORDER BY created_at;

-- 3. CRIAR CONTAS PADRÃO PARA CADA FILIAL
DO $$
DECLARE
    filial RECORD;
BEGIN
    FOR filial IN SELECT id, name FROM companies LOOP
        -- Criar contas padrão para cada filial
        INSERT INTO financial_accounts (company_id, name, type, balance, description, active)
        VALUES 
            (filial.id, 'Caixa Principal', 'caixa', 0.00, 'Caixa principal da ' || filial.name, true),
            (filial.id, 'Conta Corrente', 'banco', 0.00, 'Conta corrente da ' || filial.name, true),
            (filial.id, 'Reserva de Emergência', 'caixa', 0.00, 'Reserva de emergência da ' || filial.name, true);
        
        RAISE NOTICE 'Contas criadas para: %', filial.name;
    END LOOP;
END $$;

-- 4. VERIFICAR CONTAS CRIADAS
SELECT 
  'CONTAS CRIADAS POR FILIAL:' as info,
  c.name as filial,
  COUNT(fa.id) as total_contas,
  SUM(fa.balance) as saldo_total
FROM companies c
LEFT JOIN financial_accounts fa ON c.id = fa.company_id
GROUP BY c.id, c.name
ORDER BY c.created_at;

-- 5. CRIAR TABELA DE USUÁRIOS POR FILIAL
CREATE TABLE IF NOT EXISTS user_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  company_id TEXT NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT user_companies_company_id_fkey 
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 6. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_user_companies_user_id ON user_companies(user_id);
CREATE INDEX IF NOT EXISTS idx_user_companies_company_id ON user_companies(company_id);

-- 7. CRIAR POLÍTICAS RLS POR FILIAL
DROP POLICY IF EXISTS "Users can only access their company accounts" ON financial_accounts;
CREATE POLICY "Users can only access their company accounts" 
ON financial_accounts 
FOR ALL 
USING (
  company_id IN (
    SELECT company_id 
    FROM user_companies 
    WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can only access their company transactions" ON financial_transactions;
CREATE POLICY "Users can only access their company transactions" 
ON financial_transactions 
FOR ALL 
USING (
  company_id IN (
    SELECT company_id 
    FROM user_companies 
    WHERE user_id = auth.uid()
  )
);

-- 8. VERIFICAR CONFIGURAÇÃO FINAL
SELECT 
  '✅ CONFIGURAÇÃO DE FILIAIS CONCLUÍDA!' as status,
  (SELECT COUNT(*) FROM companies) as total_filiais,
  (SELECT COUNT(*) FROM financial_accounts) as total_contas,
  (SELECT COUNT(*) FROM user_companies) as usuarios_vinculados;

SELECT '🎉 SISTEMA PRONTO PARA PRODUÇÃO!' as status_final;
