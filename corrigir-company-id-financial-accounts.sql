-- Script para corrigir o problema de company_id na tabela financial_accounts
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se existe uma tabela de empresas/companies
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND (table_name LIKE '%company%' OR table_name LIKE '%empresa%')
ORDER BY table_name;

-- 2. Verificar se existe o company_id que estamos usando
SELECT 
  'Verificando company_id: 68cacb91-3d16-9d19-1be6-c90d000000000000' as status,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'companies' AND table_schema = 'public'
    ) THEN 'Tabela companies existe'
    ELSE 'Tabela companies NÃO existe'
  END as tabela_companies;

-- 3. Se a tabela companies existir, verificar se o ID existe
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'companies' AND table_schema = 'public'
  ) THEN
    -- Verificar se o company_id existe na tabela companies
    IF NOT EXISTS (
      SELECT 1 FROM companies 
      WHERE id = '68cacb91-3d16-9d19-1be6-c90d000000000000'::uuid
    ) THEN
      -- Inserir o company_id se não existir
      INSERT INTO companies (id, name, created_at, updated_at)
      VALUES (
        '68cacb91-3d16-9d19-1be6-c90d000000000000'::uuid,
        'Empresa Principal',
        NOW(),
        NOW()
      );
      RAISE NOTICE 'Company_id inserido com sucesso!';
    ELSE
      RAISE NOTICE 'Company_id já existe!';
    END IF;
  ELSE
    RAISE NOTICE 'Tabela companies não existe - criando tabela básica...';
    
    -- Criar tabela companies básica
    CREATE TABLE IF NOT EXISTS companies (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Inserir o company_id
    INSERT INTO companies (id, name)
    VALUES (
      '68cacb91-3d16-9d19-1be6-c90d000000000000'::uuid,
      'Empresa Principal'
    );
    
    RAISE NOTICE 'Tabela companies criada e company_id inserido!';
  END IF;
END $$;

-- 4. Verificar se o company_id agora existe
SELECT 
  'Company_id verificado:' as status,
  id,
  name,
  created_at
FROM companies 
WHERE id = '68cacb91-3d16-9d19-1be6-c90d000000000000'::uuid;

-- 5. Testar inserção na financial_accounts
INSERT INTO financial_accounts (
  company_id,
  name,
  type,
  balance,
  description,
  active
) VALUES (
  '68cacb91-3d16-9d19-1be6-c90d000000000000'::uuid,
  'Teste Conta Corrigida',
  'banco',
  1000.00,
  'Teste após correção do company_id',
  true
);

-- 6. Verificar se a conta foi criada
SELECT 
  'Conta criada com sucesso!' as resultado,
  id,
  name,
  type,
  balance,
  company_id
FROM financial_accounts 
WHERE name = 'Teste Conta Corrigida'
ORDER BY created_at DESC 
LIMIT 1;

