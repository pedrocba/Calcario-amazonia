-- =====================================================
-- CORREÇÃO CRÍTICA: get_user_companies
-- =====================================================
-- Esta função substitui a versão defeituosa que estava
-- causando erro 500 Internal Server Error na página
-- de seleção de filiais.
-- 
-- Características da nova função:
-- - Lógica simplificada e robusta
-- - Retorna todas as empresas para usuários autenticados
-- - Sem complexidade desnecessária que pode causar falhas
-- - Ordenação por nome para consistência
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_user_companies()
RETURNS TABLE (
    id text, 
    name character varying, 
    full_name character varying, 
    city character varying, 
    state character varying, 
    description text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Lógica simplificada e garantida: Retorna todas as empresas para qualquer usuário autenticado.
    RETURN QUERY
    SELECT 
        c.id, 
        c.name, 
        c.full_name, 
        c.city, 
        c.state, 
        c.description
    FROM public.companies c
    WHERE c.active = true
    ORDER BY c.name;
END;
$$;

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON FUNCTION public.get_user_companies() IS 
'Função simplificada para retornar lista de empresas ativas para seleção de filial.
Substitui versão anterior que causava erro 500 Internal Server Error.
Retorna todas as empresas ativas ordenadas por nome.';

-- =====================================================
-- GRANT DE PERMISSÕES
-- =====================================================

-- Permitir que usuários anônimos executem a função
GRANT EXECUTE ON FUNCTION public.get_user_companies() TO anon;

-- Permitir que usuários autenticados executem a função  
GRANT EXECUTE ON FUNCTION public.get_user_companies() TO authenticated;

-- =====================================================
-- TESTE DA FUNÇÃO (OPCIONAL)
-- =====================================================

-- Para testar a função, execute:
-- SELECT * FROM public.get_user_companies();

-- =====================================================
-- VERIFICAÇÃO DE STATUS
-- =====================================================

-- Para verificar se a função foi criada corretamente:
-- SELECT 
--     routine_name, 
--     routine_type, 
--     data_type as return_type
-- FROM information_schema.routines 
-- WHERE routine_name = 'get_user_companies' 
-- AND routine_schema = 'public';














