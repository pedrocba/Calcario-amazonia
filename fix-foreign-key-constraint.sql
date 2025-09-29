-- ==============================================
-- CORRIGIR FOREIGN KEY CONSTRAINT
-- ==============================================
-- Execute este script no Supabase SQL Editor

-- 1. Verificar constraints existentes na tabela companies
SELECT 
    'Constraints na tabela companies:' as info,
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'companies'::regclass;

-- 2. Remover foreign key constraint se existir
DO $$
BEGIN
    -- Verificar se a constraint existe e removê-la
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'companies'::regclass 
        AND conname = 'companies_empresa_id_fkey'
    ) THEN
        ALTER TABLE companies DROP CONSTRAINT companies_empresa_id_fkey;
        RAISE NOTICE 'Foreign key constraint removida com sucesso!';
    ELSE
        RAISE NOTICE 'Foreign key constraint não encontrada.';
    END IF;
END $$;

-- 3. Verificar se a coluna empresa_id existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'companies' 
        AND column_name = 'empresa_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE companies ADD COLUMN empresa_id UUID;
        RAISE NOTICE 'Coluna empresa_id adicionada à tabela companies.';
    ELSE
        RAISE NOTICE 'Coluna empresa_id já existe na tabela companies.';
    END IF;
END $$;

-- 4. Criar função para definir empresa_id automaticamente
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

-- 5. Configurar RLS para companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Remover policies antigas se existirem
DROP POLICY IF EXISTS "companies_isolada_por_empresa" ON companies;
DROP POLICY IF EXISTS "companies_owner_company_id_policy" ON companies;
DROP POLICY IF EXISTS "companies_parent_company_id_policy" ON companies;

-- Criar nova policy
CREATE POLICY "companies_isolada_por_empresa"
ON companies
FOR ALL
USING (empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid)
WITH CHECK (empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid);

-- 6. Criar trigger para preenchimento automático
DROP TRIGGER IF EXISTS set_empresa_id_companies ON companies;
CREATE TRIGGER set_empresa_id_companies
BEFORE INSERT ON companies
FOR EACH ROW
EXECUTE FUNCTION set_empresa_id();

-- 7. Atualizar registros existentes
UPDATE companies 
SET empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid 
WHERE empresa_id IS NULL;

-- 8. Verificar resultado
SELECT 
    'Configuração concluída!' as status,
    COUNT(*) as total_companies,
    COUNT(CASE WHEN empresa_id IS NOT NULL THEN 1 END) as companies_with_empresa_id
FROM companies;

-- 9. Testar inserção
INSERT INTO companies (id, name, type, active) 
VALUES (gen_random_uuid(), 'Teste Isolamento', 'filial', true)
ON CONFLICT (id) DO NOTHING;

-- 10. Verificar se o teste funcionou
SELECT 
    'Teste de inserção:' as info,
    id,
    name,
    empresa_id
FROM companies 
WHERE name = 'Teste Isolamento';



