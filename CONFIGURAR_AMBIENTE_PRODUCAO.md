# 🚀 CONFIGURAÇÃO DE AMBIENTE DE PRODUÇÃO

## 📋 **PASSO A PASSO COMPLETO**

### **1. PREPARAÇÃO INICIAL**

#### **1.1 Backup do Ambiente Atual**
```bash
# 1. Acessar Supabase Dashboard
# 2. Ir para Settings > Database
# 3. Fazer backup completo
# 4. Download do backup
```

#### **1.2 Configuração de Variáveis**
```env
# .env.production
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
VITE_APP_ENV=production
VITE_APP_VERSION=1.0.0
VITE_APP_NAME=Sistema Financeiro
```

---

### **2. EXECUÇÃO DOS SCRIPTS SQL**

#### **2.1 Ordem de Execução**
```sql
-- 1. PRIMEIRO: Limpeza completa
-- Execute: PRODUCAO_LIMPEZA_COMPLETA.sql

-- 2. SEGUNDO: Configurar filiais
-- Execute: PRODUCAO_CONFIGURAR_FILIAIS.sql

-- 3. TERCEIRO: Configurar usuários
-- Execute: PRODUCAO_CONFIGURAR_USUARIOS.sql

-- 4. QUARTO: Deploy final
-- Execute: PRODUCAO_DEPLOY_FINAL.sql
```

#### **2.2 Verificação de Cada Script**
```sql
-- Após cada script, verificar:
SELECT 
  'Verificação:' as info,
  (SELECT COUNT(*) FROM companies) as empresas,
  (SELECT COUNT(*) FROM financial_accounts) as contas,
  (SELECT COUNT(*) FROM user_companies) as usuarios;
```

---

### **3. CONFIGURAÇÃO DO FRONTEND**

#### **3.1 Build de Produção**
```bash
# Instalar dependências
npm install

# Build para produção
npm run build

# Verificar build
npm run preview
```

#### **3.2 Configuração de Deploy**
```bash
# Para Vercel
vercel --prod

# Para Netlify
netlify deploy --prod

# Para servidor próprio
npm run build
# Copiar pasta 'dist' para servidor
```

---

### **4. CONFIGURAÇÃO DE DOMÍNIO**

#### **4.1 Configuração DNS**
```
# DNS Records
A     @        IP_DO_SERVIDOR
CNAME www      seu-dominio.com
CNAME api      api.seu-dominio.com
```

#### **4.2 Configuração SSL**
```bash
# Certificado SSL automático (Vercel/Netlify)
# Ou configurar manualmente no servidor
```

---

### **5. CONFIGURAÇÃO DE USUÁRIOS**

#### **5.1 Criar Primeiro Usuário Admin**
```sql
-- Substitua pelos IDs reais
SELECT add_user_to_company(
  'user-id-do-admin',
  'company-id-da-matriz',
  'admin',
  '{"create": true, "edit": true, "delete": true, "admin": true}'
);
```

#### **5.2 Configurar Usuários por Filial**
```sql
-- Para cada filial, adicionar usuários
SELECT add_user_to_company(
  'user-id-1',
  'company-id-filial-1',
  'user',
  '{"create": true, "edit": true, "delete": false}'
);
```

---

### **6. TESTES DE PRODUÇÃO**

#### **6.1 Checklist de Testes**
- [ ] Login funcionando
- [ ] Dados isolados por filial
- [ ] Contas financeiras criadas
- [ ] Transações funcionando
- [ ] Relatórios gerando
- [ ] Backup automático
- [ ] Logs funcionando

#### **6.2 Teste de Carga**
```bash
# Testar com múltiplos usuários
# Verificar performance
# Monitorar uso de recursos
```

---

### **7. MONITORAMENTO**

#### **7.1 Configuração de Alertas**
```sql
-- Configurar alertas no Supabase
-- Monitorar logs de erro
-- Verificar performance
```

#### **7.2 Dashboard Administrativo**
```sql
-- Acessar view admin_dashboard
SELECT * FROM admin_dashboard;
```

---

### **8. MANUTENÇÃO**

#### **8.1 Backup Automático**
```sql
-- Configurar no Supabase Dashboard
-- Backup diário às 02:00
-- Retenção de 30 dias
```

#### **8.2 Limpeza de Logs**
```sql
-- Executar semanalmente
SELECT cleanup_old_logs();
```

---

### **9. SEGURANÇA**

#### **9.1 Configurações de Segurança**
```sql
-- Verificar políticas RLS
-- Testar isolamento de dados
-- Validar permissões
```

#### **9.2 Monitoramento de Acessos**
```sql
-- Verificar logs de acesso
-- Monitorar tentativas de login
-- Alertas de segurança
```

---

### **10. DOCUMENTAÇÃO**

#### **10.1 Documentar Configurações**
```markdown
# Documentar:
- URLs de produção
- Chaves de API
- Configurações de banco
- Usuários e permissões
- Procedimentos de backup
```

#### **10.2 Treinamento de Usuários**
```markdown
# Criar guias para:
- Login e navegação
- Criação de contas
- Lançamento de transações
- Geração de relatórios
- Resolução de problemas
```

---

## 🎯 **RESULTADO FINAL**

Após seguir todos os passos, você terá:

- ✅ **Sistema em produção** funcionando
- ✅ **Dados separados** por filial
- ✅ **Banco limpo** sem dados de teste
- ✅ **Usuários configurados** com permissões
- ✅ **Backup automático** funcionando
- ✅ **Monitoramento** ativo
- ✅ **Segurança** configurada
- ✅ **Performance** otimizada

## 🚨 **IMPORTANTE**

1. **SEMPRE faça backup** antes de qualquer alteração
2. **Teste em ambiente de staging** antes da produção
3. **Monitore** o sistema após o deploy
4. **Documente** todas as configurações
5. **Treine** os usuários finais

## 📞 **SUPORTE**

- **Logs do sistema**: `system_logs` table
- **Métricas**: `system_metrics` table
- **Dashboard**: `admin_dashboard` view
- **Configurações**: `system_config` table

**Sistema pronto para uso real!** 🎉
