
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lightbulb, Terminal, AlertTriangle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

const pythonScriptCode = `
# balanca_bridge.py
# Este script cria uma ponte entre a balança USB e o sistema web.
# Ele precisa ser executado no computador onde a balança está conectada.
#
# Instalação (execute no terminal/cmd):
# pip install Flask Flask-Cors pyserial

from flask import Flask, jsonify, request
from flask_cors import CORS
import serial
import serial.tools.list_ports
import time

app = Flask(__name__)
# Permite que o sistema web acesse este servidor local
CORS(app, resources={r"/*": {"origins": "*"}})

# --- CONFIGURAÇÕES ---
# Altere a porta se necessário (ex: 'COM4' no Windows, '/dev/ttyUSB0' no Linux)
SERIAL_PORT = 'COM3' 
BAUD_RATE = 9600
# ---------------------

def get_scale_connection():
    """Tenta conectar na porta serial e retorna o objeto da conexão."""
    try:
        ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=2)
        # Aguarda um pouco para a conexão estabilizar
        time.sleep(1.5) 
        return ser
    except serial.SerialException as e:
        print(f"Erro ao conectar na porta {SERIAL_PORT}: {e}")
        return None

@app.route('/status', methods=['GET'])
def get_status():
    """Verifica se a ponte e a balança estão online."""
    ser = get_scale_connection()
    if ser:
        ser.close()
        return jsonify({"success": True, "message": "Ponte da balança online e conectada.", "port": SERIAL_PORT})
    else:
        return jsonify({"success": False, "error": "Balança não encontrada na porta " + SERIAL_PORT, "port": SERIAL_PORT}), 503

@app.route('/ports', methods=['GET'])
def list_ports():
    """Lista todas as portas seriais disponíveis no computador."""
    try:
        ports = serial.tools.list_ports.comports()
        available_ports = [
            {"device": port.device, "description": port.description} for port in ports
        ]
        return jsonify({"success": True, "ports": available_ports})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/read', methods=['GET'])
def read_weight():
    """Lê o peso atual da balança."""
    ser = get_scale_connection()
    if not ser:
        return jsonify({"success": False, "error": "Balança desconectada"}), 503
    
    try:
        ser.flushInput()
        # O comando de leitura pode variar. Use 'P\\r\\n' ou o comando correto do seu manual.
        ser.write(b'P\\r\\n') 
        raw_data = ser.readline().decode('utf-8').strip()
        ser.close()
        
        # Limpa a resposta para obter apenas os números
        weight = ''.join(filter(lambda x: x.isdigit() or x == '.', raw_data))
        
        return jsonify({"success": True, "weight": float(weight) if weight else 0, "raw": raw_data})
    except Exception as e:
        if ser and ser.is_open:
            ser.close()
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    print("--- Servidor da Ponte da Balança ---")
    print(f"Tentando usar a porta serial: {SERIAL_PORT}")
    print("Acesse o sistema no navegador para começar a pesagem.")
    print("Este terminal precisa permanecer aberto durante o uso da balança.")
    # Executa o servidor na porta 9001, acessível apenas localmente
    app.run(host='127.0.0.1', port=9001)

`;

const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([pythonScriptCode], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "balanca_bridge.py";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

export default function ScaleSettings() {
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="border-l-4 border-blue-600">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <Terminal className="w-8 h-8 text-blue-600" />
              Configuração da Balança Local (USB)
            </CardTitle>
            <CardDescription className="text-base">
              Para o sistema web se comunicar com sua balança USB, um pequeno programa (ponte) precisa ser executado no computador local.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-2">Passo 1: Pré-requisitos</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                <li>Python 3.7 ou superior instalado no computador</li>
                <li>Balança WT3000-i conectada via USB</li>
                <li>Drivers da balança instalados e funcionando</li>
                <li>Identificar a porta COM correta (ex: COM3, COM4)</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Passo 2: Baixar o Programa Ponte</h3>
              <p className="text-sm text-slate-600 mb-4">
                Clique no botão abaixo para baixar o arquivo "balanca_bridge.py":
              </p>
              <Button onClick={handleDownload} className="bg-green-600 hover:bg-green-700">
                <Download className="w-4 h-4 mr-2" />
                Baixar balanca_bridge.py
              </Button>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Passo 3: Instalação</h3>
              <div className="bg-slate-100 p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">Execute no terminal/prompt de comando:</p>
                <code className="bg-slate-800 text-green-400 p-2 rounded block text-sm">
                  pip install Flask Flask-Cors pyserial
                </code>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Passo 4: Configuração</h3>
              <p className="text-sm text-slate-600 mb-2">
                Antes de executar, abra o arquivo "balanca_bridge.py" em um editor de texto e ajuste a linha:
              </p>
              <code className="bg-slate-100 p-2 rounded block text-sm mb-2">
                SERIAL_PORT = 'COM3'  {/* Altere para a porta correta */}
              </code>
              <p className="text-xs text-slate-500">
                * No Windows: COM1, COM2, COM3, etc.<br/>
                * No Linux: /dev/ttyUSB0, /dev/ttyACM0, etc.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Passo 5: Execução</h3>
              <div className="bg-slate-100 p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">Execute o programa:</p>
                <code className="bg-slate-800 text-green-400 p-2 rounded block text-sm">
                  python balanca_bridge.py
                </code>
              </div>
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Importante:</p>
                    <p className="text-sm text-amber-700">
                      Mantenha este terminal aberto durante toda a operação da balança. 
                      Fechar o terminal interromperá a comunicação.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Passo 6: Verificação</h3>
              <p className="text-sm text-slate-600">
                Se tudo estiver correto, você verá esta mensagem no terminal:
              </p>
              <div className="bg-slate-800 text-green-400 p-3 rounded-lg text-xs font-mono mt-2">
                --- Servidor da Ponte da Balança ---<br/>
                Tentando usar a porta serial: COM3<br/>
                Acesse o sistema no navegador para começar a pesagem.<br/>
                Este terminal precisa permanecer aberto durante o uso da balança.<br/>
                * Running on http://127.0.0.1:9001
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Solução de Problemas</h3>
              <div className="space-y-3">
                <details className="bg-slate-50 p-3 rounded-lg">
                  <summary className="font-medium cursor-pointer">Erro: "Port already in use"</summary>
                  <p className="text-sm text-slate-600 mt-2">
                    Outro programa está usando a porta. Feche outros softwares da balança ou reinicie o computador.
                  </p>
                </details>
                <details className="bg-slate-50 p-3 rounded-lg">
                  <summary className="font-medium cursor-pointer">Erro: "Permission denied"</summary>
                  <p className="text-sm text-slate-600 mt-2">
                    Execute o terminal como administrador (Windows) ou use sudo (Linux).
                  </p>
                </details>
                <details className="bg-slate-50 p-3 rounded-lg">
                  <summary className="font-medium cursor-pointer">Balança não responde</summary>
                  <p className="text-sm text-slate-600 mt-2">
                    Verifique se a porta COM está correta, se os drivers estão instalados e se a balança está ligada.
                  </p>
                </details>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Dica:</p>
                  <p className="text-sm text-blue-700">
                    Após iniciar o programa ponte, vá para a página "Pesagem" no sistema para testar a conexão.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
