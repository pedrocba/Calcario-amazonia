-- ==============================================
-- CORRIGIR FORMATO DO UUID NO BANCO
-- ==============================================
-- Execute este script no Supabase SQL Editor

-- 1. Verificar registros com UUID incorreto
SELECT 
    'Registros com UUID incorreto:' as info,
    table_name,
    column_name,
    COUNT(*) as total
FROM information_schema.columns c
JOIN (
    SELECT 'profiles' as table_name, 'empresa_id' as column_name
    UNION ALL SELECT 'companies', 'empresa_id'
    UNION ALL SELECT 'products', 'empresa_id'
    UNION ALL SELECT 'contacts', 'empresa_id'
    UNION ALL SELECT 'vendas', 'empresa_id'
    UNION ALL SELECT 'product_categories', 'empresa_id'
) t ON c.table_name = t.table_name AND c.column_name = t.column_name
WHERE c.table_schema = 'public'
GROUP BY table_name, column_name;

-- 2. Atualizar UUID incorreto para o formato correto
UPDATE profiles 
SET empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid 
WHERE empresa_id::text = '68cacb913d169d191be6c90d';

UPDATE companies 
SET empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid 
WHERE empresa_id::text = '68cacb913d169d191be6c90d';

UPDATE products 
SET empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid 
WHERE empresa_id::text = '68cacb913d169d191be6c90d';

UPDATE contacts 
SET empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid 
WHERE empresa_id::text = '68cacb913d169d191be6c90d';

UPDATE vendas 
SET empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid 
WHERE empresa_id::text = '68cacb913d169d191be6c90d';

UPDATE product_categories 
SET empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid 
WHERE empresa_id::text = '68cacb913d169d191be6c90d';

-- 3. Atualizar outras tabelas se existirem
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'financial_transactions' AND table_schema = 'public') THEN
        UPDATE financial_transactions 
        SET empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid 
        WHERE empresa_id::text = '68cacb913d169d191be6c90d';
        RAISE NOTICE 'Tabela financial_transactions atualizada.';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'financial_accounts' AND table_schema = 'public') THEN
        UPDATE financial_accounts 
        SET empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid 
        WHERE empresa_id::text = '68cacb913d169d191be6c90d';
        RAISE NOTICE 'Tabela financial_accounts atualizada.';
    END IF;
END $$;

-- 4. Verificar resultado
SELECT 'UUIDs corrigidos com sucesso!' as status;
SELECT 'Profiles com empresa_id correto:' as info, COUNT(*) as total FROM profiles WHERE empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid;
SELECT 'Companies com empresa_id correto:' as info, COUNT(*) as total FROM companies WHERE empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid;
SELECT 'Products com empresa_id correto:' as info, COUNT(*) as total FROM products WHERE empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid;
SELECT 'Contacts com empresa_id correto:' as info, COUNT(*) as total FROM contacts WHERE empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid;
SELECT 'Vendas com empresa_id correto:' as info, COUNT(*) as total FROM vendas WHERE empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid;



