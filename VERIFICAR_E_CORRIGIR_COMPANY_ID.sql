-- =====================================================
-- VERIFICAR E CORRIGIR COMPANY_ID
-- =====================================================
-- Execute este script no Supabase SQL Editor

-- 1. VERIFICAR SE A EMPRESA EXISTE
SELECT 
  'Verificando empresa...' as status,
  id,
  name,
  created_at
FROM companies 
WHERE id = '68cacb91-3d16-9d19-1be6-c90d000000000000';

-- 2. SE NÃO EXISTIR, CRIAR A EMPRESA
INSERT INTO companies (id, name, email, phone, address)
VALUES (
  '68cacb91-3d16-9d19-1be6-c90d000000000000',
  'Empresa Principal',
  'contato@empresa.com',
  '(11) 99999-9999',
  'Endereço da Empresa'
)
ON CONFLICT (id) DO NOTHING;

-- 3. VERIFICAR SE A EMPRESA FOI CRIADA
SELECT 
  'Empresa criada/verificada:' as status,
  id,
  name,
  created_at
FROM companies 
WHERE id = '68cacb91-3d16-9d19-1be6-c90d000000000000';

-- 4. VERIFICAR CONTAS FINANCEIRAS EXISTENTES
SELECT 
  'Contas financeiras existentes:' as status,
  COUNT(*) as total_contas,
  SUM(balance) as saldo_total
FROM financial_accounts 
WHERE company_id = '68cacb91-3d16-9d19-1be6-c90d000000000000';

-- 5. SE NÃO HOUVER CONTAS, CRIAR CONTAS PADRÃO
INSERT INTO financial_accounts (company_id, name, type, balance, description, active)
VALUES 
  ('68cacb91-3d16-9d19-1be6-c90d000000000000', 'Caixa Principal', 'caixa', 15000.00, 'Caixa principal da empresa', true),
  ('68cacb91-3d16-9d19-1be6-c90d000000000000', 'Conta Corrente BB', 'banco', 45000.00, 'Conta corrente principal', true),
  ('68cacb91-3d16-9d19-1be6-c90d000000000000', 'Caixa de Emergência', 'caixa', 10000.00, 'Reserva de emergência', true),
  ('68cacb91-3d16-9d19-1be6-c90d000000000000', 'Poupança', 'investimento', 25000.00, 'Investimentos de longo prazo', true)
ON CONFLICT DO NOTHING;

-- 6. VERIFICAR RESULTADO FINAL
SELECT 
  '✅ SISTEMA VERIFICADO E CORRIGIDO!' as status,
  (SELECT COUNT(*) FROM companies WHERE id = '68cacb91-3d16-9d19-1be6-c90d000000000000') as empresa_existe,
  (SELECT COUNT(*) FROM financial_accounts WHERE company_id = '68cacb91-3d16-9d19-1be6-c90d000000000000') as contas_criadas;

-- 7. MOSTRAR TODAS AS CONTAS FINANCEIRAS
SELECT 
  'CONTAS FINANCEIRAS DISPONÍVEIS:' as info,
  id,
  name,
  type,
  balance,
  active
FROM financial_accounts 
WHERE company_id = '68cacb91-3d16-9d19-1be6-c90d000000000000'
ORDER BY created_at;
