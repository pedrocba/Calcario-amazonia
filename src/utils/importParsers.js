const stripBOM = (value = '') =>
  typeof value === 'string' ? value.replace(/^\uFEFF/, '') : value;

const normalizeHeader = (header = '') =>
  stripBOM(header)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const keyFromHeader = (header = '') => normalizeHeader(header).replace(/\s+/g, '_');

const detectDelimiter = (line = '') => {
  const commaCount = (line.match(/,/g) || []).length;
  const semicolonCount = (line.match(/;/g) || []).length;
  return semicolonCount > commaCount ? ';' : ',';
};

const splitLine = (line = '', delimiter) => {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && char === delimiter) {
      values.push(stripBOM(current).trim());
      current = '';
    } else {
      current += char;
    }
  }

  values.push(stripBOM(current).trim());
  return values;
};

const parseTableFromText = (text = '') => {
  const cleaned = stripBOM(text)
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');

  const lines = cleaned
    .split('\n')
    .filter((line, index) => index === 0 || line.trim().length > 0);

  if (lines.length < 2) {
    return { headers: [], rows: [] };
  }

  const delimiter = detectDelimiter(lines[0]);
  const rawHeaders = splitLine(lines[0], delimiter).map((header) => stripBOM(header).trim());

  const rows = lines.slice(1).map((line) => {
    const values = splitLine(line, delimiter);

    while (values.length < rawHeaders.length) {
      values.push('');
    }

    return values.slice(0, rawHeaders.length).map((value) => stripBOM(value).trim());
  });

  return { headers: rawHeaders, rows };
};

const finalizeRow = (row) => {
  const trimmed = {};

  Object.entries(row).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    const stringValue = typeof value === 'string' ? value.trim() : value;

    if (stringValue !== '' && stringValue !== null && stringValue !== undefined) {
      trimmed[key] = stringValue;
    }
  });

  return trimmed;
};

const normalizeActiveFlag = (value) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  const normalized = value.toString().trim().toLowerCase();
  const inactiveValues = new Set(['0', 'false', 'nao', 'não', 'inativo', 'inativado', 'desativado', 'desativo']);

  return inactiveValues.has(normalized) ? 'false' : 'true';
};

export const parseContactsCSV = (text = '') => {
  const { headers, rows } = parseTableFromText(text);

  if (!headers.length) {
    return [];
  }

  const headerMapping = {
    nome: 'nome',
    'nome razao social': 'nome_razao_social',
    'nome/razao social': 'nome_razao_social',
    'nome/razão social': 'nome_razao_social',
    'razao social': 'nome_razao_social',
    'razão social': 'nome_razao_social',
    cliente: 'cliente',
    empresa: 'empresa',
    fantasia: 'apelido_nome_fantasia',
    'nome fantasia': 'apelido_nome_fantasia',
    apelido: 'apelido_nome_fantasia',
    telefone: 'telefone',
    'telefone principal': 'telefone',
    celular: 'celular',
    whatsapp: 'celular',
    documento: 'documento',
    cpf: 'cpf',
    cnpj: 'cnpj',
    'inscricao estadual': 'ie',
    'inscricao estadual/rg': 'ie',
    email: 'email',
    endereco: 'endereco',
    endereço: 'endereco',
    logradouro: 'endereco',
    numero: 'numero',
    número: 'numero',
    complemento: 'complemento',
    bairro: 'bairro',
    cidade: 'cidade',
    municipio: 'cidade',
    estado: 'estado',
    uf: 'estado',
    cep: 'cep',
    tipo: 'tipo',
    'tipo de cliente': 'tipo',
    classificacao: 'classificacao',
    segmento: 'segmento',
    status: 'status',
    ativo: 'ativo'
  };

  const mappedHeaders = headers.map((header) => {
    const normalized = normalizeHeader(header);
    return headerMapping[normalized] || keyFromHeader(header);
  });

  const contacts = rows
    .map((values) => {
      const row = {};

      mappedHeaders.forEach((key, index) => {
        if (!key) return;
        const value = values[index] ?? '';
        if (value !== '') {
          row[key] = value;
        }
      });

      const normalizedRow = finalizeRow(row);

      const nomeCandidates = [
        normalizedRow.nome,
        normalizedRow.nome_razao_social,
        normalizedRow['nome_razao_social'],
        normalizedRow.apelido_nome_fantasia,
        normalizedRow.cliente,
        normalizedRow.empresa
      ].filter(Boolean);

      if (!normalizedRow.nome && nomeCandidates.length > 0) {
        normalizedRow.nome = nomeCandidates[0];
      }

      if (!normalizedRow.documento) {
        normalizedRow.documento = normalizedRow.cnpj || normalizedRow.cpf || normalizedRow.documento;
      }

      if (!normalizedRow.telefone) {
        normalizedRow.telefone = normalizedRow.celular;
      }

      if (!normalizedRow.tipo) {
        normalizedRow.tipo = normalizedRow.classificacao || normalizedRow.segmento || normalizedRow.tipo_lista_precos;
      }

      const activeFlag = normalizeActiveFlag(normalizedRow.ativo ?? normalizedRow.status);
      if (activeFlag !== undefined) {
        normalizedRow.ativo = activeFlag;
      }

      return normalizedRow;
    })
    .filter((row) => Object.keys(row).length > 0);

  return contacts;
};

const cleanCurrency = (value = '') =>
  value
    .toString()
    .replace(/\s+/g, '')
    .replace(/R\$/gi, '')
    .replace(/\./g, '')
    .replace(/,/g, '.');

export const parseFinancialTransactionsCSV = (text = '') => {
  const { headers, rows } = parseTableFromText(text);

  if (!headers.length) {
    return [];
  }

  const headerMapping = {
    descricao: 'descricao',
    descrição: 'descricao',
    historico: 'descricao',
    historico_lancamento: 'descricao',
    conta: 'descricao',
    valor: 'valor',
    'valor total': 'valor',
    'valor liquido': 'valor',
    tipo: 'tipo',
    natureza: 'tipo',
    operacao: 'tipo',
    vencimento: 'data_vencimento',
    'data vencimento': 'data_vencimento',
    'data de vencimento': 'data_vencimento',
    data: 'data_vencimento',
    status: 'status',
    situacao: 'status',
    categoria: 'categoria',
    'plano de contas': 'categoria',
    observacao: 'observacoes',
    observações: 'observacoes',
    observacoes: 'observacoes',
    nota: 'observacoes'
  };

  const mappedHeaders = headers.map((header) => {
    const normalized = normalizeHeader(header);
    return headerMapping[normalized] || keyFromHeader(header);
  });

  const transactions = rows
    .map((values) => {
      const row = {};

      mappedHeaders.forEach((key, index) => {
        if (!key) return;
        const value = values[index] ?? '';
        if (value !== '') {
          row[key] = value;
        }
      });

      const normalizedRow = finalizeRow(row);

      if (!normalizedRow.descricao) {
        normalizedRow.descricao =
          normalizedRow.description || normalizedRow.conta || normalizedRow.historico || 'Conta importada';
      }

      if (!normalizedRow.data_vencimento) {
        normalizedRow.data_vencimento = normalizedRow.vencimento || normalizedRow.data;
      }

      if (normalizedRow.valor) {
        normalizedRow.valor = cleanCurrency(normalizedRow.valor);
      }

      if (!normalizedRow.tipo) {
        const valorNumber = normalizedRow.valor ? parseFloat(normalizedRow.valor) : NaN;
        const categoria = (normalizedRow.categoria || '').toString().toLowerCase();

        if (!Number.isNaN(valorNumber)) {
          if (valorNumber >= 0 && categoria.includes('rece')) {
            normalizedRow.tipo = 'entrada';
          } else if (valorNumber < 0) {
            normalizedRow.tipo = 'saida';
          }
        }

        if (!normalizedRow.tipo) {
          normalizedRow.tipo = 'saida';
        }
      }

      if (normalizedRow.status) {
        normalizedRow.status = normalizedRow.status.toString().trim().toLowerCase();
      }

      return normalizedRow;
    })
    .filter((row) => Object.keys(row).length > 0);

  return transactions;
};
