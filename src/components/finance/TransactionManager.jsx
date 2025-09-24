import React, { useState } from 'react';
import { FinancialTransaction } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';

export default function TransactionManager({ transactions, accounts, contacts, isLoading, refreshData }) {
    const [showForm, setShowForm] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);

    const handleFormSubmit = async (data) => {
        try {
            if (editingTransaction) {
                await FinancialTransaction.update(editingTransaction.id, data);
            } else {
                await FinancialTransaction.create(data);
            }
            setShowForm(false);
            setEditingTransaction(null);
            await refreshData();
        } catch (error) {
            console.error("Erro ao salvar transação:", error);
        }
    };
    
    const handleEdit = (transaction) => {
        setEditingTransaction(transaction);
        setShowForm(true);
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingTransaction(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <Button onClick={() => { setEditingTransaction(null); setShowForm(true); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Lançamento
                </Button>
            </div>
            
            {showForm && (
                <TransactionForm
                    transaction={editingTransaction}
                    accounts={accounts}
                    contacts={contacts}
                    onSubmit={handleFormSubmit}
                    onCancel={handleCancel}
                />
            )}

            <TransactionList
                transactions={transactions}
                accounts={accounts}
                contacts={contacts}
                isLoading={isLoading}
                onEdit={handleEdit}
                refreshData={refreshData}
            />
        </div>
    );
}