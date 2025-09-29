-- Corrigir clientes que podem ter sido importados com company_id em vez de empresa_id

-- 1. Verificar se existe coluna company_id na tabela contacts
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contacts' 
        AND column_name = 'company_id'
        AND table_schema = 'public'
    ) THEN
        -- Atualizar clientes que têm company_id mas não têm empresa_id
        UPDATE contacts 
        SET empresa_id = company_id 
        WHERE type = 'cliente' 
          AND empresa_id IS NULL 
          AND company_id IS NOT NULL;
        
        -- Remover a coluna company_id se não for mais necessária
        ALTER TABLE contacts DROP COLUMN IF EXISTS company_id;
        
        RAISE NOTICE 'Coluna company_id removida e dados migrados para empresa_id';
    ELSE
        RAISE NOTICE 'Coluna company_id não existe na tabela contacts';
    END IF;
END $$;

-- 2. Verificar se todos os clientes têm empresa_id
SELECT 
    COUNT(*) as total_clientes,
    COUNT(empresa_id) as clientes_com_empresa_id,
    COUNT(*) - COUNT(empresa_id) as clientes_sem_empresa_id
FROM contacts 
WHERE type = 'cliente';

-- 3. Atualizar clientes sem empresa_id para usar o ID da CBA
UPDATE contacts 
SET empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'
WHERE type = 'cliente' 
  AND empresa_id IS NULL;

-- 4. Verificar resultado final
SELECT 
    empresa_id,
    COUNT(*) as total_clientes
FROM contacts 
WHERE type = 'cliente' AND active = true
GROUP BY empresa_id
ORDER BY total_clientes DESC;



