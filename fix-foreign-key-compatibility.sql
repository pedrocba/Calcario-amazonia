-- ==============================================
-- CORREÇÃO DE COMPATIBILIDADE DE TIPOS
-- ==============================================
-- Execute este script no Supabase SQL Editor

-- 1. Primeiro, vamos verificar os tipos atuais
SELECT 
    table_name, 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name IN ('companies', 'financial_accounts') 
AND column_name IN ('id', 'company_id')
ORDER BY table_name, column_name;

-- 2. Remover a constraint de foreign key existente (se existir)
ALTER TABLE public.financial_accounts 
DROP CONSTRAINT IF EXISTS financial_accounts_company_id_fkey;

-- 3. Converter company_id em financial_accounts para UUID
ALTER TABLE public.financial_accounts 
ALTER COLUMN company_id SET DATA TYPE UUID USING company_id::UUID;

-- 4. Recriar a constraint de foreign key
ALTER TABLE public.financial_accounts 
ADD CONSTRAINT financial_accounts_company_id_fkey 
FOREIGN KEY (company_id) REFERENCES public.companies(id);

-- 5. Verificar se há outras tabelas com o mesmo problema
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND ccu.table_name = 'companies';



