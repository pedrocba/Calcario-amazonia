-- =====================================================
-- SOLUÇÃO FINAL - TRABALHANDO COM ESTRUTURA EXISTENTE
-- =====================================================
-- Execute este script no Supabase SQL Editor

-- 1. PRIMEIRO, VAMOS VER A ESTRUTURA DA TABELA COMPANIES
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'companies'
ORDER BY ordinal_position;

-- 2. INSERIR EMPRESA PRINCIPAL COM TODOS OS CAMPOS OBRIGATÓRIOS
INSERT INTO companies (name, code, created_at, updated_at)
VALUES (
  'Empresa Principal',
  'EMP001',
  NOW(),
  NOW()
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  updated_at = NOW();

-- 3. OBTER O ID DA EMPRESA CRIADA
DO $$
DECLARE
    empresa_id UUID;
BEGIN
    -- Buscar o ID da empresa
    SELECT id INTO empresa_id FROM companies WHERE code = 'EMP001' LIMIT 1;
    
    -- Criar tabela financial_accounts se não existir
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

    -- Remover restrições problemáticas se existirem
    ALTER TABLE financial_accounts DROP CONSTRAINT IF EXISTS financial_accounts_type_check;
    ALTER TABLE financial_accounts DROP CONSTRAINT IF EXISTS financial_accounts_company_id_fkey;

    -- Criar chave estrangeira
    ALTER TABLE financial_accounts 
    ADD CONSTRAINT financial_accounts_company_id_fkey 
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

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
  COUNT(fa.id) as total_contas
FROM companies c
LEFT JOIN financial_accounts fa ON fa.company_id = c.id
WHERE c.code = 'EMP001'
GROUP BY c.id, c.name, c.code;

-- 5. MOSTRAR CONTAS CRIADAS
SELECT 
  'Contas criadas:' as info,
  fa.name,
  fa.type,
  fa.balance,
  fa.active
FROM financial_accounts fa
JOIN companies c ON c.id = fa.company_id
WHERE c.code = 'EMP001'
ORDER BY fa.created_at;

SELECT '🎉 PRONTO PARA USO!' as final;

