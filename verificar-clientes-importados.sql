-- Verificar clientes importados e seus empresa_id
SELECT 
    id,
    name,
    document,
    type,
    empresa_id,
    created_at,
    active
FROM contacts 
WHERE type = 'cliente'
ORDER BY created_at DESC
LIMIT 10;

-- Verificar total de clientes por empresa
SELECT 
    empresa_id,
    COUNT(*) as total_clientes
FROM contacts 
WHERE type = 'cliente' AND active = true
GROUP BY empresa_id
ORDER BY total_clientes DESC;

-- Verificar se há clientes sem empresa_id
SELECT 
    COUNT(*) as clientes_sem_empresa_id
FROM contacts 
WHERE type = 'cliente' AND empresa_id IS NULL;

-- Verificar se há clientes com empresa_id incorreto
SELECT 
    empresa_id,
    COUNT(*) as total
FROM contacts 
WHERE type = 'cliente' 
  AND empresa_id != '68cacb91-3d16-9d19-1be6-c90d00000000'
GROUP BY empresa_id;



