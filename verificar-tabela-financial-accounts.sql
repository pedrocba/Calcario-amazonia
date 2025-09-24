-- Script para verificar se a tabela financial_accounts existe e tem a estrutura correta
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a tabela existe
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'financial_accounts';

-- 2. Verificar estrutura da tabela
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'financial_accounts'
ORDER BY ordinal_position;

-- 3. Verificar se há dados na tabela
SELECT COUNT(*) as total_records FROM financial_accounts;

-- 4. Verificar dados existentes (se houver)
SELECT 
  id,
  company_id,
  name,
  type,
  balance,
  description,
  active,
  created_at
FROM financial_accounts 
ORDER BY created_at DESC 
LIMIT 5;

