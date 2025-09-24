# 🚀 GUIA DE PRODUÇÃO - SISTEMA FINANCEIRO

## 📋 **VISÃO GERAL**

Guia completo para colocar o sistema financeiro em produção com dados reais, separados por filial e banco de dados limpo.

---

## 🎯 **PRÉ-REQUISITOS**

### **1. Ambiente de Produção**
- ✅ Supabase configurado
- ✅ Domínio próprio (opcional)
- ✅ SSL/HTTPS configurado
- ✅ Backup automático

### **2. Estrutura de Filiais**
- ✅ Cada filial terá seus próprios dados
- ✅ Isolamento completo entre filiais
- ✅ Usuários vinculados às filiais
- ✅ Relatórios por filial

---

## 🔧 **PASSO 1: LIMPEZA DO BANCO DE DADOS**

### **Script de Limpeza Completa**
```sql
-- LIMPAR TODOS OS DADOS DE TESTE
DELETE FROM financial_transactions;
DELETE FROM financial_accounts;
DELETE FROM sessoes_caixa;
DELETE FROM companies;

-- RESETAR SEQUÊNCIAS
ALTER SEQUENCE IF EXISTS companies_id_seq RESTART WITH 1;
```

### **Verificar Limpeza**
```sql
-- VERIFICAR SE ESTÁ LIMPO
SELECT 
  'Verificação de limpeza:' as status,
  (SELECT COUNT(*) FROM companies) as empresas,
  (SELECT COUNT(*) FROM financial_accounts) as contas,
  (SELECT COUNT(*) FROM financial_transactions) as transacoes;
```

---

## 🏢 **PASSO 2: CONFIGURAÇÃO DE FILIAIS**

### **Estrutura de Filiais**
```sql
-- CRIAR FILIAIS REAIS
INSERT INTO companies (id, name, email, phone, address, created_at)
VALUES 
  (gen_random_uuid(), 'Matriz - São Paulo', 'matriz@empresa.com', '(11) 99999-9999', 'Av. Paulista, 1000 - São Paulo/SP', NOW()),
  (gen_random_uuid(), 'Filial - Rio de Janeiro', 'rj@empresa.com', '(21) 88888-8888', 'Av. Copacabana, 500 - Rio de Janeiro/RJ', NOW()),
  (gen_random_uuid(), 'Filial - Belo Horizonte', 'bh@empresa.com', '(31) 77777-7777', 'Av. Afonso Pena, 2000 - Belo Horizonte/MG', NOW());
```

### **Configurar Contas Financeiras por Filial**
```sql
-- PARA CADA FILIAL, CRIAR CONTAS PADRÃO
-- Substitua 'ID_DA_FILIAL' pelo ID real da filial

-- Contas para Matriz
INSERT INTO financial_accounts (company_id, name, type, balance, description, active)
SELECT 
  id as company_id,
  'Caixa Principal' as name,
  'caixa' as type,
  0.00 as balance,
  'Caixa principal da filial' as description,
  true as active
FROM companies WHERE name LIKE '%Matriz%';

-- Contas para Filiais
INSERT INTO financial_accounts (company_id, name, type, balance, description, active)
SELECT 
  id as company_id,
  'Caixa Principal' as name,
  'caixa' as type,
  0.00 as balance,
  'Caixa principal da filial' as description,
  true as active
FROM companies WHERE name LIKE '%Filial%';
```

---

## 👥 **PASSO 3: CONFIGURAÇÃO DE USUÁRIOS**

### **Sistema de Permissões por Filial**
```sql
-- CRIAR TABELA DE USUÁRIOS POR FILIAL
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

-- CRIAR ÍNDICES
CREATE INDEX idx_user_companies_user_id ON user_companies(user_id);
CREATE INDEX idx_user_companies_company_id ON user_companies(company_id);
```

### **Políticas RLS por Filial**
```sql
-- POLÍTICA PARA CONTAS FINANCEIRAS
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

-- POLÍTICA PARA TRANSAÇÕES
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
```

---

## 🔐 **PASSO 4: SEGURANÇA E BACKUP**

### **Backup Automático**
```sql
-- CONFIGURAR BACKUP DIÁRIO
-- (Configurar no Supabase Dashboard > Settings > Database)

-- 1. Backup diário às 02:00
-- 2. Retenção de 30 dias
-- 3. Backup antes de atualizações
```

### **Monitoramento**
```sql
-- CRIAR TABELA DE LOGS
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  company_id TEXT,
  action VARCHAR(100) NOT NULL,
  details JSONB,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ÍNDICES PARA PERFORMANCE
CREATE INDEX idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX idx_system_logs_company_id ON system_logs(company_id);
CREATE INDEX idx_system_logs_created_at ON system_logs(created_at);
```

---

## 📊 **PASSO 5: CONFIGURAÇÃO INICIAL**

### **Script de Configuração Inicial**
```sql
-- CONFIGURAR FILIAL PRINCIPAL
DO $$
DECLARE
    matriz_id TEXT;
BEGIN
    -- Buscar ID da matriz
    SELECT id INTO matriz_id FROM companies WHERE name LIKE '%Matriz%' LIMIT 1;
    
    -- Criar contas padrão para matriz
    INSERT INTO financial_accounts (company_id, name, type, balance, description, active)
    VALUES 
        (matriz_id, 'Caixa Principal', 'caixa', 0.00, 'Caixa principal da matriz', true),
        (matriz_id, 'Conta Corrente Principal', 'banco', 0.00, 'Conta corrente da matriz', true),
        (matriz_id, 'Reserva de Emergência', 'caixa', 0.00, 'Reserva de emergência', true);
    
    RAISE NOTICE 'Matriz configurada com sucesso!';
END $$;
```

---

## 🚀 **PASSO 6: DEPLOY EM PRODUÇÃO**

### **1. Configuração do Supabase**
```bash
# 1. Acessar Supabase Dashboard
# 2. Ir para Settings > API
# 3. Copiar URL e anon key
# 4. Configurar no .env do projeto
```

### **2. Variáveis de Ambiente**
```env
# .env.production
VITE_SUPABASE_URL=sua_url_aqui
VITE_SUPABASE_ANON_KEY=sua_chave_aqui
VITE_APP_ENV=production
VITE_APP_VERSION=1.0.0
```

### **3. Build de Produção**
```bash
# Instalar dependências
npm install

# Build para produção
npm run build

# Verificar build
npm run preview
```

---

## 📱 **PASSO 7: CONFIGURAÇÃO DE DOMÍNIO**

### **1. Configurar Domínio**
```bash
# 1. Comprar domínio
# 2. Configurar DNS
# 3. Configurar SSL
# 4. Deploy no Vercel/Netlify
```

### **2. Configuração de DNS**
```
# DNS Records
A     @        IP_DO_SERVIDOR
CNAME www      seu-dominio.com
CNAME api      api.seu-dominio.com
```

---

## 🔄 **PASSO 8: MIGRAÇÃO DE DADOS**

### **Script de Migração**
```sql
-- MIGRAR DADOS EXISTENTES
-- (Se houver dados antigos para migrar)

-- 1. Backup dos dados antigos
-- 2. Mapear estrutura antiga para nova
-- 3. Migrar dados por filial
-- 4. Validar integridade
-- 5. Testar funcionalidades
```

---

## 📈 **PASSO 9: MONITORAMENTO E MANUTENÇÃO**

### **1. Monitoramento**
- ✅ Logs de acesso
- ✅ Performance do banco
- ✅ Uso de recursos
- ✅ Alertas de erro

### **2. Manutenção**
- ✅ Backup diário
- ✅ Limpeza de logs antigos
- ✅ Otimização de queries
- ✅ Atualizações de segurança

---

## 🎯 **PASSO 10: TESTES FINAIS**

### **Checklist de Produção**
- [ ] Todas as filiais configuradas
- [ ] Usuários com permissões corretas
- [ ] Dados isolados por filial
- [ ] Backup funcionando
- [ ] SSL configurado
- [ ] Performance otimizada
- [ ] Logs funcionando
- [ ] Testes de carga realizados

---

## 🚨 **IMPORTANTE - ANTES DE IR PARA PRODUÇÃO**

### **1. Backup Completo**
```sql
-- FAZER BACKUP COMPLETO ANTES DE QUALQUER ALTERAÇÃO
-- Supabase Dashboard > Settings > Database > Backups
```

### **2. Teste em Ambiente de Staging**
- ✅ Testar todas as funcionalidades
- ✅ Verificar isolamento de dados
- ✅ Testar performance
- ✅ Validar segurança

### **3. Plano de Rollback**
- ✅ Backup antes de cada alteração
- ✅ Script de rollback preparado
- ✅ Monitoramento ativo
- ✅ Equipe de suporte disponível

---

## 📞 **SUPORTE PÓS-PRODUÇÃO**

### **1. Monitoramento 24/7**
- ✅ Logs de erro
- ✅ Performance
- ✅ Uso de recursos
- ✅ Alertas automáticos

### **2. Manutenção Preventiva**
- ✅ Backup diário
- ✅ Limpeza semanal
- ✅ Otimização mensal
- ✅ Atualizações de segurança

---

## 🎉 **RESULTADO FINAL**

Após seguir todos os passos, você terá:

- ✅ **Sistema em produção** funcionando
- ✅ **Dados separados** por filial
- ✅ **Banco limpo** sem dados de teste
- ✅ **Segurança** configurada
- ✅ **Backup** automático
- ✅ **Monitoramento** ativo
- ✅ **Performance** otimizada

**Sistema pronto para uso real!** 🚀