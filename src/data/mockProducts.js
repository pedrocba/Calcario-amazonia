/**
 * DADOS MOCK DE PRODUTOS
 * ======================
 * Dados de exemplo para substituir as chamadas do Supabase
 */

export const mockProducts = [
  {
    id: '1',
    name: 'CALCARIO DOLOMITICO A GRANEL',
    code: 'PROD000010',
    description: 'Sem descrição',
    category: 'Produção Propria',
    condition: 'novo',
    cost_price: 180.00,
    sale_price: 360.00,
    stock: 0,
    company_id: '68cacb91-3d16-9d19-1be6-c90d00000000',
    active: true
  },
  {
    id: '2',
    name: 'PRODUTO TESTE 1',
    code: 'PROD000011',
    description: 'Produto de teste',
    category: 'Produção Propria',
    condition: 'novo',
    cost_price: 100.00,
    sale_price: 200.00,
    stock: 50,
    company_id: '68cacb91-3d16-9d19-1be6-c90d00000000',
    active: true
  },
  {
    id: '3',
    name: 'PRODUTO TESTE 2',
    code: 'PROD000012',
    description: 'Outro produto de teste',
    category: 'Produção Propria',
    condition: 'novo',
    cost_price: 150.00,
    sale_price: 300.00,
    stock: 25,
    company_id: '68cacb91-3d16-9d19-1be6-c90d00000000',
    active: true
  }
];

export const mockCategories = [
  { id: '1', name: 'Produção Propria', company_id: '68cacb91-3d16-9d19-1be6-c90d00000000' },
  { id: '2', name: 'EPI', company_id: '68cacb91-3d16-9d19-1be6-c90d00000000' },
  { id: '3', name: 'Equipamentos', company_id: '68cacb91-3d16-9d19-1be6-c90d00000000' }
];









