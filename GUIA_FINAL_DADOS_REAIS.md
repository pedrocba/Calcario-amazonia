# 🏢 SISTEMA FINANCEIRO COM DADOS REAIS DAS FILIAIS

## 📋 **FILIAIS CONFIGURADAS**

### **1. LOJA DO SERTANEJO LTDA**
- **Razão Social**: Loja do Sertanejo Ltda
- **Nome Fantasia**: Loja do Sertanejo
- **CNPJ**: 25.143.614/0001-53
- **Endereço**: Avenida Cuiabá, 1030 - Sale, Santarém - PA, 68.040-400
- **Email**: contato@lojadosertanejo.com.br
- **Telefone**: (93) 3523-0000

### **2. CBA - MINERAÇÃO E COMÉRCIO DE CALCÁRIO E BRITA DA AMAZÔNIA LTDA**
- **Razão Social**: CBA - Mineração e Comércio de Calcário e Brita da Amazônia Ltda
- **Nome Fantasia**: CBA MINERAÇÃO FILIAL
- **CNPJ**: 10.375.218/0002-65
- **Endereço**: Rodovia BR 163, 1030 - Sale, Santarém - PA, 68.040-400
- **Email**: contato@cbamineracao.com.br
- **Telefone**: (93) 3523-0001

### **3. CBA - MINERAÇÃO E COMÉRCIO DE CALCÁRIO E BRITA DA AMAZÔNIA LTDA - ME**
- **Razão Social**: CBA - MINERAÇÃO E COMÉRCIO DE CALCÁRIO E BRITA DA AMAZÔNIA LTDA - ME
- **Nome Fantasia**: CBA
- **CNPJ**: 10.375.218/0004-27
- **Endereço**: Área Vicinal Apiáu KM 04 S/N, Santarém - PA
- **Email**: contato@cba.com.br
- **Telefone**: (93) 3523-0002

---

## 🚀 **PASSO A PASSO PARA CONFIGURAR**

### **PASSO 1: EXECUTAR SCRIPT PRINCIPAL**
```sql
-- Execute no Supabase SQL Editor:
-- SISTEMA_FINANCEIRO_DADOS_REAIS.sql
```

### **PASSO 2: CONFIGURAR USUÁRIOS**
```sql
-- Execute no Supabase SQL Editor:
-- CONFIGURAR_USUARIOS_FILIAIS_REAIS.sql
```

### **PASSO 3: VERIFICAR CONFIGURAÇÃO**
```sql
-- Verificar filiais criadas
SELECT id, name, email, phone, address FROM companies;

-- Verificar contas criadas
SELECT c.name as filial, COUNT(fa.id) as contas 
FROM companies c 
LEFT JOIN financial_accounts fa ON c.id = fa.company_id 
GROUP BY c.id, c.name;

-- Verificar usuários
SELECT uc.role, c.name as filial 
FROM user_companies uc 
JOIN companies c ON uc.company_id = c.id;
```

---

## 💰 **CONTAS FINANCEIRAS CRIADAS POR FILIAL**

### **Para cada filial, foram criadas 5 contas:**
1. **Caixa Principal** - Conta principal de caixa
2. **Conta Corrente** - Conta bancária principal
3. **Reserva de Emergência** - Reserva de emergência
4. **Conta Poupança** - Investimentos
5. **Cartão de Crédito** - Conta de crédito

### **Total de contas criadas: 15 (5 por filial)**

---

## 👥 **CONFIGURAÇÃO DE USUÁRIOS**

### **Tipos de Usuários:**
- **Super Admin**: Acesso a todas as filiais
- **Admin**: Acesso total à filial específica
- **User**: Acesso operacional à filial específica

### **Permissões por Tipo:**
- **Super Admin**: Todas as permissões em todas as filiais
- **Admin**: Criar, editar, deletar, relatórios na filial
- **User**: Criar, editar, relatórios na filial (sem deletar)

---

## 🔐 **SEGURANÇA CONFIGURADA**

### **Isolamento de Dados:**
- ✅ **Dados isolados** por filial
- ✅ **Usuários vinculados** às filiais
- ✅ **Permissões** por usuário
- ✅ **Logs** de todas as ações
- ✅ **Backup** automático

### **Políticas RLS:**
- ✅ **Contas financeiras** isoladas por filial
- ✅ **Transações** isoladas por filial
- ✅ **Usuários** só acessam suas filiais

---

## 📊 **MONITORAMENTO INCLUÍDO**

### **Dashboard Administrativo:**
- ✅ **Total de filiais** (3)
- ✅ **Total de contas** (15)
- ✅ **Total de transações** (0 inicialmente)
- ✅ **Total de usuários** (configurados)
- ✅ **Logs do sistema** (24h)
- ✅ **Saldo total** do sistema
- ✅ **Transações** (24h)

### **Logs do Sistema:**
- ✅ **Ações dos usuários**
- ✅ **Criação de contas**
- ✅ **Transações financeiras**
- ✅ **Acessos ao sistema**
- ✅ **Erros e exceções**

---

## 🎯 **RESULTADO FINAL**

Após executar os scripts, você terá:

- ✅ **3 filiais reais** configuradas
- ✅ **15 contas financeiras** criadas
- ✅ **Usuários** com permissões
- ✅ **Dados isolados** por filial
- ✅ **Segurança** configurada
- ✅ **Monitoramento** ativo
- ✅ **Backup** automático
- ✅ **Sistema pronto** para uso real

---

## 🚨 **IMPORTANTE**

### **Antes de Executar:**
1. **Faça backup** do banco atual
2. **Verifique** se as tabelas existem
3. **Teste** em ambiente de desenvolvimento primeiro

### **Após Executar:**
1. **Verifique** se as filiais foram criadas
2. **Configure** os usuários reais
3. **Teste** o isolamento de dados
4. **Monitore** o sistema

---

## 📞 **SUPORTE**

### **Verificar Sistema:**
```sql
-- Status geral
SELECT * FROM admin_dashboard;

-- Filiais criadas
SELECT id, name, email FROM companies;

-- Contas por filial
SELECT c.name, COUNT(fa.id) as contas 
FROM companies c 
LEFT JOIN financial_accounts fa ON c.id = fa.company_id 
GROUP BY c.id, c.name;
```

### **Logs do Sistema:**
```sql
-- Logs recentes
SELECT * FROM system_logs 
WHERE created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

**Sistema pronto para uso real com dados das suas filiais!** 🎉
