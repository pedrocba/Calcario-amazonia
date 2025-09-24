# 🚚 Sistema de Controle de Retiradas - Guia Completo

## 📋 **Visão Geral**

O sistema implementa a lógica que você solicitou: **o cliente compra uma quantidade de produto, paga (total ou parcialmente) e vai retirando aos poucos conforme sua necessidade**.

## 🏗️ **Estrutura do Sistema**

### **1. Tabelas Criadas:**
- `saldo_produtos` - Controla o estoque do cliente
- `retiradas` - Registra cada retirada feita
- `pagamentos_parciais` - Controla pagamentos em parcelas

### **2. Fluxo de Funcionamento:**

```
1. VENDA CRIADA
   ↓
2. FATURAMENTO (Cliente paga total/parcial)
   ↓
3. SALDO DE PRODUTOS CRIADO (Cliente tem estoque)
   ↓
4. RETIRADAS (Cliente retira conforme necessidade)
   ↓
5. CONTROLE TOTAL (Saldo, pagamentos, histórico)
```

## 🎯 **Funcionalidades Implementadas**

### **A. Sistema de Faturamento Atualizado:**
- ✅ Cria automaticamente saldo de produtos após faturamento
- ✅ Suporte a pagamento à vista e à prazo
- ✅ Integração com sistema financeiro

### **B. Controle de Retiradas:**
- ✅ **Saldo de Produtos**: Mostra quanto o cliente tem disponível
- ✅ **Registro de Retiradas**: Cliente retira conforme necessidade
- ✅ **Validação**: Impede retirada maior que o saldo
- ✅ **Histórico Completo**: Todas as retiradas registradas

### **C. Controle de Pagamentos:**
- ✅ **Pagamentos Parciais**: Cliente pode pagar aos poucos
- ✅ **Resumo Financeiro**: Valor total, pago, saldo devedor
- ✅ **Histórico de Pagamentos**: Controle completo

## 🖥️ **Interface do Usuário**

### **Na Tela de Detalhes da Venda:**

#### **Para Vendas Pendentes:**
- Botão "Faturar Venda" (como antes)

#### **Para Vendas Faturadas:**
- **"Controle de Retiradas"** - Gerencia o saldo e retiradas
- **"Pagamentos Parciais"** - Controla pagamentos em parcelas

## 📊 **Como Usar o Sistema**

### **1. Faturamento (Primeira Etapa):**
```
1. Cliente faz compra de 100 toneladas
2. Vendedor clica em "Faturar Venda"
3. Sistema cria:
   - Fatura (paid/pending)
   - Saldo de produtos (100 toneladas disponíveis)
   - Atualiza status da venda
```

### **2. Controle de Retiradas:**
```
1. Cliente vem retirar 15 toneladas
2. Vendedor clica em "Controle de Retiradas"
3. Seleciona o produto
4. Informa quantidade (15 toneladas)
5. Informa responsável pela retirada
6. Sistema atualiza saldo (85 toneladas restantes)
```

### **3. Pagamentos Parciais:**
```
1. Cliente quer pagar R$ 5.000 de R$ 10.000
2. Vendedor clica em "Pagamentos Parciais"
3. Informa valor (R$ 5.000)
4. Seleciona forma de pagamento
5. Sistema atualiza saldo devedor (R$ 5.000 restantes)
```

## 🔧 **Configuração Inicial**

### **1. Execute o SQL das Tabelas:**
```sql
-- Execute no Supabase Dashboard > SQL Editor
-- Arquivo: create-retirada-tables.sql
```

### **2. Corrija a Constraint da Tabela Vendas:**
```sql
-- Execute no Supabase Dashboard > SQL Editor
-- Arquivo: fix-vendas-constraint-urgent.sql
```

## 📈 **Benefícios do Sistema**

### **Para o Cliente:**
- ✅ Pode pagar aos poucos
- ✅ Retira produto conforme necessidade
- ✅ Controle total do seu saldo
- ✅ Histórico de todas as operações

### **Para a Empresa:**
- ✅ Controle total de estoque por cliente
- ✅ Controle de recebimentos
- ✅ Relatórios detalhados
- ✅ Prevenção de retiradas indevidas

## 🎨 **Status e Cores**

### **Status de Venda:**
- 🟡 **Pendente** - Não faturada
- 🔵 **Faturada** - Faturada, pendente de pagamento
- 🟢 **Pago** - Pago à vista
- 🔴 **Cancelada** - Cancelada

### **Status de Saldo:**
- 🟢 **Ativo** - Produto disponível para retirada
- 🔵 **Finalizado** - Saldo esgotado
- 🔴 **Cancelado** - Cancelado

## 🚀 **Próximos Passos**

1. **Execute os SQLs** no Supabase Dashboard
2. **Teste o faturamento** de uma venda
3. **Teste as retiradas** e pagamentos parciais
4. **Configure relatórios** se necessário

## 📞 **Suporte**

Se encontrar algum problema:
1. Verifique se as tabelas foram criadas corretamente
2. Confirme se a constraint da tabela vendas foi corrigida
3. Verifique os logs do console para erros específicos

---

**Sistema implementado com sucesso! 🎉**

Agora você tem controle total sobre:
- ✅ Faturamento de vendas
- ✅ Saldo de produtos por cliente
- ✅ Retiradas controladas
- ✅ Pagamentos parciais
- ✅ Histórico completo

