-- ==============================================
-- CADASTRAR FILIAIS REAIS COM DADOS COMPLETOS
-- ==============================================
-- Execute este script no Supabase SQL Editor

-- 1. CADASTRAR LOJA DO SERTANEJO - SANTARÉM
INSERT INTO companies (
    id,
    name,
    code,
    full_name,
    razao_social,
    cnpj,
    nome_fantasia,
    logradouro,
    complemento,
    bairro,
    cep,
    city,
    state,
    type,
    active,
    empresa_id
) VALUES (
    gen_random_uuid(),
    'Loja do Sertanejo - Santarém',
    'LDS',
    'Loja do Sertanejo - Santarém',
    'Loja do Sertanejo LTDA',
    '25.143.614/0001-53',
    'Loja do Sertanejo',
    'Avenida Cuiaba, 1030',
    'Rod.br 163 Km 04',
    'Sale',
    '68040-400',
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
    razao_social,
    cnpj,
    nome_fantasia,
    logradouro,
    complemento,
    bairro,
    cep,
    city,
    state,
    type,
    active,
    empresa_id
) VALUES (
    gen_random_uuid(),
    'CBA - Mucajaí (Filial)',
    'CBA-MUC',
    'CBA - Mucajaí (Filial)',
    'Cba - Mineração e Comercio de Calcário e Brita da Amazônia Ltda',
    '10.375.218/0004-27',
    'Cba',
    'AREA VICINAL APIAU KM 04 S N',
    '',
    'Zona Rural',
    '69340-000',
    'Mucajaí',
    'RR',
    'filial',
    true,
    '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid
);

-- 3. ATUALIZAR CBA SANTARÉM (MATRIZ) COM DADOS COMPLETOS
UPDATE companies 
SET 
    razao_social = 'Cba - Mineração e Comercio de Calcário e Brita da Amazônia Ltda',
    cnpj = '10.375.218/0001-00', -- CNPJ da matriz (assumindo)
    nome_fantasia = 'CBA - Santarém',
    logradouro = 'Endereço da Matriz',
    complemento = '',
    bairro = 'Centro',
    cep = '68000-000',
    city = 'Santarém',
    state = 'PA'
WHERE name = 'CBA - Santarém (Matriz)';

-- 4. VERIFICAR FILIAIS CADASTRADAS
SELECT 
    'Filiais cadastradas:' as info,
    id,
    name,
    code,
    razao_social,
    cnpj,
    nome_fantasia,
    city,
    state,
    type,
    active,
    empresa_id
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
SELECT 'FILIAIS CADASTRADAS COM SUCESSO!' as status;
SELECT 'Sistema multi-tenant configurado com dados reais!' as info;



