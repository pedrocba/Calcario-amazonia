-- ==============================================
-- DEBUG: VERIFICAR ISOLAMENTO DE EMPRESAS
-- ==============================================
-- Execute este script no Supabase SQL Editor

-- 1. Verificar estrutura da tabela companies
SELECT 
    'Estrutura da tabela companies:' as info,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'companies' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar se RLS está habilitado
SELECT 
    'RLS Status:' as info,
    schemaname, 
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE tablename = 'companies' 
AND schemaname = 'public';

-- 3. Verificar políticas RLS existentes
SELECT 
    'Políticas RLS:' as info,
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual 
FROM pg_policies 
WHERE tablename = 'companies' 
AND schemaname = 'public';

-- 4. Verificar dados atuais
SELECT 
    'Dados atuais:' as info,
    id,
    name,
    code,
    owner_company_id,
    parent_company_id,
    created_at
FROM public.companies
ORDER BY created_at;

-- 5. Verificar se há dados duplicados
SELECT 
    'Empresas duplicadas:' as info,
    name,
    code,
    COUNT(*) as count
FROM public.companies
GROUP BY name, code
HAVING COUNT(*) > 1;



