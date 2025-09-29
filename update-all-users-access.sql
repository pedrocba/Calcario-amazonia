-- ===============================================
-- SCRIPT: DAR ACESSO TOTAL A TODOS OS USUÁRIOS
-- ===============================================
-- Este script atualiza TODOS os usuários existentes
-- para ter acesso total ao sistema

-- 1. Atualizar TODOS os usuários para role 'admin' (acesso total)
UPDATE profiles 
SET role = 'admin' 
WHERE role IN ('usuario_padrao', 'gerente_patio', 'almoxarife', 'admin');

-- 2. Verificar quantos usuários foram atualizados
SELECT 
  role,
  COUNT(*) as total_usuarios
FROM profiles 
GROUP BY role
ORDER BY total_usuarios DESC;

-- 3. Listar todos os usuários e seus novos roles
SELECT 
  id,
  email,
  full_name,
  role,
  created_at,
  CASE 
    WHEN role = 'admin' THEN '✅ ACESSO TOTAL'
    WHEN role = 'super_admin' THEN '👑 SUPER ADMIN'
    ELSE '❓ OUTRO'
  END as status_acesso
FROM profiles 
ORDER BY created_at DESC;

-- 4. Verificar se há usuários sem role definido
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM profiles 
WHERE role IS NULL OR role = '';

-- 5. Se houver usuários sem role, definir como 'admin'
UPDATE profiles 
SET role = 'admin' 
WHERE role IS NULL OR role = '';

-- ===============================================
-- RESULTADO ESPERADO:
-- ===============================================
-- Todos os usuários devem ter role = 'admin'
-- Todos os usuários terão acesso total ao sistema
-- ===============================================





















