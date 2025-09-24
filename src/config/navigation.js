/**
 * CONFIGURAÇÃO DE NAVEGAÇÃO DINÂMICA
 * ==================================
 * Arquivo de configuração para o menu de navegação lateral
 * baseado em roles de usuário.
 */

import { 
  LayoutDashboard, 
  Package, 
  Warehouse, 
  ArrowRightLeft, 
  FileText, 
  Scale, 
  Truck, 
  DollarSign, 
  Users, 
  Settings, 
  Building2,
  ShoppingCart,
  ClipboardList,
  TruckIcon,
  Fuel,
  BarChart3,
  Shield,
  Database,
  Upload,
  Download,
  AlertTriangle,
  Calendar,
  MapPin,
  CreditCard,
  TrendingUp,
  Activity
} from 'lucide-react';

/**
 * Estrutura de itens de menu com permissões por role
 */
export const menuItems = [
  // DASHBOARD - Acesso para todos os usuários
  {
    id: 'dashboard',
    path: '/Dashboard',
    title: 'Dashboard',
    icon: LayoutDashboard,
    roles: ['super_admin', 'admin', 'usuario_padrao', 'gerente_patio', 'almoxarife'],
    description: 'Visão geral do sistema'
  },

  // PRODUTOS E ESTOQUE
  {
    id: 'products',
    path: '/Products',
    title: 'Produtos',
    icon: Package,
    roles: ['super_admin', 'admin', 'almoxarife'],
    description: 'Gestão de produtos e catálogo'
  },
  {
    id: 'warehouse',
    path: '/Warehouse',
    title: 'Almoxarifado',
    icon: Warehouse,
    roles: ['super_admin', 'admin', 'almoxarife'],
    description: 'Controle de estoque e movimentações'
  },
  {
    id: 'transfers',
    path: '/Transfers',
    title: 'Transferências',
    icon: ArrowRightLeft,
    roles: ['super_admin', 'admin', 'gerente_patio', 'almoxarife'],
    description: 'Transferências entre filiais'
  },

  // OPERAÇÕES
  {
    id: 'weighing',
    path: '/Weighing',
    title: 'Pesagem',
    icon: Scale,
    roles: ['super_admin', 'admin', 'usuario_padrao', 'gerente_patio'],
    description: 'Sistema de pesagem e pesagens'
  },
  {
    id: 'vehicles',
    path: '/Vehicles',
    title: 'Veículos',
    icon: Truck,
    roles: ['super_admin', 'admin', 'gerente_patio'],
    description: 'Gestão da frota de veículos'
  },
  {
    id: 'fuel-station',
    path: '/PostoCombustivel',
    title: 'Posto de Combustível',
    icon: Fuel,
    roles: ['super_admin', 'admin', 'gerente_patio'],
    description: 'Controle de abastecimento'
  },

  // FINANCEIRO
  {
    id: 'finance',
    path: '/Finance',
    title: 'Financeiro',
    icon: DollarSign,
    roles: ['super_admin', 'admin'],
    description: 'Gestão financeira e contas'
  },
  {
    id: 'sales',
    path: '/Vendas',
    title: 'Vendas',
    icon: ShoppingCart,
    roles: ['super_admin', 'admin'],
    description: 'Gestão de vendas e clientes'
  },
  {
    id: 'clients',
    path: '/Clientes',
    title: 'Clientes',
    icon: Users,
    roles: ['super_admin', 'admin'],
    description: 'Cadastro de clientes'
  },

  // REQUISIÇÕES E RETIRADAS
  {
    id: 'requisitions',
    path: '/Requisicoes',
    title: 'Requisições',
    icon: ClipboardList,
    roles: ['super_admin', 'admin', 'gerente_patio', 'almoxarife'],
    description: 'Requisições de materiais'
  },
  {
    id: 'withdrawals',
    path: '/Retiradas',
    title: 'Retiradas',
    icon: Download,
    roles: ['super_admin', 'admin', 'almoxarife'],
    description: 'Controle de retiradas'
  },
  {
    id: 'remessas',
    path: '/Remessas',
    title: 'Remessas',
    icon: TruckIcon,
    roles: ['super_admin', 'admin', 'gerente_patio'],
    description: 'Gestão de remessas'
  },

  // RELATÓRIOS
  {
    id: 'reports',
    path: '/Reports',
    title: 'Relatórios',
    icon: FileText,
    roles: ['super_admin', 'admin', 'gerente_patio', 'almoxarife'],
    description: 'Relatórios e análises',
    children: [
      {
        id: 'inventory-report',
        path: '/InventoryReport',
        title: 'Relatório de Estoque',
        icon: Package,
        roles: ['super_admin', 'admin', 'almoxarife']
      },
      {
        id: 'transfer-report',
        path: '/TransferReport',
        title: 'Relatório de Transferências',
        icon: ArrowRightLeft,
        roles: ['super_admin', 'admin', 'gerente_patio']
      },
      {
        id: 'vehicle-report',
        path: '/VehicleReport',
        title: 'Relatório de Veículos',
        icon: Truck,
        roles: ['super_admin', 'admin', 'gerente_patio']
      },
      {
        id: 'fuel-report',
        path: '/FuelReport',
        title: 'Relatório de Combustível',
        icon: Fuel,
        roles: ['super_admin', 'admin', 'gerente_patio']
      },
      {
        id: 'requisition-report',
        path: '/RequisitionReport',
        title: 'Relatório de Requisições',
        icon: ClipboardList,
        roles: ['super_admin', 'admin', 'gerente_patio', 'almoxarife']
      },
      {
        id: 'activity-report',
        path: '/ActivityReport',
        title: 'Relatório de Atividades',
        icon: Activity,
        roles: ['super_admin', 'admin']
      },
      {
        id: 'fixed-cost-report',
        path: '/FixedCostReport',
        title: 'Relatório de Custos Fixos',
        icon: TrendingUp,
        roles: ['super_admin', 'admin']
      }
    ]
  },

  // ADMINISTRAÇÃO
  {
    id: 'users',
    path: '/Users',
    title: 'Usuários',
    icon: Users,
    roles: ['super_admin', 'admin'],
    description: 'Gestão de usuários'
  },
  {
    id: 'assets',
    path: '/AtivosTI',
    title: 'Ativos de TI',
    icon: Database,
    roles: ['super_admin', 'admin'],
    description: 'Gestão de ativos de TI'
  },
  {
    id: 'epi-stock',
    path: '/EstoqueEPIs',
    title: 'Estoque de EPIs',
    icon: Shield,
    roles: ['super_admin', 'admin', 'almoxarife'],
    description: 'Controle de EPIs'
  },

  // FERRAMENTAS E UTILIDADES
  {
    id: 'simple-transfer',
    path: '/TransferenciaSimples',
    title: 'Transferência Simples',
    icon: ArrowRightLeft,
    roles: ['super_admin', 'admin', 'gerente_patio'],
    description: 'Transferência rápida entre filiais'
  },
  {
    id: 'scale-settings',
    path: '/ScaleSettings',
    title: 'Configurações da Balança',
    icon: Settings,
    roles: ['super_admin', 'admin'],
    description: 'Configurações do sistema de pesagem'
  },
  {
    id: 'bridge-instructions',
    path: '/BridgeInstructions',
    title: 'Instruções da Ponte',
    icon: Settings,
    roles: ['super_admin', 'admin'],
    description: 'Instruções para ponte da balança'
  },

  // ADMINISTRAÇÃO DO SISTEMA (apenas super_admin)
  {
    id: 'admin-dashboard',
    path: '/Dashboard',
    title: 'Painel Administrativo',
    icon: Shield,
    roles: ['super_admin'],
    description: 'Painel de administração global',
    isAdmin: true
  },
  {
    id: 'backup-manager',
    path: '/BackupManager',
    title: 'Gerenciador de Backup',
    icon: Database,
    roles: ['super_admin'],
    description: 'Backup e restauração do sistema'
  },
  {
    id: 'data-importer',
    path: '/DataImporter',
    title: 'Importador de Dados',
    icon: Upload,
    roles: ['super_admin'],
    description: 'Importação de dados externos'
  }
];

/**
 * Função para filtrar itens de menu baseado no role do usuário
 * @param {string} userRole - Role do usuário atual
 * @param {boolean} isSuperAdmin - Se o usuário é super admin
 * @returns {Array} Array de itens de menu filtrados
 */
export const getFilteredMenuItems = (userRole, isSuperAdmin = false) => {
  // TODOS os usuários têm acesso a TODOS os menus
  return menuItems;
};

/**
 * Função para obter itens de menu por categoria
 * @param {string} userRole - Role do usuário atual
 * @param {boolean} isSuperAdmin - Se o usuário é super admin
 * @returns {Object} Objeto com itens agrupados por categoria
 */
export const getMenuItemsByCategory = (userRole, isSuperAdmin = false) => {
  // TODOS os usuários têm acesso a TODOS os menus
  const filteredItems = menuItems;
  
  const categories = {
    main: [],
    operations: [],
    financial: [],
    reports: [],
    administration: [],
    tools: [],
    system: []
  };

  filteredItems.forEach(item => {
    if (item.isAdmin) {
      categories.system.push(item);
    } else if (item.path.includes('/Finance') || item.path.includes('/Vendas') || item.path.includes('/Clientes')) {
      categories.financial.push(item);
    } else if (item.path.includes('/Reports') || item.path.includes('Report')) {
      categories.reports.push(item);
    } else if (item.path.includes('/Users') || item.path.includes('/AtivosTI') || item.path.includes('/EstoqueEPIs')) {
      categories.administration.push(item);
    } else if (item.path.includes('/ScaleSettings') || item.path.includes('/BridgeInstructions') || item.path.includes('/TransferenciaSimples')) {
      categories.tools.push(item);
    } else if (item.path.includes('/Weighing') || item.path.includes('/Vehicles') || item.path.includes('/PostoCombustivel') || item.path.includes('/Requisicoes') || item.path.includes('/Retiradas') || item.path.includes('/Remessas')) {
      categories.operations.push(item);
    } else {
      categories.main.push(item);
    }
  });

  return categories;
};

/**
 * Função para buscar um item de menu por ID
 * @param {string} itemId - ID do item de menu
 * @returns {Object|null} Item de menu encontrado ou null
 */
export const getMenuItemById = (itemId) => {
  return menuItems.find(item => item.id === itemId) || null;
};

/**
 * Função para verificar se um usuário tem permissão para acessar uma rota
 * @param {string} path - Caminho da rota
 * @param {string} userRole - Role do usuário atual
 * @param {boolean} isSuperAdmin - Se o usuário é super admin
 * @returns {boolean} Se o usuário tem permissão
 */
export const hasPermissionForRoute = (path, userRole, isSuperAdmin = false) => {
  if (isSuperAdmin) return true;
  
  const item = menuItems.find(item => item.path === path);
  return item ? item.roles.includes(userRole) : false;
};

export default menuItems;
