-- CORRIGIR VENDA ESPECÍFICA PARA STATUS PENDENTE
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- Substitua 'SEU_ID_DA_VENDA' pelo ID real da venda que está dando erro
-- Exemplo: WHERE id = '5697c-e3a3-4f36-b935-6dbe35fca654'

-- 1. Verificar status atual da venda
SELECT 
    id,
    status,
    created_at,
    updated_at
FROM vendas 
WHERE id = 'SEU_ID_DA_VENDA';

-- 2. Corrigir status para pendente
UPDATE vendas 
SET status = 'pendente',
    updated_at = NOW()
WHERE id = 'SEU_ID_DA_VENDA';

-- 3. Verificar se foi corrigido
SELECT 
    id,
    status,
    updated_at
FROM vendas 
WHERE id = 'SEU_ID_DA_VENDA';

-- 4. Se quiser corrigir TODAS as vendas para pendente (CUIDADO!)
-- Descomente as linhas abaixo apenas se necessário:
-- UPDATE vendas SET status = 'pendente' WHERE status != 'pendente';
-- SELECT 'Todas as vendas foram corrigidas para pendente!' as resultado;

