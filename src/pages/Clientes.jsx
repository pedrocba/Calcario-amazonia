
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, User as UserIcon, Search, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomerForm from '../components/customers/CustomerForm';
import CustomerList from '../components/customers/CustomerList';
import CustomerSearchModal from '../components/customers/CustomerSearchModal';
import { useCompany } from '../components/common/CompanyContext';
import { supabase } from '../lib/supabaseClient';

export default function ClientesPage() {
    const { currentCompany } = useCompany();
    const [customers, setCustomers] = useState([]);
    const [sales, setSales] = useState([]);
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isImporting, setIsImporting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const fileInputRef = useRef(null);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const user = await User.me();
                setCurrentUser(user);
            } catch(e) { 
                console.error("Erro ao buscar usuário:", e); 
            }
        };
        fetchUser();
    }, []);

    const loadData = useCallback(async () => {
        if (!currentCompany) return;
        setIsLoading(true);
        try {
            console.log(`🔍 CARREGANDO CLIENTES DA FILIAL: ${currentCompany.name} (ID: ${currentCompany.id})`);
            
            // Buscar clientes
            const { data: customersData, error: customersError } = await supabase
                .from('contacts')
                .select('*')
                .eq('company_id', currentCompany.id)
                .eq('type', 'cliente')
                .eq('active', true)
                .order('created_at', { ascending: false });

            if (customersError) throw customersError;

            // Buscar vendas
            const { data: salesData, error: salesError } = await supabase
                .from('vendas')
                .select('*')
                .eq('company_id', currentCompany.id);

            if (salesError) {
                console.warn('Erro ao carregar vendas:', salesError);
            }

            // Buscar itens de venda
            const { data: itemsData, error: itemsError } = await supabase
                .from('itens_venda')
                .select('*');

            if (itemsError) {
                console.warn('Erro ao carregar itens de venda:', itemsError);
            }

            console.log(`📊 RESULTADO DA BUSCA:`);
            console.log(`- Total de clientes encontrados: ${customersData?.length || 0}`);

            setCustomers(customersData || []);
            setSales(salesData || []);
            setItems(itemsData || []);

            console.log(`✅ CLIENTES DEFINIDOS NO STATE: ${customersData?.length || 0}`);

        } catch (error) {
            console.error("❌ ERRO ao carregar dados dos clientes:", error);
        }
        setIsLoading(false);
    }, [currentCompany]);

    useEffect(() => {
        if (currentCompany) {
            loadData();
        } else {
            setIsLoading(false);
            setCustomers([]);
        }
    }, [currentCompany, loadData]);

    const filteredCustomers = useMemo(() => {
        return customers.filter(customer =>
            customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (customer.document && customer.document.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [customers, searchTerm]);

    const handleImportClick = () => {
        fileInputRef.current.click();
    };

    const handleFileImport = async (event) => {
        alert("Funcionalidade de importação temporariamente desabilitada. Use o formulário para adicionar clientes individualmente.");
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (customerData) => {
        if (!currentCompany) {
            alert("Erro: Nenhuma filial selecionada.");
            return;
        }

        try {
            const dataToSave = { 
                ...customerData, 
                company_id: currentCompany.id,
                type: 'cliente',
                active: true
            };

            if (editingCustomer) {
                const { error } = await supabase
                    .from('contacts')
                    .update(dataToSave)
                    .eq('id', editingCustomer.id)
                    .eq('company_id', currentCompany.id);

                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('contacts')
                    .insert([dataToSave]);

                if (error) throw error;
            }

            setShowForm(false);
            setEditingCustomer(null);
            await loadData();
        } catch (error) {
            console.error("Erro ao salvar cliente:", error);
            alert("Falha ao salvar cliente. Verifique os dados e tente novamente.");
        }
    };

    const handleEdit = (customer) => {
        setEditingCustomer(customer);
        setShowForm(true);
    };

    const handleDelete = async (customer) => {
        if (confirm(`Tem certeza que deseja inativar o cliente "${customer.name}"?`)) {
            try {
                const { error } = await supabase
                    .from('contacts')
                    .update({ active: false })
                    .eq('id', customer.id)
                    .eq('company_id', currentCompany.id);

                if (error) throw error;

                await loadData();
            } catch (error) {
                console.error("Erro ao inativar cliente:", error);
                alert("Falha ao inativar cliente.");
            }
        }
    };

    if (!currentCompany) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <p className="text-xl text-slate-700">Por favor, selecione uma filial para gerenciar os clientes.</p>
          </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileImport}
                className="hidden"
                accept=".csv"
            />
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Gestão de Clientes</h1>
                        <p className="text-slate-600">Cadastre e gerencie os clientes da filial: <span className="font-semibold text-blue-700">{currentCompany.name}</span></p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowSearchModal(true)}
                        >
                            <Search className="w-4 h-4 mr-2" />
                            Buscar Cliente
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleImportClick}
                            disabled={isImporting}
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            {isImporting ? "Importando..." : "Importar CSV"}
                        </Button>
                        <Button onClick={() => { setEditingCustomer(null); setShowForm(true); }} className="bg-blue-600 hover:bg-blue-700 shadow-lg">
                            <Plus className="w-5 h-5 mr-2" />
                            Novo Cliente
                        </Button>
                    </div>
                </div>

                <AnimatePresence>
                    {showForm && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-8 overflow-hidden">
                            <CustomerForm
                                customer={editingCustomer}
                                onSubmit={handleSubmit}
                                onCancel={() => { setShowForm(false); setEditingCustomer(null); }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                <CustomerList
                    customers={filteredCustomers}
                    isLoading={isLoading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />

                <CustomerSearchModal
                    open={showSearchModal}
                    onOpenChange={setShowSearchModal}
                    customers={customers}
                    sales={sales}
                    items={items}
                />
            </div>
        </div>
    );
}
