import React from 'react';
import SaleReceipt from './SaleReceipt';

// Exemplo de dados de venda para teste
const exampleSaleData = {
  order_number: 'PED-2024-001',
  created_at: '2024-01-15T10:30:00Z',
  issue_date: '2024-01-15T10:30:00Z',
  delivery_date: '2024-01-20T14:00:00Z',
  seller: {
    name: 'João Silva',
    email: 'joao.silva@empresa.com'
  },
  billing: {
    name: 'Cálcário Amazônia Ltda',
    cnpj: '12.345.678/0001-90',
    address: 'Rua das Flores, 123, Centro, Santarém - PA',
    zip_code: '68000-000',
    phone: '(93) 99999-9999'
  },
  shipping: {
    name: 'Maria Santos',
    cpf: '123.456.789-00',
    address: 'Av. Principal, 456, Bairro Novo, Manaus - AM',
    zip_code: '69000-000'
  },
  items: [
    {
      reference: 'PROD-00001',
      description: 'Calçário Dolomítico A Granel',
      unit: 'TON',
      quantity: 10,
      unit_price: 150.00,
      discount: 0,
      total: 1500.00
    },
    {
      reference: 'PROD-00002',
      description: 'Calçário Calcítico A Granel',
      unit: 'TON',
      quantity: 5,
      unit_price: 180.00,
      discount: 50.00,
      total: 850.00
    },
    {
      reference: 'PROD-00003',
      description: 'Calçário Agrícola',
      unit: 'SAC',
      quantity: 100,
      unit_price: 25.00,
      discount: 0,
      total: 2500.00
    }
  ],
  shipping: 200.00,
  other: 0,
  observations: 'Entrega deve ser feita em horário comercial.\nCliente preferencial - desconto especial aplicado.\nProdutos devem ser armazenados em local seco.',
  payments: [
    {
      description: 'Entrada',
      due_date: '2024-01-15T00:00:00Z',
      payment_method: 'Dinheiro',
      amount: 1000.00,
      balance: 0,
      observation: 'Pago na entrega'
    },
    {
      description: 'Parcelado',
      due_date: '2024-02-15T00:00:00Z',
      payment_method: 'Boleto',
      amount: 2000.00,
      balance: 2000.00,
      observation: '30 dias'
    },
    {
      description: 'Parcelado',
      due_date: '2024-03-15T00:00:00Z',
      payment_method: 'Boleto',
      amount: 2000.00,
      balance: 2000.00,
      observation: '60 dias'
    }
  ]
};

const SaleReceiptExample = () => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Exemplo de Pedido de Venda</h1>
        <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
          🖨️ Imprimir Pedido
        </Button>
      </div>
      
      <SaleReceipt sale={exampleSaleData} />
    </div>
  );
};

export default SaleReceiptExample;














