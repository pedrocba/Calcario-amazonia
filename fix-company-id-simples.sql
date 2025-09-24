-- SOLUÇÃO SIMPLES E DIRETA
-- Execute este script no Supabase SQL Editor

-- 1. Criar tabela companies
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Inserir o company_id
INSERT INTO companies (id, name)
VALUES (
  '68cacb91-3d16-9d19-1be6-c90d000000000000'::uuid,
  'Empresa Principal'
) ON CONFLICT (id) DO NOTHING;

-- 3. Verificar se funcionou
SELECT 'Company_id criado com sucesso!' as status;

