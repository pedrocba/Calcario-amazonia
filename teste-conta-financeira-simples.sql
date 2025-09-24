-- Script de teste simples para verificar se conseguimos inserir uma conta
-- Execute este script no Supabase SQL Editor

-- Teste 1: Verificar se a tabela existe
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'financial_accounts') 
    THEN 'Tabela existe ✅' 
    ELSE 'Tabela NÃO existe ❌' 
  END as status_tabela;

-- Teste 2: Tentar inserir uma conta de teste
INSERT INTO financial_accounts (
  company_id,
  name,
  type,
  balance,
  description,
  active
) VALUES (
  '68cacb91-3d16-9d19-1be6-c90d000000000000',
  'Conta Teste',
  'caixa',
  1000.00,
  'Conta criada para teste',
  true
);

-- Teste 3: Verificar se a conta foi criada
SELECT 
  'Conta criada com sucesso!' as resultado,
  id,
  name,
  balance,
  created_at
FROM financial_accounts 
WHERE name = 'Conta Teste'
ORDER BY created_at DESC 
LIMIT 1;

