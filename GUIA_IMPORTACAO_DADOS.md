# 📊 **GUIA DE IMPORTAÇÃO DE DADOS**

## 🎯 **FUNCIONALIDADES IMPLEMENTADAS**

### **✅ SISTEMA COMPLETO DE IMPORTAÇÃO:**
- **Clientes/Fornecedores** - Importar lista de contatos
- **Contas a Pagar/Receber** - Importar transações financeiras  
- **Produtos** - Importar catálogo de produtos
- **Upload de Arquivos** - Suporte a CSV e Excel
- **Validação de Dados** - Verificação automática antes da importação
- **Templates Prontos** - Modelos para download
- **Processamento em Lotes** - Importação eficiente de grandes volumes

---

## 🚀 **COMO USAR**

### **1. ACESSAR O IMPORTADOR**
1. Faça login no sistema
2. No menu lateral, clique em **"Importar Dados"**
3. Apenas administradores e gerentes podem acessar

### **2. BAIXAR TEMPLATES**
1. Clique em **"Baixar Template"** no tipo desejado
2. Abra o arquivo CSV no Excel ou editor de texto
3. Preencha com seus dados seguindo o formato

### **3. PREPARAR SEUS DADOS**

#### **📋 CLIENTES/FORNECEDORES:**
```csv
nome,email,telefone,documento,tipo,endereco,cidade,estado,cep,ativo
João Silva,joao@email.com,(11) 99999-9999,123.456.789-00,cliente,Rua das Flores 123,Santarém,PA,68040-000,true
Maria Santos,maria@email.com,(11) 88888-8888,987.654.321-00,fornecedor,Av. Principal 456,Santarém,PA,68040-100,true
```

#### **💰 CONTAS A PAGAR/RECEBER:**
```csv
descricao,valor,tipo,data_vencimento,status,categoria,observacoes
Venda de calcário,1500.00,entrada,2024-02-15,pendente,vendas,Cliente João Silva
Compra de combustível,800.50,saida,2024-02-10,pendente,combustivel,Posto Shell
Pagamento funcionário,2500.00,saida,2024-02-05,pago,folha_pagamento,Salário mensal
```

#### **📦 PRODUTOS:**
```csv
nome,codigo,preco_venda,preco_custo,estoque,categoria,ativo
Calcário Dolomítico,CALC001,45.00,30.00,1000,Calcário,true
Brita 1,BRIT001,35.00,25.00,500,Brita,true
Areia Grossa,AREI001,28.00,20.00,800,Areia,true
```

### **4. IMPORTAR DADOS**
1. Selecione o **tipo de importação**
2. Clique em **"Escolher arquivo"** e selecione seu CSV
3. Clique em **"Importar Dados"**
4. Aguarde o processamento
5. Verifique os resultados

---

## 📝 **FORMATOS SUPORTADOS**

### **📁 TIPOS DE ARQUIVO:**
- ✅ **CSV** (.csv) - Recomendado
- ✅ **Excel** (.xlsx, .xls) - Suportado
- ❌ **PDF** - Não suportado
- ❌ **Word** - Não suportado

### **📏 LIMITES:**
- **Tamanho máximo:** 5MB por arquivo
- **Registros:** Sem limite (processamento em lotes)
- **Colunas:** Até 50 colunas por arquivo

---

## 🔍 **VALIDAÇÕES AUTOMÁTICAS**

### **✅ CAMPOS OBRIGATÓRIOS:**
- **Clientes:** Nome
- **Contas:** Descrição, Valor, Tipo
- **Produtos:** Nome, Código

### **✅ VALIDAÇÕES ESPECÍFICAS:**
- **Valores:** Devem ser números válidos
- **Emails:** Formato correto (@)
- **Datas:** Formato YYYY-MM-DD
- **Tipos:** Valores permitidos apenas

### **❌ ERROS COMUNS:**
- Campos obrigatórios vazios
- Valores numéricos inválidos
- Emails mal formatados
- Tipos não permitidos

---

## 🛠️ **CONFIGURAÇÃO TÉCNICA**

### **1. EXECUTAR SCRIPT SQL:**
```sql
-- Execute no Supabase SQL Editor
-- Arquivo: preparar-tabelas-importacao.sql
```

### **2. VERIFICAR PERMISSÕES:**
- Usuário deve ter role: `admin`, `gerente_patio` ou `super_admin`
- Tabelas devem ter RLS configurado
- `empresa_id` deve estar configurado

### **3. ESTRUTURA DAS TABELAS:**
- `contacts` - Clientes/Fornecedores
- `financial_transactions` - Contas a pagar/receber
- `products` - Produtos
- `financial_accounts` - Contas financeiras

---

## 🎯 **DICAS DE USO**

### **💡 BOAS PRÁTICAS:**
1. **Sempre baixe o template** antes de preparar seus dados
2. **Teste com poucos registros** primeiro
3. **Verifique os dados** antes de importar
4. **Use códigos únicos** para produtos
5. **Mantenha consistência** nos tipos de dados

### **⚠️ CUIDADOS:**
1. **Não altere os nomes das colunas** do template
2. **Use vírgula como separador** decimal (45,50)
3. **Mantenha as datas** no formato correto
4. **Verifique se não há duplicatas** nos códigos

### **🔄 PROCESSO DE IMPORTAÇÃO:**
1. **Validação** - Verifica formato e dados
2. **Processamento** - Insere no banco em lotes
3. **Resultado** - Mostra sucessos e erros
4. **Isolamento** - Dados ficam separados por filial

---

## 🆘 **SOLUÇÃO DE PROBLEMAS**

### **❌ "Arquivo não suportado"**
- Use apenas CSV ou Excel
- Verifique a extensão do arquivo

### **❌ "Campos obrigatórios vazios"**
- Verifique se todas as colunas obrigatórias estão preenchidas
- Não deixe linhas vazias

### **❌ "Erro de validação"**
- Verifique os tipos de dados
- Use vírgula para decimais
- Verifique formatos de data e email

### **❌ "Erro de permissão"**
- Verifique se você tem permissão para importar
- Entre em contato com o administrador

---

## 📊 **RESULTADOS DA IMPORTAÇÃO**

### **✅ SUCESSO:**
- Total de registros processados
- Quantidade importada com sucesso
- Detalhes por lote

### **❌ ERROS:**
- Linha com erro
- Descrição do problema
- Sugestão de correção

### **📈 ESTATÍSTICAS:**
- Tempo de processamento
- Velocidade de importação
- Taxa de sucesso

---

## 🎉 **PRONTO PARA USAR!**

O sistema de importação está **100% funcional** e pronto para uso. Você pode importar:

- ✅ **Clientes e Fornecedores**
- ✅ **Contas a Pagar e Receber**  
- ✅ **Catálogo de Produtos**
- ✅ **Dados em massa**
- ✅ **Validação automática**
- ✅ **Isolamento por filial**

**Acesse o menu "Importar Dados" e comece a usar!** 🚀



