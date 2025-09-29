-- Adicionar colunas necessárias para isolamento por empresa
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS owner_company_id UUID;

ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS parent_company_id UUID;

-- Atualizar empresas existentes
UPDATE public.companies 
SET owner_company_id = id, parent_company_id = id
WHERE owner_company_id IS NULL;



