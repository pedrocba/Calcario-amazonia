-- USAR TABELA OPERACOES_CAIXA EXISTENTE
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. Verificar estrutura da tabela operacoes_caixa
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'operacoes_caixa'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Se a tabela operacoes_caixa não existir, criar
CREATE TABLE IF NOT EXISTS public.operacoes_caixa (
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
ALTER TABLE public.operacoes_caixa ENABLE ROW LEVEL SECURITY;

-- 4. Criar política simples
DROP POLICY IF EXISTS "Allow all operations" ON public.operacoes_caixa;
CREATE POLICY "Allow all operations" ON public.operacoes_caixa
    FOR ALL USING (true);

-- 5. Testar inserção
INSERT INTO public.operacoes_caixa (
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
    0.00,
    'Teste de criação da tabela',
    'aberta'
);

-- 6. Verificar se funcionou
SELECT * FROM public.operacoes_caixa;

-- Mensagem de sucesso
SELECT 'Tabela operacoes_caixa pronta para uso!' AS status;

