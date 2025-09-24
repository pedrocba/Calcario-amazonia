-- Script para corrigir a restrição de tipo na tabela financial_accounts
-- Execute este script no Supabase SQL Editor

-- 1. Primeiro, vamos verificar a restrição atual
SELECT
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM
    pg_constraint
WHERE
    conrelid = 'public.financial_accounts'::regclass
    AND conname = 'financial_accounts_type_check';

-- 2. Remover a restrição atual (se existir)
ALTER TABLE financial_accounts DROP CONSTRAINT IF EXISTS financial_accounts_type_check;

-- 3. Criar nova restrição que permite os tipos corretos
ALTER TABLE financial_accounts 
ADD CONSTRAINT financial_accounts_type_check 
CHECK (type IN ('caixa', 'banco', 'investimento', 'outros'));

-- 4. Verificar se a restrição foi criada corretamente
SELECT
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM
    pg_constraint
WHERE
    conrelid = 'public.financial_accounts'::regclass
    AND conname = 'financial_accounts_type_check';

-- 5. Testar inserção com o tipo 'banco'
INSERT INTO financial_accounts (
  company_id,
  name,
  type,
  balance,
  description,
  active
) VALUES (
  '68cacb91-3d16-9d19-1be6-c90d000000000000',
  'Teste Conta Bancária',
  'banco',
  1000.00,
  'Teste para verificar se o tipo banco funciona',
  true
);

-- 6. Verificar se a conta foi criada
SELECT 
  'Conta criada com sucesso!' as resultado,
  id,
  name,
  type,
  balance,
  created_at
FROM financial_accounts 
WHERE name = 'Teste Conta Bancária'
ORDER BY created_at DESC 
LIMIT 1;

