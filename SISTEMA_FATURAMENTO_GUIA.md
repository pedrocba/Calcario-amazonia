# SISTEMA DE FATURAMENTO - GUIA COMPLETO

## 🎯 Visão Geral

Sistema completo de faturamento com opções de pagamento, controle de contas bancárias, caixas e geração automática de parcelas.

## 🚀 Funcionalidades

### 1. Faturamento de Vendas
- ✅ **Modal de faturamento** com interface intuitiva
- ✅ **Cálculos automáticos** de valores, descontos e acréscimos
- ✅ **Múltiplas formas de pagamento** (dinheiro, cartão, PIX, transferência, etc.)
- ✅ **Condições de pagamento** (à vista ou à prazo)
- ✅ **Geração automática de parcelas** para pagamentos à prazo
- ✅ **Integração com contas bancárias e caixas**

### 2. Controle Financeiro
- ✅ **Contas bancárias** - Gerenciamento de contas correntes, poupança e investimento
- ✅ **Caixas** - Controle de caixas físicos e virtuais
- ✅ **Movimentações automáticas** - Registro automático de entradas e saídas
- ✅ **Saldos atualizados** em tempo real

### 3. Relatórios e Controle
- ✅ **Faturas** - Histórico completo de faturamentos
- ✅ **Parcelas** - Controle de vencimentos e pagamentos
- ✅ **Movimentações** - Histórico de todas as transações

## 📋 Configuração Inicial

### Passo 1: Criar Tabelas no Supabase
Execute o SQL em `create-faturamento-tables.sql` no Supabase Dashboard:

```sql
-- [SQL completo disponível no arquivo]
```

### Passo 2: Configurar Contas e Caixas
1. Acesse a página de **Gerenciar Contas e Caixas**
2. Adicione suas contas bancárias
3. Configure os caixas da empresa
4. Defina saldos iniciais

### Passo 3: Testar Faturamento
1. Vá para uma venda pendente
2. Clique em **"Faturar Venda"**
3. Configure as condições de pagamento
4. Confirme o faturamento

## 🔧 Como Usar

### Faturar uma Venda

1. **Acesse os detalhes da venda**
   - Clique nos três pontos → "Ver Detalhes"

2. **Clique em "Faturar Venda"**
   - Botão verde aparece apenas para vendas pendentes

3. **Configure o faturamento:**
   - **Valor Total**: Valor original da venda
   - **Desconto**: Desconto aplicado (se houver)
   - **Acréscimos**: Taxas ou juros adicionais
   - **Valor Final**: Calculado automaticamente

4. **Escolha a forma de pagamento:**
   - Dinheiro
   - Cartão de Débito/Crédito
   - PIX
   - Transferência
   - Boleto
   - Cheque

5. **Defina a condição:**
   - **À Vista**: Pagamento imediato
   - **À Prazo**: Pagamento parcelado

6. **Para pagamentos à prazo:**
   - Defina número de parcelas
   - Escolha data de vencimento
   - Clique em "Gerar Parcelas"

7. **Selecione conta/caixa:**
   - **Dinheiro**: Escolha o caixa
   - **Transferência**: Escolha a conta bancária

8. **Adicione observações** (opcional)

9. **Confirme o faturamento**

### Gerenciar Contas e Caixas

1. **Acesse o gerenciador** (página dedicada)

2. **Contas Bancárias:**
   - Nome do banco
   - Código do banco
   - Número da conta
   - Agência
   - Tipo de conta
   - Saldo inicial

3. **Caixas:**
   - Nome do caixa
   - Descrição
   - Saldo inicial

## 📊 Estrutura do Banco de Dados

### Tabelas Principais

1. **`faturas`** - Faturas geradas
2. **`parcelas`** - Parcelas de pagamento
3. **`contas_bancarias`** - Contas bancárias
4. **`caixas`** - Caixas físicos/virtuais
5. **`movimentacoes_caixa`** - Movimentações de caixa
6. **`movimentacoes_bancarias`** - Movimentações bancárias

### Relacionamentos

- `faturas` → `vendas` (1:1)
- `parcelas` → `faturas` (1:N)
- `movimentacoes_caixa` → `caixas` (N:1)
- `movimentacoes_bancarias` → `contas_bancarias` (N:1)

## 🎨 Componentes

### FaturamentoModal.jsx
Modal principal para faturamento de vendas com:
- Formulário de configuração
- Cálculos automáticos
- Geração de parcelas
- Integração com contas/caixas

### ContasCaixasManager.jsx
Gerenciador de contas bancárias e caixas com:
- Interface de cadastro
- Listagem com saldos
- Edição de dados
- Controle de ativação

## 🔒 Segurança

- **RLS (Row Level Security)** ativado em todas as tabelas
- **Políticas de acesso** baseadas em `company_id`
- **Validações** de dados no frontend e backend
- **Constraints** de integridade no banco

## 📈 Próximos Passos

1. **Relatórios de faturamento**
2. **Dashboard financeiro**
3. **Controle de inadimplência**
4. **Integração com sistemas bancários**
5. **Notificações de vencimento**

## 🐛 Solução de Problemas

### Erro de Constraint
Se aparecer erro de constraint na tabela `vendas`, execute:

```sql
ALTER TABLE vendas DROP CONSTRAINT IF EXISTS vendas_status_check;
ALTER TABLE vendas ADD CONSTRAINT vendas_status_check 
CHECK (status IN ('pendente', 'cancelada', 'faturada', 'concluida', 'pago'));
```

### Tabelas não encontradas
Execute o SQL completo em `create-faturamento-tables.sql`

### RLS bloqueando acesso
Verifique se as políticas RLS estão configuradas corretamente

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do console
2. Confirme se as tabelas foram criadas
3. Teste com dados simples primeiro
4. Verifique as permissões RLS














