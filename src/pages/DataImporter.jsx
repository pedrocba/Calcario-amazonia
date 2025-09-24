
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertTriangle, Upload, FileText, FileUp, Info, Paperclip, X, Users } from 'lucide-react';
import { useCompany } from '@/components/common/CompanyContext';
import { Contact, FinancialTransaction, FinancialAccount } from '@/api/entities';
import { UploadFile, ExtractDataFromUploadedFile } from '@/api/integrations';

const clientesSertanejo = [
    // ... hardcoded client data remains for demo purposes
    { name: "ANTHONY COPENHAGUE", id: "sertanejo_cliente_anthony_copenhague" },
    { name: "DIVERSOS", id: "sertanejo_cliente_diversos" },
    { name: "CEREALISTA PEROLA", id: "sertanejo_cliente_cerealista_perola" },
    { name: "SERGIO SCHWADE", id: "sertanejo_cliente_sergio_schwade" },
    { name: "FLAVIO BAU", id: "sertanejo_cliente_flavio_bau" },
    { name: "A BRAGA DA SILVA", id: "sertanejo_cliente_a_braga_da_silva" },
    { name: "MERCADO DA TERRA", id: "sertanejo_cliente_mercado_da_terra" },
    { name: "DAITHY MENDONÇA NOZAWA", id: "sertanejo_cliente_daithy_mendonca_nozawa" },
    { name: "MANOEL EDUARDO MATIAS DA SILVA", id: "sertanejo_cliente_manoel_eduardo_matias_da_silva" },
    { name: "PEDRO PAULO", id: "sertanejo_cliente_pedro_paulo" },
    { name: "JOSIAS", id: "sertanejo_cliente_josias" },
    { name: "MARIA CLARA", id: "sertanejo_cliente_maria_clara" },
    { name: "ROBERTO CARLOS", id: "sertanejo_cliente_roberto_carlos" },
    { name: "ANA PAULA", id: "sertanejo_cliente_ana_paula" },
    { name: "FERNANDA LIMA", id: "sertanejo_cliente_fernanda_lima" },
];

const clientesCBA = [
    { name: "Cliente A CBA", id: "cba_cliente_a" },
    { name: "Cliente B CBA", id: "cba_cliente_b" },
    { name: "Cliente C CBA", id: "cba_cliente_c" },
];

function parseDateToISO(dateStr) {
    if (!dateStr || !/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
        // Retorna null ou lança um erro se a data for inválida
        console.warn(`Formato de data inválido encontrado: ${dateStr}. Ignorando.`);
        return null;
    }
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

const companyConfigs = [
    {
        code: 'SERTANEJO',
        name: 'Loja do Sertanejo',
        data: { clients: clientesSertanejo },
    },
    {
        code: 'CBA',
        name: 'CBA Importações',
        data: { clients: clientesCBA },
    },
];

export default function DataImporter() {
    const { currentCompany } = useCompany();
    const [importStatus, setImportStatus] = useState({});
    const [overallStatus, setOverallStatus] = useState(null);
    const [overallMessage, setOverallMessage] = useState('');
    const [selectedFiles, setSelectedFiles] = useState({ payables: null, receivables: null });
    
    const payablesInputRef = useRef(null);
    const receivablesInputRef = useRef(null);

    const handleFileChange = (event, type) => {
        const file = event.target.files[0];
        if (file) {
            // Verificar se o tipo de arquivo é suportado
            const supportedTypes = ['.csv', '.pdf'];
            const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
            
            if (!supportedTypes.includes(fileExtension)) {
                alert(`Tipo de arquivo não suportado: ${fileExtension}\n\nApenas são aceitos: CSV (.csv) e PDF (.pdf)\n\nPara arquivos Excel (.xls ou .xlsx), salve como CSV primeiro.`);
                event.target.value = ''; // Limpar a seleção
                return;
            }
            
            setSelectedFiles(prev => ({ ...prev, [type]: file }));
        }
    };

    const importFromFile = async (type, file) => {
        setImportStatus(prev => ({ ...prev, [type]: { status: 'loading', message: `Enviando arquivo...` } }));

        const { file_url } = await UploadFile({ file });
        
        setImportStatus(prev => ({ ...prev, [type]: { status: 'loading', message: `Extraindo dados...` } }));

        const schema = {
            type: "object",
            properties: {
                contas: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            vencimento: { type: "string", description: "Data de vencimento no formato DD/MM/YYYY." },
                            descricao: { type: "string", description: "Descrição completa da conta." },
                            valor: { type: "number", description: "O valor da conta." },
                            categoria: { type: "string", description: "Categoria da despesa/receita (opcional)" }
                        },
                        required: ["vencimento", "descricao", "valor"]
                    }
                }
            },
            required: ["contas"]
        };

        const extractionResult = await ExtractDataFromUploadedFile({ file_url, json_schema: schema });

        if (extractionResult.status !== 'success' || !extractionResult.output) {
            throw new Error(extractionResult.details || "Falha ao extrair dados do arquivo. Verifique se é um CSV com as colunas: vencimento, descricao, valor.");
        }

        const items = extractionResult.output.contas;
        if (!Array.isArray(items) || items.length === 0) {
            throw new Error("Nenhum dado válido encontrado no arquivo.");
        }

        const transactionType = type === 'payables' ? 'despesa' : 'receita';

        const transactionsToCreate = items.map(item => {
            const dueDate = parseDateToISO(item.vencimento);
            if (!dueDate) return null; // Ignora linhas com data inválida

            return {
                company_id: currentCompany.id,
                description: item.descricao,
                amount: transactionType === 'despesa' ? -Math.abs(item.valor) : Math.abs(item.valor),
                type: transactionType,
                category: item.categoria || 'outros',
                due_date: dueDate,
                status: 'pendente',
            };
        }).filter(Boolean); // Remove itens nulos

        if (transactionsToCreate.length > 0) {
            await FinancialTransaction.bulkCreate(transactionsToCreate);
        }
        
        return transactionsToCreate.length;
    };

    const handleImport = async (dataType) => {
        if (!currentCompany) {
            setOverallStatus('error');
            setOverallMessage('Por favor, selecione uma empresa primeiro.');
            return;
        }

        const config = companyConfigs.find(c => c.code === currentCompany.code);
        if (!config && dataType === 'clients') {
            setOverallStatus('error');
            setOverallMessage('Configuração da empresa não encontrada.');
            return;
        }

        setImportStatus(prev => ({ ...prev, [dataType]: { status: 'loading', message: `Importando ${dataType}...` } }));
        setOverallStatus('loading');
        setOverallMessage(`Processando importação para ${currentCompany.name}...`);

        try {
            let count = 0;
            switch (dataType) {
                case 'clients':
                    await importClients(config.data.clients, currentCompany.id);
                    count = config.data.clients.length;
                    break;
                case 'payables':
                case 'receivables':
                    const file = selectedFiles[dataType];
                    if (!file) throw new Error("Nenhum arquivo selecionado.");
                    count = await importFromFile(dataType, file);
                    break;
                default:
                    throw new Error('Tipo de dado desconhecido.');
            }
            setImportStatus(prev => ({ ...prev, [dataType]: { status: 'success', message: `${count} registros importados!` } }));
            setOverallStatus('success');
            setOverallMessage(`Dados de ${dataType} importados com sucesso para ${currentCompany.name}!`);
        } catch (error) {
            console.error(`Erro ao importar ${dataType}:`, error);
            setImportStatus(prev => ({ ...prev, [dataType]: { status: 'error', message: `Erro: ${error.message}` } }));
            setOverallStatus('error');
            setOverallMessage(`Falha ao importar dados de ${dataType}: ${error.message}`);
        } finally {
            // Limpa o arquivo selecionado após a tentativa de importação
            setSelectedFiles(prev => ({...prev, [dataType]: null}));
        }
    };
    
    // A função importClients permanece a mesma
    const importClients = async (clients, companyId) => {
        for (const clientData of clients) {
            const existingContact = await Contact.filter({ company_id: companyId, name: clientData.name });
            if (!existingContact || existingContact.length === 0) {
                await Contact.create({
                    company_id: companyId,
                    name: clientData.name,
                    type: 'cliente',
                });
            }
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'loading':
                return <Loader2 className="w-4 h-4 animate-spin" />;
            case 'success':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'error':
                return <AlertTriangle className="w-4 h-4 text-red-500" />;
            default:
                return null;
        }
    };

    return (
        <div className="p-6 space-y-8">
            {/* Input de arquivos escondido */}
            <input 
                type="file" 
                accept=".csv,.pdf" 
                ref={payablesInputRef} 
                onChange={(e) => handleFileChange(e, 'payables')} 
                className="hidden" 
            />
            <input 
                type="file" 
                accept=".csv,.pdf" 
                ref={receivablesInputRef} 
                onChange={(e) => handleFileChange(e, 'receivables')} 
                className="hidden" 
            />

            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900">Importação de Dados</h1>
                <p className="mt-2 text-lg text-gray-600">
                    Importe dados iniciais para a empresa selecionada.
                </p>
            </div>

            {currentCompany ? (
                <Alert className="mb-6 max-w-xl mx-auto border-blue-200 bg-blue-50 text-blue-700">
                    <Info className="w-4 h-4" />
                    <AlertDescription className="flex items-center gap-2">
                        Empresa selecionada: <span className="font-semibold">{currentCompany.name}</span>
                    </AlertDescription>
                </Alert>
            ) : (
                <Alert className="mb-6 max-w-xl mx-auto border-yellow-200 bg-yellow-50 text-yellow-700">
                    <AlertTriangle className="w-4 h-4" />
                    <AlertDescription>
                        Nenhuma empresa selecionada. Por favor, selecione uma empresa no menu superior para importar dados.
                    </AlertDescription>
                </Alert>
            )}

            {/* Alerta sobre tipos de arquivo */}
            <Alert className="mb-6 max-w-4xl mx-auto border-gray-200 bg-gray-50 text-gray-700">
                <Info className="w-4 h-4" />
                <AlertDescription>
                    <strong>Tipos de arquivo aceitos:</strong> CSV (.csv) e PDF (.pdf)<br/>
                    <strong>Para arquivos Excel:</strong> Salve como CSV primeiro (Arquivo → Salvar Como → CSV)
                </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {/* Card Clientes */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5" /> Clientes
                        </CardTitle>
                        <CardDescription>Importa lista de clientes de demonstração.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            onClick={() => handleImport('clients')}
                            className="w-full"
                            disabled={!currentCompany || importStatus.clients?.status === 'loading'}
                        >
                            {importStatus.clients?.status === 'loading' ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Upload className="mr-2 h-4 w-4" />
                            )}
                            Importar Clientes
                        </Button>
                        {importStatus.clients && (
                            <div className={`mt-2 flex items-center text-sm ${importStatus.clients.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                {getStatusIcon(importStatus.clients.status)}
                                <span className="ml-2">{importStatus.clients.message}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Card Contas a Pagar */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5" /> Contas a Pagar
                        </CardTitle>
                        <CardDescription>Importe despesas de um arquivo CSV ou PDF.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button onClick={() => payablesInputRef.current.click()} className="w-full" variant="outline" disabled={!currentCompany}>
                            <Paperclip className="mr-2 h-4 w-4" /> Anexar Arquivo (.csv ou .pdf)
                        </Button>
                        {selectedFiles.payables && (
                            <div className="text-sm text-gray-600 flex items-center justify-between p-2 bg-gray-100 rounded-md">
                                <span className="truncate">{selectedFiles.payables.name}</span>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedFiles(p => ({...p, payables: null}))}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                        <Button
                            onClick={() => handleImport('payables')}
                            className="w-full"
                            disabled={!currentCompany || !selectedFiles.payables || importStatus.payables?.status === 'loading'}
                        >
                            {importStatus.payables?.status === 'loading' ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Upload className="mr-2 h-4 w-4" />
                            )}
                            Importar Contas a Pagar
                        </Button>
                        {importStatus.payables && (
                            <div className={`mt-2 flex items-center text-sm ${importStatus.payables.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                {getStatusIcon(importStatus.payables.status)}
                                <span className="ml-2">{importStatus.payables.message}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Card Contas a Receber */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileUp className="w-5 h-5" /> Contas a Receber
                        </CardTitle>
                        <CardDescription>Importe receitas de um arquivo CSV ou PDF.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button onClick={() => receivablesInputRef.current.click()} className="w-full" variant="outline" disabled={!currentCompany}>
                            <Paperclip className="mr-2 h-4 w-4" /> Anexar Arquivo (.csv ou .pdf)
                        </Button>
                        {selectedFiles.receivables && (
                            <div className="text-sm text-gray-600 flex items-center justify-between p-2 bg-gray-100 rounded-md">
                                <span className="truncate">{selectedFiles.receivables.name}</span>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedFiles(p => ({...p, receivables: null}))}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                        <Button
                            onClick={() => handleImport('receivables')}
                            className="w-full bg-green-600 hover:bg-green-700"
                            disabled={!currentCompany || !selectedFiles.receivables || importStatus.receivables?.status === 'loading'}
                        >
                            {importStatus.receivables?.status === 'loading' ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Upload className="mr-2 h-4 w-4" />
                            )}
                            Importar Contas a Receber
                        </Button>
                        {importStatus.receivables && (
                            <div className={`mt-2 flex items-center text-sm ${importStatus.receivables.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                {getStatusIcon(importStatus.receivables.status)}
                                <span className="ml-2">{importStatus.receivables.message}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {overallStatus && (
                <Alert className={`mt-8 max-w-xl mx-auto ${overallStatus === 'success' ? 'border-green-200 bg-green-50' : overallStatus === 'error' ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'}`}>
                    <AlertDescription className={`flex items-center gap-2 ${overallStatus === 'success' ? 'text-green-700' : overallStatus === 'error' ? 'text-red-700' : 'text-blue-700'}`}>
                        {overallStatus === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
                        {overallStatus === 'success' && <CheckCircle className="w-4 h-4" />}
                        {overallStatus === 'error' && <AlertTriangle className="w-4 h-4" />}
                        {overallMessage}
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}
