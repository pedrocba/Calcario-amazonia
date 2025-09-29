-- ==============================================
-- REMOVER TODAS AS FOREIGN KEY CONSTRAINTS
-- ==============================================
-- Execute este script no Supabase SQL Editor

-- 1. Verificar todas as constraints existentes
SELECT 
    'Constraints existentes:' as info,
    conname as constraint_name,
    contype as constraint_type,
    conrelid::regclass as table_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE contype = 'f'
AND conname LIKE '%empresa_id%'
ORDER BY conrelid::regclass;

-- 2. Remover todas as foreign key constraints relacionadas a empresa_id
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    -- Buscar todas as constraints de foreign key relacionadas a empresa_id
    FOR constraint_record IN
        SELECT conname, conrelid::regclass as table_name
        FROM pg_constraint 
        WHERE contype = 'f'
        AND conname LIKE '%empresa_id%'
    LOOP
        -- Remover a constraint
        EXECUTE 'ALTER TABLE ' || constraint_record.table_name || ' DROP CONSTRAINT IF EXISTS ' || constraint_record.conname;
        RAISE NOTICE 'Constraint % removida da tabela %', constraint_record.conname, constraint_record.table_name;
    END LOOP;
END $$;

-- 3. Verificar se as colunas empresa_id existem e adicionar se necessário
DO $$
DECLARE
    table_name TEXT;
    tables_to_check TEXT[] := ARRAY['profiles', 'companies', 'products', 'contacts', 'vendas', 'product_categories', 'financial_transactions', 'financial_accounts'];
BEGIN
    FOREACH table_name IN ARRAY tables_to_check
    LOOP
        -- Verificar se a tabela existe
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = table_name AND table_schema = 'public') THEN
            -- Adicionar empresa_id se não existir
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = table_name AND column_name = 'empresa_id' AND table_schema = 'public'
            ) THEN
                EXECUTE 'ALTER TABLE ' || table_name || ' ADD COLUMN empresa_id UUID';
                RAISE NOTICE 'Coluna empresa_id adicionada à tabela %.', table_name;
            ELSE
                RAISE NOTICE 'Coluna empresa_id já existe na tabela %.', table_name;
            END IF;
        ELSE
            RAISE NOTICE 'Tabela % não existe, pulando.', table_name;
        END IF;
    END LOOP;
END $$;

-- 4. Definir empresa_id padrão para CBA em todas as tabelas
UPDATE profiles SET empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid WHERE empresa_id IS NULL;
UPDATE companies SET empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid WHERE empresa_id IS NULL;
UPDATE products SET empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid WHERE empresa_id IS NULL;
UPDATE contacts SET empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid WHERE empresa_id IS NULL;
UPDATE vendas SET empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid WHERE empresa_id IS NULL;
UPDATE product_categories SET empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid WHERE empresa_id IS NULL;

-- Atualizar outras tabelas se existirem
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'financial_transactions' AND table_schema = 'public') THEN
        UPDATE financial_transactions SET empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid WHERE empresa_id IS NULL;
        RAISE NOTICE 'Tabela financial_transactions atualizada.';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'financial_accounts' AND table_schema = 'public') THEN
        UPDATE financial_accounts SET empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid WHERE empresa_id IS NULL;
        RAISE NOTICE 'Tabela financial_accounts atualizada.';
    END IF;
END $$;

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

-- 6. Criar triggers para preenchimento automático em todas as tabelas
DO $$
DECLARE
    table_name TEXT;
    tables_to_check TEXT[] := ARRAY['profiles', 'companies', 'products', 'contacts', 'vendas', 'product_categories', 'financial_transactions', 'financial_accounts'];
BEGIN
    FOREACH table_name IN ARRAY tables_to_check
    LOOP
        -- Verificar se a tabela existe
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = table_name AND table_schema = 'public') THEN
            -- Remover trigger existente se houver
            EXECUTE 'DROP TRIGGER IF EXISTS set_empresa_id_' || table_name || ' ON ' || table_name;
            
            -- Criar novo trigger
            EXECUTE 'CREATE TRIGGER set_empresa_id_' || table_name || '
                BEFORE INSERT ON ' || table_name || '
                FOR EACH ROW
                EXECUTE FUNCTION set_empresa_id()';
            
            RAISE NOTICE 'Trigger criado para tabela %.', table_name;
        END IF;
    END LOOP;
END $$;

-- 7. Configurar RLS com policies simples (sem recursão)
DO $$
DECLARE
    table_name TEXT;
    tables_to_check TEXT[] := ARRAY['profiles', 'companies', 'products', 'contacts', 'vendas', 'product_categories', 'financial_transactions', 'financial_accounts'];
BEGIN
    FOREACH table_name IN ARRAY tables_to_check
    LOOP
        -- Verificar se a tabela existe
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = table_name AND table_schema = 'public') THEN
            -- Habilitar RLS
            EXECUTE 'ALTER TABLE ' || table_name || ' ENABLE ROW LEVEL SECURITY';
            
            -- Remover policies antigas
            EXECUTE 'DROP POLICY IF EXISTS "' || table_name || '_isolada_por_empresa" ON ' || table_name;
            EXECUTE 'DROP POLICY IF EXISTS "' || table_name || '_filter_by_empresa" ON ' || table_name;
            EXECUTE 'DROP POLICY IF EXISTS "' || table_name || '_allow_authenticated" ON ' || table_name;
            
            -- Criar policy simples
            IF table_name = 'profiles' THEN
                -- Para profiles, permitir tudo para usuários autenticados
                EXECUTE 'CREATE POLICY "' || table_name || '_allow_authenticated"
                    ON ' || table_name || '
                    FOR ALL
                    TO authenticated
                    USING (true)
                    WITH CHECK (true)';
            ELSE
                -- Para outras tabelas, filtrar por empresa_id
                EXECUTE 'CREATE POLICY "' || table_name || '_filter_by_empresa"
                    ON ' || table_name || '
                    FOR ALL
                    TO authenticated
                    USING (empresa_id = ''68cacb91-3d16-9d19-1be6-c90d00000000''::uuid)
                    WITH CHECK (empresa_id = ''68cacb91-3d16-9d19-1be6-c90d00000000''::uuid)';
            END IF;
            
            RAISE NOTICE 'RLS configurado para tabela %.', table_name;
        END IF;
    END LOOP;
END $$;

-- 8. Verificar resultado
SELECT 'Sistema Multi-Tenant Configurado sem Foreign Keys!' as status;
SELECT 'Profiles com empresa_id:' as info, COUNT(*) as total FROM profiles WHERE empresa_id IS NOT NULL;
SELECT 'Companies com empresa_id:' as info, COUNT(*) as total FROM companies WHERE empresa_id IS NOT NULL;
SELECT 'Products com empresa_id:' as info, COUNT(*) as total FROM products WHERE empresa_id IS NOT NULL;
SELECT 'Contacts com empresa_id:' as info, COUNT(*) as total FROM contacts WHERE empresa_id IS NOT NULL;
SELECT 'Vendas com empresa_id:' as info, COUNT(*) as total FROM vendas WHERE empresa_id IS NOT NULL;



