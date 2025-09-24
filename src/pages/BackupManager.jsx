import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HardDrive, Server, RefreshCw, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { testBackup } from '@/api/functions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCompany } from '@/components/common/CompanyContext';


export default function BackupManager() {
    const { currentCompany } = useCompany();
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState(null);
    const [testError, setTestError] = useState('');

    const handleTestBackup = async () => {
        setIsTesting(true);
        setTestResult(null);
        setTestError('');
        try {
            const { data, error } = await testBackup({ filial: currentCompany.code });
            if (error) {
                throw new Error(error.message || 'Erro desconhecido no backup.');
            }
            setTestResult(data);
        } catch (error) {
            console.error('Falha no teste de backup:', error);
            setTestError(error.message);
        } finally {
            setIsTesting(false);
        }
    };
    
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Gerenciador de Backups</h1>
                    <p className="text-slate-600">Monitore e gerencie os backups automáticos do sistema.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Server className="w-6 h-6 text-blue-600" />
                        <div>
                            <CardTitle>Backup Automático na Nuvem</CardTitle>
                            <CardDescription>O sistema realiza backups diários automaticamente às 02:00.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p>
                        Todos os dados são salvos de forma segura e podem ser restaurados pela equipe de suporte em caso de emergência.
                    </p>
                     <Button onClick={handleTestBackup} disabled={isTesting}>
                        {isTesting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Testando...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Testar Último Backup da Filial ({currentCompany.name})
                            </>
                        )}
                    </Button>

                    {testResult && (
                         <Alert className="bg-green-50 border-green-200">
                             <CheckCircle className="h-4 w-4 text-green-700" />
                             <AlertDescription className="text-green-800">
                                 <p className="font-bold">Teste de Backup Concluído com Sucesso!</p>
                                 <p><strong>Horário do Backup:</strong> {new Date(testResult.timestamp).toLocaleString('pt-BR')}</p>
                                 <p><strong>Tamanho:</strong> {(testResult.size / 1024).toFixed(2)} KB</p>
                                 <p><strong>Arquivo:</strong> {testResult.fileName}</p>
                             </AlertDescription>
                         </Alert>
                    )}

                    {testError && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                <p className="font-bold">Falha no Teste de Backup</p>
                                <p>{testError}</p>
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>

             <Card className="border-yellow-400 bg-yellow-50">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="w-6 h-6 text-yellow-700" />
                        <CardTitle className="text-yellow-800">Restauração de Dados</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-yellow-900">
                        A restauração de um backup é um processo manual e deve ser solicitada diretamente à equipe de suporte da Andres Technologies.
                        Em caso de perda de dados ou necessidade de reverter o sistema para um ponto anterior, entre em contato conosco.
                    </p>
                </CardContent>
            </Card>

        </div>
    );
}