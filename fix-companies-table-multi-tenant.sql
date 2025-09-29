-- ==============================================
-- CORREÇÃO DA TABELA COMPANIES PARA MULTI-TENANT
-- ==============================================
-- Execute este script no Supabase SQL Editor

-- 1. Adicionar coluna empresa_id na tabela companies
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES empresas(id);

-- 2. Ativar RLS na tabela companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- 3. Remover políticas antigas
DROP POLICY IF EXISTS "Authenticated users can view companies" ON companies;
DROP POLICY IF EXISTS "Admins can manage companies" ON companies;
DROP POLICY IF EXISTS "Users can view their company's companies" ON companies;
DROP POLICY IF EXISTS "Users can manage their company's companies" ON companies;
DROP POLICY IF EXISTS "Users can insert their company's companies" ON companies;
DROP POLICY IF EXISTS "Users can update their company's companies" ON companies;
DROP POLICY IF EXISTS "Users can delete their company's companies" ON companies;

-- 4. Criar policy correta para companies
CREATE POLICY "companies_isolada_por_empresa"
ON companies
FOR ALL
USING (
    empresa_id = (SELECT empresa_id FROM profiles WHERE user_id = auth.uid())
)
WITH CHECK (
    empresa_id = (SELECT empresa_id FROM profiles WHERE user_id = auth.uid())
);

-- 5. Adicionar trigger para definir empresa_id automaticamente
DROP TRIGGER IF EXISTS set_empresa_id_companies ON companies;
CREATE TRIGGER set_empresa_id_companies
BEFORE INSERT ON companies
FOR EACH ROW
EXECUTE FUNCTION set_empresa_id();

-- 6. Atualizar empresas existentes para usar empresa_id da CBA
UPDATE companies 
SET empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid
WHERE empresa_id IS NULL;

-- 7. Verificar resultado
SELECT 
    'Companies atualizadas:' as info,
    id,
    name,
    code,
    empresa_id
FROM companies
ORDER BY created_at;



