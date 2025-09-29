-- Criar perfil automaticamente para o usuário atual
-- Execute este script no Supabase SQL Editor

-- 1. Verificar usuários autenticados recentemente
SELECT 
    'Usuários disponíveis:' as info,
    u.id,
    u.email,
    u.created_at,
    CASE 
        WHEN p.id IS NULL THEN 'PRECISA DE PERFIL' 
        ELSE 'JÁ TEM PERFIL' 
    END as status_perfil
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE u.created_at > NOW() - INTERVAL '7 days'
ORDER BY u.created_at DESC;

-- 2. Criar perfil para o usuário mais recente (se não tiver perfil)
WITH recent_user AS (
    SELECT u.id, u.email
    FROM auth.users u
    LEFT JOIN public.profiles p ON u.id = p.user_id
    WHERE u.created_at > NOW() - INTERVAL '7 days'
    AND p.id IS NULL
    ORDER BY u.created_at DESC
    LIMIT 1
)
INSERT INTO public.profiles (user_id, company_id, full_name, email, role)
SELECT 
    ru.id,
    '00000000-0000-0000-0000-000000000001',
    COALESCE(ru.email, 'Usuário'),
    ru.email,
    'admin'
FROM recent_user ru
ON CONFLICT (user_id) DO UPDATE SET
    company_id = EXCLUDED.company_id,
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    role = EXCLUDED.role;

-- 3. Verificar se o perfil foi criado
SELECT 
    'Perfil criado:' as info,
    p.user_id,
    p.full_name,
    p.email,
    p.role,
    c.name as empresa
FROM public.profiles p
JOIN public.companies c ON p.company_id = c.id
WHERE p.company_id = '00000000-0000-0000-0000-000000000001'
ORDER BY p.created_at DESC
LIMIT 1;






