import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, CheckCircle, Loader2 } from 'lucide-react';

const BranchSwitcherModal = ({ isOpen, onClose, onSelectBranch }) => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);

  // Dados de exemplo (mock data) para as filiais
  const mockBranches = [
    { id: 1, name: 'CBA - Santarém (Matriz)', city: 'Santarém', state: 'PA', type: 'matriz' },
    { id: 2, name: 'Loja do Sertanejo', city: 'Santarém', state: 'PA', type: 'loja' },
    { id: 3, name: 'Mucajai - Roraima (Filial)', city: 'Mucajai', state: 'RR', type: 'filial' },
    { id: 4, name: 'Fazenda Norte', city: 'Manaus', state: 'AM', type: 'fazenda' },
    { id: 5, name: 'Depósito Central', city: 'Belém', state: 'PA', type: 'deposito' }
  ];

  useEffect(() => {
    if (isOpen) {
      loadBranches();
    }
  }, [isOpen]);

  const loadBranches = async () => {
    setLoading(true);
    try {
      // Simular chamada de API com delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setBranches(mockBranches);
    } catch (error) {
      console.error('Erro ao carregar filiais:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBranchSelect = (branch) => {
    setSelectedBranch(branch);
  };

  const handleConfirm = () => {
    if (selectedBranch) {
      onSelectBranch(selectedBranch);
      setSelectedBranch(null);
    }
  };

  const getBranchIcon = (type) => {
    switch (type) {
      case 'matriz':
        return '🏢';
      case 'loja':
        return '🏪';
      case 'filial':
        return '🏬';
      case 'fazenda':
        return '🚜';
      case 'deposito':
        return '📦';
      default:
        return '🏢';
    }
  };

  const getBranchColor = (type) => {
    switch (type) {
      case 'matriz':
        return 'border-blue-500 bg-blue-50';
      case 'loja':
        return 'border-green-500 bg-green-50';
      case 'filial':
        return 'border-purple-500 bg-purple-50';
      case 'fazenda':
        return 'border-orange-500 bg-orange-50';
      case 'deposito':
        return 'border-gray-500 bg-gray-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-6">
            Selecionar Filial
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-sm text-gray-600">Carregando filiais...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {branches.map((branch) => (
                <Card
                  key={branch.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedBranch?.id === branch.id
                      ? 'ring-2 ring-blue-500 bg-blue-50'
                      : 'hover:shadow-lg'
                  }`}
                  onClick={() => handleBranchSelect(branch)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">
                        {getBranchIcon(branch.type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900">
                          {branch.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {branch.city}, {branch.state}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            branch.type === 'matriz' ? 'bg-blue-100 text-blue-800' :
                            branch.type === 'loja' ? 'bg-green-100 text-green-800' :
                            branch.type === 'filial' ? 'bg-purple-100 text-purple-800' :
                            branch.type === 'fazenda' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {branch.type.charAt(0).toUpperCase() + branch.type.slice(1)}
                          </span>
                        </div>
                      </div>
                      {selectedBranch?.id === branch.id && (
                        <CheckCircle className="w-6 h-6 text-blue-600" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {branches.length === 0 && !loading && (
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma filial disponível
                </h3>
                <p className="text-gray-500">
                  Não foi possível carregar a lista de filiais.
                </p>
              </div>
            )}

            {selectedBranch && (
              <div className="flex justify-center pt-6 border-t">
                <Button
                  onClick={handleConfirm}
                  className="px-8 py-3 text-lg bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  Acessar {selectedBranch.name}
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BranchSwitcherModal;












