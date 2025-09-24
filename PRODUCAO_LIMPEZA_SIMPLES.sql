-- =====================================================
-- LIMPEZA SIMPLES E EFETIVA
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

-- 2. USAR TRUNCATE CASCADE PARA LIMPEZA COMPLETA
-- TRUNCATE remove todos os dados e reseta as sequências
TRUNCATE TABLE financial_transactions CASCADE;
TRUNCATE TABLE financial_accounts CASCADE;
TRUNCATE TABLE sessoes_caixa CASCADE;
TRUNCATE TABLE companies CASCADE;

-- 3. VERIFICAR LIMPEZA
SELECT 
  'LIMPEZA CONCLUÍDA:' as status,
  (SELECT COUNT(*) FROM companies) as empresas,
  (SELECT COUNT(*) FROM financial_accounts) as contas,
  (SELECT COUNT(*) FROM financial_transactions) as transacoes,
  (SELECT COUNT(*) FROM sessoes_caixa) as sessoes;

-- 4. VERIFICAR SE ESTÁ REALMENTE LIMPO
SELECT 
  'VERIFICAÇÃO FINAL:' as info,
  (SELECT COUNT(*) FROM companies) as empresas,
  (SELECT COUNT(*) FROM financial_accounts) as contas,
  (SELECT COUNT(*) FROM financial_transactions) as transacoes,
  (SELECT COUNT(*) FROM sessoes_caixa) as sessoes;

SELECT '✅ BANCO DE DADOS LIMPO PARA PRODUÇÃO!' as status_final;
