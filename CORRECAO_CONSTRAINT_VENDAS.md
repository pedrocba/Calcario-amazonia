# CORREÇÃO - CONSTRAINT DE STATUS DA TABELA VENDAS

## Problema
A tabela `vendas` tem uma constraint que só permite os valores `pendente` e `cancelada` para a coluna `status`. Isso impede o faturamento de vendas.

## Solução
Execute o seguinte SQL no Supabase Dashboard para corrigir a constraint:

### Passo 1: Acesse o Supabase Dashboard
1. Vá para [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá para **SQL Editor** no menu lateral

### Passo 2: Execute o SQL
Cole e execute o seguinte código SQL:

```sql
-- Remover a constraint atual
ALTER TABLE vendas DROP CONSTRAINT IF EXISTS vendas_status_check;

-- Criar nova constraint que permite mais valores
ALTER TABLE vendas ADD CONSTRAINT vendas_status_check 
CHECK (status IN ('pendente', 'cancelada', 'faturada', 'concluida', 'pago'));
```

### Passo 3: Verificar se funcionou
Após executar o SQL, teste o faturamento de uma venda no sistema.

## Valores de Status Permitidos
Após a correção, os seguintes valores serão permitidos:

- **`pendente`** - Venda criada mas não processada
- **`cancelada`** - Venda cancelada
- **`faturada`** - Venda faturada (processada) ✅
- **`concluida`** - Venda concluída
- **`pago`** - Venda paga

## Status Temporário
Enquanto a constraint não for corrigida, o sistema está usando `cancelada` como status temporário para vendas faturadas.

## Arquivos Relacionados
- `src/pages/VendaDetalhes.jsx` - Página de detalhes da venda
- `fix-vendas-status-constraint.sql` - Script SQL para correção
- `fix-vendas-constraint.js` - Script de teste da correção














