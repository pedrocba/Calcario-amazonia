-- =====================================================
-- CONFIGURAR USUÁRIOS E PERMISSÕES
-- =====================================================
-- Execute este script no Supabase SQL Editor

-- 1. CRIAR TABELA DE LOGS DO SISTEMA
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  company_id TEXT,
  action VARCHAR(100) NOT NULL,
  details JSONB,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_company_id ON system_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at);

-- 3. CRIAR FUNÇÃO PARA LOG DE AÇÕES
CREATE OR REPLACE FUNCTION log_user_action(
  p_user_id UUID,
  p_company_id TEXT,
  p_action VARCHAR(100),
  p_details JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO system_logs (user_id, company_id, action, details, ip_address)
  VALUES (p_user_id, p_company_id, p_action, p_details, p_ip_address);
END;
$$ LANGUAGE plpgsql;

-- 4. CRIAR TRIGGER PARA LOG AUTOMÁTICO
CREATE OR REPLACE FUNCTION trigger_log_financial_transactions()
RETURNS TRIGGER AS $$
BEGIN
  -- Log da ação
  PERFORM log_user_action(
    NEW.created_by,
    NEW.company_id,
    CASE 
      WHEN TG_OP = 'INSERT' THEN 'CREATE_TRANSACTION'
      WHEN TG_OP = 'UPDATE' THEN 'UPDATE_TRANSACTION'
      WHEN TG_OP = 'DELETE' THEN 'DELETE_TRANSACTION'
    END,
    jsonb_build_object(
      'transaction_id', COALESCE(NEW.id, OLD.id),
      'amount', COALESCE(NEW.amount, OLD.amount),
      'type', COALESCE(NEW.type, OLD.type),
      'status', COALESCE(NEW.status, OLD.status)
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 5. APLICAR TRIGGER NAS TABELAS
DROP TRIGGER IF EXISTS log_financial_transactions_trigger ON financial_transactions;
CREATE TRIGGER log_financial_transactions_trigger
  AFTER INSERT OR UPDATE OR DELETE ON financial_transactions
  FOR EACH ROW EXECUTE FUNCTION trigger_log_financial_transactions();

-- 6. CRIAR FUNÇÃO PARA VINCULAR USUÁRIO À FILIAL
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
  
  -- Log da ação
  PERFORM log_user_action(
    p_user_id,
    p_company_id,
    'USER_ADDED_TO_COMPANY',
    jsonb_build_object(
      'role', p_role,
      'permissions', p_permissions
    )
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 7. CRIAR FUNÇÃO PARA REMOVER USUÁRIO DA FILIAL
CREATE OR REPLACE FUNCTION remove_user_from_company(
  p_user_id UUID,
  p_company_id TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar se o usuário está na filial
  IF NOT EXISTS (SELECT 1 FROM user_companies WHERE user_id = p_user_id AND company_id = p_company_id) THEN
    RAISE EXCEPTION 'Usuário não encontrado na filial: %', p_company_id;
  END IF;
  
  -- Remover usuário da filial
  DELETE FROM user_companies WHERE user_id = p_user_id AND company_id = p_company_id;
  
  -- Log da ação
  PERFORM log_user_action(
    p_user_id,
    p_company_id,
    'USER_REMOVED_FROM_COMPANY',
    NULL
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 8. CRIAR FUNÇÃO PARA LISTAR FILIAIS DO USUÁRIO
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

-- 9. CRIAR FUNÇÃO PARA VERIFICAR PERMISSÕES
CREATE OR REPLACE FUNCTION check_user_permission(
  p_user_id UUID,
  p_company_id TEXT,
  p_permission VARCHAR(100)
)
RETURNS BOOLEAN AS $$
DECLARE
  user_role VARCHAR(50);
  user_permissions JSONB;
BEGIN
  -- Buscar role e permissões do usuário
  SELECT role, permissions INTO user_role, user_permissions
  FROM user_companies
  WHERE user_id = p_user_id AND company_id = p_company_id;
  
  -- Se não encontrou o usuário na filial
  IF user_role IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Se é admin, tem todas as permissões
  IF user_role = 'admin' THEN
    RETURN TRUE;
  END IF;
  
  -- Verificar permissão específica
  RETURN COALESCE((user_permissions->>p_permission)::boolean, FALSE);
END;
$$ LANGUAGE plpgsql;

-- 10. VERIFICAR CONFIGURAÇÃO
SELECT 
  '✅ CONFIGURAÇÃO DE USUÁRIOS CONCLUÍDA!' as status,
  (SELECT COUNT(*) FROM companies) as total_filiais,
  (SELECT COUNT(*) FROM user_companies) as usuarios_vinculados,
  (SELECT COUNT(*) FROM system_logs) as logs_criados;

-- 11. EXEMPLO DE USO DAS FUNÇÕES
SELECT 'EXEMPLO DE USO:' as info;

-- Adicionar usuário à filial (substitua pelos IDs reais)
-- SELECT add_user_to_company('user-id-aqui', 'company-id-aqui', 'admin', '{"create": true, "edit": true, "delete": true}');

-- Listar filiais do usuário
-- SELECT * FROM get_user_companies('user-id-aqui');

-- Verificar permissão
-- SELECT check_user_permission('user-id-aqui', 'company-id-aqui', 'create');

SELECT '🎉 SISTEMA DE USUÁRIOS PRONTO!' as status_final;
