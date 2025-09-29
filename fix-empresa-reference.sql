-- ==============================================
-- CORRIGIR REFERÊNCIA À EMPRESA CBA
-- ==============================================
-- Execute este script no Supabase SQL Editor

-- 1. Verificar estrutura da tabela empresas
SELECT 
    'Estrutura da tabela empresas:' as info,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'empresas' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar dados existentes na tabela empresas
SELECT 
    'Dados atuais na tabela empresas:' as info,
    id,
    nome,
    tipo
FROM empresas
ORDER BY created_at;

-- 3. Inserir empresa CBA com a estrutura atual da tabela
-- Vamos usar apenas as colunas que existem
DO $$
DECLARE
    col_count INTEGER;
    has_nome BOOLEAN := FALSE;
    has_tipo BOOLEAN := FALSE;
    has_ativa BOOLEAN := FALSE;
    has_razao_social BOOLEAN := FALSE;
    sql_insert TEXT;
BEGIN
    -- Verificar quais colunas existem
    SELECT COUNT(*) INTO col_count FROM information_schema.columns 
    WHERE table_name = 'empresas' AND column_name = 'nome' AND table_schema = 'public';
    has_nome := (col_count > 0);
    
    SELECT COUNT(*) INTO col_count FROM information_schema.columns 
    WHERE table_name = 'empresas' AND column_name = 'tipo' AND table_schema = 'public';
    has_tipo := (col_count > 0);
    
    SELECT COUNT(*) INTO col_count FROM information_schema.columns 
    WHERE table_name = 'empresas' AND column_name = 'ativa' AND table_schema = 'public';
    has_ativa := (col_count > 0);
    
    SELECT COUNT(*) INTO col_count FROM information_schema.columns 
    WHERE table_name = 'empresas' AND column_name = 'razao_social' AND table_schema = 'public';
    has_razao_social := (col_count > 0);
    
    -- Construir SQL de inserção baseado nas colunas existentes
    sql_insert := 'INSERT INTO empresas (id';
    IF has_nome THEN sql_insert := sql_insert || ', nome'; END IF;
    IF has_tipo THEN sql_insert := sql_insert || ', tipo'; END IF;
    IF has_ativa THEN sql_insert := sql_insert || ', ativa'; END IF;
    IF has_razao_social THEN sql_insert := sql_insert || ', razao_social'; END IF;
    sql_insert := sql_insert || ') VALUES (''68cacb91-3d16-9d19-1be6-c90d00000000''::uuid';
    IF has_nome THEN sql_insert := sql_insert || ', ''CBA - Santarém (Matriz)'''; END IF;
    IF has_tipo THEN sql_insert := sql_insert || ', ''matriz'''; END IF;
    IF has_ativa THEN sql_insert := sql_insert || ', true'; END IF;
    IF has_razao_social THEN sql_insert := sql_insert || ', ''Calcário Amazônia Ltda'''; END IF;
    sql_insert := sql_insert || ') ON CONFLICT (id) DO UPDATE SET ';
    
    -- Adicionar campos para UPDATE
    IF has_nome THEN sql_insert := sql_insert || 'nome = EXCLUDED.nome'; END IF;
    IF has_tipo THEN 
        IF has_nome THEN sql_insert := sql_insert || ', '; END IF;
        sql_insert := sql_insert || 'tipo = EXCLUDED.tipo'; 
    END IF;
    IF has_ativa THEN 
        IF has_nome OR has_tipo THEN sql_insert := sql_insert || ', '; END IF;
        sql_insert := sql_insert || 'ativa = EXCLUDED.ativa'; 
    END IF;
    IF has_razao_social THEN 
        IF has_nome OR has_tipo OR has_ativa THEN sql_insert := sql_insert || ', '; END IF;
        sql_insert := sql_insert || 'razao_social = EXCLUDED.razao_social'; 
    END IF;
    sql_insert := sql_insert || ';';
    
    -- Executar a inserção
    EXECUTE sql_insert;
    
    RAISE NOTICE 'Empresa CBA inserida com sucesso!';
    RAISE NOTICE 'SQL executado: %', sql_insert;
END $$;

-- 4. Verificar se a empresa CBA foi inserida
SELECT 
    'Empresa CBA após inserção:' as info,
    id,
    nome,
    tipo,
    ativa
FROM empresas
WHERE id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid;

-- 5. Se ainda não existir, criar com ID diferente
INSERT INTO empresas (id, nome, tipo, ativa)
SELECT 
    '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid,
    'CBA - Santarém (Matriz)',
    'matriz',
    true
WHERE NOT EXISTS (
    SELECT 1 FROM empresas 
    WHERE id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid
);

-- 6. Verificar resultado final
SELECT 
    'Empresas disponíveis:' as info,
    id,
    nome,
    tipo,
    ativa
FROM empresas
ORDER BY created_at;



