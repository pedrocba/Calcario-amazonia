-- ==============================================
-- CONFIGURAÇÃO SIMPLES DO MULTI-TENANT
-- ==============================================
-- Execute este script no Supabase SQL Editor

-- 1. Criar função para definir empresa_id automaticamente
CREATE OR REPLACE FUNCTION set_empresa_id()
RETURNS TRIGGER AS $$
BEGIN
    -- Se empresa_id não foi definido, usar a empresa do usuário
    IF NEW.empresa_id IS NULL THEN
        NEW.empresa_id := (SELECT empresa_id FROM profiles WHERE user_id = auth.uid());
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Adicionar coluna empresa_id na tabela profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS empresa_id UUID;

-- 3. Definir empresa_id padrão para CBA (usando o ID que já está no sistema)
UPDATE profiles 
SET empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid
WHERE empresa_id IS NULL;

-- 4. Configurar RLS para profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_isolada_por_empresa" ON profiles;
CREATE POLICY "profiles_isolada_por_empresa"
ON profiles
FOR ALL
USING (empresa_id = (SELECT empresa_id FROM profiles WHERE user_id = auth.uid()))
WITH CHECK (empresa_id = (SELECT empresa_id FROM profiles WHERE user_id = auth.uid()));

-- 5. Configurar tabela companies
ALTER TABLE companies ADD COLUMN IF NOT EXISTS empresa_id UUID;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "companies_isolada_por_empresa" ON companies;
CREATE POLICY "companies_isolada_por_empresa"
ON companies
FOR ALL
USING (empresa_id = (SELECT empresa_id FROM profiles WHERE user_id = auth.uid()))
WITH CHECK (empresa_id = (SELECT empresa_id FROM profiles WHERE user_id = auth.uid()));
DROP TRIGGER IF EXISTS set_empresa_id_companies ON companies;
CREATE TRIGGER set_empresa_id_companies
BEFORE INSERT ON companies
FOR EACH ROW
EXECUTE FUNCTION set_empresa_id();
UPDATE companies SET empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid WHERE empresa_id IS NULL;

-- 6. Configurar tabela products
ALTER TABLE products ADD COLUMN IF NOT EXISTS empresa_id UUID;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "products_isolada_por_empresa" ON products;
CREATE POLICY "products_isolada_por_empresa"
ON products
FOR ALL
USING (empresa_id = (SELECT empresa_id FROM profiles WHERE user_id = auth.uid()))
WITH CHECK (empresa_id = (SELECT empresa_id FROM profiles WHERE user_id = auth.uid()));
DROP TRIGGER IF EXISTS set_empresa_id_products ON products;
CREATE TRIGGER set_empresa_id_products
BEFORE INSERT ON products
FOR EACH ROW
EXECUTE FUNCTION set_empresa_id();
UPDATE products SET empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid WHERE empresa_id IS NULL;

-- 7. Configurar tabela contacts
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS empresa_id UUID;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "contacts_isolada_por_empresa" ON contacts;
CREATE POLICY "contacts_isolada_por_empresa"
ON contacts
FOR ALL
USING (empresa_id = (SELECT empresa_id FROM profiles WHERE user_id = auth.uid()))
WITH CHECK (empresa_id = (SELECT empresa_id FROM profiles WHERE user_id = auth.uid()));
DROP TRIGGER IF EXISTS set_empresa_id_contacts ON contacts;
CREATE TRIGGER set_empresa_id_contacts
BEFORE INSERT ON contacts
FOR EACH ROW
EXECUTE FUNCTION set_empresa_id();
UPDATE contacts SET empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid WHERE empresa_id IS NULL;

-- 8. Configurar tabela vendas
ALTER TABLE vendas ADD COLUMN IF NOT EXISTS empresa_id UUID;
ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "vendas_isolada_por_empresa" ON vendas;
CREATE POLICY "vendas_isolada_por_empresa"
ON vendas
FOR ALL
USING (empresa_id = (SELECT empresa_id FROM profiles WHERE user_id = auth.uid()))
WITH CHECK (empresa_id = (SELECT empresa_id FROM profiles WHERE user_id = auth.uid()));
DROP TRIGGER IF EXISTS set_empresa_id_vendas ON vendas;
CREATE TRIGGER set_empresa_id_vendas
BEFORE INSERT ON vendas
FOR EACH ROW
EXECUTE FUNCTION set_empresa_id();
UPDATE vendas SET empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid WHERE empresa_id IS NULL;

-- 9. Configurar tabela product_categories
ALTER TABLE product_categories ADD COLUMN IF NOT EXISTS empresa_id UUID;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "product_categories_isolada_por_empresa" ON product_categories;
CREATE POLICY "product_categories_isolada_por_empresa"
ON product_categories
FOR ALL
USING (empresa_id = (SELECT empresa_id FROM profiles WHERE user_id = auth.uid()))
WITH CHECK (empresa_id = (SELECT empresa_id FROM profiles WHERE user_id = auth.uid()));
DROP TRIGGER IF EXISTS set_empresa_id_product_categories ON product_categories;
CREATE TRIGGER set_empresa_id_product_categories
BEFORE INSERT ON product_categories
FOR EACH ROW
EXECUTE FUNCTION set_empresa_id();
UPDATE product_categories SET empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid WHERE empresa_id IS NULL;

-- 10. Verificar resultado
SELECT 'Sistema Multi-Tenant Configurado!' as status;
SELECT 'Profiles com empresa_id:' as info, COUNT(*) as total FROM profiles WHERE empresa_id IS NOT NULL;
SELECT 'Companies com empresa_id:' as info, COUNT(*) as total FROM companies WHERE empresa_id IS NOT NULL;
SELECT 'Products com empresa_id:' as info, COUNT(*) as total FROM products WHERE empresa_id IS NOT NULL;
SELECT 'Contacts com empresa_id:' as info, COUNT(*) as total FROM contacts WHERE empresa_id IS NOT NULL;
SELECT 'Vendas com empresa_id:' as info, COUNT(*) as total FROM vendas WHERE empresa_id IS NOT NULL;



