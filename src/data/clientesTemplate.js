// ==============================================
// TEMPLATE PARA CLIENTES - FORMATO SISTEMA ANTIGO
// ==============================================

export const clientesTemplate = {
  headers: [
    'nome_razao_social',
    'apelido_nome_fantasia', 
    'tipo_lista_precos',
    'sexo',
    'cpf',
    'rg',
    'expedicao_rg',
    'uf_rg',
    'indicador_ie_dest',
    'cnpj',
    'ie',
    'telefone',
    'celular',
    'fax',
    'email',
    'site',
    'endereco',
    'numero',
    'complemento',
    'bairro',
    'cidade',
    'estado',
    'cep',
    'data_nascimento'
  ],
  sampleData: [
    {
      nome_razao_social: '3F AGRICOLA LTDA',
      apelido_nome_fantasia: '',
      tipo_lista_precos: 'Padrão',
      sexo: '',
      cpf: '',
      rg: '',
      expedicao_rg: '',
      uf_rg: '',
      indicador_ie_dest: 'Não Contribuinte',
      cnpj: '34.278.674/0001-74',
      ie: '2,4E+08',
      telefone: '',
      celular: '',
      fax: '',
      email: '',
      site: '',
      endereco: 'Rua Pedro Rodrigues',
      numero: '80',
      complemento: '',
      bairro: 'Centro',
      cidade: 'Boa Vista',
      estado: 'RR',
      cep: '69301-180',
      data_nascimento: ''
    },
    {
      nome_razao_social: 'A R S SANTOS',
      apelido_nome_fantasia: '',
      tipo_lista_precos: 'Padrão',
      sexo: '',
      cpf: '',
      rg: '',
      expedicao_rg: '',
      uf_rg: '',
      indicador_ie_dest: 'Contribuinte do Ii',
      cnpj: '31.240.378/0001-96',
      ie: '2,4E+08',
      telefone: '',
      celular: '',
      fax: '',
      email: '',
      site: '',
      endereco: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
      data_nascimento: ''
    },
    {
      nome_razao_social: 'ABEL',
      apelido_nome_fantasia: 'ABEL',
      tipo_lista_precos: 'Padrão',
      sexo: '',
      cpf: '',
      rg: '',
      expedicao_rg: '',
      uf_rg: '',
      indicador_ie_dest: 'Não Contribuinte',
      cnpj: '',
      ie: '',
      telefone: '',
      celular: '',
      fax: '',
      email: '',
      site: '',
      endereco: 'VICINAL DO APIAU',
      numero: 'S/N',
      complemento: '',
      bairro: 'ZONA RURAL',
      cidade: 'Mucajaí',
      estado: 'RR',
      cep: '69340-000',
      data_nascimento: ''
    }
  ]
};

// Mapeamento dos campos do sistema antigo para o novo
export const clientesFieldMapping = {
  nome_razao_social: 'name',
  apelido_nome_fantasia: 'trade_name',
  tipo_lista_precos: 'price_list_type',
  sexo: 'gender',
  cpf: 'cpf',
  rg: 'rg',
  expedicao_rg: 'rg_issuance',
  uf_rg: 'rg_state',
  indicador_ie_dest: 'ie_indicator',
  cnpj: 'cnpj',
  ie: 'ie',
  telefone: 'phone',
  celular: 'mobile',
  fax: 'fax',
  email: 'email',
  site: 'website',
  endereco: 'address',
  numero: 'number',
  complemento: 'complement',
  bairro: 'neighborhood',
  cidade: 'city',
  estado: 'state',
  cep: 'zip_code',
  data_nascimento: 'birth_date'
};

// Função para mapear tipo de cliente
export const mapClientType = (tipoListaPrecos, cnpj, cpf) => {
  // Se tem CNPJ, é empresa
  if (cnpj && cnpj.trim() !== '') {
    return 'fornecedor';
  }
  
  // Se tem CPF, é pessoa física
  if (cpf && cpf.trim() !== '') {
    return 'cliente';
  }
  
  // Se tem nome fantasia, provavelmente é empresa
  if (tipoListaPrecos && tipoListaPrecos.trim() !== '') {
    return 'fornecedor';
  }
  
  // Padrão é cliente
  return 'cliente';
};

// Função para limpar e formatar CPF/CNPJ
export const cleanDocument = (document) => {
  if (!document) return '';
  return document.toString().replace(/[^\d]/g, '');
};

// Função para formatar telefone
export const formatPhone = (phone) => {
  if (!phone) return '';
  const cleaned = phone.toString().replace(/[^\d]/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0,2)}) ${cleaned.slice(2,7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0,2)}) ${cleaned.slice(2,6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

// Função para gerar CSV no formato do sistema antigo
export const generateClientesCSV = (data) => {
  const headers = clientesTemplate.headers.join(',');
  const rows = data.map(row => 
    clientesTemplate.headers.map(header => row[header] || '').join(',')
  );
  
  return [headers, ...rows].join('\n');
};



