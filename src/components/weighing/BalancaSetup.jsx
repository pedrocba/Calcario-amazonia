import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wifi, WifiOff, Settings, TestTube, CheckCircle, AlertTriangle } from "lucide-react";

export default function BalancaSetup() {
  const [config, setConfig] = useState({
    ip: '192.168.1.100',
    port: '4001',
    timeout: '5000'
  });
  
  const [status, setStatus] = useState('desconectada');
  const [testing, setTesting] = useState(false);
  const [lastWeight, setLastWeight] = useState(null);

  const testarConexao = async () => {
    setTesting(true);
    try {
      const response = await fetch('/api/configurar_balanca', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStatus('conectada');
        setLastWeight(data.peso);
      } else {
        setStatus('erro');
        console.error('Erro:', data.error);
      }
    } catch (error) {
      setStatus('erro');
      console.error('Erro de conexão:', error);
    }
    setTesting(false);
  };

  const getStatusColor = () => {
    switch(status) {
      case 'conectada': return 'bg-green-100 text-green-800 border-green-200';
      case 'erro': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = () => {
    switch(status) {
      case 'conectada': return <CheckCircle className="w-4 h-4" />;
      case 'erro': return <AlertTriangle className="w-4 h-4" />;
      default: return <WifiOff className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-blue-600" />
            Configuração da Balança WT3000-i
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="ip">Endereço IP</Label>
              <Input 
                id="ip"
                value={config.ip}
                onChange={(e) => setConfig(prev => ({...prev, ip: e.target.value}))}
                placeholder="192.168.1.100"
              />
            </div>
            <div>
              <Label htmlFor="port">Porta</Label>
              <Input 
                id="port"
                value={config.port}
                onChange={(e) => setConfig(prev => ({...prev, port: e.target.value}))}
                placeholder="4001"
              />
            </div>
            <div>
              <Label htmlFor="timeout">Timeout (ms)</Label>
              <Input 
                id="timeout"
                value={config.timeout}
                onChange={(e) => setConfig(prev => ({...prev, timeout: e.target.value}))}
                placeholder="5000"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <h4 className="font-medium">Status da Conexão</h4>
              <p className="text-sm text-slate-600">
                {status === 'conectada' ? 'Balança conectada e funcionando' : 
                 status === 'erro' ? 'Erro de comunicação' : 'Aguardando teste'}
              </p>
            </div>
            <Badge variant="outline" className={getStatusColor()}>
              {getStatusIcon()}
              <span className="ml-2 capitalize">{status}</span>
            </Badge>
          </div>

          <Button 
            onClick={testarConexao}
            disabled={testing}
            className="w-full"
          >
            <TestTube className="w-4 h-4 mr-2" />
            {testing ? 'Testando...' : 'Testar Conexão'}
          </Button>

          {lastWeight !== null && (
            <Alert>
              <CheckCircle className="w-4 h-4" />
              <AlertDescription>
                <strong>Último peso lido:</strong> {(lastWeight / 1000).toFixed(3)} toneladas
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
        <CardHeader>
          <CardTitle>📋 Instruções de Configuração</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">1. Configurar a Balança WT3000-i:</h4>
              <ul className="list-disc list-inside space-y-1 text-slate-600">
                <li>Acesse o menu de configuração da balança</li>
                <li>Configure o IP: 192.168.1.100</li>
                <li>Configure a Porta: 4001</li>
                <li>Protocolo: TCP/IP</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">2. Conexão de Rede:</h4>
              <ul className="list-disc list-inside space-y-1 text-slate-600">
                <li>Conecte a balança na mesma rede do computador</li>
                <li>Verifique se o IP está na mesma faixa (ex: 192.168.1.x)</li>
                <li>Teste o ping: <code>ping 192.168.1.100</code></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">3. Firewall:</h4>
              <ul className="list-disc list-inside space-y-1 text-slate-600">
                <li>Libere a porta 4001 no firewall</li>
                <li>Permita comunicação TCP/IP na rede local</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}