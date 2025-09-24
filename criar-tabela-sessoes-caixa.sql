-- CRIAR TABELA SESSÕES DE CAIXA
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

-- 2. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_sessoes_caixa_company_id ON public.sessoes_caixa(company_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_caixa_data_abertura ON public.sessoes_caixa(data_abertura);
CREATE INDEX IF NOT EXISTS idx_sessoes_caixa_status ON public.sessoes_caixa(status);

-- 3. Habilitar RLS (Row Level Security)
ALTER TABLE public.sessoes_caixa ENABLE ROW LEVEL SECURITY;

-- 4. Criar política de RLS
CREATE POLICY "Users can view sessoes_caixa for their company" ON public.sessoes_caixa
    FOR SELECT USING (company_id = (SELECT id FROM companies WHERE id = company_id));

CREATE POLICY "Users can insert sessoes_caixa for their company" ON public.sessoes_caixa
    FOR INSERT WITH CHECK (company_id = (SELECT id FROM companies WHERE id = company_id));

CREATE POLICY "Users can update sessoes_caixa for their company" ON public.sessoes_caixa
    FOR UPDATE USING (company_id = (SELECT id FROM companies WHERE id = company_id));

CREATE POLICY "Users can delete sessoes_caixa for their company" ON public.sessoes_caixa
    FOR DELETE USING (company_id = (SELECT id FROM companies WHERE id = company_id));

-- 5. Criar trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sessoes_caixa_updated_at 
    BEFORE UPDATE ON public.sessoes_caixa 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Inserir sessão de exemplo (opcional)
INSERT INTO public.sessoes_caixa (
    company_id,
    data_abertura,
    hora_abertura,
    saldo_inicial,
    observacoes_abertura,
    status
) VALUES (
    '68cacb913d169d191be6c90d',
    CURRENT_DATE,
    NOW(),
    0.00,
    'Sessão inicial do sistema',
    'aberta'
) ON CONFLICT DO NOTHING;

-- 7. Verificar se a tabela foi criada
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'sessoes_caixa'
ORDER BY ordinal_position;

-- Mensagem de conclusão
SELECT 'Tabela sessoes_caixa criada com sucesso!' AS status;

