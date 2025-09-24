import React from 'react';

const SaleReceipt = ({ sale }) => {
  // Função para formatar data
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
  };

  // Função para formatar moeda
  const formatCurrency = (value) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Função para calcular total do item
  const calculateItemTotal = (item) => {
    const unitPrice = item.unit_price || 0;
    const quantity = item.quantity || 0;
    const discount = item.discount || 0;
    const subtotal = unitPrice * quantity;
    const total = subtotal - discount;
    return total;
  };

  // Calcular totais gerais
  const calculateTotals = () => {
    const itemsTotal = sale.items?.reduce((sum, item) => sum + calculateItemTotal(item), 0) || 0;
    const totalDiscount = sale.items?.reduce((sum, item) => sum + (item.discount || 0), 0) || 0;
    const shipping = sale.shipping || 0;
    const other = sale.other || 0;
    const grandTotal = itemsTotal - totalDiscount + shipping + other;
    
    return {
      itemsTotal,
      totalDiscount,
      shipping,
      other,
      grandTotal
    };
  };

  const totals = calculateTotals();

  return (
    <div className="printable-area bg-white text-black p-8 max-w-4xl mx-auto">
      {/* Cabeçalho Superior */}
      <div className="mb-8">
        <div className="text-right mb-4">
          <h1 className="text-2xl font-bold text-gray-800">PEDIDO DE VENDA</h1>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-semibold">Vendedor:</span> {sale.seller?.name || 'N/A'}
          </div>
          <div>
            <span className="font-semibold">Pedido:</span> {sale.order_number || 'N/A'}
          </div>
          <div>
            <span className="font-semibold">Data de criação:</span> {formatDate(sale.created_at)}
          </div>
          <div>
            <span className="font-semibold">Data de emissão:</span> {formatDate(sale.issue_date)}
          </div>
          <div>
            <span className="font-semibold">Data de entrega:</span> {formatDate(sale.delivery_date)}
          </div>
        </div>
      </div>

      {/* Seção de Endereços */}
      <div className="flex gap-8 mb-8">
        {/* Endereço de Cobrança */}
        <div className="w-1/2">
          <h2 className="text-lg font-bold mb-4 text-gray-800 border-b-2 border-gray-300 pb-2">
            ENDEREÇO DE COBRANÇA
          </h2>
          <div className="text-sm space-y-1">
            <div><span className="font-semibold">Nome:</span> {sale.billing?.name || 'N/A'}</div>
            <div><span className="font-semibold">CNPJ:</span> {sale.billing?.cnpj || 'N/A'}</div>
            <div><span className="font-semibold">Endereço:</span> {sale.billing?.address || 'N/A'}</div>
            <div><span className="font-semibold">CEP:</span> {sale.billing?.zip_code || 'N/A'}</div>
            <div><span className="font-semibold">Telefone:</span> {sale.billing?.phone || 'N/A'}</div>
          </div>
        </div>

        {/* Endereço de Entrega */}
        <div className="w-1/2">
          <h2 className="text-lg font-bold mb-4 text-gray-800 border-b-2 border-gray-300 pb-2">
            ENDEREÇO DE ENTREGA
          </h2>
          <div className="text-sm space-y-1">
            <div><span className="font-semibold">Nome:</span> {sale.shipping?.name || 'N/A'}</div>
            <div><span className="font-semibold">CPF:</span> {sale.shipping?.cpf || 'N/A'}</div>
            <div><span className="font-semibold">Endereço:</span> {sale.shipping?.address || 'N/A'}</div>
            <div><span className="font-semibold">CEP:</span> {sale.shipping?.zip_code || 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* Seção de Itens do Pedido */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-4 text-gray-800 border-b-2 border-gray-300 pb-2">
          ITENS DO PEDIDO
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Referência</th>
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Descrição</th>
                <th className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold">Unidade</th>
                <th className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold">Quantidade</th>
                <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Unitário</th>
                <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Desconto</th>
                <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {sale.items?.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 px-3 py-2 text-sm">{item.reference || item.code || 'N/A'}</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm">{item.description || item.name || 'N/A'}</td>
                  <td className="border border-gray-300 px-3 py-2 text-center text-sm">{item.unit || 'UN'}</td>
                  <td className="border border-gray-300 px-3 py-2 text-center text-sm">{item.quantity || 0}</td>
                  <td className="border border-gray-300 px-3 py-2 text-right text-sm">{formatCurrency(item.unit_price)}</td>
                  <td className="border border-gray-300 px-3 py-2 text-right text-sm">{formatCurrency(item.discount)}</td>
                  <td className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">
                    {formatCurrency(calculateItemTotal(item))}
                  </td>
                </tr>
              )) || (
                <tr>
                  <td colSpan="7" className="border border-gray-300 px-3 py-4 text-center text-gray-500">
                    Nenhum item encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Seção de Totais */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-4 text-gray-800 border-b-2 border-gray-300 pb-2">
          TOTAIS
        </h2>
        
        <div className="max-w-md ml-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Descrição</th>
                <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Valor</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-3 py-2 text-sm">Total dos Itens</td>
                <td className="border border-gray-300 px-3 py-2 text-right text-sm">{formatCurrency(totals.itemsTotal)}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-2 text-sm">Desconto</td>
                <td className="border border-gray-300 px-3 py-2 text-right text-sm text-red-600">
                  -{formatCurrency(totals.totalDiscount)}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-2 text-sm">Frete</td>
                <td className="border border-gray-300 px-3 py-2 text-right text-sm">{formatCurrency(totals.shipping)}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-2 text-sm">Outros</td>
                <td className="border border-gray-300 px-3 py-2 text-right text-sm">{formatCurrency(totals.other)}</td>
              </tr>
              <tr className="bg-gray-100 font-bold">
                <td className="border border-gray-300 px-3 py-2 text-sm">VALOR TOTAL</td>
                <td className="border border-gray-300 px-3 py-2 text-right text-sm">{formatCurrency(totals.grandTotal)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Seção de Pagamento */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-4 text-gray-800 border-b-2 border-gray-300 pb-2">
          FORMA / CONDIÇÕES DE PAGAMENTO
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Descrição</th>
                <th className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold">Vencimento</th>
                <th className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold">Pagamento</th>
                <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Valor</th>
                <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Saldo</th>
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Observação</th>
              </tr>
            </thead>
            <tbody>
              {sale.payments?.map((payment, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 px-3 py-2 text-sm">{payment.description || 'N/A'}</td>
                  <td className="border border-gray-300 px-3 py-2 text-center text-sm">{formatDate(payment.due_date)}</td>
                  <td className="border border-gray-300 px-3 py-2 text-center text-sm">{payment.payment_method || 'N/A'}</td>
                  <td className="border border-gray-300 px-3 py-2 text-right text-sm">{formatCurrency(payment.amount)}</td>
                  <td className="border border-gray-300 px-3 py-2 text-right text-sm">{formatCurrency(payment.balance)}</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm">{payment.observation || '-'}</td>
                </tr>
              )) || (
                <tr>
                  <td colSpan="6" className="border border-gray-300 px-3 py-4 text-center text-gray-500">
                    Nenhuma condição de pagamento encontrada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rodapé */}
      <div className="mt-12">
        {/* Observações */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4 text-gray-800 border-b-2 border-gray-300 pb-2">
            OBSERVAÇÕES
          </h2>
          <div className="bg-gray-50 p-4 rounded border">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {sale.observations || 'Nenhuma observação adicional.'}
            </p>
          </div>
        </div>

        {/* Assinaturas */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="text-center">
            <div className="border-t-2 border-gray-400 pt-2">
              <p className="text-sm font-semibold">Assinatura do Comprador</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t-2 border-gray-400 pt-2">
              <p className="text-sm font-semibold">Assinatura do Recebedor</p>
            </div>
          </div>
        </div>

        {/* Data de Impressão */}
        <div className="text-center text-xs text-gray-500">
          <p>Impresso em: {new Date().toLocaleString('pt-BR')}</p>
        </div>
      </div>
    </div>
  );
};

export default SaleReceipt;







