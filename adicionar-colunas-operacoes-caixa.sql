-- ADICIONAR COLUNAS FALTANTES NA TABELA OPERACOES_CAIXA
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. Adicionar colunas que estão faltando
ALTER TABLE public.operacoes_caixa 
ADD COLUMN IF NOT EXISTS data_abertura DATE,
ADD COLUMN IF NOT EXISTS hora_abertura TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS data_fechamento DATE,
ADD COLUMN IF NOT EXISTS hora_fechamento TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS saldo_inicial DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS saldo_final DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS total_entradas DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_saidas DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS observacoes_abertura TEXT,
ADD COLUMN IF NOT EXISTS observacoes_fechamento TEXT,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'aberta',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Adicionar constraints se necessário
ALTER TABLE public.operacoes_caixa 
ADD CONSTRAINT IF NOT EXISTS check_status 
CHECK (status IN ('aberta', 'fechada'));

-- 3. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_operacoes_caixa_company_id ON public.operacoes_caixa(company_id);
CREATE INDEX IF NOT EXISTS idx_operacoes_caixa_data_abertura ON public.operacoes_caixa(data_abertura);
CREATE INDEX IF NOT EXISTS idx_operacoes_caixa_status ON public.operacoes_caixa(status);

-- 4. Verificar estrutura final
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'operacoes_caixa'
AND table_schema = 'public'
ORDER BY ordinal_position;

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
    'Teste após adicionar colunas',
    'aberta'
);

-- 6. Verificar se inseriu
SELECT * FROM public.operacoes_caixa;

-- Mensagem de sucesso
SELECT 'Colunas adicionadas com sucesso!' AS status;

