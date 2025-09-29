import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ShoppingCart } from 'lucide-react';
import { useCompany } from '../components/common/CompanyContext';
import { supabase } from '../lib/supabaseClient';

import NewSaleForm from '../components/sales/NewSaleForm';
import VendaList from '../components/vendas/VendaList';
import VendaStats from '../components/vendas/VendaStats';

export default function VendasPage() {
    const { currentCompany } = useCompany();
    const [vendas, setVendas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);

    useEffect(() => {
        if (currentCompany) {
            loadVendas();
        } else {
            setVendas([]);
            setIsLoading(false);
        }
    }, [currentCompany]);

    const loadVendas = async () => {
        if (!currentCompany) return;
        
        setIsLoading(true);
        try {
            console.log("Carregando vendas para empresa:", currentCompany.id);

            // Buscar vendas com dados do cliente
            const { data: vendasData, error: vendasError } = await supabase
                .from('vendas')
                .select(`
                    *,
                    client:contacts!client_id (
                        id,
                        name,
                        email,
                        phone
                    )
                `)
                .eq('empresa_id', currentCompany.id)
                .order('created_at', { ascending: false });

            if (vendasError) throw vendasError;

            setVendas(vendasData || []);
        } catch (error) {
            console.error("Erro ao carregar vendas:", error);
            alert("Erro ao carregar vendas: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewSaleSuccess = () => {
        setIsFormOpen(false);
        loadVendas(); // Recarregar a lista de vendas
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <ShoppingCart className="w-8 h-8 text-blue-600" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Vendas</h1>
                        <p className="text-gray-600">
                            Gerencie as vendas da filial: <span className="font-semibold text-blue-600">{currentCompany?.name}</span>
                        </p>
                    </div>
                </div>
                <Button 
                    onClick={() => setIsFormOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Nova Venda
                </Button>
            </div>

            {/* Estatísticas */}
            <VendaStats vendas={vendas} isLoading={isLoading} />

            {/* Lista de Vendas */}
            <VendaList 
                vendas={vendas} 
                isLoading={isLoading}
                onRefresh={loadVendas}
            />

            {/* Modal do Formulário de Nova Venda */}
            {isFormOpen && (
                <NewSaleForm
                    onClose={() => setIsFormOpen(false)}
                    onSaveSuccess={handleNewSaleSuccess}
                />
            )}
        </div>
    );
}