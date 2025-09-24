# 🚀 CONFIGURAÇÃO DO FRONTEND PARA PRODUÇÃO

## 📋 **PASSO A PASSO COMPLETO**

### **1. CONFIGURAÇÃO DE VARIÁVEIS DE AMBIENTE**

#### **1.1 Criar arquivo .env.production**
```env
# .env.production
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
VITE_APP_ENV=production
VITE_APP_VERSION=1.0.0
VITE_APP_NAME=Sistema Financeiro
VITE_APP_DESCRIPTION=Sistema completo de gestão financeira
```

#### **1.2 Verificar configurações**
```bash
# Verificar se as variáveis estão corretas
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
```

### **2. CONFIGURAÇÃO DO SISTEMA FINANCEIRO**

#### **2.1 Atualizar unifiedFinancialService.js**
```javascript
// src/api/unifiedFinancialService.js
// Adicionar configurações de produção

const PRODUCTION_CONFIG = {
  enableLogging: true,
  enableMetrics: true,
  enableBackup: true,
  sessionTimeout: 480, // 8 horas
  maxFileSize: 10 // MB
};

// Adicionar função de log para produção
const logProductionAction = async (action, details) => {
  try {
    await supabase
      .from('system_logs')
      .insert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        company_id: getCurrentCompanyId(),
        action: action,
        details: details,
        ip_address: null // Será preenchido pelo backend
      });
  } catch (error) {
    console.error('Erro ao registrar log:', error);
  }
};
```

#### **2.2 Atualizar componentes financeiros**
```javascript
// src/components/finance/FinancialDashboard.jsx
// Adicionar métricas de produção

const [productionMetrics, setProductionMetrics] = useState({
  totalTransactions: 0,
  totalAccounts: 0,
  totalCompanies: 0,
  systemHealth: 'healthy'
});

// Adicionar função para carregar métricas
const loadProductionMetrics = async () => {
  try {
    const { data } = await supabase
      .from('admin_dashboard')
      .select('*')
      .single();
    
    setProductionMetrics(data);
  } catch (error) {
    console.error('Erro ao carregar métricas:', error);
  }
};
```

### **3. CONFIGURAÇÃO DE SEGURANÇA**

#### **3.1 Implementar autenticação robusta**
```javascript
// src/auth/authService.js
export const authService = {
  // Verificar se usuário tem acesso à filial
  async checkCompanyAccess(companyId) {
    try {
      const { data } = await supabase
        .from('user_companies')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .eq('company_id', companyId)
        .single();
      
      return !!data;
    } catch (error) {
      console.error('Erro ao verificar acesso:', error);
      return false;
    }
  },

  // Obter filiais do usuário
  async getUserCompanies() {
    try {
      const { data } = await supabase
        .from('user_companies')
        .select(`
          company_id,
          role,
          permissions,
          companies (
            id,
            name,
            email,
            phone,
            address
          )
        `)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
      
      return data;
    } catch (error) {
      console.error('Erro ao obter filiais:', error);
      return [];
    }
  }
};
```

#### **3.2 Implementar controle de sessão**
```javascript
// src/utils/sessionManager.js
export const sessionManager = {
  // Verificar se sessão está ativa
  async checkSession() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      
      // Verificar timeout de sessão
      const lastActivity = localStorage.getItem('lastActivity');
      const now = Date.now();
      const timeout = 480 * 60 * 1000; // 8 horas
      
      if (lastActivity && (now - parseInt(lastActivity)) > timeout) {
        await this.logout();
        return false;
      }
      
      // Atualizar última atividade
      localStorage.setItem('lastActivity', now.toString());
      return true;
    } catch (error) {
      console.error('Erro ao verificar sessão:', error);
      return false;
    }
  },

  // Logout automático
  async logout() {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('lastActivity');
      window.location.href = '/login';
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }
};
```

### **4. CONFIGURAÇÃO DE MONITORAMENTO**

#### **4.1 Implementar métricas de performance**
```javascript
// src/utils/performanceMonitor.js
export const performanceMonitor = {
  // Registrar métrica
  async recordMetric(metricName, value, unit = null, companyId = null) {
    try {
      await supabase
        .from('system_metrics')
        .insert({
          metric_name: metricName,
          metric_value: value,
          metric_unit: unit,
          company_id: companyId
        });
    } catch (error) {
      console.error('Erro ao registrar métrica:', error);
    }
  },

  // Registrar tempo de carregamento
  async recordLoadTime(pageName, loadTime) {
    await this.recordMetric(`${pageName}_load_time`, loadTime, 'ms');
  },

  // Registrar uso de memória
  async recordMemoryUsage() {
    if (performance.memory) {
      await this.recordMetric('memory_usage', performance.memory.usedJSHeapSize, 'bytes');
    }
  }
};
```

#### **4.2 Implementar logs de erro**
```javascript
// src/utils/errorLogger.js
export const errorLogger = {
  // Registrar erro
  async logError(error, context = {}) {
    try {
      await supabase
        .from('system_logs')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          company_id: getCurrentCompanyId(),
          action: 'ERROR',
          details: {
            error: error.message,
            stack: error.stack,
            context: context,
            timestamp: new Date().toISOString()
          }
        });
    } catch (logError) {
      console.error('Erro ao registrar log de erro:', logError);
    }
  }
};
```

### **5. CONFIGURAÇÃO DE BUILD**

#### **5.1 Scripts de build**
```json
// package.json
{
  "scripts": {
    "build:production": "NODE_ENV=production npm run build",
    "preview:production": "npm run build:production && npm run preview",
    "deploy:production": "npm run build:production && vercel --prod"
  }
}
```

#### **5.2 Configuração do Vite**
```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']
        }
      }
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
  }
});
```

### **6. CONFIGURAÇÃO DE DEPLOY**

#### **6.1 Deploy no Vercel**
```bash
# Instalar Vercel CLI
npm install -g vercel

# Fazer login
vercel login

# Deploy
vercel --prod

# Configurar variáveis de ambiente
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

#### **6.2 Deploy no Netlify**
```bash
# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist

# Configurar variáveis de ambiente no dashboard
```

### **7. CONFIGURAÇÃO DE DOMÍNIO**

#### **7.1 Configuração DNS**
```
# DNS Records
A     @        IP_DO_SERVIDOR
CNAME www      seu-dominio.com
CNAME api      api.seu-dominio.com
```

#### **7.2 Configuração SSL**
```bash
# Certificado SSL automático (Vercel/Netlify)
# Ou configurar manualmente no servidor
```

### **8. TESTES DE PRODUÇÃO**

#### **8.1 Checklist de testes**
- [ ] Login funcionando
- [ ] Dados isolados por filial
- [ ] Contas financeiras criadas
- [ ] Transações funcionando
- [ ] Relatórios gerando
- [ ] Backup automático
- [ ] Logs funcionando
- [ ] Performance otimizada
- [ ] Segurança configurada

#### **8.2 Teste de carga**
```bash
# Testar com múltiplos usuários
# Verificar performance
# Monitorar uso de recursos
```

### **9. MONITORAMENTO PÓS-DEPLOY**

#### **9.1 Dashboard administrativo**
```sql
-- Acessar view admin_dashboard
SELECT * FROM admin_dashboard;
```

#### **9.2 Logs do sistema**
```sql
-- Verificar logs recentes
SELECT * FROM system_logs 
WHERE created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

#### **9.3 Métricas de performance**
```sql
-- Verificar métricas
SELECT * FROM system_metrics 
WHERE created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

### **10. MANUTENÇÃO**

#### **10.1 Backup automático**
```sql
-- Configurar no Supabase Dashboard
-- Backup diário às 02:00
-- Retenção de 30 dias
```

#### **10.2 Limpeza de logs**
```sql
-- Executar semanalmente
SELECT cleanup_old_logs();
```

## 🎯 **RESULTADO FINAL**

Após seguir todos os passos, você terá:

- ✅ **Sistema em produção** funcionando
- ✅ **Frontend otimizado** para produção
- ✅ **Dados separados** por filial
- ✅ **Segurança** configurada
- ✅ **Monitoramento** ativo
- ✅ **Performance** otimizada
- ✅ **Backup** automático
- ✅ **Logs** funcionando

## 🚨 **IMPORTANTE**

1. **SEMPRE faça backup** antes de qualquer alteração
2. **Teste em ambiente de staging** antes da produção
3. **Monitore** o sistema após o deploy
4. **Documente** todas as configurações
5. **Treine** os usuários finais

**Sistema pronto para uso real!** 🎉
