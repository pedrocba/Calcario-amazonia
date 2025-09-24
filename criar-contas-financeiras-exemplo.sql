-- Script para criar contas financeiras de exemplo
-- Execute este script no Supabase SQL Editor

-- Inserir contas financeiras de exemplo
INSERT INTO financial_accounts (
  id,
  company_id,
  name,
  type,
  balance,
  description,
  active,
  created_at,
  updated_at
) VALUES 
-- Caixa Principal
(
  gen_random_uuid(),
  '68cacb91-3d16-9d19-1be6-c90d000000000000',
  'Caixa Principal',
  'caixa',
  15000.00,
  'Caixa principal da empresa para operações diárias',
  true,
  NOW(),
  NOW()
),
-- Conta Corrente
(
  gen_random_uuid(),
  '68cacb91-3d16-9d19-1be6-c90d000000000000',
  'Conta Corrente - Banco do Brasil',
  'banco',
  45000.00,
  'Conta corrente principal para recebimentos e pagamentos',
  true,
  NOW(),
  NOW()
),
-- Caixa de Emergência
(
  gen_random_uuid(),
  '68cacb91-3d16-9d19-1be6-c90d000000000000',
  'Caixa de Emergência',
  'caixa',
  10000.00,
  'Reserva de emergência para situações imprevistas',
  true,
  NOW(),
  NOW()
),
-- Conta Poupança
(
  gen_random_uuid(),
  '68cacb91-3d16-9d19-1be6-c90d000000000000',
  'Poupança - Investimentos',
  'investimento',
  25000.00,
  'Conta poupança para investimentos de longo prazo',
  true,
  NOW(),
  NOW()
),
-- Caixa Secundário
(
  gen_random_uuid(),
  '68cacb91-3d16-9d19-1be6-c90d000000000000',
  'Caixa Secundário',
  'caixa',
  5000.00,
  'Caixa auxiliar para operações menores',
  true,
  NOW(),
  NOW()
);

-- Verificar se as contas foram criadas
SELECT 
  id,
  name,
  type,
  balance,
  description,
  active,
  created_at
FROM financial_accounts 
WHERE company_id = '68cacb91-3d16-9d19-1be6-c90d000000000000'
ORDER BY created_at DESC;

