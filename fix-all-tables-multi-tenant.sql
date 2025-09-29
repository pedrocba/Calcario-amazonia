-- ==============================================
-- CORREÇÃO DE TODAS AS TABELAS PARA MULTI-TENANT
-- ==============================================
-- Execute este script no Supabase SQL Editor

-- 1. CORRIGIR TABELA PRODUCTS
ALTER TABLE products ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES empresas(id);
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

-- 2. CORRIGIR TABELA CONTACTS
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES empresas(id);
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

-- 3. CORRIGIR TABELA VENDAS
ALTER TABLE vendas ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES empresas(id);
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

-- 4. CORRIGIR TABELA PRODUCT_CATEGORIES
ALTER TABLE product_categories ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES empresas(id);
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

-- 5. ATUALIZAR DADOS EXISTENTES PARA USAR EMPRESA CBA
UPDATE products SET empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid WHERE empresa_id IS NULL;
UPDATE contacts SET empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid WHERE empresa_id IS NULL;
UPDATE vendas SET empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid WHERE empresa_id IS NULL;
UPDATE product_categories SET empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid WHERE empresa_id IS NULL;

-- 6. VERIFICAR RESULTADO
SELECT 'Tabelas corrigidas:' as info, 'products' as tabela, COUNT(*) as registros FROM products WHERE empresa_id IS NOT NULL
UNION ALL
SELECT 'Tabelas corrigidas:', 'contacts', COUNT(*) FROM contacts WHERE empresa_id IS NOT NULL
UNION ALL
SELECT 'Tabelas corrigidas:', 'vendas', COUNT(*) FROM vendas WHERE empresa_id IS NOT NULL
UNION ALL
SELECT 'Tabelas corrigidas:', 'product_categories', COUNT(*) FROM product_categories WHERE empresa_id IS NOT NULL;



