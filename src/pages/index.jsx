import { useMemo } from 'react';
import Layout from './Layout';
import Login from './Login';
import Register from './Register';
import SelectCompany from './SelectCompany';
import AdminDashboard from './admin/AdminDashboard';
import ProtectedRoute from '@/components/auth/ProtectedRoute.jsx';
import AuthRedirect from '@/components/auth/AuthRedirect.jsx';
import Dashboard from './Dashboard';
import Products from './Products';
import Warehouse from './Warehouse';
import Transfers from './Transfers';
import Reports from './Reports';
import Weighing from './Weighing';
import Vehicles from './Vehicles';
import Finance from './Finance';
import VehicleDetail from './VehicleDetail';
import WeightHistory from './WeightHistory';
import Users from './Users';
import DataImporter from './DataImporter';
import Requisicoes from './Requisicoes';
import Retiradas from './Retiradas';
import AcessoSistema from './AcessoSistema';
import EstoqueEPIs from './EstoqueEPIs';
import TransferenciaSimples from './TransferenciaSimples';
import Remessas from './Remessas';
import AtivosTI from './AtivosTI';
import PostoCombustivel from './PostoCombustivel';
import FuelReport from './FuelReport';
import InventoryReport from './InventoryReport';
import TransferReport from './TransferReport';
import RequisitionReport from './RequisitionReport';
import VehicleReport from './VehicleReport';
import ActivityReport from './ActivityReport';
import ScaleSettings from './ScaleSettings';
import BridgeInstructions from './BridgeInstructions';
import FixedCostReport from './FixedCostReport';
import Clientes from './Clientes';
import Vendas from './Vendas';
import Companies from './Companies';
import VendaDetalhes from './VendaDetalhes';
import ContasFinanceiras from './ContasFinanceiras';
import BackupManager from './BackupManager';
import { BrowserRouter as Router, Route, Routes, useLocation, matchPath } from 'react-router-dom';

const DEFAULT_PAGE_NAME = 'Dashboard';

const PROTECTED_PAGE_CONFIGS = [
  {
    name: 'Dashboard',
    paths: ['/dashboard', '/Dashboard'],
    Component: Dashboard,
  },
  {
    name: 'Products',
    paths: ['/Products'],
    Component: Products,
  },
  {
    name: 'Warehouse',
    paths: ['/Warehouse'],
    Component: Warehouse,
  },
  {
    name: 'Transfers',
    paths: ['/Transfers'],
    Component: Transfers,
  },
  {
    name: 'Reports',
    paths: ['/Reports'],
    Component: Reports,
  },
  {
    name: 'Weighing',
    paths: ['/Weighing'],
    Component: Weighing,
  },
  {
    name: 'Vehicles',
    paths: ['/Vehicles'],
    Component: Vehicles,
  },
  {
    name: 'Finance',
    paths: ['/Finance'],
    Component: Finance,
  },
  {
    name: 'VehicleDetail',
    paths: ['/VehicleDetail'],
    Component: VehicleDetail,
  },
  {
    name: 'WeightHistory',
    paths: ['/WeightHistory'],
    Component: WeightHistory,
  },
  {
    name: 'Users',
    paths: ['/Users'],
    Component: Users,
    requiredPermission: 'manage_users',
  },
  {
    name: 'DataImporter',
    paths: ['/DataImporter'],
    Component: DataImporter,
    requiredPermission: 'manage_system_settings',
  },
  {
    name: 'Requisicoes',
    paths: ['/Requisicoes'],
    Component: Requisicoes,
  },
  {
    name: 'Retiradas',
    paths: ['/Retiradas'],
    Component: Retiradas,
  },
  {
    name: 'AcessoSistema',
    paths: ['/AcessoSistema'],
    Component: AcessoSistema,
  },
  {
    name: 'EstoqueEPIs',
    paths: ['/EstoqueEPIs'],
    Component: EstoqueEPIs,
  },
  {
    name: 'TransferenciaSimples',
    paths: ['/TransferenciaSimples'],
    Component: TransferenciaSimples,
  },
  {
    name: 'Remessas',
    paths: ['/Remessas'],
    Component: Remessas,
  },
  {
    name: 'AtivosTI',
    paths: ['/AtivosTI'],
    Component: AtivosTI,
  },
  {
    name: 'PostoCombustivel',
    paths: ['/PostoCombustivel'],
    Component: PostoCombustivel,
  },
  {
    name: 'FuelReport',
    paths: ['/FuelReport'],
    Component: FuelReport,
  },
  {
    name: 'InventoryReport',
    paths: ['/InventoryReport'],
    Component: InventoryReport,
  },
  {
    name: 'TransferReport',
    paths: ['/TransferReport'],
    Component: TransferReport,
  },
  {
    name: 'RequisitionReport',
    paths: ['/RequisitionReport'],
    Component: RequisitionReport,
  },
  {
    name: 'VehicleReport',
    paths: ['/VehicleReport'],
    Component: VehicleReport,
  },
  {
    name: 'ActivityReport',
    paths: ['/ActivityReport'],
    Component: ActivityReport,
  },
  {
    name: 'ScaleSettings',
    paths: ['/ScaleSettings'],
    Component: ScaleSettings,
  },
  {
    name: 'BridgeInstructions',
    paths: ['/BridgeInstructions'],
    Component: BridgeInstructions,
  },
  {
    name: 'FixedCostReport',
    paths: ['/FixedCostReport'],
    Component: FixedCostReport,
  },
  {
    name: 'Clientes',
    paths: ['/Clientes'],
    Component: Clientes,
  },
  {
    name: 'Vendas',
    paths: ['/Vendas'],
    Component: Vendas,
  },
  {
    name: 'Companies',
    paths: ['/Companies'],
    Component: Companies,
    requiredPermission: 'manage_companies',
  },
  {
    name: 'VendaDetalhes',
    paths: ['/VendaDetalhes/:id'],
    Component: VendaDetalhes,
  },
  {
    name: 'ContasFinanceiras',
    paths: ['/ContasFinanceiras'],
    Component: ContasFinanceiras,
  },
  {
    name: 'BackupManager',
    paths: ['/BackupManager'],
    Component: BackupManager,
    requiredPermission: 'manage_system_settings',
  },
];

const PROTECTED_LAYOUT_ROUTES = PROTECTED_PAGE_CONFIGS.flatMap(({ paths, ...config }) =>
  paths.map((path) => ({
    path,
    ...config,
  }))
);

const STANDALONE_PROTECTED_ROUTES = [
  {
    path: '/select-company',
    element: <SelectCompany />,
  },
  {
    path: '/admin/dashboard',
    element: <AdminDashboard />,
    requiredRole: 'super_admin',
  },
];

function PagesContent() {
  const location = useLocation();

  const normalizedPath = useMemo(() => {
    if (location.pathname.length > 1 && location.pathname.endsWith('/')) {
      return location.pathname.slice(0, -1);
    }
    return location.pathname;
  }, [location.pathname]);

  const currentPage = useMemo(() => {
    const matchedRoute = PROTECTED_LAYOUT_ROUTES.find(({ path }) =>
      matchPath({ path, caseSensitive: false, end: true }, normalizedPath)
    );

    return matchedRoute?.name ?? DEFAULT_PAGE_NAME;
  }, [normalizedPath]);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Smart redirect route */}
      <Route path="/" element={<AuthRedirect />} />

      {/* Protected routes without layout */}
      {STANDALONE_PROTECTED_ROUTES.map(({ path, element, requiredRole }) => (
        <Route
          key={path}
          path={path}
          element={
            <ProtectedRoute requiredRole={requiredRole}>
              {element}
            </ProtectedRoute>
          }
        />
      ))}

      {/* Layout protected routes */}
      {PROTECTED_LAYOUT_ROUTES.map(({ path, Component, requiredPermission, requiredRole }) => (
        <Route
          key={path}
          path={path}
          element={
            <ProtectedRoute
              requiredPermission={requiredPermission}
              requiredRole={requiredRole}
            >
              <Layout currentPageName={currentPage}>
                <Component />
              </Layout>
            </ProtectedRoute>
          }
        />
      ))}
    </Routes>
  );
}

export default function Pages() {
  return (
    <Router>
      <PagesContent />
    </Router>
  );
}
