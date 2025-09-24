-- CRIAR TABELA OPERACOES_CAIXA DEFINITIVA - UUID CORRIGIDO
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. Dropar tabela existente se houver
DROP TABLE IF EXISTS public.operacoes_caixa CASCADE;

-- 2. Criar tabela operacoes_caixa completa
CREATE TABLE public.operacoes_caixa (
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
    status VARCHAR(20) DEFAULT 'aberta' CHECK (status IN ('aberta', 'fechada')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar índices
CREATE INDEX idx_operacoes_caixa_company_id ON public.operacoes_caixa(company_id);
CREATE INDEX idx_operacoes_caixa_data_abertura ON public.operacoes_caixa(data_abertura);
CREATE INDEX idx_operacoes_caixa_status ON public.operacoes_caixa(status);

-- 4. Habilitar RLS
ALTER TABLE public.operacoes_caixa ENABLE ROW LEVEL SECURITY;

-- 5. Criar política RLS
CREATE POLICY "Allow all operations" ON public.operacoes_caixa
    FOR ALL USING (true);

-- 6. Testar inserção com UUID CORRETO
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
    1000.00,
    'Teste de criação da tabela operacoes_caixa',
    'aberta'
);

-- 7. Verificar estrutura
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'operacoes_caixa'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 8. Verificar dados
SELECT * FROM public.operacoes_caixa;

-- Mensagem de sucesso
SELECT 'Tabela operacoes_caixa criada com sucesso!' AS status;

