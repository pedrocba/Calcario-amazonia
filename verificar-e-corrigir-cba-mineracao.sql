-- ==============================================
-- VERIFICAR E CORRIGIR CBA MINERAÇÃO
-- ==============================================
-- Execute este script no Supabase SQL Editor

-- 1. Verificar dados da CBA Mineração
SELECT 
    'Dados da CBA Mineração:' as info,
    id,
    name,
    code,
    full_name,
    city,
    state,
    type,
    active,
    empresa_id
FROM companies
WHERE name LIKE '%CBA%' OR name LIKE '%Mineração%'
ORDER BY created_at;

-- 2. Verificar se há registros com ID inválido
SELECT 
    'Registros com ID inválido:' as info,
    id,
    name,
    LENGTH(id) as id_length,
    CASE 
        WHEN id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN 'UUID válido'
        ELSE 'UUID inválido'
    END as uuid_status
FROM companies
WHERE name LIKE '%CBA%' OR name LIKE '%Mineração%';

-- 3. Verificar vendas que podem estar causando o erro
SELECT 
    'Vendas com empresa_id inválido:' as info,
    id,
    total_amount,
    empresa_id,
    LENGTH(empresa_id::text) as empresa_id_length
FROM vendas
WHERE empresa_id::text LIKE '%comp_%' OR empresa_id::text LIKE '%c3f908c7%'
LIMIT 5;

-- 4. Corrigir CBA Mineração com UUID válido
UPDATE companies 
SET id = '68cacb91-3d16-9d19-1be6-c90d00000001'::uuid
WHERE id = 'comp_c3f908c7' OR id::text = 'comp_c3f908c7';

-- 5. Se não existir, criar CBA Mineração com UUID válido
INSERT INTO companies (
    id,
    name,
    code,
    full_name,
    city,
    state,
    type,
    active,
    empresa_id
) VALUES (
    '68cacb91-3d16-9d19-1be6-c90d00000001'::uuid,
    'CBA - Mineração',
    'CBA-MIN',
    'Cba - Mineração e Comercio de Calcário e Brita da Amazônia Ltda',
    'Santarém',
    'PA',
    'matriz',
    true,
    '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    code = EXCLUDED.code,
    full_name = EXCLUDED.full_name,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    type = EXCLUDED.type,
    active = EXCLUDED.active,
    empresa_id = EXCLUDED.empresa_id;

-- 6. Atualizar vendas com empresa_id correto
UPDATE vendas 
SET empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000001'::uuid
WHERE empresa_id::text = 'comp_c3f908c7' OR empresa_id::text LIKE '%comp_%';

-- 7. Atualizar outras tabelas se necessário
UPDATE contacts 
SET empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000001'::uuid
WHERE empresa_id::text = 'comp_c3f908c7' OR empresa_id::text LIKE '%comp_%';

UPDATE products 
SET empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000001'::uuid
WHERE empresa_id::text = 'comp_c3f908c7' OR empresa_id::text LIKE '%comp_%';

-- 8. Verificar resultado final
SELECT 
    'CBA Mineração corrigida:' as info,
    id,
    name,
    code,
    full_name,
    city,
    state,
    type,
    active,
    empresa_id
FROM companies
WHERE name LIKE '%CBA%' OR name LIKE '%Mineração%'
ORDER BY created_at;

-- 9. Verificar vendas da CBA Mineração
SELECT 
    'Vendas da CBA Mineração:' as info,
    COUNT(*) as total_vendas
FROM vendas
WHERE empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000001'::uuid;



