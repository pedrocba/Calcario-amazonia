-- TESTE SIMPLES - CRIAR TABELA CAIXA
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. Verificar se a tabela existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'sessoes_caixa';

-- 2. Criar tabela simples
CREATE TABLE IF NOT EXISTS public.sessoes_caixa (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL,
    data_abertura DATE NOT NULL,
    hora_abertura TIMESTAMP WITH TIME ZONE NOT NULL,
    data_fechamento DATE,
    hora_fechamento TIMESTAMP WITH TIME ZONE,
    saldo_inicial DECIMAL(15,2) DEFAULT 0,
    saldo_final DECIMAL(15,2),
    total_entradas DECIMAL(15,2) DEFAULT 0,
    total_saidas DECIMAL(15,2) DEFAULT 0,
    observacoes_abertura TEXT,
    observacoes_fechamento TEXT,
    status VARCHAR(20) DEFAULT 'aberta',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Habilitar RLS
ALTER TABLE public.sessoes_caixa ENABLE ROW LEVEL SECURITY;

-- 4. Criar política simples
CREATE POLICY "Allow all" ON public.sessoes_caixa
    FOR ALL USING (true);

-- 5. Testar inserção
INSERT INTO public.sessoes_caixa (
    company_id,
    data_abertura,
    hora_abertura,
    saldo_inicial,
    observacoes_abertura,
    status
) VALUES (
    '68cacb91-3d16-9d19-1be6-c90d0a7b8c1f',
    CURRENT_DATE,
    NOW(),
    100.00,
    'Teste de inserção',
    'aberta'
);

-- 6. Verificar se inseriu
SELECT * FROM public.sessoes_caixa;

-- 7. Verificar estrutura
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'sessoes_caixa' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Mensagem final
SELECT 'Tabela sessoes_caixa criada e testada!' AS resultado;

