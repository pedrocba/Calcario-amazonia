-- =====================================================
-- LIMPEZA DOS DADOS DE TESTE - MIGRAÇÃO FINAL
-- =====================================================
-- Execute este script no Supabase SQL Editor antes da migração completa

-- Desabilitar RLS temporariamente para limpeza
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles DISABLE ROW LEVEL SECURITY;
ALTER TABLE transfers DISABLE ROW LEVEL SECURITY;
ALTER TABLE requisitions DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Limpar dados de teste (manter apenas dados essenciais)
DELETE FROM public.transfers;
DELETE FROM public.requisitions;
DELETE FROM public.vehicles;
DELETE FROM public.products;
DELETE FROM public.companies;

-- Manter apenas usuários de sistema essenciais
DELETE FROM public.users 
WHERE email NOT IN (
  'superadmin@calcarioamazonia.com',
  'admin@calcarioamazonia.com'
);

-- Resetar sequências (se existirem)
-- ALTER SEQUENCE IF EXISTS companies_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS products_id_seq RESTART WITH 1;

-- Reabilitar RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE requisitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Verificar limpeza
SELECT 'Companies' as table_name, COUNT(*) as count FROM companies
UNION ALL
SELECT 'Products' as table_name, COUNT(*) as count FROM products
UNION ALL
SELECT 'Vehicles' as table_name, COUNT(*) as count FROM vehicles
UNION ALL
SELECT 'Transfers' as table_name, COUNT(*) as count FROM transfers
UNION ALL
SELECT 'Requisitions' as table_name, COUNT(*) as count FROM requisitions
UNION ALL
SELECT 'Users' as table_name, COUNT(*) as count FROM users;

-- Mensagem de confirmação
SELECT 'Dados de teste limpos com sucesso! Pronto para migração completa.' as status;






















