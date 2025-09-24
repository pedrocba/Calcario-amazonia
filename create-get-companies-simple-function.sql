-- =====================================================
-- FUNÇÃO: get_companies_simple
-- =====================================================
-- Esta função retorna uma lista simples de empresas
-- para ser usada na seleção de filial no frontend.
-- 
-- Características:
-- - SECURITY DEFINER: Executa com privilégios do criador
-- - Retorna apenas colunas essenciais
-- - Ordenada por nome
-- - Bypass RLS para funcionar no frontend
-- =====================================================

CREATE OR REPLACE FUNCTION get_companies_simple()
RETURNS TABLE (
    id TEXT,
    name TEXT,
    full_name TEXT,
    city TEXT,
    state TEXT,
    description TEXT
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        c.id,
        c.name,
        c.full_name,
        c.city,
        c.state,
        c.description
    FROM companies c
    WHERE c.active = true
    ORDER BY c.name ASC;
$$;

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON FUNCTION get_companies_simple() IS 
'Retorna lista simples de empresas ativas para seleção de filial no frontend. 
Bypass RLS para funcionar sem problemas de permissão.';

-- =====================================================
-- GRANT DE PERMISSÕES
-- =====================================================

-- Permitir que usuários anônimos executem a função
GRANT EXECUTE ON FUNCTION get_companies_simple() TO anon;

-- Permitir que usuários autenticados executem a função  
GRANT EXECUTE ON FUNCTION get_companies_simple() TO authenticated;

-- =====================================================
-- TESTE DA FUNÇÃO (OPCIONAL)
-- =====================================================

-- Para testar a função, execute:
-- SELECT * FROM get_companies_simple();














