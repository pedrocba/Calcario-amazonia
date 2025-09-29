-- ==============================================
-- CORREÇÃO DA TABELA EMPRESAS
-- ==============================================
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a tabela empresas existe e sua estrutura
SELECT 
    'Estrutura da tabela empresas:' as info,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'empresas' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Se a tabela não existir, criar
CREATE TABLE IF NOT EXISTS empresas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    razao_social VARCHAR(255),
    cnpj VARCHAR(18),
    ie VARCHAR(20),
    endereco TEXT,
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(10),
    telefone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    tipo VARCHAR(20) DEFAULT 'matriz' CHECK (tipo IN ('matriz', 'filial')),
    ativa BOOLEAN DEFAULT true,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Inserir empresa CBA
INSERT INTO empresas (
    id, nome, razao_social, tipo, ativa
) VALUES (
    '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid,
    'CBA - Santarém (Matriz)',
    'Calcário Amazônia Ltda',
    'matriz',
    true
) ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    razao_social = EXCLUDED.razao_social,
    tipo = EXCLUDED.tipo,
    ativa = EXCLUDED.ativa;

-- 4. Verificar resultado
SELECT 
    'Empresa CBA inserida:' as info,
    id,
    nome,
    razao_social,
    tipo,
    ativa
FROM empresas
WHERE id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid;



