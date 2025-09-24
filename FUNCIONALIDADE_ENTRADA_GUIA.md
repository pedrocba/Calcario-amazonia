# 💰 Funcionalidade de Entrada para Pagamentos à Prazo

## 🎯 **O que foi implementado:**

Agora o sistema suporta **entrada** para pagamentos à prazo! O cliente pode pagar uma parte na hora e o restante fica parcelado.

## 🚀 **Como Funciona:**

### **1. Faturamento com Entrada:**
```
Valor Total: R$ 1.000,00
Entrada: R$ 200,00 (pago na hora)
Restante: R$ 800,00 (dividido em parcelas)
```

### **2. Exemplo Prático:**
- **Venda:** R$ 1.000,00
- **Entrada:** R$ 200,00 (PIX)
- **Parcelas:** 4x de R$ 200,00 cada
- **Total:** R$ 200,00 (entrada) + R$ 800,00 (parcelas) = R$ 1.000,00

## 🖥️ **Interface Atualizada:**

### **No Modal de Faturamento:**

#### **Para Pagamento à Vista:**
- Funciona como antes (sem mudanças)

#### **Para Pagamento à Prazo:**
- ✅ **Número de Parcelas** (como antes)
- ✅ **Valor da Entrada** (NOVO!)
- ✅ **Método de Pagamento** (para entrada e parcelas)
- ✅ **Resumo Financeiro** atualizado

### **Resumo Financeiro Inteligente:**
```
Valor Base: R$ 1.000,00
Valor Total: R$ 1.000,00

┌─ Entrada ─────────────────┐
│ Entrada: R$ 200,00        │
│ Valor Restante: R$ 800,00 │
└───────────────────────────┘

Valor por Parcela: R$ 200,00
```

## 🔧 **Funcionalidades Implementadas:**

### **1. Campo de Entrada:**
- ✅ Aparece apenas para pagamentos à prazo
- ✅ Validação: não pode ser maior que o valor total
- ✅ Validação: não pode ser negativo
- ✅ Opcional: pode deixar em branco ou 0

### **2. Cálculo Automático:**
- ✅ **Parcelas:** Calculadas sobre o valor restante (total - entrada)
- ✅ **Resumo:** Mostra entrada e valor restante
- ✅ **Validação:** Impede entrada maior que o total

### **3. Processamento:**
- ✅ **Entrada:** Registrada como pagamento parcial
- ✅ **Parcelas:** Criadas com valor restante
- ✅ **Financeiro:** Movimentação registrada automaticamente

## 📊 **Exemplos de Uso:**

### **Exemplo 1: Entrada de 20%**
```
Venda: R$ 1.000,00
Entrada: R$ 200,00 (20%)
Parcelas: 4x de R$ 200,00
```

### **Exemplo 2: Entrada de 50%**
```
Venda: R$ 1.000,00
Entrada: R$ 500,00 (50%)
Parcelas: 2x de R$ 250,00
```

### **Exemplo 3: Sem Entrada**
```
Venda: R$ 1.000,00
Entrada: R$ 0,00
Parcelas: 5x de R$ 200,00
```

## 🎨 **Interface Visual:**

### **Campo de Entrada:**
```
┌─ Valor da Entrada (R$) ─┐
│ [0.00]                  │
│ Deixe em branco ou 0 se │
│ não houver entrada      │
└─────────────────────────┘
```

### **Resumo com Entrada:**
```
┌─ Entrada ───────────────┐
│ Entrada: R$ 200,00      │
│ Valor Restante: R$ 800,00│
└─────────────────────────┘
```

## ✅ **Validações Implementadas:**

1. **Entrada não pode ser negativa**
2. **Entrada não pode ser maior que o valor total**
3. **Parcelas calculadas automaticamente**
4. **Resumo atualizado em tempo real**

## 🚀 **Como Usar:**

### **1. Faturar Venda:**
1. Clique em "Faturar Venda"
2. Selecione "À Prazo"
3. Digite o número de parcelas
4. **Digite o valor da entrada** (opcional)
5. Selecione método de pagamento
6. Clique em "Faturar Venda"

### **2. O Sistema Faz:**
- ✅ Registra a entrada como pagamento
- ✅ Cria parcelas com valor restante
- ✅ Atualiza saldo de produtos
- ✅ Registra movimentação financeira

## 🎯 **Benefícios:**

### **Para o Cliente:**
- ✅ Pode dar entrada e parcelar o restante
- ✅ Flexibilidade no pagamento
- ✅ Controle do saldo de produtos

### **Para a Empresa:**
- ✅ Recebe parte do pagamento na hora
- ✅ Controle total de recebimentos
- ✅ Relatórios detalhados

## 🔍 **Testando a Funcionalidade:**

1. **Crie uma venda** de R$ 1.000,00
2. **Fature como à prazo** com entrada de R$ 200,00
3. **Verifique** se as parcelas foram calculadas corretamente
4. **Confirme** se a entrada foi registrada

---

**Funcionalidade implementada com sucesso! 🎉**

Agora você tem controle total sobre entradas e parcelas! 💰

