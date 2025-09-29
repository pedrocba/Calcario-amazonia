-- SOLUÇÃO SIMPLES - Execute no Supabase SQL Editor

-- Criar empresa padrão
INSERT INTO public.companies (id, name, code, full_name, type, active) 
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Empresa Padrão',
    'DEFAULT001',
    'Empresa Padrão Ltda',
    'matriz',
    true
) ON CONFLICT (id) DO NOTHING;

-- Ver usuários que precisam de perfil
SELECT 
    u.id as user_id,
    u.email,
    CASE 
        WHEN p.id IS NULL THEN 'PRECISA DE PERFIL' 
        ELSE 'JÁ TEM PERFIL' 
    END as status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
ORDER BY u.created_at DESC
LIMIT 10;






