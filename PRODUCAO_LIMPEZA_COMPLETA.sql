-- =====================================================
-- LIMPEZA COMPLETA PARA PRODUÇÃO
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

-- 2. LIMPAR TODOS OS DADOS DE TESTE
DELETE FROM financial_transactions;
DELETE FROM financial_accounts;
DELETE FROM sessoes_caixa;
DELETE FROM companies;

-- 3. VERIFICAR LIMPEZA
SELECT 
  'LIMPEZA CONCLUÍDA:' as status,
  (SELECT COUNT(*) FROM companies) as empresas,
  (SELECT COUNT(*) FROM financial_accounts) as contas,
  (SELECT COUNT(*) FROM financial_transactions) as transacoes,
  (SELECT COUNT(*) FROM sessoes_caixa) as sessoes;

-- 4. RESETAR SEQUÊNCIAS (se existirem)
DO $$
BEGIN
    -- Resetar sequências se existirem
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'companies_id_seq') THEN
        ALTER SEQUENCE companies_id_seq RESTART WITH 1;
    END IF;
    
    RAISE NOTICE 'Sequências resetadas com sucesso!';
END $$;

SELECT '✅ BANCO DE DADOS LIMPO PARA PRODUÇÃO!' as status_final;
