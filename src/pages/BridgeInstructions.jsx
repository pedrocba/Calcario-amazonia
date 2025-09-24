import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Download, CheckCircle, Terminal, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function BridgeInstructions() {
  const handleDownloadPython = () => {
    window.open('https://www.python.org/downloads/windows/', '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Instalação da Ponte da Balança - Guia Completo</h1>
          <p className="text-slate-600">Siga este guia passo a passo para configurar a comunicação com a balança WT3000-i</p>
        </div>

        {/* Erro Comum */}
        <Card className="mb-8 border-l-4 border-red-500 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-red-800">
              <AlertTriangle className="w-6 h-6" />
              Erro Comum: 'pip' não é reconhecido
            </CardTitle>
          </CardHeader>
          <CardContent className="text-red-700">
            <p className="mb-2">Se você está vendo este erro:</p>
            <div className="bg-red-100 p-3 rounded font-mono text-sm mb-4">
              'pip' não é reconhecido como um comando interno ou externo, um programa operável ou um arquivo em lotes.
            </div>
            <p className="font-semibold">Isso significa que o Python não está instalado corretamente ou não está no PATH do Windows.</p>
            <p>Siga as instruções abaixo para resolver.</p>
          </CardContent>
        </Card>

        {/* Passo 1: Instalar Python */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold">1</span>
              Instalar o Python Corretamente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">1.1 - Baixar o Python</h4>
              <Button onClick={handleDownloadPython} className="bg-blue-600 hover:bg-blue-700 mb-4">
                <ExternalLink className="w-4 h-4 mr-2" />
                Baixar Python do Site Oficial
              </Button>
              <p className="text-sm text-slate-600">Clique no botão acima ou vá para: https://www.python.org/downloads/windows/</p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">1.2 - Instalar com a Opção Correta</h4>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-1" />
                  <div>
                    <p className="font-semibold text-amber-800 mb-2">IMPORTANTE:</p>
                    <p className="text-amber-700 mb-3">Na primeira tela do instalador do Python, você DEVE marcar a opção:</p>
                    <div className="bg-white border-2 border-amber-300 rounded p-3 mb-3">
                      <Badge className="bg-green-600 text-white">☑️ Add Python to PATH</Badge>
                    </div>
                    <p className="text-amber-700">Depois clique em "Install Now". Se você não marcar essa opção, o comando 'pip' não funcionará.</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">1.3 - Verificar se Funcionou</h4>
              <p className="mb-3">Depois da instalação:</p>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Feche qualquer terminal que esteja aberto</li>
                <li>Abra um NOVO prompt de comando (digite "cmd" no menu Iniciar)</li>
                <li>Digite o comando: <code className="bg-slate-100 px-2 py-1 rounded">python --version</code></li>
                <li>Deve aparecer algo como: "Python 3.12.x"</li>
                <li>Digite o comando: <code className="bg-slate-100 px-2 py-1 rounded">pip --version</code></li>
                <li>Deve aparecer a versão do pip</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Passo 2: Instalar Dependências */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold">2</span>
              Instalar as Dependências
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Com o Python funcionando, execute este comando no prompt de comando:</p>
            <div className="bg-slate-100 p-4 rounded-lg font-mono">
              pip install Flask Flask-Cors pyserial
            </div>
            <p className="text-sm text-slate-600 mt-2">Este comando instalará as bibliotecas necessárias para comunicação com a balança.</p>
          </CardContent>
        </Card>

        {/* Passo 3: Baixar e Configurar */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold">3</span>
              Baixar e Configurar a Ponte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Agora vá para a página "Configurar Balança" no menu do sistema para:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Baixar o arquivo <code>balanca_bridge.py</code></li>
              <li>Configurar a porta serial correta (ex: COM3, COM4)</li>
              <li>Executar o programa ponte</li>
            </ul>
          </CardContent>
        </Card>

        {/* Solução de Problemas */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              Solução de Problemas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold">Se ainda aparecer "'pip' não é reconhecido":</h4>
              <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                <li>Desinstale o Python pelo Painel de Controle</li>
                <li>Reinicie o computador</li>
                <li>Reinstale o Python marcando "Add Python to PATH"</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold">Se o comando pip funcionar mas der erro de "access denied":</h4>
              <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                <li>Abra o prompt de comando como Administrador</li>
                <li>Clique com botão direito no "Prompt de Comando" e escolha "Executar como administrador"</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold">Para verificar qual porta COM a balança está usando:</h4>
              <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                <li>Vá em "Gerenciador de Dispositivos" no Windows</li>
                <li>Procure por "Portas (COM e LPT)"</li>
                <li>A balança aparecerá como algo como "USB Serial Port (COM3)"</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card className="border-l-4 border-green-500 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-800">Quando tudo estiver funcionando:</p>
                <p className="text-green-700">Você verá o status "Balança Conectada" na página de Pesagem do sistema.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}