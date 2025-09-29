-- ==============================================
-- CONFIGURAR SISTEMA REAL DE USUÁRIOS
-- ==============================================
-- Execute este script no Supabase SQL Editor

-- 1. CRIAR TABELA PROFILES (se não existir)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    role TEXT DEFAULT 'usuario_padrao' CHECK (role IN ('super_admin', 'admin', 'gerente_patio', 'almoxarife', 'usuario_padrao')),
    empresa_id UUID REFERENCES empresas(id),
    setor TEXT DEFAULT 'santarem' CHECK (setor IN ('santarem', 'fazenda', 'ambos')),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. HABILITAR RLS NA TABELA PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. CRIAR POLICIES PARA PROFILES
DROP POLICY IF EXISTS "profiles_isolada_por_empresa" ON profiles;
CREATE POLICY "profiles_isolada_por_empresa"
ON profiles
FOR ALL
USING (empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid)
WITH CHECK (empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid);

-- 4. CRIAR FUNÇÃO PARA CRIAR PROFILE AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role, empresa_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'usuario_padrao'),
    '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. CRIAR TRIGGER PARA CRIAR PROFILE AUTOMATICAMENTE
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. CRIAR USUÁRIOS DE EXEMPLO
-- Super Admin
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data
) VALUES (
    '68cacb91-3d16-9d19-1be6-c90d00000001'::uuid,
    'superadmin@calcarioamazonia.com',
    crypt('admin123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"full_name": "Super Admin", "role": "super_admin"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Admin
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data
) VALUES (
    '68cacb91-3d16-9d19-1be6-c90d00000002'::uuid,
    'admin@calcarioamazonia.com',
    crypt('admin123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"full_name": "Administrador", "role": "admin"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Gerente de Pátio
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data
) VALUES (
    '68cacb91-3d16-9d19-1be6-c90d00000003'::uuid,
    'gerente@calcarioamazonia.com',
    crypt('gerente123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"full_name": "Gerente de Pátio", "role": "gerente_patio"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Almoxarife
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data
) VALUES (
    '68cacb91-3d16-9d19-1be6-c90d00000004'::uuid,
    'almoxarife@calcarioamazonia.com',
    crypt('almoxarife123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"full_name": "Almoxarife", "role": "almoxarife"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Operador de Balança
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data
) VALUES (
    '68cacb91-3d16-9d19-1be6-c90d00000005'::uuid,
    'operador@calcarioamazonia.com',
    crypt('operador123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"full_name": "Operador de Balança", "role": "usuario_padrao"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 7. VERIFICAR USUÁRIOS CRIADOS
SELECT 
    'Usuários criados:' as info,
    p.id,
    p.full_name,
    p.role,
    p.setor,
    p.active,
    u.email
FROM profiles p
JOIN auth.users u ON p.user_id = u.id
ORDER BY p.created_at;

-- 8. RESULTADO FINAL
SELECT 'SISTEMA DE USUÁRIOS CONFIGURADO COM SUCESSO!' as status;
SELECT 'Usuários podem ser criados via Supabase Auth!' as info;
SELECT 'Permissões são aplicadas automaticamente!' as resultado;



