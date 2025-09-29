-- ==============================================
-- LIMPAR DADOS E ISOLAR APENAS CBA
-- ==============================================
-- Execute este script no Supabase SQL Editor

-- 1. REMOVER TODOS OS DADOS QUE NÃO SÃO DA CBA
DELETE FROM contacts WHERE empresa_id != '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid;
DELETE FROM products WHERE empresa_id != '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid;
DELETE FROM product_categories WHERE empresa_id != '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid;
DELETE FROM vendas WHERE empresa_id != '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid;
DELETE FROM companies WHERE empresa_id != '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid;

-- 2. REMOVER DADOS DE OUTRAS TABELAS SE EXISTIREM
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
            EXECUTE 'DELETE FROM ' || tbl_name || ' WHERE empresa_id != ''68cacb91-3d16-9d19-1be6-c90d00000000''::uuid';
            RAISE NOTICE 'Dados limpos da tabela %.', tbl_name;
        END IF;
    END LOOP;
END $$;

-- 3. GARANTIR QUE TODOS OS DADOS RESTANTES TENHAM EMPRESA_ID DA CBA
UPDATE contacts SET empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid WHERE empresa_id IS NULL;
UPDATE products SET empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid WHERE empresa_id IS NULL;
UPDATE product_categories SET empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid WHERE empresa_id IS NULL;
UPDATE vendas SET empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid WHERE empresa_id IS NULL;
UPDATE companies SET empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid WHERE empresa_id IS NULL;

-- 4. ATUALIZAR OUTRAS TABELAS SE EXISTIREM
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
            RAISE NOTICE 'Tabela % atualizada com empresa_id da CBA.', tbl_name;
        END IF;
    END LOOP;
END $$;

-- 5. VERIFICAR RESULTADO FINAL
SELECT 'DADOS LIMPOS E ISOLADOS PARA CBA!' as status;

-- Verificar contagem de registros por empresa
SELECT 'Isolamento por empresa:' as info;
SELECT 'Profiles:' as tabela, empresa_id, COUNT(*) as total FROM profiles GROUP BY empresa_id;
SELECT 'Companies:' as tabela, empresa_id, COUNT(*) as total FROM companies GROUP BY empresa_id;
SELECT 'Products:' as tabela, empresa_id, COUNT(*) as total FROM products GROUP BY empresa_id;
SELECT 'Product Categories:' as tabela, empresa_id, COUNT(*) as total FROM product_categories GROUP BY empresa_id;
SELECT 'Contacts:' as tabela, empresa_id, COUNT(*) as total FROM contacts GROUP BY empresa_id;
SELECT 'Vendas:' as tabela, empresa_id, COUNT(*) as total FROM vendas GROUP BY empresa_id;

-- Verificar se há registros sem empresa_id
SELECT 'Registros sem empresa_id:' as info;
SELECT 'Profiles sem empresa_id:' as tabela, COUNT(*) as total FROM profiles WHERE empresa_id IS NULL;
SELECT 'Companies sem empresa_id:' as tabela, COUNT(*) as total FROM companies WHERE empresa_id IS NULL;
SELECT 'Products sem empresa_id:' as tabela, COUNT(*) as total FROM products WHERE empresa_id IS NULL;
SELECT 'Product Categories sem empresa_id:' as tabela, COUNT(*) as total FROM product_categories WHERE empresa_id IS NULL;
SELECT 'Contacts sem empresa_id:' as tabela, COUNT(*) as total FROM contacts WHERE empresa_id IS NULL;
SELECT 'Vendas sem empresa_id:' as tabela, COUNT(*) as total FROM vendas WHERE empresa_id IS NULL;



