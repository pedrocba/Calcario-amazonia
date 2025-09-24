-- =====================================================
-- LIMPEZA DEFINITIVA PARA PRODUÇÃO
-- =====================================================
-- Execute este script no Supabase SQL Editor

-- ⚠️ ATENÇÃO: ESTE SCRIPT REMOVE TODOS OS DADOS DE TESTE
-- ⚠️ FAÇA BACKUP ANTES DE EXECUTAR

-- 1. VERIFICAR DADOS ATUAIS
SELECT 
  'DADOS ATUAIS:' as info,
  (SELECT COUNT(*) FROM companies) as empresas,
  (SELECT COUNT(*) FROM financial_accounts) as contas,
  (SELECT COUNT(*) FROM financial_transactions) as transacoes,
  (SELECT COUNT(*) FROM sessoes_caixa) as sessoes;

-- 2. VERIFICAR RESTRIÇÕES EXISTENTES
SELECT 
  'RESTRIÇÕES ENCONTRADAS:' as info,
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.table_name IN ('companies', 'financial_accounts', 'financial_transactions', 'sessoes_caixa')
AND tc.constraint_type = 'FOREIGN KEY';

-- 3. DESABILITAR TODAS AS RESTRIÇÕES DE CHAVE ESTRANGEIRA
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Desabilitar todas as restrições de FK
    FOR r IN (
        SELECT tc.table_name, tc.constraint_name
        FROM information_schema.table_constraints tc
        WHERE tc.table_name IN ('companies', 'financial_accounts', 'financial_transactions', 'sessoes_caixa')
        AND tc.constraint_type = 'FOREIGN KEY'
    ) LOOP
        EXECUTE 'ALTER TABLE ' || r.table_name || ' DISABLE TRIGGER ALL';
        RAISE NOTICE 'Desabilitado trigger em: %', r.table_name;
    END LOOP;
END $$;

-- 4. LIMPAR TODOS OS DADOS DE TESTE (ORDEM CORRETA)
DELETE FROM financial_transactions;
DELETE FROM financial_accounts;
DELETE FROM sessoes_caixa;
DELETE FROM companies;

-- 5. HABILITAR TODAS AS RESTRIÇÕES NOVAMENTE
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Habilitar todas as restrições de FK
    FOR r IN (
        SELECT tc.table_name, tc.constraint_name
        FROM information_schema.table_constraints tc
        WHERE tc.table_name IN ('companies', 'financial_accounts', 'financial_transactions', 'sessoes_caixa')
        AND tc.constraint_type = 'FOREIGN KEY'
    ) LOOP
        EXECUTE 'ALTER TABLE ' || r.table_name || ' ENABLE TRIGGER ALL';
        RAISE NOTICE 'Habilitado trigger em: %', r.table_name;
    END LOOP;
END $$;

-- 6. VERIFICAR LIMPEZA
SELECT 
  'LIMPEZA CONCLUÍDA:' as status,
  (SELECT COUNT(*) FROM companies) as empresas,
  (SELECT COUNT(*) FROM financial_accounts) as contas,
  (SELECT COUNT(*) FROM financial_transactions) as transacoes,
  (SELECT COUNT(*) FROM sessoes_caixa) as sessoes;

-- 7. RESETAR SEQUÊNCIAS (se existirem)
DO $$
BEGIN
    -- Resetar sequências se existirem
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'companies_id_seq') THEN
        ALTER SEQUENCE companies_id_seq RESTART WITH 1;
    END IF;
    
    RAISE NOTICE 'Sequências resetadas com sucesso!';
END $$;

-- 8. VERIFICAR SE ESTÁ REALMENTE LIMPO
SELECT 
  'VERIFICAÇÃO FINAL:' as info,
  (SELECT COUNT(*) FROM companies) as empresas,
  (SELECT COUNT(*) FROM financial_accounts) as contas,
  (SELECT COUNT(*) FROM financial_transactions) as transacoes,
  (SELECT COUNT(*) FROM sessoes_caixa) as sessoes;

-- 9. VERIFICAR RESTRIÇÕES RESTAURADAS
SELECT 
  'RESTRIÇÕES RESTAURADAS:' as info,
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.table_name IN ('companies', 'financial_accounts', 'financial_transactions', 'sessoes_caixa')
AND tc.constraint_type = 'FOREIGN KEY';

SELECT '✅ BANCO DE DADOS LIMPO PARA PRODUÇÃO!' as status_final;
