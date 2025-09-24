-- SOLUÇÃO DEFINITIVA para o problema de company_id
-- Execute este script no Supabase SQL Editor

-- 1. Primeiro, vamos verificar se existe alguma tabela de empresas
SELECT 
  'Verificando tabelas existentes...' as status,
  table_name
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND (table_name LIKE '%company%' OR table_name LIKE '%empresa%' OR table_name LIKE '%filial%')
ORDER BY table_name;

-- 2. Criar tabela companies se não existir
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Inserir o company_id que estamos usando (com tratamento de conflito)
INSERT INTO companies (id, name, created_at, updated_at)
VALUES (
  '68cacb91-3d16-9d19-1be6-c90d000000000000'::uuid,
  'Empresa Principal',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  updated_at = NOW();

-- 4. Verificar se o company_id foi criado/atualizado
SELECT 
  'Company_id verificado:' as status,
  id,
  name,
  created_at
FROM companies 
WHERE id = '68cacb91-3d16-9d19-1be6-c90d000000000000'::uuid;

-- 5. Verificar se a tabela financial_accounts tem a chave estrangeira correta
SELECT 
  'Verificando chave estrangeira...' as status,
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.financial_accounts'::regclass
  AND conname LIKE '%company_id%';

-- 6. Se a chave estrangeira não existir, criar uma
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.financial_accounts'::regclass
      AND conname LIKE '%company_id%'
  ) THEN
    ALTER TABLE financial_accounts 
    ADD CONSTRAINT financial_accounts_company_id_fkey 
    FOREIGN KEY (company_id) REFERENCES companies(id);
    RAISE NOTICE 'Chave estrangeira criada com sucesso!';
  ELSE
    RAISE NOTICE 'Chave estrangeira já existe!';
  END IF;
END $$;

-- 7. Testar inserção na financial_accounts
INSERT INTO financial_accounts (
  company_id,
  name,
  type,
  balance,
  description,
  active
) VALUES (
  '68cacb91-3d16-9d19-1be6-c90d000000000000'::uuid,
  'Teste Conta Final',
  'banco',
  1000.00,
  'Teste após correção completa',
  true
);

-- 8. Verificar se a conta foi criada
SELECT 
  'SUCESSO! Conta criada:' as resultado,
  id,
  name,
  type,
  balance,
  company_id
FROM financial_accounts 
WHERE name = 'Teste Conta Final'
ORDER BY created_at DESC 
LIMIT 1;

-- 9. Limpar conta de teste
DELETE FROM financial_accounts WHERE name = 'Teste Conta Final';

SELECT 'Sistema pronto para uso!' as status_final;

