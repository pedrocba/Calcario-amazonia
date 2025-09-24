
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function RequisicaoTicket({ requisicao, items, products }) {
    if (!requisicao) return null;

    const formatDateTime = (dateStr) => {
        if (!dateStr) return 'N/A';
        return format(new Date(dateStr), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    };

    // Helper function for general date formatting (e.g., solicitation date)
    const formatShortDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return format(new Date(dateStr), "dd/MM/yyyy", { locale: ptBR });
    };

    // Helper function specifically for 'data_devolucao_prevista'
    // Preserves the original logic of adding one day, which might be
    // specific to how return dates are calculated or displayed.
    const formatExpectedReturnDate = (dateStr) => {
        if (!dateStr) return '--';
        const date = new Date(dateStr);
        date.setDate(date.getDate() + 1); // Logic preserved from original formatDate
        return format(date, "dd/MM/yyyy", { locale: ptBR });
    };

    const localUsoMapping = {
        'moinho': 'Moinho',
        'britador': 'Britador',
        'rebritador': 'Rebritador',
        'oficina': 'Oficina',
        'administracao': 'Administração',
        'campo': 'Campo',
        'transporte': 'Transporte',
        'lavra': 'Lavra',
        'beneficiamento': 'Beneficiamento',
        'outros': 'Outros'
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'pending': return 'Pendente';
            case 'approved': return 'Aprovado';
            case 'rejected': return 'Rejeitado';
            case 'completed': return 'Concluído';
            case 'cancelled': return 'Cancelado';
            case 'partially_attended': return 'Atendida Parcialmente'; // Example, add more as needed
            default: return status ? status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ') : 'N/A';
        }
    };

    return (
        <div className="font-mono text-xs bg-white p-2 font-bold" style={{ width: '80mm' }}>
            <div className="text-center border-b-2 border-black pb-4 mb-6">
                <h1 className="font-extrabold text-sm">CBA MINERAÇÃO</h1>
                <p className="font-extrabold text-xs">TERMO DE RESPONSABILIDADE DE RETIRADA</p>
                <h3 className="font-extrabold text-xs">REQUISIÇÃO DE MATERIAIS Nº {requisicao.numero_requisicao}</h3>
            </div>

            <div className="text-xs">
                <p className="mb-0"><strong>SOLICITANTE:</strong> {requisicao.solicitante_nome}</p>
                <p className="mb-0"><strong>SETOR:</strong> {requisicao.setor === 'santarem' ? 'Santarém (Matriz)' : 'Fazenda (Filial)'}</p>
                <p className="mb-0"><strong>LOCAL DE USO:</strong> {localUsoMapping[requisicao.local_uso] || requisicao.local_uso}</p>
                <p className="mb-0"><strong>DATA SOLICITAÇÃO:</strong> {formatShortDate(requisicao.data_solicitacao)}</p>
                <p className="mb-0"><strong>STATUS:</strong> {getStatusLabel(requisicao.status)}</p>
                <p className="mb-0"><strong>TOTAL DE ITENS:</strong> {items.length}</p>
            </div>

            <div className="my-1 text-center">----------------------------------------</div>
            <p className="font-extrabold">ITENS RETIRADOS</p>
            <div className="my-1 text-center">----------------------------------------</div>
            
            <table className="w-full text-xs">
                <thead>
                    <tr>
                        <th className="text-left">QTD</th>
                        <th className="text-left">DESCRIÇÃO</th>
                        <th className="text-right">DEV. PREV.</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map(item => {
                        const product = products.find(p => p.id === item.produto_id);
                        return (
                            <tr key={item.id}>
                                <td className="text-left">
                                    {item.quantidade_atendida}
                                    {/* NOVO: Indicador de fracionado no ticket */}
                                    {item.eh_fracionado && <span className="text-xs"> F</span>}
                                </td>
                                <td className="text-left">
                                    {product?.name || 'Produto não encontrado'}
                                    {/* NOVO: Mostrar dados de manutenção no ticket */}
                                    {item.veiculo_nome && (
                                        <div className="text-xs">VEI: {item.veiculo_nome}</div>
                                    )}
                                </td>
                                <td className="text-right">{item.data_devolucao_prevista ? formatExpectedReturnDate(item.data_devolucao_prevista) : '--'}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            
            <div className="my-1 text-center">----------------------------------------</div>
            <p className="text-xs leading-tight my-2">
                Declaro que recebi os itens acima em perfeitas condições de uso e me responsabilizo pela sua guarda, bom uso e devolução na data prevista (quando aplicável).
            </p>
            {/* NOVO: Legenda para fracionado */}
            <p className="text-xs">F = Fracionado (parte do recipiente)</p>
            <div className="mt-8 mb-4">
                <div className="border-b border-black border-dotted w-full"></div>
                <p className="text-center text-xs mt-1">{requisicao.solicitante_nome}</p>
                <p className="text-center text-xs mt-0">(Assinatura do Solicitante)</p>
            </div>
            <p className="text-xs">Data da Retirada: ____/____/________</p>
        </div>
    );
}
