// Temporariamente desabilitado - usando apenas Supabase
// import { base44 } from './base44Client';

// Mock functions para evitar erros durante a transição
const createMockFunction = (name) => ({
  invoke: () => Promise.resolve({ data: null, error: null })
});

// Export mock functions
export const receber_peso_balanca = createMockFunction('receber_peso_balanca');
export const auth = createMockFunction('auth');
export const configurar_balanca = createMockFunction('configurar_balanca');
export const backupSistema = createMockFunction('backupSistema');
export const testBackup = createMockFunction('testBackup');
export const processarContasPagar = createMockFunction('processarContasPagar');
export const securityMiddleware = createMockFunction('securityMiddleware');
export const importarContas = createMockFunction('importarContas');
export const backupAutomatico = createMockFunction('backupAutomatico');
export const importarClientesSertanejo = createMockFunction('importarClientesSertanejo');
export const importarClientesCBA = createMockFunction('importarClientesCBA');
export const corrigirDatasRecebiveis = createMockFunction('corrigirDatasRecebiveis');