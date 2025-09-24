-- TESTAR RESUMO FINANCEIRO
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. Verificar vendas com faturamento
SELECT 
    v.id as venda_id,
    v.final_amount,
    v.status as venda_status,
    f.id as fatura_id,
    f.status as fatura_status,
    f.final_value as fatura_valor,
    COUNT(p.id) as total_parcelas,
    COUNT(CASE WHEN p.status = 'paid' THEN 1 END) as parcelas_pagas
FROM vendas v
LEFT JOIN faturas f ON f.venda_id = v.id
LEFT JOIN parcelas p ON p.fatura_id = f.id
WHERE v.status IN ('faturada', 'concluida', 'pago')
GROUP BY v.id, v.final_amount, v.status, f.id, f.status, f.final_value
ORDER BY v.created_at DESC
LIMIT 10;

-- 2. Verificar pagamentos parciais
SELECT 
    pp.id,
    pp.venda_id,
    pp.valor_pago,
    pp.data_pagamento,
    pp.status,
    v.final_amount as venda_valor
FROM pagamentos_parciais pp
JOIN vendas v ON v.id = pp.venda_id
ORDER BY pp.data_pagamento DESC
LIMIT 10;

-- 3. Calcular resumo financeiro manualmente
WITH resumo_vendas AS (
    SELECT 
        v.id as venda_id,
        v.final_amount as valor_total,
        COALESCE(SUM(pp.valor_pago), 0) as total_pago,
        v.final_amount - COALESCE(SUM(pp.valor_pago), 0) as saldo_devedor
    FROM vendas v
    LEFT JOIN pagamentos_parciais pp ON pp.venda_id = v.id AND pp.status = 'confirmado'
    WHERE v.status IN ('faturada', 'concluida', 'pago')
    GROUP BY v.id, v.final_amount
)
SELECT 
    venda_id,
    valor_total,
    total_pago,
    saldo_devedor,
    CASE 
        WHEN valor_total > 0 THEN ROUND((total_pago / valor_total) * 100, 1)
        ELSE 0 
    END as percentual_pago
FROM resumo_vendas
ORDER BY valor_total DESC
LIMIT 10;

