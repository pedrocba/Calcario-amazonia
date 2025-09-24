-- VERIFICAR COMPANY_ID E TESTAR INSERÇÃO
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. Verificar se as tabelas foram criadas
SELECT 
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_name IN ('sessoes_caixa', 'financial_accounts')
AND table_schema = 'public';

-- 2. Verificar estrutura da sessoes_caixa
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'sessoes_caixa'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Testar inserção com UUID diferente
INSERT INTO public.sessoes_caixa (
    company_id,
    data_abertura,
    hora_abertura,
    saldo_inicial,
    observacoes_abertura,
    status
) VALUES (
    gen_random_uuid(), -- UUID aleatório
    CURRENT_DATE,
    NOW(),
    200.00,
    'Teste com UUID aleatório',
    'aberta'
);

-- 4. Verificar se inseriu
SELECT * FROM public.sessoes_caixa;

-- 5. Testar com o UUID específico
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
    300.00,
    'Teste com UUID específico',
    'aberta'
);

-- 6. Verificar se inseriu
SELECT * FROM public.sessoes_caixa WHERE company_id = '68cacb91-3d16-9d19-1be6-c90d0a7b8c1f';

-- Mensagem final
SELECT 'Testes de inserção concluídos!' AS resultado;

