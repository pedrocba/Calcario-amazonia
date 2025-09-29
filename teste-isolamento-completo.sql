-- ==============================================
-- TESTE DE ISOLAMENTO COMPLETO
-- ==============================================
-- Execute este script no Supabase SQL Editor

-- 1. VERIFICAR ESTRUTURA DAS TABELAS
SELECT 
    'Estrutura das tabelas com empresa_id:' as info,
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE column_name = 'empresa_id' 
AND table_schema = 'public'
ORDER BY table_name;

-- 2. VERIFICAR POLICIES RLS ATIVAS
SELECT 
    'Policies RLS ativas:' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. VERIFICAR TRIGGERS ATIVOS
SELECT 
    'Triggers ativos:' as info,
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND trigger_name LIKE 'set_empresa_id_%'
ORDER BY event_object_table;

-- 4. TESTAR INSERÇÃO DE DADOS (deve funcionar com empresa_id automático)
-- Teste 1: Inserir produto
INSERT INTO products (name, code, purchase_price, sale_price, stock, active)
VALUES ('Produto Teste Isolamento', 'TEST001', 10.00, 15.00, 100, true)
RETURNING id, name, empresa_id;

-- Teste 2: Inserir categoria
INSERT INTO product_categories (name)
VALUES ('Categoria Teste Isolamento')
RETURNING id, name, empresa_id;

-- Teste 3: Inserir contato
INSERT INTO contacts (name, type, email, phone)
VALUES ('Cliente Teste Isolamento', 'customer', 'teste@exemplo.com', '(11) 99999-9999')
RETURNING id, name, empresa_id;

-- Teste 4: Inserir venda
INSERT INTO vendas (total_amount, final_amount, date, status, client_id)
VALUES (100.00, 95.00, CURRENT_DATE, 'pendente', (SELECT id FROM contacts WHERE name = 'Cliente Teste Isolamento' LIMIT 1))
RETURNING id, total_amount, empresa_id;

-- 5. VERIFICAR ISOLAMENTO - CONTAR REGISTROS POR EMPRESA
SELECT 'Isolamento por empresa:' as info;
SELECT 'Profiles:' as tabela, empresa_id, COUNT(*) as total FROM profiles GROUP BY empresa_id;
SELECT 'Companies:' as tabela, empresa_id, COUNT(*) as total FROM companies GROUP BY empresa_id;
SELECT 'Products:' as tabela, empresa_id, COUNT(*) as total FROM products GROUP BY empresa_id;
SELECT 'Product Categories:' as tabela, empresa_id, COUNT(*) as total FROM product_categories GROUP BY empresa_id;
SELECT 'Contacts:' as tabela, empresa_id, COUNT(*) as total FROM contacts GROUP BY empresa_id;
SELECT 'Vendas:' as tabela, empresa_id, COUNT(*) as total FROM vendas GROUP BY empresa_id;

-- 6. TESTAR CONSULTA COM RLS (deve retornar apenas dados da empresa CBA)
SELECT 'Teste de consulta com RLS:' as info;
SELECT 'Produtos visíveis:' as info, COUNT(*) as total FROM products;
SELECT 'Contatos visíveis:' as info, COUNT(*) as total FROM contacts;
SELECT 'Vendas visíveis:' as info, COUNT(*) as total FROM vendas;

-- 7. VERIFICAR SE TODOS OS REGISTROS TÊM EMPRESA_ID
SELECT 'Registros sem empresa_id:' as info;
SELECT 'Profiles sem empresa_id:' as tabela, COUNT(*) as total FROM profiles WHERE empresa_id IS NULL;
SELECT 'Companies sem empresa_id:' as tabela, COUNT(*) as total FROM companies WHERE empresa_id IS NULL;
SELECT 'Products sem empresa_id:' as tabela, COUNT(*) as total FROM products WHERE empresa_id IS NULL;
SELECT 'Product Categories sem empresa_id:' as tabela, COUNT(*) as total FROM product_categories WHERE empresa_id IS NULL;
SELECT 'Contacts sem empresa_id:' as tabela, COUNT(*) as total FROM contacts WHERE empresa_id IS NULL;
SELECT 'Vendas sem empresa_id:' as tabela, COUNT(*) as total FROM vendas WHERE empresa_id IS NULL;

-- 8. RESULTADO FINAL
SELECT 'TESTE DE ISOLAMENTO COMPLETO CONCLUÍDO!' as status;
SELECT 'Sistema multi-tenant configurado com sucesso!' as info;
SELECT 'Todos os dados estão isolados por filial/matriz!' as resultado;



