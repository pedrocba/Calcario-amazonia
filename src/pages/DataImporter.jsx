import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Users,
  DollarSign,
  Calendar,
  FileSpreadsheet
} from "lucide-react";
import { useAuth } from '@/contexts/SimpleAuthContext';
import { useCompany } from '@/components/common/CompanyContext';
import importService from '@/services/importService';
import { getTemplateData, generateCSV } from '@/data/importTemplates';
import * as XLSX from 'xlsx';

export default function DataImporter() {
  const { user } = useAuth();
  const { currentCompany } = useCompany();
  const fileInputRef = useRef(null);
  
  const [importType, setImportType] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState(null);
  const [errors, setErrors] = useState([]);

  const importTypes = [
    {
      id: 'contacts',
      name: 'Clientes/Fornecedores',
      description: 'Importar lista de clientes e fornecedores (formato padrão)',
      icon: Users,
      templateFields: ['nome', 'email', 'telefone', 'documento', 'tipo', 'endereco', 'cidade', 'estado', 'cep']
    },
    {
      id: 'clientes_sistema_antigo',
      name: 'Clientes - Sistema Antigo',
      description: 'Importar clientes exportados do sistema antigo',
      icon: Users,
      templateFields: ['nome_razao_social', 'apelido_nome_fantasia', 'cnpj', 'cpf', 'telefone', 'email', 'endereco', 'cidade', 'estado', 'cep'],
      isSpecialFormat: true
    },
    {
      id: 'financial_transactions',
      name: 'Contas a Pagar/Receber',
      description: 'Importar transações financeiras (formato padrão)',
      icon: DollarSign,
      templateFields: ['descricao', 'valor', 'tipo', 'data_vencimento', 'status', 'categoria', 'observacoes']
    },
    {
      id: 'contas_pagar_sistema_antigo',
      name: 'Contas a Pagar - Sistema Antigo',
      description: 'Importar contas a pagar exportadas do sistema antigo',
      icon: Calendar,
      templateFields: ['vencimento', 'conta', 'conta_gerencial', 'origem', 'cliente', 'valor', 'saldo'],
      isSpecialFormat: true
    },
    {
      id: 'products',
      name: 'Produtos',
      description: 'Importar catálogo de produtos',
      icon: FileText,
      templateFields: ['nome', 'codigo', 'preco_venda', 'preco_custo', 'estoque', 'categoria', 'ativo']
    }
  ];

  const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
      setSelectedFile(file);
      setErrors([]);
      setImportResults(null);
    }
  };

  const downloadTemplate = (type) => {
    let template;
    
    if (type === 'contas_pagar_sistema_antigo') {
      // Usar template específico para contas a pagar do sistema antigo
      template = {
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
          }
        ]
      };
    } else if (type === 'clientes_sistema_antigo') {
      // Usar template específico para clientes do sistema antigo
      template = {
        headers: [
          'nome_razao_social', 'apelido_nome_fantasia', 'tipo_lista_precos', 'sexo', 'cpf', 'rg',
          'expedicao_rg', 'uf_rg', 'indicador_ie_dest', 'cnpj', 'ie', 'telefone', 'celular',
          'fax', 'email', 'site', 'endereco', 'numero', 'complemento', 'bairro', 'cidade',
          'estado', 'cep', 'data_nascimento'
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
    } else {
      template = getTemplateData(type);
    }
    
    if (!template) return;

    const csvContent = generateCSV(template);
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `template_${type}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const validateFile = (file) => {
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!validTypes.includes(file.type)) {
      return 'Tipo de arquivo não suportado. Use CSV ou Excel.';
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB
      return 'Arquivo muito grande. Máximo 5MB.';
    }
    
    return null;
  };

  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return { headers: [], data: [] };
    
    const rawHeaders = lines[0].split(',').map(h => h.trim());
    const headers = rawHeaders.map(h => h.toLowerCase());
    
    console.log('Headers brutos do CSV:', rawHeaders);
    console.log('Headers em minúsculas:', headers);
    
    // Mapear headers do CSV para o formato esperado
    const headerMapping = {
      // Variações para Nome/Razão Social
      'nome/razão social': 'nome_razao_social',
      'nome/razao social': 'nome_razao_social',
      'nome razao social': 'nome_razao_social',
      'nome': 'nome_razao_social',
      'razao social': 'nome_razao_social',
      'razão social': 'nome_razao_social',
      'nome completo': 'nome_razao_social',
      'cliente': 'nome_razao_social',
      'empresa': 'nome_razao_social',
      
      // Variações para Apelido/Nome fantasia
      'apelido/nome fantasia': 'apelido_nome_fantasia',
      'apelido nome fantasia': 'apelido_nome_fantasia',
      'apelido': 'apelido_nome_fantasia',
      'nome fantasia': 'apelido_nome_fantasia',
      'fantasia': 'apelido_nome_fantasia',
      
      // Variações para Tipo
      'tipo (lista de preços)': 'tipo_lista_precos',
      'tipo lista de precos': 'tipo_lista_precos',
      'tipo': 'tipo_lista_precos',
      'lista de preços': 'tipo_lista_precos',
      
      // Outros campos
      'sex': 'sexo',
      'sexo': 'sexo',
      'cpf': 'cpf',
      'rg': 'rg',
      'expedição rc': 'expedicao_rg',
      'expedicao rc': 'expedicao_rg',
      'uf do rg': 'uf_rg',
      'indicador ie dest': 'indicador_ie_dest',
      'cnpj': 'cnpj',
      'ie': 'ie',
      'telefone': 'telefone',
      'celular': 'celular',
      'fax': 'fax',
      'email': 'email',
      'site': 'site',
      'endereço': 'endereco',
      'endereco': 'endereco',
      'número': 'numero',
      'numero': 'numero',
      'complemento': 'complemento',
      'bairro': 'bairro',
      'cidade': 'cidade',
      'estado': 'estado',
      'cep': 'cep',
      'data de nascimer': 'data_nascimento',
      'data de nascimento': 'data_nascimento'
    };
    
    // Converter headers para formato padrão
    const mappedHeaders = headers.map(header => {
      const mapped = headerMapping[header] || header;
      console.log(`Mapeando CSV: "${header}" -> "${mapped}"`);
      return mapped;
    });
    
    const data = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const row = {};
      mappedHeaders.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });
    
    console.log('Headers mapeados do CSV:', mappedHeaders);
    console.log('Primeira linha de dados do CSV:', data[0]);
    console.log('Total de linhas de dados do CSV:', data.length);
    
    return { headers: mappedHeaders, data };
  };

  const parseExcel = async (file) => {
    try {
      console.log('Processando arquivo Excel com XLSX...');
      
      // Ler o arquivo como ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Processar com XLSX
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      // Pegar a primeira planilha
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Converter para JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length < 2) {
        throw new Error('Arquivo Excel vazio ou com dados insuficientes');
      }
      
      // Primeira linha são os headers
      const rawHeaders = jsonData[0].map(h => h ? h.toString().trim() : '');
      const headers = rawHeaders.map(h => h.toLowerCase());
      
      console.log('Headers brutos do Excel:', rawHeaders);
      console.log('Headers em minúsculas:', headers);
      
      // Mapear headers do Excel para o formato esperado
      const headerMapping = {
        'nome/razão social': 'nome_razao_social',
        'nome/razao social': 'nome_razao_social',
        'nome razao social': 'nome_razao_social',
        'apelido/nome fantasia': 'apelido_nome_fantasia',
        'apelido nome fantasia': 'apelido_nome_fantasia',
        'tipo (lista de preços)': 'tipo_lista_precos',
        'tipo lista de precos': 'tipo_lista_precos',
        'sex': 'sexo',
        'cpf': 'cpf',
        'rg': 'rg',
        'expedição rc': 'expedicao_rg',
        'expedicao rc': 'expedicao_rg',
        'uf do rg': 'uf_rg',
        'indicador ie dest': 'indicador_ie_dest',
        'cnpj': 'cnpj',
        'ie': 'ie',
        'telefone': 'telefone',
        'celular': 'celular',
        'fax': 'fax',
        'email': 'email',
        'site': 'site',
        'endereço': 'endereco',
        'endereco': 'endereco',
        'número': 'numero',
        'numero': 'numero',
        'complemento': 'complemento',
        'bairro': 'bairro',
        'cidade': 'cidade',
        'estado': 'estado',
        'cep': 'cep',
        'data de nascimer': 'data_nascimento',
        'data de nascimento': 'data_nascimento'
      };
      
      // Converter headers para formato padrão
      const mappedHeaders = headers.map(header => {
        const mapped = headerMapping[header] || header;
        console.log(`Mapeando: "${header}" -> "${mapped}"`);
        return mapped;
      });
      
      // Resto são os dados
      const data = jsonData.slice(1).map(row => {
        const rowData = {};
        mappedHeaders.forEach((header, index) => {
          rowData[header] = row[index] ? row[index].toString().trim() : '';
        });
        return rowData;
      });
      
      console.log('Headers originais do Excel:', headers);
      console.log('Headers mapeados:', mappedHeaders);
      console.log('Primeira linha de dados:', data[0]);
      console.log('Total de linhas de dados:', data.length);
      
      return { headers: mappedHeaders, data };
    } catch (error) {
      console.error('Erro ao processar arquivo Excel:', error);
      throw new Error(`Erro ao processar arquivo Excel: ${error.message}`);
    }
  };

  const validateData = (data, type) => {
    return importService.validateData(data, type);
  };

  const importData = async (data, type) => {
    const empresaId = currentCompany?.id || '68cacb91-3d16-9d19-1be6-c90d00000000';
    
    let results;
    
    switch (type) {
      case 'contacts':
        results = await importService.importContacts(data, empresaId);
        break;
      case 'clientes_sistema_antigo':
        results = await importService.importClientesSistemaAntigo(data, empresaId);
        break;
      case 'financial_transactions':
        results = await importService.importFinancialTransactions(data, empresaId);
        break;
      case 'contas_pagar_sistema_antigo':
        results = await importService.importContasPagarSistemaAntigo(data, empresaId);
        break;
      case 'products':
        results = await importService.importProducts(data, empresaId);
        break;
      default:
        throw new Error('Tipo de importação não suportado');
    }
    
    // Atualizar progresso
    setImportProgress(100);
    
    return results;
  };

  const handleImport = async () => {
    if (!selectedFile || !importType) {
      setErrors(['Selecione um arquivo e tipo de importação']);
            return;
        }

    const validationError = validateFile(selectedFile);
    if (validationError) {
      setErrors([validationError]);
            return;
        }

    setImporting(true);
    setImportProgress(0);
    setErrors([]);
    
    try {
      let { headers, data } = { headers: [], data: [] };
      
      // Detectar tipo de arquivo e usar parser apropriado
      if (selectedFile.name.endsWith('.xls') || selectedFile.name.endsWith('.xlsx')) {
        console.log('Processando arquivo Excel...');
        const result = await parseExcel(selectedFile);
        headers = result.headers;
        data = result.data;
      } else {
        console.log('Processando arquivo CSV...');
        
        try {
          const text = await selectedFile.text();
          console.log('Conteúdo do arquivo lido:', text.substring(0, 500) + '...');
          
          const result = parseCSV(text);
          headers = result.headers;
          data = result.data;
        } catch (readError) {
          console.error('Erro ao ler arquivo:', readError);
          throw new Error(`Erro ao ler arquivo: ${readError.message}. Tente salvar o arquivo novamente.`);
        }
      }
      
      console.log('Headers encontrados:', headers);
      console.log('Dados encontrados:', data);
      
      // Verificar se há dados válidos
      if (data.length === 0) {
        throw new Error('Nenhum dado válido encontrado no arquivo. Verifique se o arquivo não está vazio.');
      }
      
      // Verificar se o campo obrigatório existe
      if (importType === 'clientes_sistema_antigo' && !headers.includes('nome_razao_social')) {
        console.log('Headers disponíveis:', headers);
        
        // Tentar encontrar um campo que possa ser o nome
        const possibleNameFields = headers.filter(h => 
          h.includes('nome') || 
          h.includes('razao') || 
          h.includes('social') || 
          h.includes('cliente') || 
          h.includes('empresa')
        );
        
        if (possibleNameFields.length > 0) {
          console.log('Campos de nome encontrados:', possibleNameFields);
          // Usar o primeiro campo de nome encontrado
          const nameField = possibleNameFields[0];
          console.log(`Usando campo "${nameField}" como nome_razao_social`);
          
          // Atualizar os dados para usar o campo correto
          data = data.map(row => {
            if (row[nameField] && !row.nome_razao_social) {
              row.nome_razao_social = row[nameField];
            }
            return row;
          });
        } else {
          throw new Error(`Campo obrigatório "nome_razao_social" não encontrado. Headers disponíveis: ${headers.join(', ')}. Verifique se o arquivo tem uma coluna com nome, razão social, cliente ou empresa.`);
        }
      }
      
      // Validar dados
      const validationErrors = validateData(data, importType);
      if (validationErrors.length > 0) {
        setErrors(validationErrors.map(err => `Linha ${err.row}: ${err.errors.join(', ')}`));
        setImporting(false);
        return;
      }
      
      // Importar dados
      const results = await importData(data, importType);
      setImportResults(results);
      
    } catch (error) {
      console.error('Erro no processamento:', error);
      setErrors([`Erro ao processar arquivo: ${error.message}`]);
    } finally {
      setImporting(false);
    }
    };

    return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <Upload className="w-8 h-8 text-blue-600" />
            Importador de Dados
          </h1>
          <p className="text-slate-600">
            Importe clientes, contas a pagar/receber e produtos através de arquivos CSV ou Excel.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {importTypes.map((type) => (
            <Card key={type.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <type.icon className="w-5 h-5 text-blue-600" />
                  {type.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 mb-4">{type.description}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadTemplate(type.id)}
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Importar Dados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="import-type">Tipo de Importação</Label>
              <Select value={importType} onValueChange={setImportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de dados" />
                </SelectTrigger>
                <SelectContent>
                  {importTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="file-upload">Arquivo</Label>
              <div className="mt-2">
                <Input
                  ref={fileInputRef}
                type="file" 
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileSelect}
                  className="cursor-pointer"
                />
                {selectedFile && (
                  <div className="mt-2 flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-slate-600">{selectedFile.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {errors.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Erros encontrados</AlertTitle>
                    <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                    </AlertDescription>
                </Alert>
            )}

            {importing && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-slate-600">Importando dados...</span>
                </div>
                <Progress value={importProgress} className="w-full" />
              </div>
            )}

            {importResults && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Importação Concluída</AlertTitle>
                <AlertDescription>
                  <div className="space-y-2">
                    <p>Total: {importResults.total} registros</p>
                    <p className="text-green-600">Sucessos: {importResults.success}</p>
                    {importResults.errors > 0 && (
                      <p className="text-red-600">Erros: {importResults.errors}</p>
                    )}
                  </div>
                </AlertDescription>
            </Alert>
            )}

                        <Button
              onClick={handleImport}
              disabled={!selectedFile || !importType || importing}
                            className="w-full"
            >
              {importing ? 'Importando...' : 'Importar Dados'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}