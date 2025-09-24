# 🚀 DEPLOY COMPLETO PARA PRODUÇÃO

## 📋 **PASSO A PASSO FINAL**

### **1. EXECUTAR SCRIPT SQL COMPLETO**

#### **1.1 Execute no Supabase SQL Editor:**
```sql
-- Copie e cole o conteúdo do arquivo:
-- SISTEMA_FINANCEIRO_PRODUCAO_COMPLETO.sql
```

#### **1.2 Verificar se funcionou:**
- ✅ **5 filiais** criadas
- ✅ **15 contas financeiras** criadas (3 por filial)
- ✅ **Tabelas de usuários** configuradas
- ✅ **Políticas RLS** ativas
- ✅ **Logs do sistema** funcionando

### **2. CONFIGURAR FRONTEND**

#### **2.1 Variáveis de ambiente:**
```env
# .env.production
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
VITE_APP_ENV=production
VITE_APP_VERSION=1.0.0
```

#### **2.2 Build de produção:**
```bash
# Instalar dependências
npm install

# Build para produção
npm run build

# Verificar build
npm run preview
```

### **3. CONFIGURAR USUÁRIOS**

#### **3.1 Criar primeiro usuário admin:**
```sql
-- Substitua pelos IDs reais
SELECT add_user_to_company(
  'user-id-do-admin',
  'company-id-da-matriz',
  'admin',
  '{"create": true, "edit": true, "delete": true, "admin": true}'
);
```

#### **3.2 Configurar usuários por filial:**
```sql
-- Para cada filial, adicionar usuários
SELECT add_user_to_company(
  'user-id-1',
  'company-id-filial-1',
  'user',
  '{"create": true, "edit": true, "delete": false}'
);
```

### **4. DEPLOY DO FRONTEND**

#### **4.1 Deploy no Vercel:**
```bash
# Instalar Vercel CLI
npm install -g vercel

# Fazer login
vercel login

# Deploy
vercel --prod
```

#### **4.2 Deploy no Netlify:**
```bash
# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

### **5. CONFIGURAR DOMÍNIO**

#### **5.1 DNS:**
```
A     @        IP_DO_SERVIDOR
CNAME www      seu-dominio.com
```

#### **5.2 SSL:**
- ✅ Certificado automático (Vercel/Netlify)
- ✅ HTTPS configurado

### **6. TESTES FINAIS**

#### **6.1 Checklist:**
- [ ] **Login** funcionando
- [ ] **Dados isolados** por filial
- [ ] **Contas financeiras** criadas
- [ ] **Transações** funcionando
- [ ] **Relatórios** gerando
- [ ] **Backup** automático
- [ ] **Logs** funcionando

#### **6.2 Teste de usuários:**
- [ ] **Admin** pode acessar todas as filiais
- [ ] **Usuários** só acessam suas filiais
- [ ] **Dados** estão isolados
- [ ] **Performance** está boa

### **7. MONITORAMENTO**

#### **7.1 Dashboard administrativo:**
```sql
-- Verificar status do sistema
SELECT * FROM admin_dashboard;
```

#### **7.2 Logs do sistema:**
```sql
-- Verificar logs recentes
SELECT * FROM system_logs 
WHERE created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

### **8. MANUTENÇÃO**

#### **8.1 Backup automático:**
- ✅ **Configurado** no Supabase
- ✅ **Backup diário** às 02:00
- ✅ **Retenção** de 30 dias

#### **8.2 Limpeza de logs:**
```sql
-- Executar semanalmente
SELECT cleanup_old_logs();
```

## 🎯 **RESULTADO FINAL**

Após seguir todos os passos, você terá:

- ✅ **Sistema em produção** funcionando
- ✅ **5 filiais** configuradas
- ✅ **15 contas financeiras** criadas
- ✅ **Usuários** com permissões
- ✅ **Dados isolados** por filial
- ✅ **Segurança** configurada
- ✅ **Monitoramento** ativo
- ✅ **Backup** automático
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

---

## 🔧 **COMANDOS RÁPIDOS**

### **Verificar sistema:**
```sql
SELECT * FROM admin_dashboard;
```

### **Verificar filiais:**
```sql
SELECT id, name, email FROM companies;
```

### **Verificar contas:**
```sql
SELECT c.name as filial, COUNT(fa.id) as contas 
FROM companies c 
LEFT JOIN financial_accounts fa ON c.id = fa.company_id 
GROUP BY c.id, c.name;
```

### **Verificar usuários:**
```sql
SELECT uc.role, c.name as filial 
FROM user_companies uc 
JOIN companies c ON uc.company_id = c.id;
```

**Execute tudo e seu sistema estará 100% funcional!** 🚀
