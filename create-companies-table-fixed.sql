-- ==============================================
-- CRIAÇÃO/ATUALIZAÇÃO DA TABELA COMPANIES CORRIGIDA
-- ==============================================
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a tabela existe e sua estrutura
DO $$
BEGIN
    -- Se a tabela não existe, criar
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'companies') THEN
        CREATE TABLE public.companies (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            code TEXT UNIQUE NOT NULL,
            full_name TEXT,
            cnpj TEXT,
            ie TEXT,
            address TEXT,
            city TEXT,
            state TEXT,
            zip_code TEXT,
            phone TEXT,
            email TEXT,
            website TEXT,
            type TEXT DEFAULT 'matriz' CHECK (type IN ('matriz', 'filial')),
            active BOOLEAN DEFAULT true,
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Tabela companies criada com sucesso!';
    ELSE
        RAISE NOTICE 'Tabela companies já existe. Verificando estrutura...';
        
        -- Adicionar colunas que podem estar faltando
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'companies' AND column_name = 'city') THEN
            ALTER TABLE public.companies ADD COLUMN city TEXT;
            RAISE NOTICE 'Coluna city adicionada';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'companies' AND column_name = 'state') THEN
            ALTER TABLE public.companies ADD COLUMN state TEXT;
            RAISE NOTICE 'Coluna state adicionada';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'companies' AND column_name = 'zip_code') THEN
            ALTER TABLE public.companies ADD COLUMN zip_code TEXT;
            RAISE NOTICE 'Coluna zip_code adicionada';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'companies' AND column_name = 'phone') THEN
            ALTER TABLE public.companies ADD COLUMN phone TEXT;
            RAISE NOTICE 'Coluna phone adicionada';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'companies' AND column_name = 'email') THEN
            ALTER TABLE public.companies ADD COLUMN email TEXT;
            RAISE NOTICE 'Coluna email adicionada';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'companies' AND column_name = 'website') THEN
            ALTER TABLE public.companies ADD COLUMN website TEXT;
            RAISE NOTICE 'Coluna website adicionada';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'companies' AND column_name = 'cnpj') THEN
            ALTER TABLE public.companies ADD COLUMN cnpj TEXT;
            RAISE NOTICE 'Coluna cnpj adicionada';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'companies' AND column_name = 'ie') THEN
            ALTER TABLE public.companies ADD COLUMN ie TEXT;
            RAISE NOTICE 'Coluna ie adicionada';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'companies' AND column_name = 'address') THEN
            ALTER TABLE public.companies ADD COLUMN address TEXT;
            RAISE NOTICE 'Coluna address adicionada';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'companies' AND column_name = 'notes') THEN
            ALTER TABLE public.companies ADD COLUMN notes TEXT;
            RAISE NOTICE 'Coluna notes adicionada';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'companies' AND column_name = 'updated_at') THEN
            ALTER TABLE public.companies ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
            RAISE NOTICE 'Coluna updated_at adicionada';
        END IF;
    END IF;
END $$;

-- 2. Criar índices para performance (se não existirem)
CREATE INDEX IF NOT EXISTS idx_companies_code ON public.companies(code);
CREATE INDEX IF NOT EXISTS idx_companies_type ON public.companies(type);
CREATE INDEX IF NOT EXISTS idx_companies_active ON public.companies(active);
CREATE INDEX IF NOT EXISTS idx_companies_city ON public.companies(city);
CREATE INDEX IF NOT EXISTS idx_companies_state ON public.companies(state);

-- 3. Habilitar RLS (Row Level Security)
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas RLS
-- Política para permitir que todos os usuários autenticados vejam as empresas
DROP POLICY IF EXISTS "Authenticated users can view companies" ON public.companies;
CREATE POLICY "Authenticated users can view companies" ON public.companies
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política para permitir que admins e super_admins gerenciem empresas
DROP POLICY IF EXISTS "Admins can manage companies" ON public.companies;
CREATE POLICY "Admins can manage companies" ON public.companies
    FOR ALL USING (
        auth.role() = 'authenticated' AND (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE user_id = auth.uid() 
                AND role IN ('admin', 'super_admin')
            )
        )
    );

-- 5. Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_companies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Criar trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_companies_updated_at ON public.companies;
CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON public.companies
    FOR EACH ROW
    EXECUTE FUNCTION update_companies_updated_at();

-- 7. Inserir empresa padrão se não existir
INSERT INTO public.companies (
    id, 
    name, 
    code, 
    full_name, 
    type, 
    active,
    city,
    state,
    notes
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Empresa Padrão',
    'DEFAULT001',
    'Empresa Padrão Ltda',
    'matriz',
    true,
    'Santarém',
    'PA',
    'Empresa padrão do sistema'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    code = EXCLUDED.code,
    full_name = EXCLUDED.full_name,
    type = EXCLUDED.type,
    active = EXCLUDED.active,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    notes = EXCLUDED.notes,
    updated_at = NOW();

-- 8. Verificar se a tabela foi criada/atualizada corretamente
SELECT 
    'Tabela companies configurada com sucesso!' as status,
    count(*) as total_empresas
FROM public.companies;

-- 9. Listar estrutura da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'companies'
ORDER BY ordinal_position;

-- 10. Listar empresas existentes
SELECT 
    id,
    name,
    code,
    full_name,
    type,
    active,
    city,
    state,
    created_at
FROM public.companies
ORDER BY created_at DESC;




