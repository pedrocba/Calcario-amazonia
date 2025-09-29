-- ==============================================
-- CADASTRAR FILIAIS COM CAMPOS CORRETOS
-- ==============================================
-- Execute este script no Supabase SQL Editor

-- 1. CADASTRAR LOJA DO SERTANEJO - SANTARÉM
-- Usando apenas os campos que existem na tabela companies
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
    gen_random_uuid(),
    'Loja do Sertanejo - Santarém',
    'LDS',
    'Loja do Sertanejo LTDA',
    'Santarém',
    'PA',
    'loja',
    true,
    '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid
);

-- 2. CADASTRAR CBA MUCJAÍ - RORAIMA
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
    gen_random_uuid(),
    'CBA - Mucajaí (Filial)',
    'CBA-MUC',
    'Cba - Mineração e Comercio de Calcário e Brita da Amazônia Ltda',
    'Mucajaí',
    'RR',
    'filial',
    true,
    '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid
);

-- 3. ATUALIZAR CBA SANTARÉM (MATRIZ) SE NECESSÁRIO
UPDATE companies 
SET 
    full_name = 'Cba - Mineração e Comercio de Calcário e Brita da Amazônia Ltda',
    city = 'Santarém',
    state = 'PA'
WHERE name = 'CBA - Santarém (Matriz)';

-- 4. VERIFICAR FILIAIS CADASTRADAS
SELECT 
    'Filiais cadastradas:' as info,
    id,
    name,
    code,
    full_name,
    city,
    state,
    type,
    active,
    empresa_id,
    created_at
FROM companies
ORDER BY 
    CASE 
        WHEN type = 'matriz' THEN 1
        WHEN type = 'filial' THEN 2
        WHEN type = 'loja' THEN 3
        ELSE 4
    END,
    name;

-- 5. VERIFICAR ISOLAMENTO POR EMPRESA
SELECT 
    'Isolamento por empresa:' as info,
    empresa_id,
    COUNT(*) as total_filiais
FROM companies
GROUP BY empresa_id;

-- 6. RESULTADO FINAL
SELECT 'FILIAIS CADASTRADAS COM CAMPOS CORRETOS!' as status;
SELECT 'Sistema multi-tenant configurado com dados reais!' as info;



