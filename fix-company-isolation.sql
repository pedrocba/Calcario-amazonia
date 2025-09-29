-- ==============================================
-- CORREÇÃO DO ISOLAMENTO DE EMPRESAS POR FILIAL
-- ==============================================
-- Execute este script no Supabase SQL Editor

-- 1. Adicionar coluna parent_company_id para identificar a empresa pai
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS parent_company_id UUID REFERENCES public.companies(id);

-- 2. Adicionar coluna owner_company_id para identificar qual empresa criou/gerencia esta empresa
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS owner_company_id UUID REFERENCES public.companies(id);

-- 3. Atualizar a empresa CBA existente para ser a empresa raiz
UPDATE public.companies 
SET parent_company_id = id, owner_company_id = id
WHERE code = 'CBA' OR name LIKE '%CBA%' OR name LIKE '%Calcário%'
LIMIT 1;

-- 4. Se não existir empresa CBA, criar uma
INSERT INTO public.companies (
    id, name, code, full_name, type, active, parent_company_id, owner_company_id
)
SELECT 
    '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid,
    'CBA - Santarém (Matriz)',
    'CBA',
    'Calcário Amazônia Ltda',
    'matriz',
    true,
    '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid,
    '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid
WHERE NOT EXISTS (
    SELECT 1 FROM public.companies 
    WHERE code = 'CBA' OR name LIKE '%CBA%'
);

-- 5. Atualizar políticas RLS para filtrar por owner_company_id
DROP POLICY IF EXISTS "Authenticated users can view companies" ON public.companies;
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

-- 6. Política para inserção - empresas são criadas com owner_company_id do usuário
DROP POLICY IF EXISTS "Admins can manage companies" ON public.companies;
CREATE POLICY "Users can manage their company's companies" ON public.companies
    FOR ALL USING (
        auth.role() = 'authenticated' AND (
            -- Super admins podem gerenciar todas as empresas
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE id = auth.uid() AND role = 'super_admin'
            )
            OR
            -- Usuários normais gerenciam apenas empresas da sua filial
            owner_company_id = (
                SELECT company_id FROM public.profiles 
                WHERE id = auth.uid()
            )
        )
    );

-- 7. Trigger para definir automaticamente owner_company_id na inserção
CREATE OR REPLACE FUNCTION set_owner_company_id()
RETURNS TRIGGER AS $$
BEGIN
    -- Se owner_company_id não foi definido, usar a empresa do usuário
    IF NEW.owner_company_id IS NULL THEN
        NEW.owner_company_id := (
            SELECT company_id FROM public.profiles 
            WHERE id = auth.uid()
        );
    END IF;
    
    -- Se parent_company_id não foi definido, usar o mesmo que owner_company_id
    IF NEW.parent_company_id IS NULL THEN
        NEW.parent_company_id := NEW.owner_company_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Aplicar o trigger
DROP TRIGGER IF EXISTS trigger_set_owner_company_id ON public.companies;
CREATE TRIGGER trigger_set_owner_company_id
    BEFORE INSERT ON public.companies
    FOR EACH ROW
    EXECUTE FUNCTION set_owner_company_id();

-- 9. Verificar resultado
SELECT 
    'Empresas após correção:' as status,
    id,
    name,
    code,
    type,
    owner_company_id,
    parent_company_id
FROM public.companies
ORDER BY created_at;



