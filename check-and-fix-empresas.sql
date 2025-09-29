-- ==============================================
-- VERIFICAR E CORRIGIR TABELA EMPRESAS
-- ==============================================
-- Execute este script no Supabase SQL Editor

-- 1. Verificar estrutura atual da tabela empresas
SELECT 
    'Estrutura atual da tabela empresas:' as info,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'empresas' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar se a tabela tem dados
SELECT 
    'Dados atuais na tabela empresas:' as info,
    COUNT(*) as total_registros
FROM empresas;

-- 3. Se a tabela estiver vazia, inserir empresa CBA com a estrutura atual
-- Primeiro vamos ver quais colunas existem
DO $$
DECLARE
    col_count INTEGER;
    has_nome BOOLEAN := FALSE;
    has_tipo BOOLEAN := FALSE;
    has_ativa BOOLEAN := FALSE;
BEGIN
    -- Verificar se colunas existem
    SELECT COUNT(*) INTO col_count FROM information_schema.columns 
    WHERE table_name = 'empresas' AND column_name = 'nome' AND table_schema = 'public';
    has_nome := (col_count > 0);
    
    SELECT COUNT(*) INTO col_count FROM information_schema.columns 
    WHERE table_name = 'empresas' AND column_name = 'tipo' AND table_schema = 'public';
    has_tipo := (col_count > 0);
    
    SELECT COUNT(*) INTO col_count FROM information_schema.columns 
    WHERE table_name = 'empresas' AND column_name = 'ativa' AND table_schema = 'public';
    has_ativa := (col_count > 0);
    
    -- Inserir empresa CBA com as colunas que existem
    IF has_nome AND has_tipo AND has_ativa THEN
        INSERT INTO empresas (id, nome, tipo, ativa)
        VALUES ('68cacb91-3d16-9d19-1be6-c90d00000000'::uuid, 'CBA - Santarém (Matriz)', 'matriz', true)
        ON CONFLICT (id) DO UPDATE SET
            nome = EXCLUDED.nome,
            tipo = EXCLUDED.tipo,
            ativa = EXCLUDED.ativa;
        
        RAISE NOTICE 'Empresa CBA inserida com sucesso!';
    ELSE
        RAISE NOTICE 'Estrutura da tabela empresas não é compatível. Colunas encontradas: nome=%, tipo=%, ativa=%', has_nome, has_tipo, has_ativa;
    END IF;
END $$;

-- 4. Verificar resultado
SELECT 
    'Empresa CBA após inserção:' as info,
    id,
    nome,
    tipo,
    ativa
FROM empresas
WHERE id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid;



