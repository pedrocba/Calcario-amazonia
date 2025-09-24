-- ========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Sistema de Controle de Acesso Baseado em Papel (RBAC)
-- ========================================

-- Habilitar RLS em todas as tabelas principais
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE requisitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ========================================
-- POLÍTICAS PARA TABELA users
-- ========================================

-- Usuários podem ver apenas seu próprio perfil
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Usuários podem atualizar apenas seu próprio perfil
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Apenas admins podem criar novos perfis
CREATE POLICY "Only admins can create users" ON users
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Apenas admins podem deletar perfis
CREATE POLICY "Only admins can delete users" ON users
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ========================================
-- POLÍTICAS PARA TABELA COMPANIES
-- ========================================

-- Todos os usuários autenticados podem ver empresas
CREATE POLICY "Authenticated users can view companies" ON companies
    FOR SELECT USING (auth.role() = 'authenticated');

-- Apenas admins podem gerenciar empresas
CREATE POLICY "Only admins can manage companies" ON companies
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ========================================
-- POLÍTICAS PARA TABELA PRODUCTS
-- ========================================

-- Usuários autenticados podem ver produtos
CREATE POLICY "Authenticated users can view products" ON products
    FOR SELECT USING (auth.role() = 'authenticated');

-- Apenas admins e almoxarifes podem gerenciar produtos
CREATE POLICY "Admins and warehouse can manage products" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role IN ('admin', 'almoxarife')
        )
    );

-- ========================================
-- POLÍTICAS PARA TABELA TRANSFERS
-- ========================================

-- Usuários autenticados podem ver transferências
CREATE POLICY "Authenticated users can view transfers" ON transfers
    FOR SELECT USING (auth.role() = 'authenticated');

-- Apenas admins e almoxarifes podem gerenciar transferências
CREATE POLICY "Admins and warehouse can manage transfers" ON transfers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role IN ('admin', 'almoxarife')
        )
    );

-- ========================================
-- POLÍTICAS PARA TABELA REQUISITIONS
-- ========================================

-- Usuários autenticados podem ver requisições
CREATE POLICY "Authenticated users can view requisitions" ON requisitions
    FOR SELECT USING (auth.role() = 'authenticated');

-- Usuários podem criar requisições
CREATE POLICY "Authenticated users can create requisitions" ON requisitions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Apenas admins, gerentes e almoxarifes podem aprovar/gerenciar requisições
CREATE POLICY "Managers can manage requisitions" ON requisitions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role IN ('admin', 'gerente_patio', 'almoxarife')
        )
    );

-- ========================================
-- POLÍTICAS PARA TABELA VEHICLES
-- ========================================

-- Usuários autenticados podem ver veículos
CREATE POLICY "Authenticated users can view vehicles" ON vehicles
    FOR SELECT USING (auth.role() = 'authenticated');

-- Apenas admins e gerentes podem gerenciar veículos
CREATE POLICY "Admins and managers can manage vehicles" ON vehicles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role IN ('admin', 'gerente_patio')
        )
    );

-- ========================================
-- POLÍTICAS PARA TABELA USERS (se existir)
-- ========================================

-- Apenas admins podem gerenciar usuários
CREATE POLICY "Only admins can manage users" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ========================================
-- FUNÇÕES AUXILIARES
-- ========================================

-- Função para verificar se o usuário é admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se o usuário tem role específico
CREATE OR REPLACE FUNCTION has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = required_role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se o usuário tem uma das roles permitidas
CREATE OR REPLACE FUNCTION has_any_role(allowed_roles TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = ANY(allowed_roles)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

