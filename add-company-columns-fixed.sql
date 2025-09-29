-- Adicionar colunas necessárias para isolamento por empresa
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS owner_company_id TEXT;

ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS parent_company_id TEXT;

-- Atualizar empresas existentes (usando TEXT em vez de UUID)
UPDATE public.companies 
SET owner_company_id = id, parent_company_id = id
WHERE owner_company_id IS NULL;



