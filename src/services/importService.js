import supabase from '@/lib/supabaseClient';
import { convertDate, convertValue, mapOriginToType, mapCategory } from '@/data/contasPagarTemplate';
import { mapClientType, cleanDocument, formatPhone } from '@/data/clientesTemplate';

class ImportService {
  constructor() {
    this.batchSize = 50; // Processar em lotes de 50 registros
  }

  /**
   * Importar clientes/contatos (formato padrão)
   */
  async importContacts(data, empresaId) {
    const results = {
      total: data.length,
      success: 0,
      errors: 0,
      details: []
    };

    // Processar em lotes
    for (let i = 0; i < data.length; i += this.batchSize) {
      const batch = data.slice(i, i + this.batchSize);
      
      try {
        const contactsData = batch.map(row => ({
          name: row.nome?.trim(),
          email: row.email?.trim() || null,
          phone: row.telefone?.trim() || null,
          document: row.documento?.trim() || null,
          type: this.mapContactType(row.tipo?.trim()),
          address: row.endereco?.trim() || null,
          city: row.cidade?.trim() || null,
          state: row.estado?.trim() || null,
          zip_code: row.cep?.trim() || null,
          active: row.ativo !== 'false' && row.ativo !== '0',
          empresa_id: empresaId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        const { data: insertedData, error } = await supabase
          .from('contacts')
          .insert(contactsData)
          .select();

        if (error) {
          throw new Error(`Erro no lote ${Math.floor(i / this.batchSize) + 1}: ${error.message}`);
        }

        results.success += insertedData.length;
        results.details.push({
          batch: Math.floor(i / this.batchSize) + 1,
          status: 'success',
          message: `${insertedData.length} contatos importados com sucesso`
        });

      } catch (error) {
        results.errors += batch.length;
        results.details.push({
          batch: Math.floor(i / this.batchSize) + 1,
          status: 'error',
          message: error.message
        });
      }
    }

    return results;
  }

  /**
   * Importar clientes do sistema antigo (formato específico)
   */
  async importClientesSistemaAntigo(data, empresaId) {
    const results = {
      total: data.length,
      success: 0,
      errors: 0,
      details: []
    };

    // Processar em lotes
    for (let i = 0; i < data.length; i += this.batchSize) {
      const batch = data.slice(i, i + this.batchSize);
      
      try {
        const contactsData = batch.map(row => {
          // Determinar tipo baseado nos dados
          const clientType = mapClientType(
            row.tipo_lista_precos,
            row.cnpj,
            row.cpf
          );
          
          // Usar nome fantasia se disponível, senão nome/razão social
          const name = row.apelido_nome_fantasia?.trim() || row.nome_razao_social?.trim();
          
          // Limpar e formatar documentos
          const cpf = cleanDocument(row.cpf);
          const cnpj = cleanDocument(row.cnpj);
          
          // Usar o documento principal (CNPJ para empresas, CPF para pessoas)
          const document = clientType === 'fornecedor' ? cnpj : cpf;
          
          // Formatar telefone
          const phone = formatPhone(row.telefone || row.celular);
          
          // Montar endereço completo
          const fullAddress = [
            row.endereco?.trim(),
            row.numero?.trim(),
            row.complemento?.trim()
          ].filter(Boolean).join(', ');
          
          return {
            name: name || 'Cliente sem nome',
            email: row.email?.trim() || null,
            phone: phone || null,
            document: document || null,
            type: clientType,
            address: fullAddress || null,
            city: row.cidade?.trim() || null,
            state: row.estado?.trim() || null,
            zip_code: row.cep?.trim() || null,
            active: true, // Todos os clientes importados ficam ativos
            empresa_id: empresaId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        });

        const { data: insertedData, error } = await supabase
          .from('contacts')
          .insert(contactsData)
          .select();

        if (error) {
          throw new Error(`Erro no lote ${Math.floor(i / this.batchSize) + 1}: ${error.message}`);
        }

        results.success += insertedData.length;
        results.details.push({
          batch: Math.floor(i / this.batchSize) + 1,
          status: 'success',
          message: `${insertedData.length} clientes importados com sucesso`
        });

      } catch (error) {
        results.errors += batch.length;
        results.details.push({
          batch: Math.floor(i / this.batchSize) + 1,
          status: 'error',
          message: error.message
        });
      }
    }

    return results;
  }

  /**
   * Importar transações financeiras (formato padrão)
   */
  async importFinancialTransactions(data, empresaId) {
    const results = {
      total: data.length,
      success: 0,
      errors: 0,
      details: []
    };

    // Buscar conta padrão ou criar uma
    let defaultAccountId = await this.getDefaultAccount(empresaId);

    for (let i = 0; i < data.length; i += this.batchSize) {
      const batch = data.slice(i, i + this.batchSize);
      
      try {
        const transactionsData = batch.map(row => ({
          account_id: defaultAccountId,
          type: this.mapTransactionType(row.tipo?.trim()),
          amount: parseFloat(row.valor?.replace(',', '.')) || 0,
          description: row.descricao?.trim() || 'Importado',
          reference: row.referencia?.trim() || null,
          due_date: row.data_vencimento ? new Date(row.data_vencimento).toISOString().split('T')[0] : null,
          status: this.mapTransactionStatus(row.status?.trim()),
          category: row.categoria?.trim() || 'outros',
          notes: row.observacoes?.trim() || null,
          company_id: empresaId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        const { data: insertedData, error } = await supabase
          .from('financial_transactions')
          .insert(transactionsData)
          .select();

        if (error) {
          throw new Error(`Erro no lote ${Math.floor(i / this.batchSize) + 1}: ${error.message}`);
        }

        results.success += insertedData.length;
        results.details.push({
          batch: Math.floor(i / this.batchSize) + 1,
          status: 'success',
          message: `${insertedData.length} transações importadas com sucesso`
        });

      } catch (error) {
        results.errors += batch.length;
        results.details.push({
          batch: Math.floor(i / this.batchSize) + 1,
          status: 'error',
          message: error.message
        });
      }
    }

    return results;
  }

  /**
   * Importar contas a pagar do sistema antigo (formato específico)
   */
  async importContasPagarSistemaAntigo(data, empresaId) {
    const results = {
      total: data.length,
      success: 0,
      errors: 0,
      details: []
    };

    // Buscar conta padrão ou criar uma
    let defaultAccountId = await this.getDefaultAccount(empresaId);

    for (let i = 0; i < data.length; i += this.batchSize) {
      const batch = data.slice(i, i + this.batchSize);
      
      try {
        const transactionsData = batch.map(row => {
          // Converter data do formato DD/MM/YYYY para YYYY-MM-DD
          const dueDate = convertDate(row.vencimento);
          
          // Converter valor com vírgula para ponto
          const amount = convertValue(row.valor);
          
          // Mapear origem para tipo de transação
          const type = mapOriginToType(row.origem);
          
          // Mapear conta gerencial para categoria
          const category = mapCategory(row.conta_gerencial);
          
          return {
            account_id: defaultAccountId,
            type: type,
            amount: amount,
            description: row.conta?.trim() || 'Conta a pagar importada',
            reference: row.conta?.trim() || null,
            due_date: dueDate,
            status: 'pendente', // Todas as contas a pagar começam como pendentes
            category: category,
            notes: row.cliente ? `Cliente: ${row.cliente}` : null,
            company_id: empresaId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        });

        const { data: insertedData, error } = await supabase
          .from('financial_transactions')
          .insert(transactionsData)
          .select();

        if (error) {
          throw new Error(`Erro no lote ${Math.floor(i / this.batchSize) + 1}: ${error.message}`);
        }

        results.success += insertedData.length;
        results.details.push({
          batch: Math.floor(i / this.batchSize) + 1,
          status: 'success',
          message: `${insertedData.length} contas a pagar importadas com sucesso`
        });

      } catch (error) {
        results.errors += batch.length;
        results.details.push({
          batch: Math.floor(i / this.batchSize) + 1,
          status: 'error',
          message: error.message
        });
      }
    }

    return results;
  }

  /**
   * Importar produtos
   */
  async importProducts(data, empresaId) {
    const results = {
      total: data.length,
      success: 0,
      errors: 0,
      details: []
    };

    for (let i = 0; i < data.length; i += this.batchSize) {
      const batch = data.slice(i, i + this.batchSize);
      
      try {
        const productsData = batch.map(row => ({
          name: row.nome?.trim(),
          code: row.codigo?.trim(),
          sale_price: parseFloat(row.preco_venda?.replace(',', '.')) || 0,
          cost_price: parseFloat(row.preco_custo?.replace(',', '.')) || 0,
          stock: parseInt(row.estoque) || 0,
          category: row.categoria?.trim() || 'Geral',
          active: row.ativo !== 'false' && row.ativo !== '0',
          empresa_id: empresaId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        const { data: insertedData, error } = await supabase
          .from('products')
          .insert(productsData)
          .select();

        if (error) {
          throw new Error(`Erro no lote ${Math.floor(i / this.batchSize) + 1}: ${error.message}`);
        }

        results.success += insertedData.length;
        results.details.push({
          batch: Math.floor(i / this.batchSize) + 1,
          status: 'success',
          message: `${insertedData.length} produtos importados com sucesso`
        });

      } catch (error) {
        results.errors += batch.length;
        results.details.push({
          batch: Math.floor(i / this.batchSize) + 1,
          status: 'error',
          message: error.message
        });
      }
    }

    return results;
  }

  /**
   * Mapear tipo de contato
   */
  mapContactType(type) {
    if (!type) return 'cliente';
    
    const typeMap = {
      'cliente': 'cliente',
      'fornecedor': 'fornecedor',
      'funcionario': 'funcionario',
      'funcionário': 'funcionario',
      'outro': 'outro',
      'outros': 'outro'
    };
    
    return typeMap[type.toLowerCase()] || 'cliente';
  }

  /**
   * Mapear tipo de transação
   */
  mapTransactionType(type) {
    if (!type) return 'entrada';
    
    const typeMap = {
      'entrada': 'entrada',
      'receita': 'entrada',
      'receber': 'entrada',
      'saida': 'saida',
      'despesa': 'saida',
      'pagar': 'saida'
    };
    
    return typeMap[type.toLowerCase()] || 'entrada';
  }

  /**
   * Mapear status de transação
   */
  mapTransactionStatus(status) {
    if (!status) return 'pendente';
    
    const statusMap = {
      'pendente': 'pendente',
      'pago': 'pago',
      'parcial': 'parcial',
      'cancelado': 'cancelado',
      'confirmado': 'pago'
    };
    
    return statusMap[status.toLowerCase()] || 'pendente';
  }

  /**
   * Buscar ou criar conta padrão
   */
  async getDefaultAccount(empresaId) {
    try {
      // Buscar conta existente
      const { data: accounts, error } = await supabase
        .from('financial_accounts')
        .select('id')
        .eq('company_id', empresaId)
        .eq('active', true)
        .limit(1);

      if (error) throw error;

      if (accounts && accounts.length > 0) {
        return accounts[0].id;
      }

      // Criar conta padrão se não existir
      const { data: newAccount, error: createError } = await supabase
        .from('financial_accounts')
        .insert({
          name: 'Conta Principal',
          type: 'caixa',
          balance: 0,
          description: 'Conta criada automaticamente para importação',
          company_id: empresaId,
          active: true
        })
        .select()
        .single();

      if (createError) throw createError;

      return newAccount.id;

    } catch (error) {
      console.error('Erro ao buscar/criar conta padrão:', error);
      return null;
    }
  }

  /**
   * Validar dados antes da importação
   */
  validateData(data, type) {
    const errors = [];
    const requiredFields = {
      contacts: ['nome'],
      clientes_sistema_antigo: ['nome_razao_social'],
      financial_transactions: ['descricao', 'valor', 'tipo'],
      contas_pagar_sistema_antigo: ['vencimento', 'conta', 'valor'],
      products: ['nome', 'codigo']
    };

    data.forEach((row, index) => {
      const rowErrors = [];
      
      // Verificar campos obrigatórios
      requiredFields[type]?.forEach(field => {
        if (!row[field] || row[field].trim() === '') {
          rowErrors.push(`Campo obrigatório '${field}' está vazio`);
        }
      });
      
      // Validações específicas
      if (type === 'financial_transactions') {
        if (row.valor && isNaN(parseFloat(row.valor.replace(',', '.')))) {
          rowErrors.push('Valor deve ser um número válido');
        }
        if (row.tipo && !['entrada', 'saida', 'receita', 'despesa', 'receber', 'pagar'].includes(row.tipo.toLowerCase())) {
          rowErrors.push('Tipo deve ser: entrada, saida, receita, despesa, receber ou pagar');
        }
      }
      
      if (type === 'contas_pagar_sistema_antigo') {
        // Validar data no formato DD/MM/YYYY
        if (row.vencimento) {
          const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
          if (!dateRegex.test(row.vencimento)) {
            rowErrors.push('Data de vencimento deve estar no formato DD/MM/YYYY');
          }
        }
        
        // Validar valor
        if (row.valor && isNaN(convertValue(row.valor))) {
          rowErrors.push('Valor deve ser um número válido (use vírgula como separador decimal)');
        }
        
        // Validar origem
        if (row.origem && !['Despesas', 'Receitas', 'Receita', 'Despesa'].includes(row.origem)) {
          rowErrors.push('Origem deve ser: Despesas, Receitas, Receita ou Despesa');
        }
      }
      
      if (type === 'contacts') {
        if (row.email && !row.email.includes('@')) {
          rowErrors.push('Email inválido');
        }
      }
      
      if (type === 'products') {
        if (row.preco_venda && isNaN(parseFloat(row.preco_venda.replace(',', '.')))) {
          rowErrors.push('Preço de venda deve ser um número válido');
        }
        if (row.preco_custo && isNaN(parseFloat(row.preco_custo.replace(',', '.')))) {
          rowErrors.push('Preço de custo deve ser um número válido');
        }
        if (row.estoque && isNaN(parseInt(row.estoque))) {
          rowErrors.push('Estoque deve ser um número inteiro');
        }
      }
      
      if (rowErrors.length > 0) {
        errors.push({
          row: index + 2, // +2 porque começa na linha 2 (pula header)
          errors: rowErrors
        });
      }
    });
    
    return errors;
  }
}

export default new ImportService();
