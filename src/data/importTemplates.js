// ==============================================
// TEMPLATES DE IMPORTAÇÃO DE DADOS
// ==============================================

export const contactTemplate = {
  headers: ['nome', 'email', 'telefone', 'documento', 'tipo', 'endereco', 'cidade', 'estado', 'cep', 'ativo'],
  sampleData: [
    {
      nome: 'João Silva',
      email: 'joao@email.com',
      telefone: '(11) 99999-9999',
      documento: '123.456.789-00',
      tipo: 'cliente',
      endereco: 'Rua das Flores, 123',
      cidade: 'Santarém',
      estado: 'PA',
      cep: '68040-000',
      ativo: 'true'
    },
    {
      nome: 'Maria Santos',
      email: 'maria@email.com',
      telefone: '(11) 88888-8888',
      documento: '987.654.321-00',
      tipo: 'fornecedor',
      endereco: 'Av. Principal, 456',
      cidade: 'Santarém',
      estado: 'PA',
      cep: '68040-100',
      ativo: 'true'
    }
  ]
};

export const financialTransactionTemplate = {
  headers: ['descricao', 'valor', 'tipo', 'data_vencimento', 'status', 'categoria', 'observacoes'],
  sampleData: [
    {
      descricao: 'Venda de calcário',
      valor: '1500.00',
      tipo: 'entrada',
      data_vencimento: '2024-02-15',
      status: 'pendente',
      categoria: 'vendas',
      observacoes: 'Cliente João Silva'
    },
    {
      descricao: 'Compra de combustível',
      valor: '800.50',
      tipo: 'saida',
      data_vencimento: '2024-02-10',
      status: 'pendente',
      categoria: 'combustivel',
      observacoes: 'Posto Shell'
    },
    {
      descricao: 'Pagamento de funcionário',
      valor: '2500.00',
      tipo: 'saida',
      data_vencimento: '2024-02-05',
      status: 'pago',
      categoria: 'folha_pagamento',
      observacoes: 'Salário mensal'
    }
  ]
};

export const productTemplate = {
  headers: ['nome', 'codigo', 'preco_venda', 'preco_custo', 'estoque', 'categoria', 'ativo'],
  sampleData: [
    {
      nome: 'Calcário Dolomítico',
      codigo: 'CALC001',
      preco_venda: '45.00',
      preco_custo: '30.00',
      estoque: '1000',
      categoria: 'Calcário',
      ativo: 'true'
    },
    {
      nome: 'Brita 1',
      codigo: 'BRIT001',
      preco_venda: '35.00',
      preco_custo: '25.00',
      estoque: '500',
      categoria: 'Brita',
      ativo: 'true'
    },
    {
      nome: 'Areia Grossa',
      codigo: 'AREI001',
      preco_venda: '28.00',
      preco_custo: '20.00',
      estoque: '800',
      categoria: 'Areia',
      ativo: 'true'
    }
  ]
};

export const getTemplateData = (type) => {
  switch (type) {
    case 'contacts':
      return contactTemplate;
    case 'financial_transactions':
      return financialTransactionTemplate;
    case 'products':
      return productTemplate;
    default:
      return null;
  }
};

export const generateCSV = (template) => {
  const headers = template.headers.join(',');
  const rows = template.sampleData.map(row => 
    template.headers.map(header => row[header] || '').join(',')
  );
  
  return [headers, ...rows].join('\n');
};



