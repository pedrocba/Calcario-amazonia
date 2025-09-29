-- ==============================================
-- VERIFICAR ESTRUTURA DA TABELA PRODUCTS
-- ==============================================
-- Execute este script no Supabase SQL Editor

-- 1. Verificar estrutura da tabela products
SELECT 
    'Estrutura da tabela products:' as info,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar dados existentes na tabela products
SELECT 
    'Dados atuais na tabela products:' as info,
    id,
    name,
    code,
    empresa_id
FROM products
LIMIT 5;

-- 3. Verificar se empresa_id existe na tabela products
SELECT 
    'Coluna empresa_id em products:' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name = 'empresa_id'
AND table_schema = 'public';



