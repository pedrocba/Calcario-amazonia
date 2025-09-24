# Componente SaleReceipt - Pedido de Venda

Este componente React renderiza um pedido de venda formatado para impressão, imitando fielmente o layout de um PDF.

## Uso Básico

```jsx
import SaleReceipt from '@/components/sales/SaleReceipt';

const MyComponent = () => {
  const saleData = {
    order_number: 'PED-2024-001',
    created_at: '2024-01-15T10:30:00Z',
    // ... outros dados
  };

  return (
    <div className="printable-area">
      <SaleReceipt sale={saleData} />
    </div>
  );
};
```

## Estrutura dos Dados (Prop `sale`)

### Dados Básicos
- `order_number`: Número do pedido
- `created_at`: Data de criação
- `issue_date`: Data de emissão
- `delivery_date`: Data de entrega
- `seller`: Dados do vendedor
  - `name`: Nome do vendedor

### Endereços
- `billing`: Endereço de cobrança
  - `name`: Nome da empresa
  - `cnpj`: CNPJ
  - `address`: Endereço completo
  - `zip_code`: CEP
  - `phone`: Telefone

- `shipping`: Endereço de entrega
  - `name`: Nome do cliente
  - `cpf`: CPF
  - `address`: Endereço completo
  - `zip_code`: CEP

### Itens do Pedido
- `items`: Array de itens
  - `reference`: Código/referência do produto
  - `description`: Descrição do produto
  - `unit`: Unidade de medida
  - `quantity`: Quantidade
  - `unit_price`: Preço unitário
  - `discount`: Desconto
  - `total`: Total do item

### Totais
- `shipping`: Valor do frete
- `other`: Outros valores
- `observations`: Observações gerais

### Pagamentos
- `payments`: Array de condições de pagamento
  - `description`: Descrição da condição
  - `due_date`: Data de vencimento
  - `payment_method`: Forma de pagamento
  - `amount`: Valor
  - `balance`: Saldo
  - `observation`: Observação

## Componentes Auxiliares

### PrintButton
Botão de impressão reutilizável:

```jsx
import PrintButton from '@/components/sales/PrintButton';

<PrintButton 
  elementId="sale-receipt"
  variant="default"
  size="default"
>
  Imprimir Pedido
</PrintButton>
```

### usePrint Hook
Hook para funcionalidades de impressão:

```jsx
import { usePrint } from '@/hooks/usePrint';

const { printDocument, printElement, printWithStyles } = usePrint();
```

## Estilos de Impressão

O componente usa o arquivo `src/print.css` que contém estilos específicos para impressão:

- Layout otimizado para papel A4
- Cores e bordas adequadas para impressão
- Quebras de página inteligentes
- Ocultação de elementos interativos

## Exemplo Completo

```jsx
import React from 'react';
import SaleReceipt from '@/components/sales/SaleReceipt';
import PrintButton from '@/components/sales/PrintButton';

const VendaPage = () => {
  const saleData = {
    // ... dados da venda
  };

  return (
    <div>
      <div className="mb-4">
        <PrintButton elementId="sale-receipt">
          🖨️ Imprimir Pedido
        </PrintButton>
      </div>
      
      <div id="sale-receipt" className="printable-area">
        <SaleReceipt sale={saleData} />
      </div>
    </div>
  );
};
```

## Características

- ✅ Layout responsivo
- ✅ Formatação automática de moeda (BRL)
- ✅ Formatação automática de datas (pt-BR)
- ✅ Cálculos automáticos de totais
- ✅ Estilos otimizados para impressão
- ✅ Suporte a múltiplos itens e pagamentos
- ✅ Campos opcionais com fallbacks
- ✅ Design profissional e limpo

## Dependências

- React
- Tailwind CSS
- Lucide React (para ícones)
- Arquivo `src/print.css`







