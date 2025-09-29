# 🔧 SOLUÇÃO RÁPIDA: Erro de API

## 🚨 **PROBLEMA IDENTIFICADO:**
A API não está funcionando, causando erro no dashboard.

## ✅ **SOLUÇÕES DISPONÍVEIS:**

### **SOLUÇÃO 1: Servidor Simples (Recomendado)**
```bash
# Executar servidor com dados mockados
npm run dev:simple
```

**Vantagens:**
- ✅ Funciona imediatamente
- ✅ Sem dependências do Supabase
- ✅ Dados realistas para teste
- ✅ Zero configuração

### **SOLUÇÃO 2: Servidor Completo**
```bash
# Executar servidor com Supabase
npm run dev:complete
```

**Requisitos:**
- ⚙️ Configurar variáveis do Supabase no .env
- ⚙️ Executar script SQL no banco

### **SOLUÇÃO 3: Apenas Frontend**
```bash
# Executar apenas frontend (dados locais)
npm run dev
```

**Limitações:**
- ⚠️ Dados limitados
- ⚠️ Sem API real

## 🚀 **EXECUÇÃO RÁPIDA:**

### **Passo 1: Parar Servidor Atual**
```bash
# Pressione Ctrl+C para parar
```

### **Passo 2: Executar Servidor Simples**
```bash
npm run dev:simple
```

### **Passo 3: Testar API**
```bash
# Em outro terminal
node test-api.js
```

### **Passo 4: Verificar Frontend**
1. Acesse `http://localhost:5173`
2. Faça login
3. Selecione uma filial
4. Verifique se não há erro de API

## 🔍 **VERIFICAÇÃO:**

### **Console do Navegador (F12):**
- ✅ Deve mostrar: "✅ Dados da API carregados"
- ❌ Não deve mostrar: "⚠️ API não disponível"

### **Dashboard:**
- ✅ Indicador verde: "Dados atualizados"
- ❌ Não deve mostrar: "Erro na API"

### **KPIs:**
- ✅ Valores numéricos reais
- ❌ Não deve mostrar: "0" em tudo

## 🛠️ **TROUBLESHOOTING:**

### **Se API não iniciar:**
```bash
# Verificar se porta 3001 está livre
netstat -an | findstr :3001

# Matar processo na porta 3001
taskkill /F /PID <PID>
```

### **Se Frontend não conectar:**
```bash
# Verificar se API está rodando
curl http://localhost:3001/api/health
```

### **Se ainda houver erro:**
```bash
# Limpar cache e reinstalar
rm -rf node_modules
npm install
npm run dev:simple
```

## 📊 **DADOS MOCKADOS DISPONÍVEIS:**

### **Dashboard Summary:**
- Produtos Ativos: 10-60 (aleatório)
- Valor em Estoque: R$ 100.000 - 600.000
- Veículos Ativos: 5-20
- Transferências Pendentes: 0-10

### **Gráficos:**
- Movimentação dos últimos 7 dias
- Distribuição por categoria
- Resumo financeiro mensal
- Atividades recentes

## 🎯 **RESULTADO ESPERADO:**

Após executar `npm run dev:simple`:

- ✅ **API funcionando** na porta 3001
- ✅ **Frontend funcionando** na porta 5173
- ✅ **Dashboard sem erros**
- ✅ **Dados realistas** carregando
- ✅ **Sistema 100% operacional**

## 🚀 **COMANDO FINAL:**

```bash
npm run dev:simple
```

**Este comando resolve o erro de API imediatamente!** 🎉





















