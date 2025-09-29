-- ==============================================
-- PREPARAR TABELAS PARA IMPORTAÇÃO
-- ==============================================
-- Execute este script no Supabase SQL Editor

-- 1. GARANTIR QUE A TABELA CONTACTS EXISTE
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    empresa_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. GARANTIR QUE A TABELA FINANCIAL_TRANSACTIONS EXISTE
CREATE TABLE IF NOT EXISTS financial_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID,
    type VARCHAR(20) NOT NULL CHECK (type IN ('entrada', 'saida')),
    amount DECIMAL(15,2) NOT NULL,
    description TEXT NOT NULL,
    reference VARCHAR(255),
    due_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'parcial', 'cancelado')),
    payment_date DATE,
    category VARCHAR(50) DEFAULT 'outros',
    notes TEXT,
    company_id TEXT NOT NULL,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. GARANTIR QUE A TABELA FINANCIAL_ACCOUNTS EXISTE
CREATE TABLE IF NOT EXISTS financial_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'caixa',
    balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. GARANTIR QUE A TABELA PRODUCTS EXISTE
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) UNIQUE,
    sale_price DECIMAL(10,2) DEFAULT 0,
    cost_price DECIMAL(10,2) DEFAULT 0,
    stock INTEGER DEFAULT 0,
    category VARCHAR(100) DEFAULT 'Geral',
    active BOOLEAN DEFAULT true,
    empresa_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ADICIONAR COLUNA EMPRESA_ID SE NÃO EXISTIR
DO $$ 
BEGIN
    -- Adicionar empresa_id em contacts se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'contacts' AND column_name = 'empresa_id') THEN
        ALTER TABLE contacts ADD COLUMN empresa_id UUID;
    END IF;
    
    -- Adicionar empresa_id em products se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'empresa_id') THEN
        ALTER TABLE products ADD COLUMN empresa_id UUID;
    END IF;
END $$;

-- 6. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_contacts_empresa_id ON contacts(empresa_id);
CREATE INDEX IF NOT EXISTS idx_contacts_type ON contacts(type);
CREATE INDEX IF NOT EXISTS idx_contacts_active ON contacts(active);

CREATE INDEX IF NOT EXISTS idx_financial_transactions_company_id ON financial_transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_type ON financial_transactions(type);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_status ON financial_transactions(status);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_due_date ON financial_transactions(due_date);

CREATE INDEX IF NOT EXISTS idx_products_empresa_id ON products(empresa_id);
CREATE INDEX IF NOT EXISTS idx_products_code ON products(code);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);

-- 7. HABILITAR RLS NAS TABELAS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 8. CRIAR POLICIES RLS BÁSICAS
-- Contacts
DROP POLICY IF EXISTS "contacts_isolada_por_empresa" ON contacts;
CREATE POLICY "contacts_isolada_por_empresa"
ON contacts
FOR ALL
USING (empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid)
WITH CHECK (empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid);

-- Financial Transactions
DROP POLICY IF EXISTS "financial_transactions_isolada_por_empresa" ON financial_transactions;
CREATE POLICY "financial_transactions_isolada_por_empresa"
ON financial_transactions
FOR ALL
USING (company_id = '68cacb91-3d16-9d19-1be6-c90d00000000')
WITH CHECK (company_id = '68cacb91-3d16-9d19-1be6-c90d00000000');

-- Financial Accounts
DROP POLICY IF EXISTS "financial_accounts_isolada_por_empresa" ON financial_accounts;
CREATE POLICY "financial_accounts_isolada_por_empresa"
ON financial_accounts
FOR ALL
USING (company_id = '68cacb91-3d16-9d19-1be6-c90d00000000')
WITH CHECK (company_id = '68cacb91-3d16-9d19-1be6-c90d00000000');

-- Products
DROP POLICY IF EXISTS "products_isolada_por_empresa" ON products;
CREATE POLICY "products_isolada_por_empresa"
ON products
FOR ALL
USING (empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid)
WITH CHECK (empresa_id = '68cacb91-3d16-9d19-1be6-c90d00000000'::uuid);

-- 9. VERIFICAR ESTRUTURA DAS TABELAS
SELECT 
    'TABELAS PREPARADAS PARA IMPORTAÇÃO!' as status,
    'Execute o script e teste a importação' as info;

-- Verificar colunas das tabelas
SELECT 
    'CONTACTS:' as tabela,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'contacts' 
ORDER BY ordinal_position;

SELECT 
    'FINANCIAL_TRANSACTIONS:' as tabela,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'financial_transactions' 
ORDER BY ordinal_position;

SELECT 
    'PRODUCTS:' as tabela,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;



