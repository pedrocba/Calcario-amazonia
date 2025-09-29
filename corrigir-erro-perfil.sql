-- Corrigir erro "Perfil ou filial do usuário não encontrados"
-- Execute este script no Supabase SQL Editor

-- 1. Criar tabela companies
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

-- 2. Criar tabela profiles
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

-- 4. Listar usuários para identificar qual precisa de perfil
SELECT 
    u.id,
    u.email,
    u.created_at,
    CASE 
        WHEN p.id IS NULL THEN 'SEM PERFIL' 
        ELSE 'COM PERFIL' 
    END as status_perfil
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE u.created_at > NOW() - INTERVAL '30 days'
ORDER BY u.created_at DESC;






