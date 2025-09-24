
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, MapPin, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import supabase from '@/lib/supabaseClient';

const FILIAIS_CORRETAS = [
    {
        name: "CBA - Santarém (Matriz)",
        code: "CBA",
        full_name: "CBA - Santarém",
        city: "Santarém",
        state: "PA",
        type: "matriz",
        active: true,
        database_config: { database_prefix: "cba" }
    },
    {
        name: "Mucajaí - Roraima (Filial)",
        code: "MUCAJAI",
        full_name: "Mucajaí - Roraima",
        city: "Mucajaí",
        state: "RR",
        type: "filial",
        active: true,
        database_config: { database_prefix: "mucajai" }
    },
    {
        name: "Loja do Sertanejo - Santarém",
        code: "SERTANEJO",
        full_name: "Loja do Sertanejo - Santarém",
        city: "Santarém",
        state: "PA",
        type: "filial",
        active: true,
        database_config: { database_prefix: "sertanejo" }
    }
];

export default function CompanySelector({ onCompanySelect, currentUser }) {
    const [companies, setCompanies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadCompanies = async () => {
            setIsLoading(true);
            
            try {
                console.log('🔍 Carregando empresas do Supabase...');
                
                // Buscar empresas do Supabase
                const { data: companiesData, error } = await supabase
                    .from('companies')
                    .select('*')
                    .eq('active', true)
                    .order('name');
                
                if (error) {
                    console.error('❌ Erro ao carregar empresas:', error);
                    throw error;
                }
                
                console.log('✅ Empresas carregadas:', companiesData);
                setCompanies(companiesData || []);
                
            } catch (error) {
                console.error("❌ Erro ao carregar empresas:", error);
                setCompanies([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadCompanies();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
                <div className="text-center">
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full mx-auto mb-4"
                    />
                    <p className="text-white/80 text-lg">Aplicando correção permanente...</p>
                    <p className="text-white/60 text-sm mt-2">Esta operação garante que o problema nunca mais aconteça</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background decorativo */}
            <div className="absolute inset-0">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-5xl w-full relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-12"
                >
                    <div className="w-20 h-20 bg-white/10 backdrop-blur-lg rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl border border-white/20">
                        <img 
                            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/73861b5e8_ANDRESTECHPRINCIPAL.png" 
                            alt="Andres Technologies" 
                            className="w-14 h-14 object-contain"
                        />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-3 flex items-center justify-center gap-3">
                        <Sparkles className="w-8 h-8 text-yellow-400" />
                        Andres One
                        <Sparkles className="w-8 h-8 text-yellow-400" />
                    </h1>
                    <p className="text-white/80 text-lg mb-2">Plataforma Integrada de Gestão</p>
                    <p className="text-white/60">Selecione a filial para acessar</p>
                    {currentUser && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="mt-4 px-6 py-3 bg-white/10 backdrop-blur-lg rounded-full border border-white/20 inline-block"
                        >
                            <p className="text-white/90 text-sm">
                                Bem-vindo(a), <span className="font-semibold text-yellow-300">{currentUser.full_name}</span>
                            </p>
                        </motion.div>
                    )}
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {companies.map((company, index) => (
                        <motion.div
                            key={company.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.2, duration: 0.6 }}
                            whileHover={{ scale: 1.05, y: -5 }}
                        >
                            <Card 
                                className="cursor-pointer hover:shadow-2xl transition-all duration-500 bg-white/10 backdrop-blur-lg border border-white/20 hover:border-white/40 rounded-2xl overflow-hidden group"
                                onClick={() => onCompanySelect(company)}
                            >
                                <CardHeader className="text-center pb-4 relative">
                                    {/* Gradiente sutil no header */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-t-2xl"></div>
                                    
                                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 relative z-10">
                                        <Building2 className="w-8 h-8 text-white" />
                                    </div>
                                    <CardTitle className="text-xl font-bold text-white relative z-10">
                                        {company.name}
                                    </CardTitle>
                                    {company.full_name && company.full_name !== company.name && (
                                        <p className="text-sm text-white/70 relative z-10">{company.full_name}</p>
                                    )}
                                </CardHeader>
                                <CardContent className="text-center">
                                    <div className="flex items-center justify-center gap-2 text-white/70 mb-6">
                                        <MapPin className="w-4 h-4" />
                                        <span className="text-sm">
                                            {company.city}{company.state ? `, ${company.state}` : ''}
                                        </span>
                                    </div>
                                    <Button 
                                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 rounded-xl font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-300 border-0"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onCompanySelect(company);
                                        }}
                                    >
                                        Acessar Filial
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-center mt-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-lg rounded-full border border-white/10">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <p className="text-xs text-white/60">
                            Sistema corrige automaticamente filiais duplicadas
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
