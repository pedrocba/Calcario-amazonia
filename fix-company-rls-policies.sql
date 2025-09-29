-- ==============================================
-- CORREÇÃO DAS POLÍTICAS RLS PARA ISOLAMENTO
-- ==============================================
-- Execute este script no Supabase SQL Editor

-- 1. Habilitar RLS na tabela companies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas existentes
DROP POLICY IF EXISTS "Authenticated users can view companies" ON public.companies;
DROP POLICY IF EXISTS "Admins can manage companies" ON public.companies;
DROP POLICY IF EXISTS "Users can view their company's companies" ON public.companies;
DROP POLICY IF EXISTS "Users can manage their company's companies" ON public.companies;

-- 3. Criar política para visualização - apenas empresas da própria filial
CREATE POLICY "Users can view their company's companies" ON public.companies
    FOR SELECT USING (
        auth.role() = 'authenticated' AND (
            -- Super admins podem ver todas as empresas
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE id = auth.uid() AND role = 'super_admin'
            )
            OR
            -- Usuários normais veem apenas empresas da sua filial
            owner_company_id = (
                SELECT company_id FROM public.profiles 
                WHERE id = auth.uid()
            )
        )
    );

-- 4. Criar política para inserção - empresas são criadas com owner_company_id do usuário
CREATE POLICY "Users can insert their company's companies" ON public.companies
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND (
            -- Super admins podem criar empresas para qualquer filial
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE id = auth.uid() AND role = 'super_admin'
            )
            OR
            -- Usuários normais criam empresas apenas para sua filial
            owner_company_id = (
                SELECT company_id FROM public.profiles 
                WHERE id = auth.uid()
            )
        )
    );

-- 5. Criar política para atualização - apenas empresas da própria filial
CREATE POLICY "Users can update their company's companies" ON public.companies
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND (
            -- Super admins podem atualizar todas as empresas
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE id = auth.uid() AND role = 'super_admin'
            )
            OR
            -- Usuários normais atualizam apenas empresas da sua filial
            owner_company_id = (
                SELECT company_id FROM public.profiles 
                WHERE id = auth.uid()
            )
        )
    );

-- 6. Criar política para exclusão - apenas empresas da própria filial
CREATE POLICY "Users can delete their company's companies" ON public.companies
    FOR DELETE USING (
        auth.role() = 'authenticated' AND (
            -- Super admins podem deletar todas as empresas
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE id = auth.uid() AND role = 'super_admin'
            )
            OR
            -- Usuários normais deletam apenas empresas da sua filial
            owner_company_id = (
                SELECT company_id FROM public.profiles 
                WHERE id = auth.uid()
            )
        )
    );

-- 7. Verificar se as políticas foram criadas
SELECT 
    'Políticas criadas:' as info,
    policyname, 
    cmd, 
    permissive
FROM pg_policies 
WHERE tablename = 'companies' 
AND schemaname = 'public'
ORDER BY policyname;



