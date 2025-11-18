
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
import importService from '@/services/importService';
import { parseContactsCSV } from '@/utils/importParsers';
import { mapClientType, cleanDocument, formatPhone } from '@/data/clientesTemplate';

const CONTACT_IMPORT_BATCH_SIZE = 50;
const INACTIVE_FLAG_VALUES = new Set(['0', 'false', 'nao', 'não', 'inativo', 'inativado', 'desativado', 'desativo']);

const toNullableString = (value) => {
    if (value === undefined || value === null) {
        return null;
    }

    const text = value.toString().trim();
    return text.length > 0 ? text : null;
};

const pickFirstFilled = (...values) => {
    for (const value of values) {
        const parsed = toNullableString(value);
        if (parsed) {
            return parsed;
        }
    }

    return null;
};

const resolveActiveFlag = (value) => {
    if (value === undefined || value === null || value === '') {
        return true;
    }

    if (typeof value === 'boolean') {
        return value;
    }

    const normalized = value.toString().trim().toLowerCase();
    return !INACTIVE_FLAG_VALUES.has(normalized);
};

const resolveContactType = (row) => {
    const directType = toNullableString(row?.tipo);

    if (directType) {
        const normalized = directType.toLowerCase();

        if (['fornecedor', 'supplier'].includes(normalized)) {
            return 'fornecedor';
        }

        if (['funcionario', 'funcionário', 'colaborador'].includes(normalized)) {
            return 'funcionario';
        }

        if (['outro', 'outros', 'outros clientes'].includes(normalized)) {
            return 'outro';
        }

        if (['cliente', 'client'].includes(normalized)) {
            return 'cliente';
        }
    }

    return mapClientType(row?.tipo_lista_precos, row?.cnpj, row?.cpf) || 'cliente';
};

const resolveDocumentValue = (row) => {
    const document = pickFirstFilled(row?.documento, row?.cnpj, row?.cpf);

    if (!document) {
        return null;
    }

    const cleaned = cleanDocument(document);
    return cleaned || null;
};

const resolvePhoneValue = (row) => {
    const phone = pickFirstFilled(row?.telefone, row?.celular);

    if (!phone) {
        return null;
    }

    return formatPhone(phone);
};

const resolveAddressValue = (row) => {
    const composed = [row?.endereco, row?.numero, row?.complemento]
        .map((part) => toNullableString(part))
        .filter(Boolean);

    if (composed.length > 0) {
        return composed.join(', ');
    }

    return pickFirstFilled(row?.address, row?.logradouro);
};

const mapRowToContactPayload = (row, empresaId, timestamp) => {
    const name =
        pickFirstFilled(
            row?.nome,
            row?.nome_razao_social,
            row?.apelido_nome_fantasia,
            row?.cliente,
            row?.empresa
        ) || 'Cliente sem nome';

    const address = resolveAddressValue(row);

    return {
        name,
        email: toNullableString(row?.email),
        phone: resolvePhoneValue(row),
        document: resolveDocumentValue(row),
        type: resolveContactType(row),
        address: address ?? null,
        city: toNullableString(row?.cidade),
        state: toNullableString(row?.estado) || toNullableString(row?.uf),
        zip_code: toNullableString(row?.cep),
        active: resolveActiveFlag(row?.ativo ?? row?.status),
        empresa_id: empresaId,
        created_at: timestamp,
        updated_at: timestamp,
    };
};

const fallbackImportContacts = async (rows, empresaId) => {
    const timestamp = new Date().toISOString();
    const results = {
        total: rows.length,
        success: 0,
        errors: 0,
    };

    for (let index = 0; index < rows.length; index += CONTACT_IMPORT_BATCH_SIZE) {
        const batch = rows.slice(index, index + CONTACT_IMPORT_BATCH_SIZE);
        const payload = batch.map((row) => mapRowToContactPayload(row, empresaId, timestamp));

        const { data, error } = await supabase
            .from('contacts')
            .insert(payload)
            .select();

        if (error) {
            throw new Error(`Erro no lote ${Math.floor(index / CONTACT_IMPORT_BATCH_SIZE) + 1}: ${error.message}`);
        }

        results.success += data?.length || 0;
    }

    results.errors = Math.max(results.total - results.success, 0);

    return results;
};

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
                .eq('empresa_id', currentCompany.id)
                .eq('type', 'cliente')
                .eq('active', true)
                .order('created_at', { ascending: false });

            if (customersError) throw customersError;

            // Buscar vendas
            const { data: salesData, error: salesError } = await supabase
                .from('vendas')
                .select('*')
                .eq('empresa_id', currentCompany.id);

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
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        if (!currentCompany) {
            alert('Erro: selecione uma filial antes de importar clientes.');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            return;
        }

        setIsImporting(true);

        try {
            const text = await file.text();
            const parsedCustomers = parseContactsCSV(text);

            if (parsedCustomers.length === 0) {
                alert('Nenhum cliente válido encontrado no arquivo selecionado.');
                return;
            }

            const validationErrors = importService.validateData(parsedCustomers, 'contacts');

            if (validationErrors.length > 0) {
                const formatted = validationErrors
                    .slice(0, 5)
                    .map(error => `Linha ${error.row}: ${error.errors.join(', ')}`)
                    .join('\n');

                const suffix = validationErrors.length > 5 ? '\n... (corrija os demais registros e tente novamente)' : '';
                alert(`Erros de validação encontrados:\n${formatted}${suffix}`);
                return;
            }

            let results;
            let usedFallback = false;

            try {
                results = await importService.importContacts(parsedCustomers, currentCompany.id);
            } catch (serviceError) {
                const message = serviceError?.message?.toLowerCase?.() || '';
                const serviceDisabled = message.includes('desabil') || message.includes('disabled');

                if (!serviceDisabled) {
                    throw serviceError;
                }

                console.warn('Serviço de importação indisponível. Aplicando fallback direto no Supabase.', serviceError);
                usedFallback = true;
                results = await fallbackImportContacts(parsedCustomers, currentCompany.id);
            }

            await loadData();

            const total = results?.total ?? parsedCustomers.length;
            const success = results?.success ?? 0;
            const errorsCount = results?.errors ?? Math.max(total - success, 0);

            const summary = [
                `Clientes importados: ${success}/${total}`,
                errorsCount ? `Registros com erro: ${errorsCount}` : null,
                usedFallback ? 'Importação realizada no modo de compatibilidade.' : null
            ]
                .filter(Boolean)
                .join('\n');

            alert(`Importação concluída!\n${summary}`);
        } catch (error) {
            console.error('Erro ao importar clientes:', error);
            alert(`Falha ao importar clientes: ${error.message}`);
        } finally {
            setIsImporting(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
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
                empresa_id: currentCompany.id,
                type: 'cliente',
                active: true
            };

            if (editingCustomer) {
                const { error } = await supabase
                    .from('contacts')
                    .update(dataToSave)
                    .eq('id', editingCustomer.id)
                    .eq('empresa_id', currentCompany.id);

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
                    .eq('empresa_id', currentCompany.id);

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
