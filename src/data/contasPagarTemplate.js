// ==============================================
// TEMPLATE PARA CONTAS A PAGAR - FORMATO SISTEMA ANTIGO
// ==============================================

export const contasPagarTemplate = {
  headers: ['vencimento', 'conta', 'conta_gerencial', 'origem', 'cliente', 'valor', 'saldo'],
  sampleData: [
    {
      vencimento: '15/06/2025',
      conta: 'ALUGUEL MAQUINA LUCAS BEZE',
      conta_gerencial: 'Aluguel de Equipamentos',
      origem: 'Despesas',
      cliente: '',
      valor: '5239',
      saldo: '5239'
    },
    {
      vencimento: '20/06/2025',
      conta: 'CONSTRUALVES [DINHEIRO] (101',
      conta_gerencial: 'Outras Despesas',
      origem: 'Despesas',
      cliente: '',
      valor: '3724,73',
      saldo: '3724,73'
    },
    {
      vencimento: '05/07/2025',
      conta: 'TERRENO MARANHÃO [DINHEIRC',
      conta_gerencial: 'Aluguel',
      origem: 'Despesas',
      cliente: '',
      valor: '2000',
      saldo: '2000'
    }
  ]
};

// Mapeamento dos campos do sistema antigo para o novo
export const fieldMapping = {
  vencimento: 'due_date',
  conta: 'description',
  conta_gerencial: 'category',
  origem: 'type',
  cliente: 'contact_name',
  valor: 'amount',
  saldo: 'balance'
};

// Função para converter data do formato DD/MM/YYYY para YYYY-MM-DD
export const convertDate = (dateString) => {
  if (!dateString) return null;
  
  // Se já está no formato correto, retorna
  if (dateString.includes('-')) return dateString;
  
  // Converte DD/MM/YYYY para YYYY-MM-DD
  const parts = dateString.split('/');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  return dateString;
};

// Função para converter valor com vírgula para ponto
export const convertValue = (valueString) => {
  if (!valueString) return 0;
  
  // Remove espaços e converte vírgula para ponto
  const cleanValue = valueString.toString().replace(/\s/g, '').replace(',', '.');
  return parseFloat(cleanValue) || 0;
};

// Função para mapear origem para tipo de transação
export const mapOriginToType = (origem) => {
  const origemMap = {
    'Despesas': 'saida',
    'Receitas': 'entrada',
    'Receita': 'entrada',
    'Despesa': 'saida'
  };
  
  return origemMap[origem] || 'saida';
};

// Função para mapear conta gerencial para categoria
export const mapCategory = (contaGerencial) => {
  const categoryMap = {
    'Aluguel de Equipamentos': 'aluguel_equipamentos',
    'Outras Despesas': 'outras_despesas',
    'Aluguel': 'aluguel',
    'Combustível': 'combustivel',
    'Manutenção': 'manutencao',
    'Salários': 'folha_pagamento',
    'Impostos': 'impostos',
    'Telefone': 'telecomunicacoes',
    'Energia': 'energia',
    'Água': 'agua'
  };
  
  return categoryMap[contaGerencial] || 'outras_despesas';
};

// Função para gerar CSV no formato do sistema antigo
export const generateContasPagarCSV = (data) => {
  const headers = contasPagarTemplate.headers.join(',');
  const rows = data.map(row => 
    contasPagarTemplate.headers.map(header => row[header] || '').join(',')
  );
  
  return [headers, ...rows].join('\n');
};



