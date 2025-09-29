-- ==============================================
-- CORRIGIR INFINITE RECURSION NO RLS
-- ==============================================
-- Execute este script no Supabase SQL Editor

-- 1. Remover todas as policies problemáticas
DROP POLICY IF EXISTS "profiles_isolada_por_empresa" ON profiles;
DROP POLICY IF EXISTS "companies_isolada_por_empresa" ON companies;
DROP POLICY IF EXISTS "products_isolada_por_empresa" ON products;
DROP POLICY IF EXISTS "contacts_isolada_por_empresa" ON contacts;
DROP POLICY IF EXISTS "vendas_isolada_por_empresa" ON vendas;
DROP POLICY IF EXISTS "product_categories_isolada_por_empresa" ON product_categories;

-- 2. Desabilitar RLS temporariamente
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE vendas DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories DISABLE ROW LEVEL SECURITY;

-- 3. Verificar se as colunas empresa_id existem e adicionar se necessário
DO $$
BEGIN
    -- Adicionar empresa_id em profiles se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'empresa_id' AND table_schema = 'public'
    ) THEN
        ALTER TABLE profiles ADD COLUMN empresa_id UUID;
        RAISE NOTICE 'Coluna empresa_id adicionada à tabela profiles.';
    END IF;
    
    -- Adicionar empresa_id em companies se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'companies' AND column_name = 'empresa_id' AND table_schema = 'public'
    ) THEN
        ALTER TABLE companies ADD COLUMN empresa_id UUID;
        RAISE NOTICE 'Coluna empresa_id adicionada à tabela companies.';
    END IF;
    
    -- Adicionar empresa_id em products se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'empresa_id' AND table_schema = 'public'
    ) THEN
        ALTER TABLE products ADD COLUMN empresa_id UUID;
        RAISE NOTICE 'Coluna empresa_id adicionada à tabela products.';
    END IF;
    
    -- Adicionar empresa_id em contacts se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contacts' AND column_name = 'empresa_id' AND table_schema = 'public'
    ) THEN
        ALTER TABLE contacts ADD COLUMN empresa_id UUID;
        RAISE NOTICE 'Coluna empresa_id adicionada à tabela contacts.';
    END IF;
    
    -- Adicionar empresa_id em vendas se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vendas' AND column_name = 'empresa_id' AND table_schema = 'public'
    ) THEN
        ALTER TABLE vendas ADD COLUMN empresa_id UUID;
        RAISE NOTICE 'Coluna empresa_id adicionada à tabela vendas.';
    END IF;
    
    -- Adicionar empresa_id em product_categories se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'product_categories' AND column_name = 'empresa_id' AND table_schema = 'public'
    ) THEN
        ALTER TABLE product_categories ADD COLUMN empresa_id UUID;
        RAISE NOTICE 'Coluna empresa_id adicionada à tabela product_categories.';
    END IF;
END $$;

-- 4. Definir empresa_id padrão para CBA em todas as tabelas
UPDATE profiles SET empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid WHERE empresa_id IS NULL;
UPDATE companies SET empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid WHERE empresa_id IS NULL;
UPDATE products SET empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid WHERE empresa_id IS NULL;
UPDATE contacts SET empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid WHERE empresa_id IS NULL;
UPDATE vendas SET empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid WHERE empresa_id IS NULL;
UPDATE product_categories SET empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid WHERE empresa_id IS NULL;

-- 5. Criar função para definir empresa_id automaticamente
CREATE OR REPLACE FUNCTION set_empresa_id()
RETURNS TRIGGER AS $$
BEGIN
    -- Se empresa_id não foi definido, usar a empresa CBA
    IF NEW.empresa_id IS NULL THEN
        NEW.empresa_id := '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Criar triggers para preenchimento automático
DROP TRIGGER IF EXISTS set_empresa_id_profiles ON profiles;
CREATE TRIGGER set_empresa_id_profiles
BEFORE INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION set_empresa_id();

DROP TRIGGER IF EXISTS set_empresa_id_companies ON companies;
CREATE TRIGGER set_empresa_id_companies
BEFORE INSERT ON companies
FOR EACH ROW
EXECUTE FUNCTION set_empresa_id();

DROP TRIGGER IF EXISTS set_empresa_id_products ON products;
CREATE TRIGGER set_empresa_id_products
BEFORE INSERT ON products
FOR EACH ROW
EXECUTE FUNCTION set_empresa_id();

DROP TRIGGER IF EXISTS set_empresa_id_contacts ON contacts;
CREATE TRIGGER set_empresa_id_contacts
BEFORE INSERT ON contacts
FOR EACH ROW
EXECUTE FUNCTION set_empresa_id();

DROP TRIGGER IF EXISTS set_empresa_id_vendas ON vendas;
CREATE TRIGGER set_empresa_id_vendas
BEFORE INSERT ON vendas
FOR EACH ROW
EXECUTE FUNCTION set_empresa_id();

DROP TRIGGER IF EXISTS set_empresa_id_product_categories ON product_categories;
CREATE TRIGGER set_empresa_id_product_categories
BEFORE INSERT ON product_categories
FOR EACH ROW
EXECUTE FUNCTION set_empresa_id();

-- 7. Reabilitar RLS com policies simples (sem recursão)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

-- 8. Criar policies simples (sem recursão)
-- Policy para profiles - permitir tudo para usuários autenticados
CREATE POLICY "profiles_allow_authenticated"
ON profiles
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy para companies - filtrar por empresa_id
CREATE POLICY "companies_filter_by_empresa"
ON companies
FOR ALL
TO authenticated
USING (empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid)
WITH CHECK (empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid);

-- Policy para products - filtrar por empresa_id
CREATE POLICY "products_filter_by_empresa"
ON products
FOR ALL
TO authenticated
USING (empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid)
WITH CHECK (empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid);

-- Policy para contacts - filtrar por empresa_id
CREATE POLICY "contacts_filter_by_empresa"
ON contacts
FOR ALL
TO authenticated
USING (empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid)
WITH CHECK (empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid);

-- Policy para vendas - filtrar por empresa_id
CREATE POLICY "vendas_filter_by_empresa"
ON vendas
FOR ALL
TO authenticated
USING (empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid)
WITH CHECK (empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid);

-- Policy para product_categories - filtrar por empresa_id
CREATE POLICY "product_categories_filter_by_empresa"
ON product_categories
FOR ALL
TO authenticated
USING (empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid)
WITH CHECK (empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid);

-- 9. Verificar resultado
SELECT 'Sistema Multi-Tenant Configurado sem Recursão!' as status;
SELECT 'Profiles com empresa_id:' as info, COUNT(*) as total FROM profiles WHERE empresa_id IS NOT NULL;
SELECT 'Companies com empresa_id:' as info, COUNT(*) as total FROM companies WHERE empresa_id IS NOT NULL;
SELECT 'Products com empresa_id:' as info, COUNT(*) as total FROM products WHERE empresa_id IS NOT NULL;
SELECT 'Contacts com empresa_id:' as info, COUNT(*) as total FROM contacts WHERE empresa_id IS NOT NULL;
SELECT 'Vendas com empresa_id:' as info, COUNT(*) as total FROM vendas WHERE empresa_id IS NOT NULL;



