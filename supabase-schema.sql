-- Schema SQL para migração do Base44 para Supabase
-- Sistema de Gestão CBA Mineração

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================
-- TABELAS PRINCIPAIS
-- ==============================================

-- Tabela de empresas/filiais
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(2),
    type VARCHAR(20) NOT NULL CHECK (type IN ('matriz', 'filial')),
    active BOOLEAN DEFAULT true,
    database_config JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de perfis de usuário (relacionada com auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'usuario_padrao' CHECK (role IN ('admin', 'usuario_padrao', 'operador_balanca', 'gerente_estoque', 'financeiro')),
    company_id UUID REFERENCES companies(id),
    permissions JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'suspenso')),
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de logs de acesso
CREATE TABLE access_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id),
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    details TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    success BOOLEAN DEFAULT true,
    ip_address INET,
    user_agent TEXT
);

-- Tabela de categorias de produtos
CREATE TABLE product_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    company_id UUID REFERENCES companies(id),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de produtos
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES product_categories(id),
    condition VARCHAR(20) DEFAULT 'novo' CHECK (condition IN ('novo', 'usado', 'recondicionado')),
    size VARCHAR(20),
    unit_of_measure VARCHAR(10) DEFAULT 'UN',
    cost_price DECIMAL(10,2) DEFAULT 0,
    sale_price DECIMAL(10,2) DEFAULT 0,
    profit_margin DECIMAL(5,2) DEFAULT 0,
    min_qty INTEGER DEFAULT 0,
    max_qty INTEGER DEFAULT 0,
    current_stock INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    company_id UUID REFERENCES companies(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(code, company_id)
);

-- Tabela de veículos
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plate VARCHAR(20) UNIQUE NOT NULL,
    model VARCHAR(100),
    brand VARCHAR(100),
    year INTEGER,
    fleet VARCHAR(50) DEFAULT 'Própria',
    capacity DECIMAL(10,2) DEFAULT 0,
    odometer DECIMAL(10,2) DEFAULT 0,
    driver_name VARCHAR(255),
    driver_cnh VARCHAR(20),
    company VARCHAR(100),
    cost_center VARCHAR(100),
    status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'parado', 'manutencao')),
    vehicle_code VARCHAR(50),
    rfid_tag VARCHAR(100),
    qr_code VARCHAR(100),
    tare_weight_empty DECIMAL(10,2) DEFAULT 0,
    last_maintenance DATE,
    gps_integration_code VARCHAR(100),
    company_id UUID REFERENCES companies(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de contas financeiras
CREATE TABLE financial_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('receita', 'despesa', 'ativo', 'passivo', 'patrimonio')),
    balance DECIMAL(15,2) DEFAULT 0,
    description TEXT,
    active BOOLEAN DEFAULT true,
    company_id UUID REFERENCES companies(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de transações financeiras
CREATE TABLE financial_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID REFERENCES financial_accounts(id),
    type VARCHAR(50) NOT NULL CHECK (type IN ('entrada', 'saida', 'transferencia')),
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    reference VARCHAR(255),
    date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmado', 'cancelado')),
    metadata JSONB,
    company_id UUID REFERENCES companies(id),
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de contatos/clientes
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    document VARCHAR(20),
    type VARCHAR(20) DEFAULT 'cliente' CHECK (type IN ('cliente', 'fornecedor', 'funcionario', 'outro')),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(2),
    zip_code VARCHAR(10),
    active BOOLEAN DEFAULT true,
    company_id UUID REFERENCES companies(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de entradas de estoque
CREATE TABLE stock_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(15,2),
    supplier VARCHAR(255),
    reference VARCHAR(255),
    notes TEXT,
    date DATE NOT NULL,
    company_id UUID REFERENCES companies(id),
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de transferências
CREATE TABLE transfers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_location VARCHAR(255),
    to_location VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_transito', 'concluida', 'cancelada')),
    notes TEXT,
    date DATE NOT NULL,
    company_id UUID REFERENCES companies(id),
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de itens de transferência
CREATE TABLE transfer_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transfer_id UUID REFERENCES transfers(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(15,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de viagens de pesagem
CREATE TABLE weighing_trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id),
    driver_name VARCHAR(255),
    origin VARCHAR(255),
    destination VARCHAR(255),
    gross_weight DECIMAL(10,2),
    tare_weight DECIMAL(10,2),
    net_weight DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'pesando', 'concluida', 'cancelada')),
    notes TEXT,
    date DATE NOT NULL,
    company_id UUID REFERENCES companies(id),
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de leituras de balança
CREATE TABLE scale_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    weighing_trip_id UUID REFERENCES weighing_trips(id),
    weight DECIMAL(10,2) NOT NULL,
    reading_type VARCHAR(20) NOT NULL CHECK (reading_type IN ('bruto', 'tara', 'liquido')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    scale_id VARCHAR(50),
    company_id UUID REFERENCES companies(id)
);

-- Tabela de registros de abastecimento
CREATE TABLE fueling_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id),
    fuel_type VARCHAR(50) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(10,2),
    total_cost DECIMAL(15,2),
    odometer_reading DECIMAL(10,2),
    station_name VARCHAR(255),
    notes TEXT,
    date DATE NOT NULL,
    company_id UUID REFERENCES companies(id),
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de despesas de veículos
CREATE TABLE vehicle_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id),
    expense_type VARCHAR(100) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    receipt_number VARCHAR(100),
    company_id UUID REFERENCES companies(id),
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de requisições de saída
CREATE TABLE requisicoes_saida (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_name VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    purpose TEXT,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovada', 'rejeitada', 'concluida')),
    approved_by UUID REFERENCES profiles(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    date DATE NOT NULL,
    company_id UUID REFERENCES companies(id),
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de itens de requisição
CREATE TABLE itens_requisicao (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requisicao_id UUID REFERENCES requisicoes_saida(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity_requested INTEGER NOT NULL,
    quantity_approved INTEGER DEFAULT 0,
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(15,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de movimentações de estoque
CREATE TABLE movimentacoes_estoque (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id),
    movement_type VARCHAR(50) NOT NULL CHECK (movement_type IN ('entrada', 'saida', 'ajuste', 'transferencia')),
    quantity INTEGER NOT NULL,
    previous_stock INTEGER,
    new_stock INTEGER,
    reason VARCHAR(255),
    reference_id UUID,
    reference_type VARCHAR(50),
    notes TEXT,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    company_id UUID REFERENCES companies(id),
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de EPIs
CREATE TABLE epis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    size VARCHAR(20),
    current_stock INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 0,
    unit_cost DECIMAL(10,2),
    active BOOLEAN DEFAULT true,
    company_id UUID REFERENCES companies(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de funcionários
CREATE TABLE funcionarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    document VARCHAR(20),
    position VARCHAR(100),
    department VARCHAR(100),
    hire_date DATE,
    active BOOLEAN DEFAULT true,
    company_id UUID REFERENCES companies(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de entregas de EPI
CREATE TABLE entregas_epi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    funcionario_id UUID REFERENCES funcionarios(id),
    epi_id UUID REFERENCES epis(id),
    quantity INTEGER NOT NULL,
    delivery_date DATE NOT NULL,
    return_date DATE,
    status VARCHAR(20) DEFAULT 'entregue' CHECK (status IN ('entregue', 'devolvido', 'perdido')),
    notes TEXT,
    company_id UUID REFERENCES companies(id),
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de transferências simples
CREATE TABLE transferencias_simples (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_location VARCHAR(255),
    to_location VARCHAR(255),
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL,
    notes TEXT,
    date DATE NOT NULL,
    company_id UUID REFERENCES companies(id),
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de remessas
CREATE TABLE remessas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    number VARCHAR(100) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'preparando' CHECK (status IN ('preparando', 'enviada', 'entregue', 'cancelada')),
    shipping_date DATE,
    delivery_date DATE,
    tracking_code VARCHAR(100),
    notes TEXT,
    company_id UUID REFERENCES companies(id),
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de ativos de TI
CREATE TABLE ativos_ti (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100),
    status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'manutencao', 'descartado')),
    location VARCHAR(255),
    assigned_to UUID REFERENCES funcionarios(id),
    purchase_date DATE,
    warranty_expiry DATE,
    cost DECIMAL(15,2),
    notes TEXT,
    company_id UUID REFERENCES companies(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de postos de combustível
CREATE TABLE postos_combustivel (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    fuel_types JSONB,
    current_stock JSONB,
    min_stock JSONB,
    max_stock JSONB,
    active BOOLEAN DEFAULT true,
    company_id UUID REFERENCES companies(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de entradas de combustível
CREATE TABLE entradas_combustivel (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    posto_id UUID REFERENCES postos_combustivel(id),
    fuel_type VARCHAR(50) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(10,2),
    total_cost DECIMAL(15,2),
    supplier VARCHAR(255),
    invoice_number VARCHAR(100),
    date DATE NOT NULL,
    company_id UUID REFERENCES companies(id),
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de ajustes de estoque
CREATE TABLE ajustes_estoque_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id),
    previous_stock INTEGER,
    new_stock INTEGER,
    adjustment_type VARCHAR(50) NOT NULL CHECK (adjustment_type IN ('inventario', 'perda', 'avaria', 'outro')),
    reason TEXT,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    company_id UUID REFERENCES companies(id),
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de custos recorrentes
CREATE TABLE recurring_costs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    amount DECIMAL(15,2) NOT NULL,
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('mensal', 'trimestral', 'semestral', 'anual')),
    start_date DATE NOT NULL,
    end_date DATE,
    active BOOLEAN DEFAULT true,
    account_id UUID REFERENCES financial_accounts(id),
    company_id UUID REFERENCES companies(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de vendas
CREATE TABLE vendas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES contacts(id),
    total_amount DECIMAL(15,2) NOT NULL,
    discount DECIMAL(15,2) DEFAULT 0,
    final_amount DECIMAL(15,2) NOT NULL,
    payment_method VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'paga', 'cancelada')),
    notes TEXT,
    date DATE NOT NULL,
    company_id UUID REFERENCES companies(id),
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de itens de venda
CREATE TABLE itens_venda (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venda_id UUID REFERENCES vendas(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(15,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de créditos de cliente
CREATE TABLE creditos_cliente (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES contacts(id),
    amount DECIMAL(15,2) NOT NULL,
    balance DECIMAL(15,2) NOT NULL,
    description TEXT,
    expiry_date DATE,
    active BOOLEAN DEFAULT true,
    company_id UUID REFERENCES companies(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de operações de caixa
CREATE TABLE operacoes_caixa (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL CHECK (type IN ('abertura', 'fechamento', 'entrada', 'saida')),
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    reference VARCHAR(255),
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    company_id UUID REFERENCES companies(id),
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de logs de atividade
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    company_id UUID REFERENCES companies(id)
);

-- ==============================================
-- ÍNDICES PARA PERFORMANCE
-- ==============================================

-- Índices para consultas frequentes
CREATE INDEX idx_products_company ON products(company_id);
CREATE INDEX idx_products_code ON products(code);
CREATE INDEX idx_vehicles_company ON vehicles(company_id);
CREATE INDEX idx_vehicles_plate ON vehicles(plate);
CREATE INDEX idx_financial_transactions_company ON financial_transactions(company_id);
CREATE INDEX idx_financial_transactions_date ON financial_transactions(date);
CREATE INDEX idx_stock_entries_company ON stock_entries(company_id);
CREATE INDEX idx_stock_entries_date ON stock_entries(date);
CREATE INDEX idx_weighing_trips_company ON weighing_trips(company_id);
CREATE INDEX idx_weighing_trips_date ON weighing_trips(date);
CREATE INDEX idx_access_logs_company ON access_logs(company_id);
CREATE INDEX idx_access_logs_timestamp ON access_logs(timestamp);
CREATE INDEX idx_activity_logs_company ON activity_logs(company_id);
CREATE INDEX idx_activity_logs_timestamp ON activity_logs(timestamp);

-- ==============================================
-- TRIGGERS PARA UPDATED_AT
-- ==============================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas com updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_financial_accounts_updated_at BEFORE UPDATE ON financial_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_financial_transactions_updated_at BEFORE UPDATE ON financial_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transfers_updated_at BEFORE UPDATE ON transfers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_weighing_trips_updated_at BEFORE UPDATE ON weighing_trips FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_requisicoes_saida_updated_at BEFORE UPDATE ON requisicoes_saida FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_epis_updated_at BEFORE UPDATE ON epis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_funcionarios_updated_at BEFORE UPDATE ON funcionarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_remessas_updated_at BEFORE UPDATE ON remessas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ativos_ti_updated_at BEFORE UPDATE ON ativos_ti FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_postos_combustivel_updated_at BEFORE UPDATE ON postos_combustivel FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recurring_costs_updated_at BEFORE UPDATE ON recurring_costs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendas_updated_at BEFORE UPDATE ON vendas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_creditos_cliente_updated_at BEFORE UPDATE ON creditos_cliente FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

























