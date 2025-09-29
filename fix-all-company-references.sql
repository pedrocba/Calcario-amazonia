-- ==============================================
-- CORREÇÃO COMPLETA DE REFERÊNCIAS À TABELA COMPANIES
-- ==============================================
-- Execute este script no Supabase SQL Editor

-- 1. Primeiro, vamos verificar todas as tabelas que referenciam companies
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

-- 2. Remover todas as constraints de foreign key que referenciam companies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tc.constraint_name, tc.table_name
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND ccu.table_name = 'companies'
    ) LOOP
        EXECUTE 'ALTER TABLE public.' || r.table_name || ' DROP CONSTRAINT IF EXISTS ' || r.constraint_name;
    END LOOP;
END $$;

-- 3. Converter todas as colunas company_id para UUID
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT table_name, column_name
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND column_name = 'company_id'
        AND data_type = 'text'
    ) LOOP
        EXECUTE 'ALTER TABLE public.' || r.table_name || ' ALTER COLUMN ' || r.column_name || ' SET DATA TYPE UUID USING ' || r.column_name || '::UUID';
    END LOOP;
END $$;

-- 4. Recriar as constraints de foreign key
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tc.table_name, kcu.column_name
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND ccu.table_name = 'companies'
        AND ccu.column_name = 'id'
    ) LOOP
        EXECUTE 'ALTER TABLE public.' || r.table_name || ' ADD CONSTRAINT ' || r.table_name || '_company_id_fkey FOREIGN KEY (' || r.column_name || ') REFERENCES public.companies(id)';
    END LOOP;
END $$;

-- 5. Verificar resultado
SELECT 
    'Tabelas corrigidas:' as status,
    table_name, 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND column_name = 'company_id'
ORDER BY table_name;



