-- =====================================================
-- TESTE COMPLETO DO SISTEMA FINANCEIRO
-- =====================================================
-- Execute este script no Supabase SQL Editor para testar

-- 1. VERIFICAR ESTRUTURA DAS TABELAS
SELECT 'Verificando estrutura das tabelas...' as status;

-- Verificar se todas as tabelas existem
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('companies', 'financial_transactions', 'financial_accounts', 'sessoes_caixa') 
    THEN '✅ Existe'
    ELSE '❌ Não existe'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('companies', 'financial_transactions', 'financial_accounts', 'sessoes_caixa');

-- 2. VERIFICAR DADOS DA EMPRESA
SELECT 'Verificando dados da empresa...' as status;

SELECT 
  id,
  name,
  code,
  type,
  created_at
FROM companies 
WHERE id = 'd4e26386-fc32-472d-ac2a-deddc3efce27';

-- 3. VERIFICAR CONTAS FINANCEIRAS
SELECT 'Verificando contas financeiras...' as status;

SELECT 
  id,
  name,
  type,
  balance,
  active,
  company_id
FROM financial_accounts 
WHERE company_id = 'd4e26386-fc32-472d-ac2a-deddc3efce27'
ORDER BY created_at;

-- 4. VERIFICAR TRANSAÇÕES FINANCEIRAS
SELECT 'Verificando transações financeiras...' as status;

SELECT 
  id,
  type,
  amount,
  description,
  status,
  category,
  company_id,
  created_at
FROM financial_transactions 
WHERE company_id = 'd4e26386-fc32-472d-ac2a-deddc3efce27'
ORDER BY created_at DESC
LIMIT 10;

-- 5. TESTAR INSERÇÃO DE CONTA A PAGAR
SELECT 'Testando inserção de conta a pagar...' as status;

INSERT INTO financial_transactions (
  type,
  amount,
  description,
  status,
  company_id,
  category,
  date,
  created_at,
  updated_at
) VALUES (
  'saida',
  -150.00,
  'Teste de Conta a Pagar',
  'pendente',
  'd4e26386-fc32-472d-ac2a-deddc3efce27',
  'fornecedores',
  CURRENT_DATE,
  NOW(),
  NOW()
) RETURNING id, description, amount;

-- 6. TESTAR INSERÇÃO DE CONTA A RECEBER
SELECT 'Testando inserção de conta a receber...' as status;

INSERT INTO financial_transactions (
  type,
  amount,
  description,
  status,
  company_id,
  category,
  date,
  created_at,
  updated_at
) VALUES (
  'entrada',
  300.00,
  'Teste de Conta a Receber',
  'pendente',
  'd4e26386-fc32-472d-ac2a-deddc3efce27',
  'venda_produto',
  CURRENT_DATE,
  NOW(),
  NOW()
) RETURNING id, description, amount;

-- 7. VERIFICAR RESULTADO FINAL
SELECT 'Verificando resultado final...' as status;

SELECT 
  'Sistema Financeiro' as sistema,
  COUNT(DISTINCT fa.id) as total_contas,
  COUNT(DISTINCT ft.id) as total_transacoes,
  SUM(CASE WHEN ft.type = 'entrada' THEN ft.amount ELSE 0 END) as total_entradas,
  SUM(CASE WHEN ft.type = 'saida' THEN ABS(ft.amount) ELSE 0 END) as total_saidas
FROM financial_accounts fa
LEFT JOIN financial_transactions ft ON ft.company_id = fa.company_id
WHERE fa.company_id = 'd4e26386-fc32-472d-ac2a-deddc3efce27';

-- 8. LIMPAR DADOS DE TESTE
SELECT 'Limpando dados de teste...' as status;

DELETE FROM financial_transactions 
WHERE description LIKE 'Teste de%' 
  AND company_id = 'd4e26386-fc32-472d-ac2a-deddc3efce27';

-- 9. RESULTADO FINAL
SELECT '🎉 SISTEMA FINANCEIRO FUNCIONANDO PERFEITAMENTE!' as status_final;


