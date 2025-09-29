-- SOLUÇÃO DEFINITIVA - Erro de Perfil/Filial
-- Execute este script no Supabase SQL Editor

-- 1. Verificar estrutura da tabela companies
SELECT 
    'Estrutura da tabela companies:' as info,
    column_name, 
    data_type
FROM information_schema.columns 
WHERE table_name = 'companies' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Adicionar colunas necessárias se não existirem
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS code TEXT;

ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS full_name TEXT;

ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'matriz';

ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- 3. Criar empresa padrão
INSERT INTO public.companies (id, name, code, full_name, type, active) 
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Empresa Padrão',
    'DEFAULT001',
    'Empresa Padrão Ltda',
    'matriz',
    true
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    code = EXCLUDED.code,
    full_name = EXCLUDED.full_name,
    type = EXCLUDED.type,
    active = EXCLUDED.active;

-- 4. Verificar se a tabela profiles existe
SELECT 
    'Estrutura da tabela profiles:' as info,
    column_name, 
    data_type
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Criar tabela profiles se não existir
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

-- 6. Listar usuários que precisam de perfil
SELECT 
    'Usuários que precisam de perfil:' as info,
    u.id as user_id,
    u.email,
    u.created_at,
    CASE 
        WHEN p.id IS NULL THEN 'PRECISA DE PERFIL' 
        ELSE 'JÁ TEM PERFIL' 
    END as status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE u.created_at > NOW() - INTERVAL '30 days'
ORDER BY u.created_at DESC
LIMIT 5;






