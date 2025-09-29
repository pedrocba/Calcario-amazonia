-- ==============================================
-- CRIAR USUÁRIO ADMIN NO SISTEMA
-- ==============================================
-- Execute este script no Supabase SQL Editor

-- 1. Criar usuário admin na tabela auth.users (se não existir)
-- Nota: Em produção, isso seria feito através do painel de autenticação do Supabase
-- Aqui estamos criando apenas o perfil na tabela profiles

-- 2. Criar perfil para o usuário admin
INSERT INTO public.profiles (
    user_id,
    company_id,
    full_name,
    email,
    role
) VALUES (
    'admin-id',  -- ID do usuário admin
    '00000000-0000-0000-0000-000000000001',  -- Empresa padrão
    'Administrador',
    'admin@calcarioamazonia.com',
    'admin'
) ON CONFLICT (user_id) DO UPDATE SET
    company_id = EXCLUDED.company_id,
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    role = EXCLUDED.role;

-- 3. Criar perfil para o usuário super admin
INSERT INTO public.profiles (
    user_id,
    company_id,
    full_name,
    email,
    role
) VALUES (
    'super-admin-id',  -- ID do usuário super admin
    '00000000-0000-0000-0000-000000000001',  -- Empresa padrão
    'Super Administrador',
    'superadmin@calcarioamazonia.com',
    'super_admin'
) ON CONFLICT (user_id) DO UPDATE SET
    company_id = EXCLUDED.company_id,
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    role = EXCLUDED.role;

-- 4. Verificar se os perfis foram criados
SELECT 
    'Perfis de administração criados!' as status,
    user_id,
    full_name,
    email,
    role,
    company_id
FROM public.profiles 
WHERE user_id IN ('admin-id', 'super-admin-id');

-- 5. Verificar empresas disponíveis
SELECT 
    'Empresas disponíveis:' as info,
    id,
    name,
    code,
    type,
    active
FROM public.companies
ORDER BY created_at DESC;




