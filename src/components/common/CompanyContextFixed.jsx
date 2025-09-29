import React, { createContext, useContext, useState } from 'react';

const CompanyContext = createContext(null);

export const useCompany = () => {
    const context = useContext(CompanyContext);
    if (!context) {
        throw new Error('useCompany must be used within a CompanyProvider');
    }
    return context;
};

export const CompanyProvider = ({ children }) => {
    // Empresa fixa para simplificar
    const currentCompany = {
        id: '68cacb91-3d16-9d19-1be6-c90d00000000',
        name: 'CBA - Santarém (Matriz)',
        code: 'CBA',
        type: 'matriz',
        active: true
    };

    // Dados mock estáticos
    const transactions = [
        { id: 1, type: 'receita', amount: 5000.00, status: 'pago', description: 'Venda de produtos', date: '2024-01-15T10:00:00Z', company_id: currentCompany.id },
        { id: 2, type: 'despesa', amount: 1200.00, status: 'pago', description: 'Compra de materiais', date: '2024-01-14T14:30:00Z', company_id: currentCompany.id },
        { id: 3, type: 'receita', amount: 3500.00, status: 'pendente', description: 'Serviços prestados', date: '2024-01-13T09:15:00Z', company_id: currentCompany.id },
        { id: 4, type: 'despesa', amount: 800.00, status: 'pendente', description: 'Manutenção de equipamentos', date: '2024-01-12T16:45:00Z', company_id: currentCompany.id }
    ];

    const accounts = [
        { id: 1, name: 'Conta Corrente', type: 'bank', balance: 15000.00, company_id: currentCompany.id },
        { id: 2, name: 'Caixa', type: 'cash', balance: 2500.00, company_id: currentCompany.id },
        { id: 3, name: 'Poupança', type: 'savings', balance: 50000.00, company_id: currentCompany.id }
    ];

    const contacts = [
        { id: 1, name: 'Fornecedor ABC', type: 'supplier', email: 'contato@abc.com', phone: '(11) 99999-9999', company_id: currentCompany.id },
        { id: 2, name: 'Cliente XYZ', type: 'customer', email: 'contato@xyz.com', phone: '(11) 88888-8888', company_id: currentCompany.id },
        { id: 3, name: 'Fornecedor DEF', type: 'supplier', email: 'contato@def.com', phone: '(11) 77777-7777', company_id: currentCompany.id }
    ];

    const value = {
        currentCompany,
        transactions,
        accounts,
        contacts,
        isLoading: false,
        refreshData: () => console.log('Refresh data called')
    };

    return (
        <CompanyContext.Provider value={value}>
            {children}
        </CompanyContext.Provider>
    );
};









