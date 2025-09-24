-- =====================================================
-- SISTEMA FINANCEIRO COM DADOS REAIS DAS FILIAIS
-- =====================================================
-- Execute este script no Supabase SQL Editor

-- ⚠️ ATENÇÃO: ESTE SCRIPT CONFIGURA O SISTEMA COM DADOS REAIS
-- ⚠️ FAÇA BACKUP ANTES DE EXECUTAR

-- 1. LIMPEZA COMPLETA PRIMEIRO
TRUNCATE TABLE financial_transactions CASCADE;
TRUNCATE TABLE financial_accounts CASCADE;
TRUNCATE TABLE sessoes_caixa CASCADE;
TRUNCATE TABLE companies CASCADE;

-- 2. VERIFICAR LIMPEZA
SELECT 
  'LIMPEZA CONCLUÍDA:' as status,
  (SELECT COUNT(*) FROM companies) as empresas,
  (SELECT COUNT(*) FROM financial_accounts) as contas,
  (SELECT COUNT(*) FROM financial_transactions) as transacoes,
  (SELECT COUNT(*) FROM sessoes_caixa) as sessoes;

-- 3. CRIAR FILIAIS REAIS COM DADOS CORRETOS
INSERT INTO companies (id, name, email, phone, address, created_at)
VALUES 
  (
    gen_random_uuid(), 
    'Loja do Sertanejo Ltda', 
    'contato@lojadosertanejo.com.br', 
    '(93) 3523-0000', 
    'Avenida Cuiabá, 1030 - Sale, Santarém - PA, 68.040-400', 
    NOW()
  ),
  (
    gen_random_uuid(), 
    'CBA - Mineração e Comércio de Calcário e Brita da Amazônia Ltda', 
    'contato@cbamineracao.com.br', 
    '(93) 3523-0001', 
    'Rodovia BR 163, 1030 - Sale, Santarém - PA, 68.040-400', 
    NOW()
  ),
  (
    gen_random_uuid(), 
    'CBA - MINERAÇÃO E COMÉRCIO DE CALCÁRIO E BRITA DA AMAZÔNIA LTDA - ME', 
    'contato@cba.com.br', 
    '(93) 3523-0002', 
    'Área Vicinal Apiáu KM 04 S/N, Santarém - PA', 
    NOW()
  );

-- 4. CRIAR CONTAS PADRÃO PARA CADA FILIAL
DO $$
DECLARE
    filial RECORD;
BEGIN
    FOR filial IN SELECT id, name FROM companies LOOP
        -- Criar contas padrão para cada filial
        INSERT INTO financial_accounts (company_id, name, type, balance, description, active)
        VALUES 
            (filial.id, 'Caixa Principal', 'caixa', 0.00, 'Caixa principal da ' || filial.name, true),
            (filial.id, 'Conta Corrente', 'banco', 0.00, 'Conta corrente da ' || filial.name, true),
            (filial.id, 'Reserva de Emergência', 'caixa', 0.00, 'Reserva de emergência da ' || filial.name, true),
            (filial.id, 'Conta Poupança', 'investimento', 0.00, 'Conta poupança da ' || filial.name, true),
            (filial.id, 'Cartão de Crédito', 'outros', 0.00, 'Cartão de crédito da ' || filial.name, true);
        
        RAISE NOTICE 'Contas criadas para: %', filial.name;
    END LOOP;
END $$;

-- 5. CRIAR TABELA DE USUÁRIOS POR FILIAL
CREATE TABLE IF NOT EXISTS user_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  company_id TEXT NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT user_companies_company_id_fkey 
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 6. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_user_companies_user_id ON user_companies(user_id);
CREATE INDEX IF NOT EXISTS idx_user_companies_company_id ON user_companies(company_id);

-- 7. CRIAR TABELA DE LOGS DO SISTEMA
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  company_id TEXT,
  action VARCHAR(100) NOT NULL,
  details JSONB,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. CRIAR ÍNDICES PARA LOGS
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_company_id ON system_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at);

-- 9. CRIAR POLÍTICAS RLS POR FILIAL
DROP POLICY IF EXISTS "Users can only access their company accounts" ON financial_accounts;
CREATE POLICY "Users can only access their company accounts" 
ON financial_accounts 
FOR ALL 
USING (
  company_id IN (
    SELECT company_id 
    FROM user_companies 
    WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can only access their company transactions" ON financial_transactions;
CREATE POLICY "Users can only access their company transactions" 
ON financial_transactions 
FOR ALL 
USING (
  company_id IN (
    SELECT company_id 
    FROM user_companies 
    WHERE user_id = auth.uid()
  )
);

-- 10. CRIAR FUNÇÃO PARA VINCULAR USUÁRIO À FILIAL
CREATE OR REPLACE FUNCTION add_user_to_company(
  p_user_id UUID,
  p_company_id TEXT,
  p_role VARCHAR(50) DEFAULT 'user',
  p_permissions JSONB DEFAULT '{}'
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar se a filial existe
  IF NOT EXISTS (SELECT 1 FROM companies WHERE id = p_company_id) THEN
    RAISE EXCEPTION 'Filial não encontrada: %', p_company_id;
  END IF;
  
  -- Inserir usuário na filial
  INSERT INTO user_companies (user_id, company_id, role, permissions)
  VALUES (p_user_id, p_company_id, p_role, p_permissions)
  ON CONFLICT (user_id, company_id) DO UPDATE SET
    role = EXCLUDED.role,
    permissions = EXCLUDED.permissions;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 11. CRIAR FUNÇÃO PARA LISTAR FILIAIS DO USUÁRIO
CREATE OR REPLACE FUNCTION get_user_companies(p_user_id UUID)
RETURNS TABLE (
  company_id TEXT,
  company_name VARCHAR(255),
  role VARCHAR(50),
  permissions JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    uc.company_id,
    c.name,
    uc.role,
    uc.permissions
  FROM user_companies uc
  JOIN companies c ON uc.company_id = c.id
  WHERE uc.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- 12. CRIAR TABELA DE CONFIGURAÇÕES DO SISTEMA
CREATE TABLE IF NOT EXISTS system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. INSERIR CONFIGURAÇÕES PADRÃO
INSERT INTO system_config (key, value, description)
VALUES 
  ('app_version', '"1.0.0"', 'Versão atual do sistema'),
  ('maintenance_mode', 'false', 'Modo de manutenção'),
  ('backup_enabled', 'true', 'Backup automático habilitado'),
  ('log_retention_days', '30', 'Dias para retenção de logs'),
  ('max_file_size_mb', '10', 'Tamanho máximo de arquivo em MB'),
  ('session_timeout_minutes', '480', 'Timeout de sessão em minutos')
ON CONFLICT (key) DO NOTHING;

-- 14. CRIAR VIEW PARA DASHBOARD ADMINISTRATIVO
CREATE OR REPLACE VIEW admin_dashboard AS
SELECT 
  'Sistema Financeiro' as sistema,
  (SELECT COUNT(*) FROM companies) as total_filiais,
  (SELECT COUNT(*) FROM financial_accounts) as total_contas,
  (SELECT COUNT(*) FROM financial_transactions) as total_transacoes,
  (SELECT COUNT(*) FROM user_companies) as total_usuarios,
  (SELECT COUNT(*) FROM system_logs WHERE created_at >= NOW() - INTERVAL '24 hours') as logs_24h,
  (SELECT SUM(balance) FROM financial_accounts) as saldo_total_sistema,
  (SELECT COUNT(*) FROM financial_transactions WHERE created_at >= NOW() - INTERVAL '24 hours') as transacoes_24h;

-- 15. VERIFICAR CONFIGURAÇÃO FINAL
SELECT 
  '✅ CONFIGURAÇÃO COMPLETA!' as status,
  (SELECT COUNT(*) FROM companies) as total_filiais,
  (SELECT COUNT(*) FROM financial_accounts) as total_contas,
  (SELECT COUNT(*) FROM financial_transactions) as total_transacoes,
  (SELECT COUNT(*) FROM user_companies) as usuarios_vinculados,
  (SELECT COUNT(*) FROM system_config) as configuracoes,
  (SELECT COUNT(*) FROM system_logs) as logs;

-- 16. MOSTRAR DASHBOARD ADMINISTRATIVO
SELECT * FROM admin_dashboard;

-- 17. MOSTRAR FILIAIS CRIADAS COM DADOS REAIS
SELECT 
  'FILIAIS REAIS CRIADAS:' as info,
  id,
  name,
  email,
  phone,
  address
FROM companies 
ORDER BY created_at;

-- 18. MOSTRAR CONTAS CRIADAS POR FILIAL
SELECT 
  'CONTAS CRIADAS POR FILIAL:' as info,
  c.name as filial,
  COUNT(fa.id) as total_contas,
  SUM(fa.balance) as saldo_total
FROM companies c
LEFT JOIN financial_accounts fa ON c.id = fa.company_id
GROUP BY c.id, c.name
ORDER BY c.created_at;

-- 19. MOSTRAR DETALHES DAS FILIAIS
SELECT 
  'DETALHES DAS FILIAIS:' as info,
  c.name as razao_social,
  CASE 
    WHEN c.name LIKE '%Loja do Sertanejo%' THEN 'Loja do Sertanejo'
    WHEN c.name LIKE '%CBA - Mineração%' THEN 'CBA MINERAÇÃO FILIAL'
    WHEN c.name LIKE '%CBA - MINERAÇÃO%' THEN 'CBA'
  END as nome_fantasia,
  CASE 
    WHEN c.name LIKE '%Loja do Sertanejo%' THEN '25.143.614/0001-53'
    WHEN c.name LIKE '%CBA - Mineração%' THEN '10.375.218/0002-65'
    WHEN c.name LIKE '%CBA - MINERAÇÃO%' THEN '10.375.218/0004-27'
  END as cnpj,
  c.address as endereco
FROM companies c
ORDER BY c.created_at;

SELECT '🎉 SISTEMA FINANCEIRO COM DADOS REAIS PRONTO!' as status_final;
