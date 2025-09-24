-- =====================================================
-- CRIAR CONTAS FINANCEIRAS RÁPIDO
-- =====================================================
-- Execute este script no Supabase SQL Editor

-- 1. VERIFICAR/CRIAR EMPRESA
INSERT INTO companies (id, name, email, phone, address)
VALUES (
  '68cacb91-3d16-9d19-1be6-c90d000000000000',
  'Empresa Principal',
  'contato@empresa.com',
  '(11) 99999-9999',
  'Endereço da Empresa'
)
ON CONFLICT (id) DO NOTHING;

-- 2. LIMPAR E RECRIAR CONTAS FINANCEIRAS
DELETE FROM financial_accounts 
WHERE company_id = '68cacb91-3d16-9d19-1be6-c90d000000000000';

-- 3. INSERIR CONTAS COM DADOS REALISTAS
INSERT INTO financial_accounts (company_id, name, type, balance, description, active)
VALUES 
  ('68cacb91-3d16-9d19-1be6-c90d000000000000', 'Caixa Principal', 'caixa', 15000.00, 'Caixa principal da empresa', true),
  ('68cacb91-3d16-9d19-1be6-c90d000000000000', 'Conta Corrente BB', 'banco', 45000.00, 'Conta corrente principal', true),
  ('68cacb91-3d16-9d19-1be6-c90d000000000000', 'Caixa de Emergência', 'caixa', 10000.00, 'Reserva de emergência', true),
  ('68cacb91-3d16-9d19-1be6-c90d000000000000', 'Poupança', 'investimento', 25000.00, 'Investimentos de longo prazo', true),
  ('68cacb91-3d16-9d19-1be6-c90d000000000000', 'Cartão de Crédito', 'outros', -2000.00, 'Cartão de crédito', true);

-- 4. VERIFICAR RESULTADO
SELECT 
  '✅ CONTAS FINANCEIRAS CRIADAS!' as status,
  COUNT(*) as total_contas,
  SUM(balance) as saldo_total
FROM financial_accounts 
WHERE company_id = '68cacb91-3d16-9d19-1be6-c90d000000000000';

-- 5. MOSTRAR TODAS AS CONTAS
SELECT 
  'CONTAS FINANCEIRAS DISPONÍVEIS:' as info,
  id,
  name,
  type,
  balance,
  description
FROM financial_accounts 
WHERE company_id = '68cacb91-3d16-9d19-1be6-c90d000000000000'
ORDER BY created_at;

SELECT '🎉 SISTEMA PRONTO PARA USO!' as status_final;
