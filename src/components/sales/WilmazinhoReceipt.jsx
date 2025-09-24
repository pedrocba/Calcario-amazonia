import React from 'react';

const WilmazinhoReceipt = ({ venda, cliente, items = [] }) => {
  // Função para formatar moeda
  const formatCurrency = (value) => {
    if (!value) return '0,00';
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Função para formatar data
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
  };

  // Calcular totais
  const subtotal = items.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
  const desconto = venda?.discount || 0;
  const total = subtotal - desconto;

  return (
    <div className="printable-area bg-white text-black p-4 max-w-4xl mx-auto font-mono text-xs">
      {/* Cabeçalho da Empresa */}
      <div className="text-center mb-4">
        <div className="text-lg font-bold mb-2">WILMAZINHO AUTO SERVICE</div>
        <div className="text-sm">END: AVENIDA CUIABA, 554 - SALE</div>
        <div className="text-sm">SANTARÉM- PA</div>
        <div className="text-sm">FONE: 93991234582</div>
        <div className="text-sm">EMAIL: WILMAZINHOAUTOPECAS@GMAIL.COM</div>
      </div>

      {/* Informações do Pedido */}
      <div className="mb-4 space-y-1">
        <div className="flex justify-between">
          <span>PEDIDO: {venda?.id?.slice(0, 8) || 'N/A'}</span>
          <span>DATA: {formatDate(venda?.date)}</span>
        </div>
        <div>CLIENTE: {cliente?.name || 'N/A'}</div>
        <div>VENDEDOR: Sistema CBA</div>
        <div>TELEFONE: {cliente?.phone || '/'}</div>
        <div>ENDERECO: {cliente?.address || 'N/A'}</div>
        <div>COMPLEMENTO:</div>
        <div>BAIRRO: {cliente?.neighborhood || 'N/A'}</div>
        <div>CIDADE: SANTARÉM - PA</div>
      </div>

      {/* Tabela de Itens */}
      <div className="mb-4">
        <table className="w-full border-collapse border border-black text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black px-2 py-1 text-left w-12">ITEM</th>
              <th className="border border-black px-2 py-1 text-left">PRODUTO</th>
              <th className="border border-black px-2 py-1 text-right w-20">PREÇO</th>
              <th className="border border-black px-2 py-1 text-center w-16">QUANTIDADE</th>
              <th className="border border-black px-2 py-1 text-center w-12">UND</th>
              <th className="border border-black px-2 py-1 text-right w-20">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? items.map((item, index) => (
              <tr key={index}>
                <td className="border border-black px-2 py-1 text-center">{index + 1}</td>
                <td className="border border-black px-2 py-1">{item.produto || item.description || 'Produto'}</td>
                <td className="border border-black px-2 py-1 text-right">{formatCurrency(item.preco || item.unit_price || 0)}</td>
                <td className="border border-black px-2 py-1 text-center">{item.quantidade || item.quantity || 1}</td>
                <td className="border border-black px-2 py-1 text-center">{item.und || item.unit || 'UN'}</td>
                <td className="border border-black px-2 py-1 text-right">{formatCurrency((item.preco || item.unit_price || 0) * (item.quantidade || item.quantity || 1))}</td>
              </tr>
            )) : (
              <tr>
                <td className="border border-black px-2 py-1 text-center">1</td>
                <td className="border border-black px-2 py-1">Produto vendido</td>
                <td className="border border-black px-2 py-1 text-right">{formatCurrency(venda?.final_amount || 0)}</td>
                <td className="border border-black px-2 py-1 text-center">1</td>
                <td className="border border-black px-2 py-1 text-center">UN</td>
                <td className="border border-black px-2 py-1 text-right">{formatCurrency(venda?.final_amount || 0)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Totais */}
      <div className="mb-4 text-right">
          <div>SubTotal: {formatCurrency(subtotal)}</div>
          <div>Desconto: {formatCurrency(desconto)}</div>
          <div className="font-bold text-lg">Total: {formatCurrency(total)}</div>
      </div>

      {/* Observações */}
      <div className="mb-4">
        <div className="font-bold">Observações:</div>
        <div className="mt-2">
          Declaro que recebi os itens descritos acima, SANTARÉM-PA, {formatDate(new Date())}
        </div>
      </div>

      {/* Informações de Pagamento */}
      <div className="mb-4">
        <table className="w-full border-collapse border border-black text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black px-2 py-1 text-left">FORMA PGTO</th>
              <th className="border border-black px-2 py-1 text-center">VENCTO</th>
              <th className="border border-black px-2 py-1 text-center">DOCTO</th>
              <th className="border border-black px-2 py-1 text-right">VALOR</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black px-2 py-1">{venda?.payment_method || 'À VISTA'}</td>
              <td className="border border-black px-2 py-1 text-center">{formatDate(venda?.date)}</td>
              <td className="border border-black px-2 py-1 text-center">{venda?.id?.slice(0, 8) || 'N/A'}/01</td>
              <td className="border border-black px-2 py-1 text-right">{formatCurrency(total)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Assinatura */}
      <div className="text-center mt-8">
        <div className="border-t border-black pt-2">
          <div className="font-bold">ASSINATURA</div>
        </div>
      </div>
    </div>
  );
};

export default WilmazinhoReceipt;


