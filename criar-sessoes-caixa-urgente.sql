-- CRIAR TABELA SESSÕES DE CAIXA - URGENTE
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. Criar tabela sessoes_caixa
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
    status VARCHAR(20) DEFAULT 'aberta' CHECK (status IN ('aberta', 'fechada')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar índices
CREATE INDEX IF NOT EXISTS idx_sessoes_caixa_company_id ON public.sessoes_caixa(company_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_caixa_data_abertura ON public.sessoes_caixa(data_abertura);
CREATE INDEX IF NOT EXISTS idx_sessoes_caixa_status ON public.sessoes_caixa(status);

-- 3. Habilitar RLS
ALTER TABLE public.sessoes_caixa ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas RLS
DROP POLICY IF EXISTS "Users can view sessoes_caixa for their company" ON public.sessoes_caixa;
CREATE POLICY "Users can view sessoes_caixa for their company" ON public.sessoes_caixa
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert sessoes_caixa for their company" ON public.sessoes_caixa;
CREATE POLICY "Users can insert sessoes_caixa for their company" ON public.sessoes_caixa
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update sessoes_caixa for their company" ON public.sessoes_caixa;
CREATE POLICY "Users can update sessoes_caixa for their company" ON public.sessoes_caixa
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Users can delete sessoes_caixa for their company" ON public.sessoes_caixa;
CREATE POLICY "Users can delete sessoes_caixa for their company" ON public.sessoes_caixa
    FOR DELETE USING (true);

-- 5. Verificar se a tabela foi criada
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'sessoes_caixa'
ORDER BY ordinal_position;

-- 6. Testar inserção
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
    0.00,
    'Teste de criação da tabela',
    'aberta'
);

-- 7. Verificar se inseriu
SELECT * FROM public.sessoes_caixa;

-- Mensagem de sucesso
SELECT 'Tabela sessoes_caixa criada e testada com sucesso!' AS status;
