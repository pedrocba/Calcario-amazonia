-- =====================================================
-- DEPLOY FINAL PARA PRODUÇÃO
-- =====================================================
-- Execute este script no Supabase SQL Editor

-- 1. VERIFICAR ESTRUTURA ATUAL
SELECT 
  'VERIFICAÇÃO INICIAL:' as info,
  (SELECT COUNT(*) FROM companies) as empresas,
  (SELECT COUNT(*) FROM financial_accounts) as contas,
  (SELECT COUNT(*) FROM financial_transactions) as transacoes,
  (SELECT COUNT(*) FROM user_companies) as usuarios_vinculados;

-- 2. CRIAR TABELA DE CONFIGURAÇÕES DO SISTEMA
CREATE TABLE IF NOT EXISTS system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. INSERIR CONFIGURAÇÕES PADRÃO
INSERT INTO system_config (key, value, description)
VALUES 
  ('app_version', '"1.0.0"', 'Versão atual do sistema'),
  ('maintenance_mode', 'false', 'Modo de manutenção'),
  ('backup_enabled', 'true', 'Backup automático habilitado'),
  ('log_retention_days', '30', 'Dias para retenção de logs'),
  ('max_file_size_mb', '10', 'Tamanho máximo de arquivo em MB'),
  ('session_timeout_minutes', '480', 'Timeout de sessão em minutos')
ON CONFLICT (key) DO NOTHING;

-- 4. CRIAR FUNÇÃO PARA ATUALIZAR CONFIGURAÇÕES
CREATE OR REPLACE FUNCTION update_system_config(
  p_key VARCHAR(100),
  p_value JSONB,
  p_description TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO system_config (key, value, description)
  VALUES (p_key, p_value, p_description)
  ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    description = COALESCE(EXCLUDED.description, system_config.description),
    updated_at = NOW();
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 5. CRIAR FUNÇÃO PARA BUSCAR CONFIGURAÇÕES
CREATE OR REPLACE FUNCTION get_system_config(p_key VARCHAR(100))
RETURNS JSONB AS $$
DECLARE
  config_value JSONB;
BEGIN
  SELECT value INTO config_value
  FROM system_config
  WHERE key = p_key;
  
  RETURN COALESCE(config_value, 'null'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- 6. CRIAR TABELA DE BACKUP
CREATE TABLE IF NOT EXISTS backup_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL,
  file_size_mb DECIMAL(10,2),
  file_path TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. CRIAR FUNÇÃO PARA LOG DE BACKUP
CREATE OR REPLACE FUNCTION log_backup(
  p_backup_type VARCHAR(50),
  p_status VARCHAR(20),
  p_file_size_mb DECIMAL(10,2) DEFAULT NULL,
  p_file_path TEXT DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO backup_logs (backup_type, status, file_size_mb, file_path, error_message)
  VALUES (p_backup_type, p_status, p_file_size_mb, p_file_path, p_error_message);
END;
$$ LANGUAGE plpgsql;

-- 8. CRIAR TABELA DE MÉTRICAS DO SISTEMA
CREATE TABLE IF NOT EXISTS system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name VARCHAR(100) NOT NULL,
  metric_value DECIMAL(15,2) NOT NULL,
  metric_unit VARCHAR(20),
  company_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_system_metrics_name ON system_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_system_metrics_company_id ON system_metrics(company_id);
CREATE INDEX IF NOT EXISTS idx_system_metrics_created_at ON system_metrics(created_at);

-- 10. CRIAR FUNÇÃO PARA INSERIR MÉTRICAS
CREATE OR REPLACE FUNCTION insert_system_metric(
  p_metric_name VARCHAR(100),
  p_metric_value DECIMAL(15,2),
  p_metric_unit VARCHAR(20) DEFAULT NULL,
  p_company_id TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO system_metrics (metric_name, metric_value, metric_unit, company_id)
  VALUES (p_metric_name, p_metric_value, p_metric_unit, p_company_id);
END;
$$ LANGUAGE plpgsql;

-- 11. CRIAR VIEW PARA DASHBOARD ADMINISTRATIVO
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

-- 12. CRIAR FUNÇÃO PARA LIMPEZA AUTOMÁTICA DE LOGS
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
  retention_days INTEGER;
BEGIN
  -- Buscar dias de retenção
  SELECT (get_system_config('log_retention_days')::text)::integer INTO retention_days;
  
  -- Limpar logs antigos
  DELETE FROM system_logs 
  WHERE created_at < NOW() - INTERVAL '1 day' * retention_days;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Log da limpeza
  PERFORM log_user_action(
    NULL,
    NULL,
    'CLEANUP_LOGS',
    jsonb_build_object(
      'deleted_count', deleted_count,
      'retention_days', retention_days
    )
  );
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 13. CRIAR TRIGGER PARA ATUALIZAR UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_system_config_updated_at 
  BEFORE UPDATE ON system_config 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 14. VERIFICAR CONFIGURAÇÃO FINAL
SELECT 
  '✅ DEPLOY FINAL CONCLUÍDO!' as status,
  (SELECT COUNT(*) FROM companies) as empresas,
  (SELECT COUNT(*) FROM financial_accounts) as contas,
  (SELECT COUNT(*) FROM financial_transactions) as transacoes,
  (SELECT COUNT(*) FROM user_companies) as usuarios,
  (SELECT COUNT(*) FROM system_config) as configuracoes,
  (SELECT COUNT(*) FROM system_logs) as logs;

-- 15. MOSTRAR DASHBOARD ADMINISTRATIVO
SELECT * FROM admin_dashboard;

-- 16. TESTAR FUNÇÕES
SELECT 
  'TESTE DE FUNÇÕES:' as info,
  get_system_config('app_version') as versao,
  get_system_config('maintenance_mode') as modo_manutencao;

SELECT '🎉 SISTEMA PRONTO PARA PRODUÇÃO!' as status_final;
