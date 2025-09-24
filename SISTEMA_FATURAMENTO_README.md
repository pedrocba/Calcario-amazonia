# Sistema de Faturamento - Guia Completo

## 🎯 Visão Geral

Sistema profissional de faturamento integrado ao módulo de vendas, permitindo:
- Faturamento à vista e à prazo
- Múltiplos métodos de pagamento
- Gestão de parcelas
- Controle financeiro integrado
- Interface moderna e intuitiva

## 🚀 Configuração Inicial

### 1. Executar Script de Configuração

```bash
# Instalar dependências se necessário
npm install @supabase/supabase-js dotenv

# Executar script de configuração
node setup-billing-tables.js
```

### 2. Verificar Variáveis de Ambiente

Certifique-se de que o arquivo `.env` contém:
```env
VITE_SUPABASE_URL=sua_url_do_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
```

## 📊 Estrutura do Banco de Dados

### Tabelas Principais

1. **`faturas`** - Faturas geradas
2. **`parcelas`** - Parcelas de pagamento à prazo
3. **`contas_bancarias`** - Contas bancárias da empresa
4. **`caixas`** - Caixas físicos
5. **`movimentacoes_caixa`** - Movimentações de caixa
6. **`movimentacoes_bancarias`** - Movimentações bancárias

### Relacionamentos

- `faturas.venda_id` → `vendas.id`
- `parcelas.fatura_id` → `faturas.id`
- `parcelas.venda_id` → `vendas.id`

## 💳 Métodos de Pagamento Suportados

- **Dinheiro** - Pagamento em espécie
- **PIX** - Transferência instantânea
- **Cartão de Débito** - Débito em conta
- **Cartão de Crédito** - Crédito parcelado
- **Transferência Bancária** - TED/DOC
- **Cheque** - Cheque pré-datado
- **Boleto Bancário** - Boleto para pagamento

## 🔄 Fluxo de Faturamento

### 1. Acesso ao Faturamento
- Vá para a página de **Vendas**
- Clique em uma venda com status **"Pendente"**
- Clique no botão **"Faturar Venda"**

### 2. Configuração do Faturamento

#### À Vista
- Selecione **"À Vista"**
- Escolha o método de pagamento
- Adicione taxas adicionais (opcional)
- Adicione observações (opcional)

#### À Prazo
- Selecione **"À Prazo"**
- Escolha o método de pagamento
- Defina o número de parcelas (1-12)
- Adicione taxas adicionais (opcional)
- Adicione observações (opcional)

### 3. Processamento
- Sistema calcula automaticamente o valor das parcelas
- Cria fatura e parcelas no banco de dados
- Atualiza status da venda
- Registra movimentação financeira (à vista)

## 📋 Funcionalidades

### Modal de Faturamento
- Interface intuitiva e responsiva
- Validação de dados em tempo real
- Cálculo automático de parcelas
- Preview do cronograma de pagamento

### Gestão de Parcelas
- Criação automática de parcelas
- Controle de vencimentos
- Status de pagamento
- Alertas de vencimento

### Controle Financeiro
- Integração com contas bancárias
- Movimentações de caixa
- Relatórios financeiros
- Auditoria completa

## 🎨 Interface do Usuário

### Página de Detalhes da Venda
- **Resumo da Venda**: Dados do cliente e valores
- **Informações de Faturamento**: Status e detalhes da fatura
- **Cronograma de Parcelas**: Tabela com todas as parcelas
- **Ações**: Botões para faturar e cancelar

### Modal de Faturamento
- **Configurações**: Condições e método de pagamento
- **Resumo Financeiro**: Valores e cálculos
- **Cronograma**: Preview das parcelas
- **Validação**: Feedback em tempo real

## 🔧 Configurações Avançadas

### Políticas RLS
- Acesso baseado em empresa
- Segurança de dados
- Auditoria de alterações

### Índices de Performance
- Otimização de consultas
- Busca rápida por vencimento
- Filtros por status

## 📈 Relatórios Disponíveis

### Financeiros
- Faturas por período
- Parcelas vencidas
- Recebimentos por método
- Fluxo de caixa

### Operacionais
- Vendas faturadas
- Status de parcelas
- Performance de cobrança
- Análise de inadimplência

## 🚨 Alertas e Notificações

### Vencimentos
- Parcelas próximas do vencimento
- Parcelas vencidas
- Atrasos de pagamento

### Status
- Faturas pendentes
- Pagamentos confirmados
- Cancelamentos

## 🔒 Segurança

### Controle de Acesso
- Usuários por empresa
- Permissões por módulo
- Auditoria de ações

### Proteção de Dados
- Criptografia de dados sensíveis
- Backup automático
- Logs de alterações

## 🛠️ Manutenção

### Limpeza de Dados
- Arquivo de faturas antigas
- Limpeza de logs
- Otimização de performance

### Monitoramento
- Logs de erro
- Performance de consultas
- Uso de recursos

## 📞 Suporte

### Problemas Comuns
1. **Erro de permissão**: Verificar RLS policies
2. **Falha no faturamento**: Verificar constraints do banco
3. **Interface não carrega**: Verificar imports dos componentes

### Logs de Debug
- Console do navegador
- Logs do Supabase
- Network tab para requisições

## 🎉 Próximos Passos

### Melhorias Planejadas
- [ ] Relatórios avançados
- [ ] Integração com bancos
- [ ] Notificações por email
- [ ] App mobile
- [ ] API para integrações

### Personalizações
- [ ] Temas customizáveis
- [ ] Campos adicionais
- [ ] Workflows personalizados
- [ ] Integrações externas

---

**Desenvolvido com ❤️ para o sistema Calcário Amazônia**




