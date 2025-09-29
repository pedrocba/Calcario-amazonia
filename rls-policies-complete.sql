-- ==============================================
-- POLÍTICAS RLS COMPLETAS PARA PRODUÇÃO
-- ==============================================
-- Execute este SQL no Supabase SQL Editor para habilitar a segurança completa

-- ==============================================
-- 1. HABILITAR RLS EM TODAS AS TABELAS
-- ==============================================

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_venda ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weighing_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimentacoes_estoque ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- 2. CRIAR TABELA PROFILES (se não existir)
-- ==============================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- 3. POLÍTICAS PARA COMPANIES
-- ==============================================

-- Usuários podem ver apenas sua própria empresa
CREATE POLICY "Users can view their own company" ON public.companies
    FOR SELECT USING (
        id = (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
    );

-- Apenas super admins podem criar/editar empresas
CREATE POLICY "Only super admins can manage companies" ON public.companies
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE user_id = auth.uid() 
            AND role = 'super_admin'
        )
    );

-- ==============================================
-- 4. POLÍTICAS PARA CONTACTS
-- ==============================================

-- Usuários podem ver contatos de sua empresa
CREATE POLICY "Users can view contacts from their company" ON public.contacts
    FOR SELECT USING (
        company_id = (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
    );

-- Usuários podem criar contatos em sua empresa
CREATE POLICY "Users can create contacts in their company" ON public.contacts
    FOR INSERT WITH CHECK (
        company_id = (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
    );

-- Usuários podem editar contatos de sua empresa
CREATE POLICY "Users can update contacts from their company" ON public.contacts
    FOR UPDATE USING (
        company_id = (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
    );

-- Usuários podem deletar contatos de sua empresa
CREATE POLICY "Users can delete contacts from their company" ON public.contacts
    FOR DELETE USING (
        company_id = (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
    );

-- ==============================================
-- 5. POLÍTICAS PARA PRODUCTS
-- ==============================================

-- Usuários podem ver produtos de sua empresa
CREATE POLICY "Users can view products from their company" ON public.products
    FOR SELECT USING (
        company_id = (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
    );

-- Usuários podem criar produtos em sua empresa
CREATE POLICY "Users can create products in their company" ON public.products
    FOR INSERT WITH CHECK (
        company_id = (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
    );

-- Usuários podem editar produtos de sua empresa
CREATE POLICY "Users can update products from their company" ON public.products
    FOR UPDATE USING (
        company_id = (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
    );

-- Usuários podem deletar produtos de sua empresa
CREATE POLICY "Users can delete products from their company" ON public.products
    FOR DELETE USING (
        company_id = (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
    );

-- ==============================================
-- 6. POLÍTICAS PARA PRODUCT_CATEGORIES
-- ==============================================

-- Usuários podem ver categorias de sua empresa
CREATE POLICY "Users can view categories from their company" ON public.product_categories
    FOR SELECT USING (
        company_id = (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
    );

-- Usuários podem criar categorias em sua empresa
CREATE POLICY "Users can create categories in their company" ON public.product_categories
    FOR INSERT WITH CHECK (
        company_id = (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
    );

-- Usuários podem editar categorias de sua empresa
CREATE POLICY "Users can update categories from their company" ON public.product_categories
    FOR UPDATE USING (
        company_id = (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
    );

-- Usuários podem deletar categorias de sua empresa
CREATE POLICY "Users can delete categories from their company" ON public.product_categories
    FOR DELETE USING (
        company_id = (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
    );

-- ==============================================
-- 7. POLÍTICAS PARA STOCK_ENTRIES
-- ==============================================

-- Usuários podem ver entradas de estoque de sua empresa
CREATE POLICY "Users can view stock entries from their company" ON public.stock_entries
    FOR SELECT USING (
        company_id = (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
    );

-- Usuários podem criar entradas de estoque em sua empresa
CREATE POLICY "Users can create stock entries in their company" ON public.stock_entries
    FOR INSERT WITH CHECK (
        company_id = (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
    );

-- Usuários podem editar entradas de estoque de sua empresa
CREATE POLICY "Users can update stock entries from their company" ON public.stock_entries
    FOR UPDATE USING (
        company_id = (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
    );

-- Usuários podem deletar entradas de estoque de sua empresa
CREATE POLICY "Users can delete stock entries from their company" ON public.stock_entries
    FOR DELETE USING (
        company_id = (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
    );

-- ==============================================
-- 8. POLÍTICAS PARA VENDAS
-- ==============================================

-- Usuários podem ver vendas de sua empresa
CREATE POLICY "Users can view sales from their company" ON public.vendas
    FOR SELECT USING (
        company_id = (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
    );

-- Usuários podem criar vendas em sua empresa
CREATE POLICY "Users can create sales in their company" ON public.vendas
    FOR INSERT WITH CHECK (
        company_id = (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
    );

-- Usuários podem editar vendas de sua empresa
CREATE POLICY "Users can update sales from their company" ON public.vendas
    FOR UPDATE USING (
        company_id = (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
    );

-- Usuários podem deletar vendas de sua empresa
CREATE POLICY "Users can delete sales from their company" ON public.vendas
    FOR DELETE USING (
        company_id = (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
    );

-- ==============================================
-- 9. POLÍTICAS PARA ITENS_VENDA
-- ==============================================

-- Usuários podem ver itens de venda de sua empresa
CREATE POLICY "Users can view sale items from their company" ON public.itens_venda
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.vendas 
            WHERE id = itens_venda.venda_id 
            AND company_id = (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
        )
    );

-- Usuários podem criar itens de venda em sua empresa
CREATE POLICY "Users can create sale items in their company" ON public.itens_venda
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.vendas 
            WHERE id = itens_venda.venda_id 
            AND company_id = (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
        )
    );

-- Usuários podem editar itens de venda de sua empresa
CREATE POLICY "Users can update sale items from their company" ON public.itens_venda
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.vendas 
            WHERE id = itens_venda.venda_id 
            AND company_id = (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
        )
    );

-- Usuários podem deletar itens de venda de sua empresa
CREATE POLICY "Users can delete sale items from their company" ON public.itens_venda
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.vendas 
            WHERE id = itens_venda.venda_id 
            AND company_id = (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
        )
    );

-- ==============================================
-- 10. POLÍTICAS PARA VEHICLES
-- ==============================================

-- Usuários podem ver veículos de sua empresa
CREATE POLICY "Users can view vehicles from their company" ON public.vehicles
    FOR SELECT USING (
        company_id = (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
    );

-- Usuários podem criar veículos em sua empresa
CREATE POLICY "Users can create vehicles in their company" ON public.vehicles
    FOR INSERT WITH CHECK (
        company_id = (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
    );

-- Usuários podem editar veículos de sua empresa
CREATE POLICY "Users can update vehicles from their company" ON public.vehicles
    FOR UPDATE USING (
        company_id = (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
    );

-- Usuários podem deletar veículos de sua empresa
CREATE POLICY "Users can delete vehicles from their company" ON public.vehicles
    FOR DELETE USING (
        company_id = (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
    );

-- ==============================================
-- 11. POLÍTICAS PARA TRANSFERS
-- ==============================================

-- Usuários podem ver transferências de sua empresa
CREATE POLICY "Users can view transfers from their company" ON public.transfers
    FOR SELECT USING (
        company_id = (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
    );

-- Usuários podem criar transferências em sua empresa
CREATE POLICY "Users can create transfers in their company" ON public.transfers
    FOR INSERT WITH CHECK (
        company_id = (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
    );

-- Usuários podem editar transferências de sua empresa
CREATE POLICY "Users can update transfers from their company" ON public.transfers
    FOR UPDATE USING (
        company_id = (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
    );

-- Usuários podem deletar transferências de sua empresa
CREATE POLICY "Users can delete transfers from their company" ON public.transfers
    FOR DELETE USING (
        company_id = (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
    );

-- ==============================================
-- 12. POLÍTICAS PARA WEIGHING_TRIPS
-- ==============================================

-- Usuários podem ver viagens de pesagem de sua empresa
CREATE POLICY "Users can view weighing trips from their company" ON public.weighing_trips
    FOR SELECT USING (
        company_id = (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
    );

-- Usuários podem criar viagens de pesagem em sua empresa
CREATE POLICY "Users can create weighing trips in their company" ON public.weighing_trips
    FOR INSERT WITH CHECK (
        company_id = (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
    );

-- Usuários podem editar viagens de pesagem de sua empresa
CREATE POLICY "Users can update weighing trips from their company" ON public.weighing_trips
    FOR UPDATE USING (
        company_id = (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
    );

-- Usuários podem deletar viagens de pesagem de sua empresa
CREATE POLICY "Users can delete weighing trips from their company" ON public.weighing_trips
    FOR DELETE USING (
        company_id = (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
    );

-- ==============================================
-- 13. POLÍTICAS PARA FINANCIAL_TRANSACTIONS
-- ==============================================

-- Usuários podem ver transações financeiras de sua empresa
CREATE POLICY "Users can view financial transactions from their company" ON public.financial_transactions
    FOR SELECT USING (
        company_id = (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
    );

-- Usuários podem criar transações financeiras em sua empresa
CREATE POLICY "Users can create financial transactions in their company" ON public.financial_transactions
    FOR INSERT WITH CHECK (
        company_id = (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
    );

-- Usuários podem editar transações financeiras de sua empresa
CREATE POLICY "Users can update financial transactions from their company" ON public.financial_transactions
    FOR UPDATE USING (
        company_id = (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
    );

-- Usuários podem deletar transações financeiras de sua empresa
CREATE POLICY "Users can delete financial transactions from their company" ON public.financial_transactions
    FOR DELETE USING (
        company_id = (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
    );

-- ==============================================
-- 14. POLÍTICAS PARA MOVIMENTACOES_ESTOQUE
-- ==============================================

-- Usuários podem ver movimentações de estoque de sua empresa
CREATE POLICY "Users can view stock movements from their company" ON public.movimentacoes_estoque
    FOR SELECT USING (
        company_id = (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
    );

-- Usuários podem criar movimentações de estoque em sua empresa
CREATE POLICY "Users can create stock movements in their company" ON public.movimentacoes_estoque
    FOR INSERT WITH CHECK (
        company_id = (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
    );

-- Usuários podem editar movimentações de estoque de sua empresa
CREATE POLICY "Users can update stock movements from their company" ON public.movimentacoes_estoque
    FOR UPDATE USING (
        company_id = (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
    );

-- Usuários podem deletar movimentações de estoque de sua empresa
CREATE POLICY "Users can delete stock movements from their company" ON public.movimentacoes_estoque
    FOR DELETE USING (
        company_id = (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
    );

-- ==============================================
-- 15. CRIAR USUÁRIO DE TESTE E PERFIL
-- ==============================================

-- Inserir empresa de teste se não existir
INSERT INTO public.companies (id, name, code, full_name, type, active) 
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Empresa Teste',
    'TESTE001',
    'Empresa Teste Ltda',
    'matriz',
    true
) ON CONFLICT (id) DO NOTHING;

-- Criar perfil de teste (você precisará substituir o UUID do usuário real)
-- INSERT INTO public.profiles (id, company_id, full_name, email, role)
-- VALUES (
--     'SEU_USER_ID_AQUI', -- Substitua pelo ID real do usuário
--     '00000000-0000-0000-0000-000000000001',
--     'Usuário Teste',
--     'teste@exemplo.com',
--     'admin'
-- ) ON CONFLICT (id) DO NOTHING;

-- ==============================================
-- 16. VERIFICAR POLÍTICAS CRIADAS
-- ==============================================

-- Verificar se todas as políticas foram criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ==============================================
-- INSTRUÇÕES DE EXECUÇÃO
-- ==============================================
/*
1. Copie todo este SQL
2. Cole no Supabase SQL Editor
3. Execute o script completo
4. Verifique se não há erros
5. Teste as páginas da aplicação

IMPORTANTE: 
- Substitua 'SEU_USER_ID_AQUI' pelo ID real do usuário autenticado
- As políticas RLS garantem que cada usuário só veja dados de sua empresa
- Todas as operações (SELECT, INSERT, UPDATE, DELETE) são protegidas por company_id
*/


















