-- =====================================================
-- SOLUÇÃO SIMPLES - ATUALIZAR EMPRESA EXISTENTE
-- =====================================================
-- Execute este script no Supabase SQL Editor

-- 1. ATUALIZAR A EMPRESA EXISTENTE COM OS CAMPOS OBRIGATÓRIOS
UPDATE companies 
SET 
  name = 'Empresa Principal',
  code = 'EMP001',
  type = 'empresa',
  updated_at = NOW()
WHERE id = 'd4e26386-fc32-472d-ac2a-deddc3efce27';

-- 2. SE NÃO EXISTIR, INSERIR
INSERT INTO companies (id, name, code, type, created_at, updated_at)
VALUES (
  'd4e26386-fc32-472d-ac2a-deddc3efce27',
  'Empresa Principal',
  'EMP001',
  'empresa',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  code = EXCLUDED.code,
  type = EXCLUDED.type,
  updated_at = NOW();

-- 3. CONFIGURAR FINANCIAL_ACCOUNTS
DO $$
DECLARE
    empresa_id UUID := 'd4e26386-fc32-472d-ac2a-deddc3efce27';
BEGIN
    -- Criar tabela financial_accounts
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

    -- Remover restrições problemáticas
    ALTER TABLE financial_accounts DROP CONSTRAINT IF EXISTS financial_accounts_type_check;
    ALTER TABLE financial_accounts DROP CONSTRAINT IF EXISTS financial_accounts_company_id_fkey;

    -- Criar chave estrangeira
    ALTER TABLE financial_accounts 
    ADD CONSTRAINT financial_accounts_company_id_fkey 
    FOREIGN KEY (company_id) REFERENCES companies(id);

    -- Criar restrição de tipo
    ALTER TABLE financial_accounts 
    ADD CONSTRAINT financial_accounts_type_check 
    CHECK (type IN ('caixa', 'banco', 'investimento', 'outros'));

    -- Inserir contas de exemplo
    INSERT INTO financial_accounts (company_id, name, type, balance, description, active)
    VALUES 
      (empresa_id, 'Caixa Principal', 'caixa', 15000.00, 'Caixa principal da empresa', true),
      (empresa_id, 'Conta Corrente BB', 'banco', 45000.00, 'Conta corrente principal', true),
      (empresa_id, 'Caixa de Emergência', 'caixa', 10000.00, 'Reserva de emergência', true),
      (empresa_id, 'Poupança', 'investimento', 25000.00, 'Investimentos de longo prazo', true);

    RAISE NOTICE 'Sistema configurado! ID da empresa: %', empresa_id;
END $$;

-- 4. VERIFICAR RESULTADO
SELECT 
  '✅ SISTEMA CONFIGURADO!' as status,
  c.id as empresa_id,
  c.name as empresa_nome,
  c.code as empresa_codigo,
  c.type as empresa_tipo,
  COUNT(fa.id) as total_contas
FROM companies c
LEFT JOIN financial_accounts fa ON fa.company_id = c.id
WHERE c.id = 'd4e26386-fc32-472d-ac2a-deddc3efce27'
GROUP BY c.id, c.name, c.code, c.type;

SELECT '🎉 PRONTO PARA USO!' as final;

