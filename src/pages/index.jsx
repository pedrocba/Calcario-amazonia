import Layout from "./Layout";
import Login from "./Login";
import Register from "./Register";
import SelectCompany from "./SelectCompany";
import AdminDashboard from "./admin/AdminDashboard";
import ProtectedRoute from "@/components/auth/ProtectedRoute.jsx";
import AuthRedirect from "@/components/auth/AuthRedirect.jsx";

import Dashboard from "./Dashboard";

import Products from "./Products";

import Warehouse from "./Warehouse";

import Transfers from "./Transfers";

import Reports from "./Reports";

import Weighing from "./Weighing";

import Vehicles from "./Vehicles";

import Finance from "./Finance";

import VehicleDetail from "./VehicleDetail";

import WeightHistory from "./WeightHistory";

import Users from "./Users";

import Requisicoes from "./Requisicoes";

import Retiradas from "./Retiradas";

import AcessoSistema from "./AcessoSistema";

import EstoqueEPIs from "./EstoqueEPIs";

import TransferenciaSimples from "./TransferenciaSimples";

import Remessas from "./Remessas";

import AtivosTI from "./AtivosTI";

import PostoCombustivel from "./PostoCombustivel";

import FuelReport from "./FuelReport";

import InventoryReport from "./InventoryReport";

import TransferReport from "./TransferReport";

import RequisitionReport from "./RequisitionReport";

import VehicleReport from "./VehicleReport";

import ActivityReport from "./ActivityReport";

import ScaleSettings from "./ScaleSettings";

import BridgeInstructions from "./BridgeInstructions";

import FixedCostReport from "./FixedCostReport";

import Clientes from "./Clientes";

import Vendas from "./Vendas";

import VendaDetalhes from "./VendaDetalhes";

import ContasFinanceiras from "./ContasFinanceiras";

import BackupManager from "./BackupManager";

import DataImporter from "./DataImporter";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Products: Products,
    
    Warehouse: Warehouse,
    
    Transfers: Transfers,
    
    Reports: Reports,
    
    Weighing: Weighing,
    
    Vehicles: Vehicles,
    
    Finance: Finance,
    
    VehicleDetail: VehicleDetail,
    
    WeightHistory: WeightHistory,
    
    Users: Users,
    
    Requisicoes: Requisicoes,
    
    Retiradas: Retiradas,
    
    AcessoSistema: AcessoSistema,
    
    EstoqueEPIs: EstoqueEPIs,
    
    TransferenciaSimples: TransferenciaSimples,
    
    Remessas: Remessas,
    
    AtivosTI: AtivosTI,
    
    PostoCombustivel: PostoCombustivel,
    
    FuelReport: FuelReport,
    
    InventoryReport: InventoryReport,
    
    TransferReport: TransferReport,
    
    RequisitionReport: RequisitionReport,
    
    VehicleReport: VehicleReport,
    
    ActivityReport: ActivityReport,
    
    ScaleSettings: ScaleSettings,
    
    BridgeInstructions: BridgeInstructions,
    
    FixedCostReport: FixedCostReport,
    
    Clientes: Clientes,
    
    Vendas: Vendas,
    
    VendaDetalhes: VendaDetalhes,
    
    ContasFinanceiras: ContasFinanceiras,
    
    BackupManager: BackupManager,
    
    DataImporter: DataImporter,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
            <Routes>            
            {/* Rotas públicas - Login e Registro */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Rota de redirecionamento inteligente */}
            <Route path="/" element={<AuthRedirect />} />
            
            {/* Rota de seleção de filial */}
            <Route path="/select-company" element={
                <ProtectedRoute>
                    <SelectCompany />
                </ProtectedRoute>
            } />
            
            {/* Rota de admin global */}
            <Route path="/admin/dashboard" element={
                <ProtectedRoute requiredRole="super_admin">
                    <AdminDashboard />
                </ProtectedRoute>
            } />
            
            {/* Rotas protegidas normais */}
            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <Dashboard />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/Dashboard" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <Dashboard />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/Products" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <Products />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/Warehouse" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <Warehouse />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/Transfers" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <Transfers />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/Reports" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <Reports />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/Weighing" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <Weighing />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/Vehicles" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <Vehicles />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/Finance" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <Finance />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/VehicleDetail" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <VehicleDetail />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/WeightHistory" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <WeightHistory />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/Users" element={
                <ProtectedRoute requiredPermission="manage_users">
                    <Layout currentPageName={currentPage}>
                        <Users />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/Requisicoes" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <Requisicoes />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/Retiradas" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <Retiradas />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/AcessoSistema" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <AcessoSistema />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/EstoqueEPIs" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <EstoqueEPIs />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/TransferenciaSimples" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <TransferenciaSimples />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/Remessas" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <Remessas />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/AtivosTI" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <AtivosTI />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/PostoCombustivel" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <PostoCombustivel />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/FuelReport" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <FuelReport />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/InventoryReport" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <InventoryReport />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/TransferReport" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <TransferReport />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/RequisitionReport" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <RequisitionReport />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/VehicleReport" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <VehicleReport />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/ActivityReport" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <ActivityReport />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/ScaleSettings" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <ScaleSettings />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/BridgeInstructions" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <BridgeInstructions />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/FixedCostReport" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <FixedCostReport />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/Clientes" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <Clientes />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/Vendas" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <Vendas />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/VendaDetalhes/:id" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <VendaDetalhes />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/ContasFinanceiras" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <ContasFinanceiras />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/BackupManager" element={
                <ProtectedRoute requiredPermission="manage_system_settings">
                    <Layout currentPageName={currentPage}>
                        <BackupManager />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/DataImporter" element={
                <ProtectedRoute requiredPermission="manage_system_settings">
                    <Layout currentPageName={currentPage}>
                        <DataImporter />
                    </Layout>
                </ProtectedRoute>
            } />
                
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