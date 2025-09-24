-- CRIAR CONTAS FINANCEIRAS PARA TESTE
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. Inserir contas financeiras básicas
INSERT INTO financial_accounts (id, name, type, balance, company_id, active, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'Caixa Principal', 'caixa', 50000.00, '68cacb91-3d16-9d19-1be6-c90d0a7b8c1f', true, NOW(), NOW()),
  (gen_random_uuid(), 'Conta Corrente - Banco do Brasil', 'conta_corrente', 25000.00, '68cacb91-3d16-9d19-1be6-c90d0a7b8c1f', true, NOW(), NOW()),
  (gen_random_uuid(), 'Poupança', 'poupanca', 15000.00, '68cacb91-3d16-9d19-1be6-c90d0a7b8c1f', true, NOW(), NOW()),
  (gen_random_uuid(), 'Caixa Pequeno', 'caixa', 5000.00, '68cacb91-3d16-9d19-1be6-c90d0a7b8c1f', true, NOW(), NOW()),
  (gen_random_uuid(), 'Cartão de Crédito', 'cartao_credito', -2000.00, '68cacb91-3d16-9d19-1be6-c90d0a7b8c1f', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. Verificar se as contas foram criadas
SELECT 
  id,
  name,
  type,
  balance,
  company_id,
  active
FROM financial_accounts 
WHERE company_id = '68cacb91-3d16-9d19-1be6-c90d0a7b8c1f'
ORDER BY name;

-- 3. Mostrar total de saldo
SELECT 
  SUM(balance) as saldo_total,
  COUNT(*) as total_contas
FROM financial_accounts 
WHERE company_id = '68cacb91-3d16-9d19-1be6-c90d0a7b8c1f' 
AND active = true;

-- Mensagem de conclusão
SELECT 'Contas financeiras criadas com sucesso!' AS status;
