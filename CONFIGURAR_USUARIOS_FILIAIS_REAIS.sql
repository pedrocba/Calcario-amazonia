-- =====================================================
-- CONFIGURAR USUÁRIOS PARA FILIAIS REAIS
-- =====================================================
-- Execute este script no Supabase SQL Editor

-- ⚠️ ATENÇÃO: SUBSTITUA OS IDs PELOS IDs REAIS DOS USUÁRIOS
-- ⚠️ FAÇA BACKUP ANTES DE EXECUTAR

-- 1. VERIFICAR FILIAIS CRIADAS
SELECT 
  'FILIAIS DISPONÍVEIS:' as info,
  id,
  name,
  email,
  phone,
  address
FROM companies 
ORDER BY created_at;

-- 2. CRIAR USUÁRIOS ADMINISTRADORES PARA CADA FILIAL
-- SUBSTITUA 'user-id-aqui' pelos IDs reais dos usuários

-- Usuário admin para Loja do Sertanejo
-- SELECT add_user_to_company(
--   'user-id-admin-sertanejo',
--   (SELECT id FROM companies WHERE name LIKE '%Loja do Sertanejo%' LIMIT 1),
--   'admin',
--   '{"create": true, "edit": true, "delete": true, "admin": true, "reports": true}'
-- );

-- Usuário admin para CBA Mineração
-- SELECT add_user_to_company(
--   'user-id-admin-cba-mineracao',
--   (SELECT id FROM companies WHERE name LIKE '%CBA - Mineração%' LIMIT 1),
--   'admin',
--   '{"create": true, "edit": true, "delete": true, "admin": true, "reports": true}'
-- );

-- Usuário admin para CBA
-- SELECT add_user_to_company(
--   'user-id-admin-cba',
--   (SELECT id FROM companies WHERE name LIKE '%CBA - MINERAÇÃO%' LIMIT 1),
--   'admin',
--   '{"create": true, "edit": true, "delete": true, "admin": true, "reports": true}'
-- );

-- 3. CRIAR USUÁRIOS OPERACIONAIS PARA CADA FILIAL
-- SUBSTITUA 'user-id-aqui' pelos IDs reais dos usuários

-- Usuários operacionais para Loja do Sertanejo
-- SELECT add_user_to_company(
--   'user-id-operacional-sertanejo-1',
--   (SELECT id FROM companies WHERE name LIKE '%Loja do Sertanejo%' LIMIT 1),
--   'user',
--   '{"create": true, "edit": true, "delete": false, "reports": true}'
-- );

-- SELECT add_user_to_company(
--   'user-id-operacional-sertanejo-2',
--   (SELECT id FROM companies WHERE name LIKE '%Loja do Sertanejo%' LIMIT 1),
--   'user',
--   '{"create": true, "edit": true, "delete": false, "reports": true}'
-- );

-- Usuários operacionais para CBA Mineração
-- SELECT add_user_to_company(
--   'user-id-operacional-cba-mineracao-1',
--   (SELECT id FROM companies WHERE name LIKE '%CBA - Mineração%' LIMIT 1),
--   'user',
--   '{"create": true, "edit": true, "delete": false, "reports": true}'
-- );

-- SELECT add_user_to_company(
--   'user-id-operacional-cba-mineracao-2',
--   (SELECT id FROM companies WHERE name LIKE '%CBA - Mineração%' LIMIT 1),
--   'user',
--   '{"create": true, "edit": true, "delete": false, "reports": true}'
-- );

-- Usuários operacionais para CBA
-- SELECT add_user_to_company(
--   'user-id-operacional-cba-1',
--   (SELECT id FROM companies WHERE name LIKE '%CBA - MINERAÇÃO%' LIMIT 1),
--   'user',
--   '{"create": true, "edit": true, "delete": false, "reports": true}'
-- );

-- SELECT add_user_to_company(
--   'user-id-operacional-cba-2',
--   (SELECT id FROM companies WHERE name LIKE '%CBA - MINERAÇÃO%' LIMIT 1),
--   'user',
--   '{"create": true, "edit": true, "delete": false, "reports": true}'
-- );

-- 4. CRIAR USUÁRIO SUPER ADMIN (ACESSA TODAS AS FILIAIS)
-- SUBSTITUA 'user-id-aqui' pelo ID real do super admin

-- SELECT add_user_to_company(
--   'user-id-super-admin',
--   (SELECT id FROM companies WHERE name LIKE '%Loja do Sertanejo%' LIMIT 1),
--   'super_admin',
--   '{"create": true, "edit": true, "delete": true, "admin": true, "super_admin": true, "reports": true}'
-- );

-- SELECT add_user_to_company(
--   'user-id-super-admin',
--   (SELECT id FROM companies WHERE name LIKE '%CBA - Mineração%' LIMIT 1),
--   'super_admin',
--   '{"create": true, "edit": true, "delete": true, "admin": true, "super_admin": true, "reports": true}'
-- );

-- SELECT add_user_to_company(
--   'user-id-super-admin',
--   (SELECT id FROM companies WHERE name LIKE '%CBA - MINERAÇÃO%' LIMIT 1),
--   'super_admin',
--   '{"create": true, "edit": true, "delete": true, "admin": true, "super_admin": true, "reports": true}'
-- );

-- 5. VERIFICAR USUÁRIOS CONFIGURADOS
SELECT 
  'USUÁRIOS CONFIGURADOS:' as info,
  uc.role,
  c.name as filial,
  uc.permissions
FROM user_companies uc
JOIN companies c ON uc.company_id = c.id
ORDER BY c.name, uc.role;

-- 6. MOSTRAR RESUMO POR FILIAL
SELECT 
  'RESUMO POR FILIAL:' as info,
  c.name as filial,
  COUNT(uc.id) as total_usuarios,
  COUNT(CASE WHEN uc.role = 'admin' THEN 1 END) as admins,
  COUNT(CASE WHEN uc.role = 'user' THEN 1 END) as usuarios,
  COUNT(CASE WHEN uc.role = 'super_admin' THEN 1 END) as super_admins
FROM companies c
LEFT JOIN user_companies uc ON c.id = uc.company_id
GROUP BY c.id, c.name
ORDER BY c.created_at;

-- 7. INSTRUÇÕES PARA CONFIGURAR USUÁRIOS
SELECT 
  'INSTRUÇÕES:' as info,
  '1. Descomente as linhas que começam com -- SELECT add_user_to_company' as passo1,
  '2. Substitua user-id-aqui pelos IDs reais dos usuários' as passo2,
  '3. Execute o script novamente' as passo3,
  '4. Verifique se os usuários foram criados' as passo4;

SELECT '🎉 CONFIGURAÇÃO DE USUÁRIOS PRONTA!' as status_final;
