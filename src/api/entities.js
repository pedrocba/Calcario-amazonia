// Temporariamente desabilitado - usando apenas Supabase
// import { base44 } from './base44Client';

// Mock entities para evitar erros durante a transição
const createMockEntity = (name) => ({
  list: () => Promise.resolve({ data: [], error: null }),
  get: () => Promise.resolve({ data: null, error: null }),
  create: () => Promise.resolve({ data: null, error: null }),
  update: () => Promise.resolve({ data: null, error: null }),
  delete: () => Promise.resolve({ data: null, error: null }),
  me: () => Promise.resolve({ data: null, error: null })
});

// Export mock entities
export const Product = createMockEntity('Product');
export const StockEntry = createMockEntity('StockEntry');
export const Transfer = createMockEntity('Transfer');
export const Vehicle = createMockEntity('Vehicle');
export const WeighingTrip = createMockEntity('WeighingTrip');
export const ScaleReading = createMockEntity('ScaleReading');
export const ActivityLog = createMockEntity('ActivityLog');
export const FinancialAccount = createMockEntity('FinancialAccount');
export const FinancialTransaction = createMockEntity('FinancialTransaction');
export const Contact = createMockEntity('Contact');
export const FuelingRecord = createMockEntity('FuelingRecord');
export const VehicleExpense = createMockEntity('VehicleExpense');
export const WeightReading = createMockEntity('WeightReading');
export const RequisicaoDeSaida = createMockEntity('RequisicaoDeSaida');
export const ItemDaRequisicao = createMockEntity('ItemDaRequisicao');
export const RetiradaDeMaterial = createMockEntity('RetiradaDeMaterial');
export const MovimentacaoEstoque = createMockEntity('MovimentacaoEstoque');
export const RetiradaDeItem = createMockEntity('RetiradaDeItem');
export const ItemRetirado = createMockEntity('ItemRetirado');
export const UserPermission = createMockEntity('UserPermission');
export const AccessLog = createMockEntity('AccessLog');
export const Company = createMockEntity('Company');
export const ProdutosAlmoxarifado = createMockEntity('ProdutosAlmoxarifado');
export const MovimentacoesProduto = createMockEntity('MovimentacoesProduto');
export const EPI = createMockEntity('EPI');
export const Funcionario = createMockEntity('Funcionario');
export const EntregaEPI = createMockEntity('EntregaEPI');
export const TransferenciaSimples = createMockEntity('TransferenciaSimples');
export const Remessa = createMockEntity('Remessa');
export const AtivoTI = createMockEntity('AtivoTI');
export const PostoCombustivel = createMockEntity('PostoCombustivel');
export const EntradaCombustivel = createMockEntity('EntradaCombustivel');
export const AjusteEstoqueLog = createMockEntity('AjusteEstoqueLog');
export const RecurringCost = createMockEntity('RecurringCost');
export const Venda = createMockEntity('Venda');
export const ItemDaVenda = createMockEntity('ItemDaVenda');
export const CreditoCliente = createMockEntity('CreditoCliente');
export const ProductCategory = createMockEntity('ProductCategory');
export const OperacaoCaixa = createMockEntity('OperacaoCaixa');

// Mock auth
export const User = createMockEntity('User');