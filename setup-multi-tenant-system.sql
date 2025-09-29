-- ==============================================
-- CONFIGURAÇÃO COMPLETA DO SISTEMA MULTI-TENANT
-- ==============================================
-- Execute este script no Supabase SQL Editor

-- 1. Criar tabela empresas (matriz e filiais)
CREATE TABLE IF NOT EXISTS empresas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    codigo VARCHAR(50) UNIQUE NOT NULL,
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

-- 2. Ativar RLS na tabela empresas
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;

-- 3. Criar policy para empresas (super admins podem ver todas)
CREATE POLICY "empresas_isolada_por_empresa"
ON empresas
FOR ALL
USING (
    -- Super admins podem ver todas as empresas
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE user_id = auth.uid() AND role = 'super_admin'
    )
    OR
    -- Usuários normais veem apenas sua empresa
    id = (SELECT empresa_id FROM profiles WHERE user_id = auth.uid())
)
WITH CHECK (
    -- Super admins podem gerenciar todas as empresas
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE user_id = auth.uid() AND role = 'super_admin'
    )
    OR
    -- Usuários normais gerenciam apenas sua empresa
    id = (SELECT empresa_id FROM profiles WHERE user_id = auth.uid())
);

-- 4. Corrigir tabela profiles para usar empresa_id
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES empresas(id);

-- 5. Ativar RLS na tabela profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 6. Criar policy para profiles
CREATE POLICY "profiles_isolada_por_empresa"
ON profiles
FOR ALL
USING (
    empresa_id = (SELECT empresa_id FROM profiles WHERE user_id = auth.uid())
)
WITH CHECK (
    empresa_id = (SELECT empresa_id FROM profiles WHERE user_id = auth.uid())
);

-- 7. Criar função para definir empresa_id automaticamente
CREATE OR REPLACE FUNCTION set_empresa_id()
RETURNS TRIGGER AS $$
BEGIN
    -- Se empresa_id não foi definido, usar a empresa do usuário
    IF NEW.empresa_id IS NULL THEN
        NEW.empresa_id := (SELECT empresa_id FROM profiles WHERE user_id = auth.uid());
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Inserir empresa CBA
INSERT INTO empresas (
    id, nome, codigo, razao_social, tipo, ativa
) VALUES (
    '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid,
    'CBA - Santarém (Matriz)',
    'CBA',
    'Calcário Amazônia Ltda',
    'matriz',
    true
) ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    codigo = EXCLUDED.codigo,
    razao_social = EXCLUDED.razao_social,
    tipo = EXCLUDED.tipo,
    ativa = EXCLUDED.ativa;

-- 9. Atualizar profiles existentes para usar empresa CBA
UPDATE profiles 
SET empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid
WHERE empresa_id IS NULL;

-- 10. Verificar resultado
SELECT 
    'Empresas criadas:' as info,
    id,
    nome,
    codigo,
    tipo,
    ativa
FROM empresas
ORDER BY created_at;

SELECT 
    'Profiles atualizados:' as info,
    id,
    email,
    role,
    empresa_id
FROM profiles
ORDER BY created_at;



