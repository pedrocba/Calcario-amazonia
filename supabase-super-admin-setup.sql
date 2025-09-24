-- ========================================
-- CONFIGURAÇÃO DO SUPER ADMIN
-- Sistema de Controle de Acesso com Super Admin
-- ========================================

-- 1. Primeiro, vamos verificar se existe um usuário super_admin
-- Se não existir, vamos criar um

-- Inserir usuário super_admin se não existir
INSERT INTO users (id, email, full_name, role, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'superadmin@calcarioamazonia.com',
  'Super Administrador',
  'super_admin',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  role = 'super_admin',
  full_name = 'Super Administrador',
  updated_at = NOW();

-- 2. Criar função para obter empresas do usuário
CREATE OR REPLACE FUNCTION get_user_companies(user_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  -- Verificar se o usuário é super_admin
  IF EXISTS (
    SELECT 1 FROM users 
    WHERE id = user_id AND role = 'super_admin'
  ) THEN
    -- Super admin vê todas as empresas
    RETURN QUERY
    SELECT c.id, c.name, c.description, c.created_at, c.updated_at
    FROM companies c
    ORDER BY c.name;
  ELSE
    -- Usuários normais veem apenas empresas específicas
    -- Por enquanto, retornamos todas as empresas (você pode ajustar isso)
    RETURN QUERY
    SELECT c.id, c.name, c.description, c.created_at, c.updated_at
    FROM companies c
    ORDER BY c.name;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Atualizar políticas RLS para incluir super_admin
-- Primeiro, vamos remover as políticas antigas se existirem
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Only admins can create users" ON users;
DROP POLICY IF EXISTS "Only admins can delete users" ON users;

-- 4. Criar novas políticas RLS para users
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Super admin pode ver todos os usuários
CREATE POLICY "Super admin can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- Super admin pode gerenciar todos os usuários
CREATE POLICY "Super admin can manage all users" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- 5. Atualizar políticas para outras tabelas com lógica de super_admin
-- Remover políticas antigas
DROP POLICY IF EXISTS "Authenticated users can view companies" ON companies;
DROP POLICY IF EXISTS "Only admins can manage companies" ON companies;

-- Criar novas políticas para companies
CREATE POLICY "View companies based on role" ON companies
    FOR SELECT USING (
        -- Super admin vê todas as empresas
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'super_admin'
        )
        OR
        -- Outros usuários veem todas as empresas (ajuste conforme necessário)
        auth.role() = 'authenticated'
    );

CREATE POLICY "Manage companies based on role" ON companies
    FOR ALL USING (
        -- Apenas super admin pode gerenciar empresas
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- 6. Atualizar políticas para products com lógica de super_admin
DROP POLICY IF EXISTS "Authenticated users can view products" ON products;
DROP POLICY IF EXISTS "Admins and warehouse can manage products" ON products;

CREATE POLICY "View products based on role" ON products
    FOR SELECT USING (
        -- Super admin vê todos os produtos
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'super_admin'
        )
        OR
        -- Outros usuários veem produtos baseados na filial ativa
        -- (Você pode ajustar isso para usar a filial selecionada)
        auth.role() = 'authenticated'
    );

CREATE POLICY "Manage products based on role" ON products
    FOR ALL USING (
        -- Super admin pode gerenciar todos os produtos
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'super_admin'
        )
        OR
        -- Outros usuários baseado em permissões
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role IN ('admin', 'almoxarife')
        )
    );

-- 7. Função para verificar se usuário é super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Função para obter role do usuário atual
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT role FROM users 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Função para obter dados do usuário atual
CREATE OR REPLACE FUNCTION get_current_user()
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  role TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT u.id, u.email, u.full_name, u.role, u.created_at, u.updated_at
    FROM users u
    WHERE u.id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;















