# 📊 **GUIA DE IMPORTAÇÃO - SISTEMA ANTIGO**

## 🎯 **IMPORTAÇÃO DE CONTAS A PAGAR DO SISTEMA ANTIGO**

### **✅ FORMATO ESPECÍFICO SUPORTADO:**

O sistema agora reconhece automaticamente o formato de exportação do seu sistema antigo:

```
Vencimento | Conta | Conta Gerencial | Origem | Cliente | Valor | Saldo
15/06/2025 | ALUGUEL MAQUINA LUCAS BEZE | Aluguel de Equipamentos | Despesas | | 5239 | 5239
20/06/2025 | CONSTRUALVES [DINHEIRO] (101 | Outras Despesas | Despesas | | 3724,73 | 3724,73
```

---

## 🚀 **COMO IMPORTAR SEUS DADOS:**

### **1. EXPORTAR DO SISTEMA ANTIGO:**
1. Exporte suas contas a pagar no formato CSV
2. Mantenha exatamente as colunas: `Vencimento`, `Conta`, `Conta Gerencial`, `Origem`, `Cliente`, `Valor`, `Saldo`

### **2. IMPORTAR NO NOVO SISTEMA:**
1. Acesse **"Importar Dados"** no menu
2. Selecione **"Contas a Pagar - Sistema Antigo"**
3. Faça upload do seu arquivo CSV
4. Clique em **"Importar Dados"**

### **3. MAPEAMENTO AUTOMÁTICO:**
O sistema converte automaticamente:

| **Sistema Antigo** | **Novo Sistema** | **Conversão** |
|-------------------|------------------|---------------|
| `Vencimento` | `due_date` | DD/MM/YYYY → YYYY-MM-DD |
| `Conta` | `description` | Nome da conta |
| `Conta Gerencial` | `category` | Categoria automática |
| `Origem` | `type` | Despesas → saida |
| `Cliente` | `notes` | Observações |
| `Valor` | `amount` | Vírgula → Ponto decimal |
| `Saldo` | `balance` | Valor atual |

---

## 🔄 **CONVERSÕES AUTOMÁTICAS:**

### **📅 DATAS:**
- **Entrada:** `15/06/2025`
- **Saída:** `2025-06-15`

### **💰 VALORES:**
- **Entrada:** `3724,73`
- **Saída:** `3724.73`

### **📋 TIPOS:**
- **Despesas** → `saida` (Contas a pagar)
- **Receitas** → `entrada` (Contas a receber)

### **🏷️ CATEGORIAS:**
- **Aluguel de Equipamentos** → `aluguel_equipamentos`
- **Outras Despesas** → `outras_despesas`
- **Aluguel** → `aluguel`
- **Combustível** → `combustivel`
- **Manutenção** → `manutencao`
- **Salários** → `folha_pagamento`

---

## 📋 **EXEMPLO DE ARQUIVO VÁLIDO:**

```csv
vencimento,conta,conta_gerencial,origem,cliente,valor,saldo
15/06/2025,ALUGUEL MAQUINA LUCAS BEZE,Aluguel de Equipamentos,Despesas,,5239,5239
20/06/2025,CONSTRUALVES [DINHEIRO] (101,Outras Despesas,Despesas,,3724,73,3724,73
05/07/2025,TERRENO MARANHÃO [DINHEIRC,Aluguel,Despesas,,2000,2000
06/07/2025,CONSTRUALVES CIMENTO IDINHL,Outras Despesas,Despesas,,704,704
```

---

## ✅ **VALIDAÇÕES AUTOMÁTICAS:**

### **🔍 CAMPOS OBRIGATÓRIOS:**
- ✅ `vencimento` - Data no formato DD/MM/YYYY
- ✅ `conta` - Nome da conta
- ✅ `valor` - Valor numérico

### **🔍 VALIDAÇÕES ESPECÍFICAS:**
- ✅ **Data:** Formato DD/MM/YYYY
- ✅ **Valor:** Número válido (vírgula como decimal)
- ✅ **Origem:** Despesas, Receitas, Receita ou Despesa

---

## 🎯 **RESULTADO DA IMPORTAÇÃO:**

### **✅ DADOS IMPORTADOS:**
- **Tipo:** Todas como "Contas a Pagar" (saida)
- **Status:** Todas como "Pendente"
- **Categoria:** Mapeada automaticamente
- **Data:** Convertida para formato padrão
- **Valor:** Convertido para formato numérico

### **📊 RELATÓRIO:**
- Total de registros processados
- Sucessos e erros
- Detalhes por lote
- Tempo de processamento

---

## 🛠️ **CONFIGURAÇÃO TÉCNICA:**

### **1. EXECUTAR SCRIPT SQL:**
```sql
-- Execute no Supabase SQL Editor
-- Arquivo: preparar-tabelas-importacao.sql
```

### **2. VERIFICAR ESTRUTURA:**
- Tabela `financial_transactions` deve existir
- RLS configurado para isolamento por filial
- Conta padrão criada automaticamente

---

## 🎉 **VANTAGENS DO NOVO SISTEMA:**

### **✅ MELHORIAS:**
- **Isolamento por filial** - Dados separados automaticamente
- **Categorização inteligente** - Mapeamento automático
- **Validação robusta** - Verificação antes da importação
- **Processamento em lotes** - Importação eficiente
- **Relatórios detalhados** - Acompanhamento completo

### **✅ FUNCIONALIDADES:**
- **Controle de vencimentos** - Alertas automáticos
- **Categorização** - Organização por tipo
- **Histórico** - Acompanhamento de pagamentos
- **Relatórios** - Análise financeira
- **Integração** - Com vendas e estoque

---

## 🚀 **PRÓXIMOS PASSOS:**

1. **Execute o script SQL** no Supabase
2. **Exporte seus dados** do sistema antigo
3. **Acesse "Importar Dados"** no novo sistema
4. **Selecione "Contas a Pagar - Sistema Antigo"**
5. **Faça upload** do seu arquivo CSV
6. **Verifique os resultados** da importação

**Seus dados do sistema antigo serão importados automaticamente com todas as conversões necessárias!** 🎯



