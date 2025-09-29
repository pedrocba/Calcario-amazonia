-- ==============================================
-- TESTE DE ISOLAMENTO DE EMPRESAS
-- ==============================================
-- Execute este script no Supabase SQL Editor

-- 1. Simular um usuário da CBA (company_id = '68cacb913d169d191be6c90d')
-- Primeiro, vamos verificar se existe um perfil de teste
SELECT 
    'Perfis existentes:' as info,
    id,
    email,
    role,
    company_id
FROM public.profiles
ORDER BY created_at;

-- 2. Criar um perfil de teste para CBA se não existir
INSERT INTO public.profiles (
    id, email, full_name, role, company_id, status
)
SELECT 
    'test-cba-user'::uuid,
    'teste@cba.com',
    'Usuário Teste CBA',
    'admin',
    '68cacb913d169d191be6c90d',
    'ativo'
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE email = 'teste@cba.com'
);

-- 3. Testar a política RLS simulando o usuário CBA
-- (Isso simula o que acontece quando um usuário da CBA faz login)
SET LOCAL "request.jwt.claims" = '{"sub": "test-cba-user", "role": "authenticated"}';

-- 4. Verificar quais empresas o usuário CBA pode ver
SELECT 
    'Empresas visíveis para usuário CBA:' as info,
    id,
    name,
    code,
    owner_company_id,
    parent_company_id
FROM public.companies
ORDER BY created_at;

-- 5. Resetar o contexto
RESET "request.jwt.claims";

-- 6. Verificar todas as empresas (sem filtro de usuário)
SELECT 
    'Todas as empresas (sem filtro):' as info,
    id,
    name,
    code,
    owner_company_id,
    parent_company_id
FROM public.companies
ORDER BY created_at;



