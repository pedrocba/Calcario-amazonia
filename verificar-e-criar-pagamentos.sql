-- VERIFICAR E CRIAR TABELA PAGAMENTOS_PARCIAIS
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. Verificar se a tabela existe
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'pagamentos_parciais'
        ) 
        THEN 'Tabela pagamentos_parciais JÁ EXISTE'
        ELSE 'Tabela pagamentos_parciais NÃO EXISTE - Criando...'
    END as status;

-- 2. Criar a tabela se não existir
CREATE TABLE IF NOT EXISTS pagamentos_parciais (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    venda_id UUID NOT NULL,
    fatura_id UUID,
    cliente_id UUID NOT NULL,
    valor_pago DECIMAL(10,2) NOT NULL,
    data_pagamento TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    forma_pagamento VARCHAR(50) NOT NULL,
    observacoes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'confirmado',
    company_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Verificar novamente
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'pagamentos_parciais'
        ) 
        THEN '✅ Tabela pagamentos_parciais CRIADA COM SUCESSO!'
        ELSE '❌ ERRO: Tabela não foi criada'
    END as resultado_final;

-- 4. Listar todas as tabelas para verificar
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%pagamento%'
ORDER BY table_name;

