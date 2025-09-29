-- ==============================================
-- DIAGNÓSTICO COMPLETO DO PROBLEMA DE ISOLAMENTO
-- ==============================================
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se RLS está habilitado na tabela companies
SELECT 
    'RLS Status:' as info,
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'companies' 
AND schemaname = 'public';

-- 2. Verificar políticas RLS existentes
SELECT 
    'Políticas RLS:' as info,
    policyname, 
    cmd, 
    permissive,
    roles,
    qual
FROM pg_policies 
WHERE tablename = 'companies' 
AND schemaname = 'public'
ORDER BY policyname;

-- 3. Verificar estrutura da tabela companies
SELECT 
    'Estrutura da tabela:' as info,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'companies' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Verificar dados atuais na tabela companies
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

-- 5. Verificar se existem perfis de usuário
SELECT 
    'Perfis de usuário:' as info,
    id,
    email,
    role,
    company_id,
    created_at
FROM public.profiles
ORDER BY created_at;

-- 6. Verificar se a tabela auth.users tem dados
SELECT 
    'Usuários auth:' as info,
    id,
    email,
    created_at
FROM auth.users
ORDER BY created_at
LIMIT 5;

-- 7. Testar consulta sem RLS (como superuser)
SELECT 
    'Consulta sem RLS:' as info,
    COUNT(*) as total_empresas
FROM public.companies;

-- 8. Verificar se há dados duplicados
SELECT 
    'Empresas duplicadas:' as info,
    name,
    code,
    COUNT(*) as count
FROM public.companies
GROUP BY name, code
HAVING COUNT(*) > 1;



