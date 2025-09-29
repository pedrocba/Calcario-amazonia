# 👥 **GUIA DE IMPORTAÇÃO - CLIENTES DO SISTEMA ANTIGO**

## 🎯 **IMPORTAÇÃO DE CLIENTES ESPECÍFICA**

### **✅ FORMATO RECONHECIDO AUTOMATICAMENTE:**

O sistema agora reconhece o formato completo de exportação de clientes do seu sistema antigo:

```
Nome/Razão Social | Apelido/Nome fantasia | Tipo (Lista de Preços) | Sex | CPF | RG | CNPJ | IE | Telefone | Celular | Email | Endereço | Número | Complemento | Bairro | Cidade | Estado | CEP
```

---

## 🚀 **COMO IMPORTAR SEUS CLIENTES:**

### **1. EXPORTAR DO SISTEMA ANTIGO:**
1. Exporte sua lista de clientes no formato CSV ou Excel
2. Mantenha todas as colunas conforme mostrado nas suas fotos
3. O sistema reconhecerá automaticamente o formato

### **2. IMPORTAR NO NOVO SISTEMA:**
1. Acesse **"Importar Dados"** no menu
2. Selecione **"Clientes - Sistema Antigo"**
3. Faça upload do seu arquivo
4. Clique em **"Importar Dados"**

### **3. MAPEAMENTO AUTOMÁTICO:**
O sistema converte automaticamente:

| **Sistema Antigo** | **Novo Sistema** | **Conversão** |
|-------------------|------------------|---------------|
| `Nome/Razão Social` | `name` | Nome principal |
| `Apelido/Nome fantasia` | `name` (prioritário) | Nome fantasia se disponível |
| `CNPJ` | `document` | Para empresas |
| `CPF` | `document` | Para pessoas físicas |
| `Telefone/Celular` | `phone` | Formatação automática |
| `Email` | `email` | Email de contato |
| `Endereço + Número + Complemento` | `address` | Endereço completo |
| `Bairro` | `neighborhood` | Bairro |
| `Cidade` | `city` | Cidade |
| `Estado` | `state` | Estado |
| `CEP` | `zip_code` | CEP |

---

## 🔄 **CONVERSÕES AUTOMÁTICAS:**

### **👤 TIPO DE CLIENTE:**
- **Com CNPJ** → `fornecedor` (empresa)
- **Com CPF** → `cliente` (pessoa física)
- **Com Nome Fantasia** → `fornecedor` (empresa)
- **Outros** → `cliente` (padrão)

### **📞 TELEFONE:**
- **Entrada:** `1234567890`
- **Saída:** `(12) 3456-7890`

### **📄 DOCUMENTOS:**
- **CPF/CNPJ:** Limpeza automática (remove pontos, traços, barras)
- **Formato:** Apenas números

### **🏠 ENDEREÇO:**
- **Montagem automática:** Endereço + Número + Complemento
- **Exemplo:** `Rua Pedro Rodrigues, 80, Centro`

---

## 📋 **EXEMPLO DE ARQUIVO VÁLIDO:**

```csv
nome_razao_social,apelido_nome_fantasia,tipo_lista_precos,sexo,cpf,rg,cnpj,ie,telefone,celular,email,endereco,numero,complemento,bairro,cidade,estado,cep
3F AGRICOLA LTDA,,Padrão,,,34.278.674/0001-74,2,4E+08,,,,,Rua Pedro Rodrigues,80,,Centro,Boa Vista,RR,69301-180
ABEL,ABEL,Padrão,,,,,,,,,VICINAL DO APIAU,S/N,,ZONA RURAL,Mucajaí,RR,69340-000
ADAILDO JOSÉ VAZ DA COSTA,,Padrão,M,382.577.002-82,,,,,,,,Avenida General Ataíde Teive,7300,,Alvorada,Boa Vista,RR,69317-182
```

---

## ✅ **VALIDAÇÕES AUTOMÁTICAS:**

### **🔍 CAMPOS OBRIGATÓRIOS:**
- ✅ `nome_razao_social` - Nome ou razão social

### **🔍 VALIDAÇÕES ESPECÍFICAS:**
- ✅ **Email:** Formato correto (@)
- ✅ **Telefone:** Formatação automática
- ✅ **Documentos:** Limpeza e validação
- ✅ **Endereço:** Montagem automática

---

## 🎯 **RESULTADO DA IMPORTAÇÃO:**

### **✅ DADOS IMPORTADOS:**
- **Nome:** Nome fantasia (se disponível) ou razão social
- **Tipo:** Cliente ou Fornecedor (baseado nos dados)
- **Documento:** CPF ou CNPJ limpo
- **Telefone:** Formatado automaticamente
- **Endereço:** Completo e organizado
- **Status:** Todos ativos

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
- Tabela `contacts` deve existir
- RLS configurado para isolamento por filial
- Campos de endereço completos

---

## 🎉 **VANTAGENS DO NOVO SISTEMA:**

### **✅ MELHORIAS:**
- **Isolamento por filial** - Dados separados automaticamente
- **Classificação inteligente** - Cliente vs Fornecedor automático
- **Formatação automática** - Telefones e documentos
- **Endereço completo** - Montagem automática
- **Validação robusta** - Verificação antes da importação

### **✅ FUNCIONALIDADES:**
- **Busca avançada** - Por nome, documento, cidade
- **Filtros** - Por tipo, cidade, estado
- **Histórico** - Acompanhamento de vendas
- **Relatórios** - Análise de clientes
- **Integração** - Com vendas e financeiro

---

## 🚀 **PRÓXIMOS PASSOS:**

1. **Execute o script SQL** no Supabase
2. **Exporte seus clientes** do sistema antigo
3. **Acesse "Importar Dados"** no novo sistema
4. **Selecione "Clientes - Sistema Antigo"**
5. **Faça upload** do seu arquivo
6. **Verifique os resultados** da importação

**Todos os seus clientes serão importados automaticamente com formatação e classificação inteligente!** 🎯



