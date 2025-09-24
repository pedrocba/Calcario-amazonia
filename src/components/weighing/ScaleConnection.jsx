import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

export default function ScaleConnection() {

  return (
    <div className="space-y-6">
       <Card className="bg-white/70 backdrop-blur border-0 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle>Monitor e Configuração da Balança</CardTitle>
             <CardDescription>
                A configuração e o monitoramento da balança agora são feitos através de um programa local.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
             <p className="text-slate-600">
                Para conectar, desconectar ou alterar as configurações da porta serial da sua balança, por favor, utilize o programa "ponte" que está em execução no seu computador local.
            </p>
             <p className="text-slate-600">
                Se você precisa de ajuda para configurar este programa, acesse a página de configuração.
            </p>
             <Button asChild>
                <Link to={createPageUrl('ScaleSettings')}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Ir para Configuração da Balança
                </Link>
            </Button>
          </CardContent>
        </Card>
    </div>
  );
}