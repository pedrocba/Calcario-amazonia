import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ComprovanteVenda({ venda, items, cliente }) {
    const formatCurrency = (value) => (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    
    return (
        <div className="w-full max-w-4xl mx-auto bg-white">
            {/* Documento A4 completo */}
            <div className="min-h-[297mm] w-[210mm] mx-auto bg-white p-8 text-black">
                {/* Cabeçalho da empresa */}
                <div className="text-center mb-8 border-b-2 border-black pb-4">
                    <h1 className="text-2xl font-bold">CBA MINERAÇÃO</h1>
                    <div className="text-sm mt-2">
                        ENDEREÇO BR 230, VICINAL 60 MARGEM DIREITA DO RIO TAPAJÓS,S/N - ZONA RURAL S18<br/>
                        SANTARÉM-PA<br/>
                        FONE: 93992415271 EMAIL: CBAMTR128@GMAIL.COM
                    </div>
                </div>

                {/* Informações do pedido */}
                <div className="mb-6">
                    <table className="w-full text-sm">
                        <tbody>
                            <tr>
                                <td className="border border-black px-2 py-1 bg-gray-100 font-semibold w-20">PEDIDO:</td>
                                <td className="border border-black px-2 py-1 w-20">{venda.id.slice(0, 8)}</td>
                                <td className="w-20"></td>
                                <td className="border border-black px-2 py-1 bg-gray-100 font-semibold w-20">DATA:</td>
                                <td className="border border-black px-2 py-1">
                                    {venda.date ? format(new Date(venda.date), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'}
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-black px-2 py-1 bg-gray-100 font-semibold">CLIENTE:</td>
                                <td className="border border-black px-2 py-1" colSpan="4">{cliente.name}</td>
                            </tr>
                            <tr>
                                <td className="border border-black px-2 py-1 bg-gray-100 font-semibold">ENDEREÇO:</td>
                                <td className="border border-black px-2 py-1" colSpan="2">{cliente.address || 'NÃO INFORMADO'}</td>
                                <td className="border border-black px-2 py-1 bg-gray-100 font-semibold">TELEFONE:</td>
                                <td className="border border-black px-2 py-1">{cliente.phone || ''}</td>
                            </tr>
                            <tr>
                                <td className="border border-black px-2 py-1 bg-gray-100 font-semibold">CPF/CNPJ:</td>
                                <td className="border border-black px-2 py-1">{cliente.document || ''}</td>
                                <td className="w-20"></td>
                                <td className="border border-black px-2 py-1 bg-gray-100 font-semibold">VENDEDOR:</td>
                                <td className="border border-black px-2 py-1">{venda.created_by || 'Sistema'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Informações complementares */}
                <div className="mb-6">
                    <table className="w-full text-sm">
                        <tbody>
                            <tr>
                                <td className="border border-black px-2 py-1 bg-gray-100 font-semibold w-24">COMPLEMENTO:</td>
                                <td className="border border-black px-2 py-1" colSpan="3">{venda.observacoes || ''}</td>
                            </tr>
                            <tr>
                                <td className="border border-black px-2 py-1 bg-gray-100 font-semibold">BAIRRO:</td>
                                <td className="border border-black px-2 py-1">{cliente.city || ''}</td>
                                <td className="border border-black px-2 py-1 bg-gray-100 font-semibold w-24">BAIRRO:</td>
                                <td className="border border-black px-2 py-1">NOVO PROGRESSO - PA</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Tabela de produtos */}
                <table className="w-full mb-6 text-sm">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-black px-2 py-2 text-left">ITEM</th>
                            <th className="border border-black px-2 py-2 text-left">PRODUTO</th>
                            <th className="border border-black px-2 py-2 text-center">PREÇO</th>
                            <th className="border border-black px-2 py-2 text-center">QUANTIDADE</th>
                            <th className="border border-black px-2 py-2 text-center">UND</th>
                            <th className="border border-black px-2 py-2 text-right">TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={index}>
                                <td className="border border-black px-2 py-2 text-center">{index + 1}</td>
                                <td className="border border-black px-2 py-2">{item.produto_nome}</td>
                                <td className="border border-black px-2 py-2 text-center">{formatCurrency(item.preco_unitario)}</td>
                                <td className="border border-black px-2 py-2 text-center">{item.quantidade_vendida}</td>
                                <td className="border border-black px-2 py-2 text-center">UN</td>
                                <td className="border border-black px-2 py-2 text-right">{formatCurrency(item.preco_total)}</td>
                            </tr>
                        ))}
                        {/* Linha de total */}
                        <tr className="bg-gray-50">
                            <td className="border border-black px-2 py-2" colSpan="4"></td>
                            <td className="border border-black px-2 py-2 font-semibold text-center">Total:</td>
                            <td className="border border-black px-2 py-2 font-bold text-right">{formatCurrency(venda.valor_total)}</td>
                        </tr>
                    </tbody>
                </table>

                {/* Observações */}
                <div className="mb-6">
                    <div className="font-semibold mb-2">Observações:</div>
                    <div className="min-h-12 border-b border-black pb-2">
                        {venda.observacoes || ''}
                    </div>
                </div>

                {/* Declaração */}
                <div className="mb-6 text-sm">
                    Declaro que recebi os itens descritos acima, SANTARÉM-PA, {format(new Date(), "dd/MM/yyyy", { locale: ptBR })}
                </div>

                {/* Tabela de pagamento */}
                <table className="w-full mb-8 text-sm">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-black px-2 py-2 text-center">PAGAMENTO</th>
                            <th className="border border-black px-2 py-2 text-center">VENCTO</th>
                            <th className="border border-black px-2 py-2 text-center">DOCTO</th>
                            <th className="border border-black px-2 py-2 text-center">VALOR</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="border border-black px-2 py-2 text-center">DINHEIRO</td>
                            <td className="border border-black px-2 py-2 text-center">
                                {venda.date ? format(new Date(venda.date), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'}
                            </td>
                            <td className="border border-black px-2 py-2 text-center">ENTRADA</td>
                            <td className="border border-black px-2 py-2 text-center">{formatCurrency(venda.final_amount)}</td>
                        </tr>
                    </tbody>
                </table>

                {/* Assinatura */}
                <div className="text-right">
                    <div className="mb-16">ASSINATURA</div>
                    <div className="border-t border-black pt-2 inline-block" style={{ width: '300px' }}>
                        <div className="text-center text-sm">Cliente</div>
                    </div>
                </div>
            </div>

            {/* Estilos para impressão A4 */}
            <style jsx>{`
                @media print {
                    body { 
                        margin: 0; 
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    
                    @page { 
                        size: A4;
                        margin: 10mm;
                    }
                    
                    * {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }
            `}</style>
        </div>
    );
}