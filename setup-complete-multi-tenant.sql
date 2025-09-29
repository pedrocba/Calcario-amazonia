-- ==============================================
-- CONFIGURAÇÃO COMPLETA DO SISTEMA MULTI-TENANT
-- Execute este script no Supabase SQL Editor
-- ==============================================

-- 1. CRIAR TABELA EMPRESAS
CREATE TABLE IF NOT EXISTS empresas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    razao_social VARCHAR(255),
    cnpj VARCHAR(18),
    ie VARCHAR(20),
    endereco TEXT,
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(10),
    telefone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    tipo VARCHAR(20) DEFAULT 'matriz' CHECK (tipo IN ('matriz', 'filial')),
    ativa BOOLEAN DEFAULT true,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CRIAR FUNÇÃO PARA DEFINIR EMPRESA_ID AUTOMATICAMENTE
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

-- 3. INSERIR EMPRESA CBA
INSERT INTO empresas (
    id, nome, razao_social, tipo, ativa
) VALUES (
    '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid,
    'CBA - Santarém (Matriz)',
    'Calcário Amazônia Ltda',
    'matriz',
    true
) ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    razao_social = EXCLUDED.razao_social,
    tipo = EXCLUDED.tipo,
    ativa = EXCLUDED.ativa;

-- 4. CORRIGIR TABELA PROFILES
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES empresas(id);
UPDATE profiles SET empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid WHERE empresa_id IS NULL;

-- 5. CONFIGURAR RLS E POLICIES PARA EMPRESAS
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "empresas_isolada_por_empresa"
ON empresas
FOR ALL
USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'super_admin')
    OR
    id = (SELECT empresa_id FROM profiles WHERE user_id = auth.uid())
)
WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'super_admin')
    OR
    id = (SELECT empresa_id FROM profiles WHERE user_id = auth.uid())
);

-- 6. CONFIGURAR RLS E POLICIES PARA PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_isolada_por_empresa"
ON profiles
FOR ALL
USING (empresa_id = (SELECT empresa_id FROM profiles WHERE user_id = auth.uid()))
WITH CHECK (empresa_id = (SELECT empresa_id FROM profiles WHERE user_id = auth.uid()));

-- 7. CONFIGURAR TABELA COMPANIES
ALTER TABLE companies ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES empresas(id);
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

-- 8. CONFIGURAR TABELA PRODUCTS
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
UPDATE products SET empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid WHERE empresa_id IS NULL;

-- 9. CONFIGURAR TABELA CONTACTS
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
UPDATE contacts SET empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid WHERE empresa_id IS NULL;

-- 10. CONFIGURAR TABELA VENDAS
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
UPDATE vendas SET empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid WHERE empresa_id IS NULL;

-- 11. CONFIGURAR TABELA PRODUCT_CATEGORIES
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
UPDATE product_categories SET empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid WHERE empresa_id IS NULL;

-- 12. VERIFICAR RESULTADO
SELECT 'Sistema Multi-Tenant Configurado!' as status;
SELECT 'Empresas:' as info, COUNT(*) as total FROM empresas;
SELECT 'Profiles com empresa_id:' as info, COUNT(*) as total FROM profiles WHERE empresa_id IS NOT NULL;
SELECT 'Companies com empresa_id:' as info, COUNT(*) as total FROM companies WHERE empresa_id IS NOT NULL;
SELECT 'Products com empresa_id:' as info, COUNT(*) as total FROM products WHERE empresa_id IS NOT NULL;
SELECT 'Contacts com empresa_id:' as info, COUNT(*) as total FROM contacts WHERE empresa_id IS NOT NULL;
SELECT 'Vendas com empresa_id:' as info, COUNT(*) as total FROM vendas WHERE empresa_id IS NOT NULL;
