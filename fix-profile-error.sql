-- ==============================================
-- CORREÇÃO COMPLETA - ERRO DE PERFIL/FILIAL
-- ==============================================
-- Execute este script no Supabase SQL Editor

-- 1. Criar tabela companies se não existir
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    full_name TEXT,
    type TEXT DEFAULT 'matriz',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar tabela profiles se não existir
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar empresa padrão
INSERT INTO public.companies (id, name, code, full_name, type, active) 
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Empresa Padrão',
    'DEFAULT001',
    'Empresa Padrão Ltda',
    'matriz',
    true
) ON CONFLICT (id) DO NOTHING;

-- 4. Verificar se existem usuários autenticados
SELECT 
    'Usuários autenticados:' as info,
    count(*) as total_usuarios
FROM auth.users 
WHERE created_at > NOW() - INTERVAL '30 days';

-- 5. Listar usuários para identificar qual precisa de perfil
SELECT 
    'Usuários que precisam de perfil:' as info,
    u.id,
    u.email,
    u.created_at,
    CASE 
        WHEN p.id IS NULL THEN '❌ SEM PERFIL' 
        ELSE '✅ COM PERFIL' 
    END as status_perfil
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE u.created_at > NOW() - INTERVAL '30 days'
ORDER BY u.created_at DESC;

-- 6. Criar perfil para usuários sem perfil
-- NOTA: Substitua 'SEU_USER_ID_AQUI' pelo ID real do usuário
-- Você pode copiar o ID da consulta acima

-- Exemplo de como criar perfil (substitua o user_id):
/*
INSERT INTO public.profiles (user_id, company_id, full_name, email, role)
VALUES (
    'SEU_USER_ID_AQUI',  -- Substitua pelo ID real do usuário
    '00000000-0000-0000-0000-000000000001',
    'Nome do Usuário',
    'email@exemplo.com',
    'admin'
) ON CONFLICT (user_id) DO UPDATE SET
    company_id = EXCLUDED.company_id,
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    role = EXCLUDED.role;
*/

-- 7. Verificar se as tabelas foram criadas corretamente
SELECT 
    'Tabelas criadas:' as info,
    table_name,
    '✅' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('companies', 'profiles');

-- 8. Verificar dados das tabelas
SELECT 'Empresas criadas:' as info, count(*) as total FROM public.companies;
SELECT 'Perfis criados:' as info, count(*) as total FROM public.profiles;






