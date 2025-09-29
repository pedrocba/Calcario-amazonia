# 🔍 **VERIFICAR FORMATO DO CSV DE CLIENTES**

## 🎯 **PROBLEMA ATUAL:**
O sistema não está encontrando o campo obrigatório `nome_razao_social` no seu arquivo CSV.

## ✅ **SOLUÇÕES IMPLEMENTADAS:**

1. **🔍 Mapeamento inteligente** - Reconhece várias variações de nomes
2. **🛠️ Detecção automática** - Encontra campos de nome automaticamente
3. **📊 Debug detalhado** - Mostra exatamente quais headers foram encontrados

## 🚀 **COMO RESOLVER AGORA:**

### **1. TESTAR COM DEBUG:**
1. **Recarregue a página** (F5)
2. **Abra o Console** (F12)
3. **Tente importar novamente**
4. **Verifique os logs** - você verá:
   - Headers brutos do CSV
   - Headers em minúsculas
   - Mapeamento de cada campo
   - Campos de nome encontrados

### **2. VERIFICAR O ARQUIVO CSV:**

Abra o arquivo `ListaClientes mucajai.csv` e verifique se a **primeira linha** tem algum destes campos:

#### **✅ CAMPOS RECONHECIDOS AUTOMATICAMENTE:**
- `nome`
- `razao social`
- `razão social`
- `nome completo`
- `cliente`
- `empresa`
- `nome/razão social`
- `nome/razao social`

### **3. EXEMPLO DE FORMATO CORRETO:**

```csv
nome,cnpj,telefone,email,cidade,estado
3F AGRICOLA LTDA,34.278.674/0001-74,4E+08,,Boa Vista,RR
ABEL,,,VICINAL DO APIAU,Mucajaí,RR
```

**OU**

```csv
cliente,cnpj,telefone,email,cidade,estado
3F AGRICOLA LTDA,34.278.674/0001-74,4E+08,,Boa Vista,RR
ABEL,,,VICINAL DO APIAU,Mucajaí,RR
```

## 🔍 **VERIFICAÇÃO RÁPIDA:**

### **ABRA O ARQUIVO CSV E VERIFIQUE:**

1. **Primeira linha** deve ter os headers
2. **Pelo menos uma coluna** deve conter:
   - A palavra "nome"
   - A palavra "cliente" 
   - A palavra "empresa"
   - A palavra "razao"

### **EXEMPLO DE HEADERS VÁLIDOS:**
```csv
nome,cnpj,telefone,cidade
```
```csv
cliente,cnpj,telefone,cidade
```
```csv
empresa,cnpj,telefone,cidade
```
```csv
razao social,cnpj,telefone,cidade
```

## 🛠️ **SE AINDA NÃO FUNCIONAR:**

### **OPÇÃO 1 - RENOMEAR A COLUNA:**
1. **Abra o CSV** no Excel
2. **Renomeie a primeira coluna** para `nome`
3. **Salve o arquivo**
4. **Teste a importação**

### **OPÇÃO 2 - USAR TEMPLATE:**
1. **Baixe o template** do sistema
2. **Copie seus dados** para o template
3. **Salve como CSV**
4. **Importe** - deve funcionar perfeitamente!

## 📋 **LOGS DE DEBUG:**

No console, você verá algo como:
```
Headers brutos do CSV: ["nome", "cnpj", "telefone", "cidade"]
Headers em minúsculas: ["nome", "cnpj", "telefone", "cidade"]
Mapeando CSV: "nome" -> "nome_razao_social"
Campos de nome encontrados: ["nome"]
Usando campo "nome" como nome_razao_social
```

**Teste novamente e verifique os logs!** 🎯



