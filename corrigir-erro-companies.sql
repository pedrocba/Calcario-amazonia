-- Corrigir erro da tabela companies
-- Execute este script no Supabase SQL Editor

-- 1. Verificar estrutura atual da tabela companies
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'companies' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Adicionar coluna code se não existir
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS code TEXT UNIQUE;

-- 3. Adicionar outras colunas se não existirem
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS full_name TEXT;

ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'matriz';

ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- 4. Criar empresa padrão (sem especificar colunas que podem não existir)
INSERT INTO public.companies (id, name) 
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Empresa Padrão'
) ON CONFLICT (id) DO NOTHING;

-- 5. Atualizar empresa padrão com dados adicionais
UPDATE public.companies 
SET 
    code = 'DEFAULT001',
    full_name = 'Empresa Padrão Ltda',
    type = 'matriz',
    active = true
WHERE id = '00000000-0000-0000-0000-000000000001';

-- 6. Verificar se a empresa foi criada
SELECT * FROM public.companies WHERE id = '00000000-0000-0000-0000-000000000001';






