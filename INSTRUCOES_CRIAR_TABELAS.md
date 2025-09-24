# 🚀 Instruções para Criar Tabelas de Faturamento

## ❌ Problema Atual
O erro "Could not find the table 'public.faturas'" indica que as tabelas de faturamento não existem no banco de dados.

## ✅ Solução Rápida

### Passo 1: Acessar o Supabase Dashboard
1. Vá para [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Faça login na sua conta
3. Selecione seu projeto

### Passo 2: Abrir o SQL Editor
1. No menu lateral, clique em **"SQL Editor"**
2. Clique em **"New query"**

### Passo 3: Executar o SQL (Versão Básica)
Cole e execute o seguinte código SQL do arquivo `create-tables-basic.sql`:

```sql
-- Tabela de Faturas
CREATE TABLE IF NOT EXISTS faturas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    venda_id UUID NOT NULL REFERENCES vendas(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL,
    total_value DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount DECIMAL(10,2) NOT NULL DEFAULT 0,
    additional_charges DECIMAL(10,2) NOT NULL DEFAULT 0,
    final_value DECIMAL(10,2) NOT NULL DEFAULT 0,
    payment_method VARCHAR(50) NOT NULL,
    payment_conditions VARCHAR(20) NOT NULL CHECK (payment_conditions IN ('a_vista', 'a_prazo')),
    due_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
    notes TEXT,
    company_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Parcelas
CREATE TABLE IF NOT EXISTS parcelas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    fatura_id UUID NOT NULL REFERENCES faturas(id) ON DELETE CASCADE,
    venda_id UUID NOT NULL REFERENCES vendas(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL,
    installment_number INTEGER NOT NULL,
    due_date DATE NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
    payment_method VARCHAR(50),
    paid_at TIMESTAMP WITH TIME ZONE,
    paid_value DECIMAL(10,2),
    company_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_faturas_venda_id ON faturas(venda_id);
CREATE INDEX IF NOT EXISTS idx_faturas_customer_id ON faturas(customer_id);
CREATE INDEX IF NOT EXISTS idx_faturas_status ON faturas(status);
CREATE INDEX IF NOT EXISTS idx_parcelas_fatura_id ON parcelas(fatura_id);
CREATE INDEX IF NOT EXISTS idx_parcelas_due_date ON parcelas(due_date);
CREATE INDEX IF NOT EXISTS idx_parcelas_status ON parcelas(status);

-- RLS (Row Level Security)
ALTER TABLE faturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcelas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas
CREATE POLICY "Users can view faturas from their company" ON faturas
    FOR SELECT USING (company_id = (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert faturas for their company" ON faturas
    FOR INSERT WITH CHECK (company_id = (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update faturas from their company" ON faturas
    FOR UPDATE USING (company_id = (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can view parcelas from their company" ON parcelas
    FOR SELECT USING (company_id = (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert parcelas for their company" ON parcelas
    FOR INSERT WITH CHECK (company_id = (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update parcelas from their company" ON parcelas
    FOR UPDATE USING (company_id = (SELECT company_id FROM profiles WHERE user_id = auth.uid()));
```

### Passo 4: Executar
1. Clique no botão **"Run"** ou pressione **Ctrl+Enter**
2. Aguarde a execução (deve mostrar "Success" em verde)

### Passo 5: Adicionar Políticas RLS (Opcional)
Se quiser adicionar segurança de dados, execute também o arquivo `add-rls-policies.sql`.

### Passo 6: Verificar
1. Vá para **"Table Editor"** no menu lateral
2. Verifique se as tabelas `faturas` e `parcelas` aparecem na lista

## 🎉 Pronto!
Agora você pode tentar faturar a venda novamente. O sistema deve funcionar corretamente!

## 📁 Arquivos Disponíveis:
- `create-tables-basic.sql` - **Execute primeiro** (apenas tabelas)
- `add-rls-policies.sql` - **Execute depois** (políticas de segurança)
- `create-billing-tables-simple.sql` - Versão completa (se der erro, use a básica)

## 🔧 Alternativa: Script Automático
Se preferir, também pode executar:
```bash
node create-tables-direct.js
```

Mas será necessário configurar as variáveis de ambiente primeiro.

---
**Tempo estimado: 2-3 minutos** ⏱️
