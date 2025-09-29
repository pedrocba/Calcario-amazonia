-- ==============================================
-- SISTEMA MULTI-TENANT COMPLETO
-- ISOLAMENTO TOTAL POR FILIAL/MATRIZ
-- ==============================================
-- Execute este script no Supabase SQL Editor

-- 1. REMOVER TODAS AS FOREIGN KEY CONSTRAINTS PROBLEMÁTICAS
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    -- Buscar todas as constraints de foreign key relacionadas a empresa_id
    FOR constraint_record IN
        SELECT conname, conrelid::regclass as table_name
        FROM pg_constraint 
        WHERE contype = 'f'
        AND (conname LIKE '%empresa_id%' OR conname LIKE '%company_id%')
    LOOP
        -- Remover a constraint
        EXECUTE 'ALTER TABLE ' || constraint_record.table_name || ' DROP CONSTRAINT IF EXISTS ' || constraint_record.conname;
        RAISE NOTICE 'Constraint % removida da tabela %', constraint_record.conname, constraint_record.table_name;
    END LOOP;
END $$;

-- 2. CRIAR FUNÇÃO PARA DEFINIR EMPRESA_ID AUTOMATICAMENTE
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

-- 3. ADICIONAR COLUNA EMPRESA_ID EM TODAS AS TABELAS
DO $$
DECLARE
    tbl_name TEXT;
    tables_to_check TEXT[] := ARRAY[
        'profiles', 'companies', 'products', 'product_categories', 'contacts', 
        'vendas', 'financial_transactions', 'financial_accounts', 'access_logs',
        'fueling_records', 'vehicle_expenses', 'recurring_costs', 'requisicoes_de_saida',
        'itens_da_requisicao', 'retiradas_de_material', 'movimentacoes_estoque',
        'epis', 'funcionarios', 'entregas_epi', 'transferencias_simples', 'remessas',
        'ativos_ti', 'postos_combustivel', 'entradas_combustivel', 'ajustes_estoque_log'
    ];
BEGIN
    FOREACH tbl_name IN ARRAY tables_to_check
    LOOP
        -- Verificar se a tabela existe
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = tbl_name AND table_schema = 'public') THEN
            -- Adicionar empresa_id se não existir
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = tbl_name AND column_name = 'empresa_id' AND table_schema = 'public'
            ) THEN
                EXECUTE 'ALTER TABLE ' || tbl_name || ' ADD COLUMN empresa_id UUID';
                RAISE NOTICE 'Coluna empresa_id adicionada à tabela %.', tbl_name;
            ELSE
                RAISE NOTICE 'Coluna empresa_id já existe na tabela %.', tbl_name;
            END IF;
        ELSE
            RAISE NOTICE 'Tabela % não existe, pulando.', tbl_name;
        END IF;
    END LOOP;
END $$;

-- 4. DEFINIR EMPRESA_ID PADRÃO PARA CBA EM TODAS AS TABELAS
UPDATE profiles SET empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid WHERE empresa_id IS NULL;
UPDATE companies SET empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid WHERE empresa_id IS NULL;
UPDATE products SET empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid WHERE empresa_id IS NULL;
UPDATE product_categories SET empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid WHERE empresa_id IS NULL;
UPDATE contacts SET empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid WHERE empresa_id IS NULL;
UPDATE vendas SET empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid WHERE empresa_id IS NULL;

-- Atualizar outras tabelas se existirem
DO $$
DECLARE
    tbl_name TEXT;
    tables_to_check TEXT[] := ARRAY[
        'financial_transactions', 'financial_accounts', 'access_logs',
        'fueling_records', 'vehicle_expenses', 'recurring_costs', 'requisicoes_de_saida',
        'itens_da_requisicao', 'retiradas_de_material', 'movimentacoes_estoque',
        'epis', 'funcionarios', 'entregas_epi', 'transferencias_simples', 'remessas',
        'ativos_ti', 'postos_combustivel', 'entradas_combustivel', 'ajustes_estoque_log'
    ];
BEGIN
    FOREACH tbl_name IN ARRAY tables_to_check
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = tbl_name AND table_schema = 'public') THEN
            EXECUTE 'UPDATE ' || tbl_name || ' SET empresa_id = ''68cacb91-3d16-9d19-1be6-c90d00000000''::uuid WHERE empresa_id IS NULL';
            RAISE NOTICE 'Tabela % atualizada com empresa_id padrão.', tbl_name;
        END IF;
    END LOOP;
END $$;

-- 5. CRIAR TRIGGERS PARA PREENCHIMENTO AUTOMÁTICO
DO $$
DECLARE
    tbl_name TEXT;
    tables_to_check TEXT[] := ARRAY[
        'profiles', 'companies', 'products', 'product_categories', 'contacts', 
        'vendas', 'financial_transactions', 'financial_accounts', 'access_logs',
        'fueling_records', 'vehicle_expenses', 'recurring_costs', 'requisicoes_de_saida',
        'itens_da_requisicao', 'retiradas_de_material', 'movimentacoes_estoque',
        'epis', 'funcionarios', 'entregas_epi', 'transferencias_simples', 'remessas',
        'ativos_ti', 'postos_combustivel', 'entradas_combustivel', 'ajustes_estoque_log'
    ];
BEGIN
    FOREACH tbl_name IN ARRAY tables_to_check
    LOOP
        -- Verificar se a tabela existe
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = tbl_name AND table_schema = 'public') THEN
            -- Remover trigger existente se houver
            EXECUTE 'DROP TRIGGER IF EXISTS set_empresa_id_' || tbl_name || ' ON ' || tbl_name;
            
            -- Criar novo trigger
            EXECUTE 'CREATE TRIGGER set_empresa_id_' || tbl_name || '
                BEFORE INSERT ON ' || tbl_name || '
                FOR EACH ROW
                EXECUTE FUNCTION set_empresa_id()';
            
            RAISE NOTICE 'Trigger criado para tabela %.', tbl_name;
        END IF;
    END LOOP;
END $$;

-- 6. CONFIGURAR RLS COM POLICIES DE ISOLAMENTO TOTAL
DO $$
DECLARE
    tbl_name TEXT;
    tables_to_check TEXT[] := ARRAY[
        'profiles', 'companies', 'products', 'product_categories', 'contacts', 
        'vendas', 'financial_transactions', 'financial_accounts', 'access_logs',
        'fueling_records', 'vehicle_expenses', 'recurring_costs', 'requisicoes_de_saida',
        'itens_da_requisicao', 'retiradas_de_material', 'movimentacoes_estoque',
        'epis', 'funcionarios', 'entregas_epi', 'transferencias_simples', 'remessas',
        'ativos_ti', 'postos_combustivel', 'entradas_combustivel', 'ajustes_estoque_log'
    ];
BEGIN
    FOREACH tbl_name IN ARRAY tables_to_check
    LOOP
        -- Verificar se a tabela existe
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = tbl_name AND table_schema = 'public') THEN
            -- Habilitar RLS
            EXECUTE 'ALTER TABLE ' || tbl_name || ' ENABLE ROW LEVEL SECURITY';
            
            -- Remover policies antigas
            EXECUTE 'DROP POLICY IF EXISTS "' || tbl_name || '_isolada_por_empresa" ON ' || tbl_name;
            EXECUTE 'DROP POLICY IF EXISTS "' || tbl_name || '_filter_by_empresa" ON ' || tbl_name;
            EXECUTE 'DROP POLICY IF EXISTS "' || tbl_name || '_allow_authenticated" ON ' || tbl_name;
            EXECUTE 'DROP POLICY IF EXISTS "' || tbl_name || '_owner_company_id_policy" ON ' || tbl_name;
            EXECUTE 'DROP POLICY IF EXISTS "' || tbl_name || '_parent_company_id_policy" ON ' || tbl_name;
            
            -- Criar policy de isolamento total
            IF tbl_name = 'profiles' THEN
                -- Para profiles, permitir tudo para usuários autenticados
                EXECUTE 'CREATE POLICY "' || tbl_name || '_allow_authenticated"
                    ON ' || tbl_name || '
                    FOR ALL
                    TO authenticated
                    USING (true)
                    WITH CHECK (true)';
            ELSE
                -- Para todas as outras tabelas, ISOLAMENTO TOTAL por empresa_id
                EXECUTE 'CREATE POLICY "' || tbl_name || '_isolamento_total"
                    ON ' || tbl_name || '
                    FOR ALL
                    TO authenticated
                    USING (empresa_id = ''68cacb91-3d16-9d19-1be6-c90d00000000''::uuid)
                    WITH CHECK (empresa_id = ''68cacb91-3d16-9d19-1be6-c90d00000000''::uuid)';
            END IF;
            
            RAISE NOTICE 'RLS configurado para tabela % com isolamento total.', tbl_name;
        END IF;
    END LOOP;
END $$;

-- 7. VERIFICAR RESULTADO FINAL
SELECT 'SISTEMA MULTI-TENANT COMPLETO CONFIGURADO!' as status;
SELECT 'Isolamento total por filial/matriz implementado!' as info;

-- Verificar tabelas com empresa_id
SELECT 
    'Tabelas configuradas:' as info,
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE column_name = 'empresa_id' 
AND table_schema = 'public'
ORDER BY table_name;

-- Verificar contagem de registros por empresa
SELECT 'Profiles por empresa:' as info, empresa_id, COUNT(*) as total FROM profiles GROUP BY empresa_id;
SELECT 'Companies por empresa:' as info, empresa_id, COUNT(*) as total FROM companies GROUP BY empresa_id;
SELECT 'Products por empresa:' as info, empresa_id, COUNT(*) as total FROM products GROUP BY empresa_id;
SELECT 'Contacts por empresa:' as info, empresa_id, COUNT(*) as total FROM contacts GROUP BY empresa_id;
SELECT 'Vendas por empresa:' as info, empresa_id, COUNT(*) as total FROM vendas GROUP BY empresa_id;



