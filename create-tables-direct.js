// Script para criar tabelas diretamente via Supabase
// Execute: node create-tables-direct.js

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase (substitua pelos seus valores)
const supabaseUrl = 'https://your-project.supabase.co'; // Substitua pela sua URL
const supabaseKey = 'your-anon-key'; // Substitua pela sua chave anon

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTables() {
  console.log('🚀 Criando tabelas de faturamento...');

  try {
    // SQL para criar as tabelas
    const sql = `
      -- Tabela de Faturas
      CREATE TABLE IF NOT EXISTS faturas (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        venda_id UUID NOT NULL REFERENCES vendas(id) ON DELETE CASCADE,
        customer_id UUID NOT NULL,
        total_value DECIMAL(10,2) NOT NULL DEFAULT 0,
        discount DECIMAL(10,2) NOT NULL DEFAULT 0,
        additional_charges DECIMAL(10,2) NOT NULL DEFAULT 0,
        final_value DECIMAL(10,2) NOT NULL DEFAULT 0,
        payment_method VARCHAR(50) NOT NULL,
        payment_conditions VARCHAR(20) NOT NULL CHECK (payment_conditions IN ('a_vista', 'a_prazo')),
        due_date DATE,
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
        notes TEXT,
        company_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Tabela de Parcelas
      CREATE TABLE IF NOT EXISTS parcelas (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        fatura_id UUID NOT NULL REFERENCES faturas(id) ON DELETE CASCADE,
        venda_id UUID NOT NULL REFERENCES vendas(id) ON DELETE CASCADE,
        customer_id UUID NOT NULL,
        installment_number INTEGER NOT NULL,
        due_date DATE NOT NULL,
        value DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
        payment_method VARCHAR(50),
        paid_at TIMESTAMP WITH TIME ZONE,
        paid_value DECIMAL(10,2),
        company_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Índices
      CREATE INDEX IF NOT EXISTS idx_faturas_venda_id ON faturas(venda_id);
      CREATE INDEX IF NOT EXISTS idx_faturas_customer_id ON faturas(customer_id);
      CREATE INDEX IF NOT EXISTS idx_faturas_status ON faturas(status);
      CREATE INDEX IF NOT EXISTS idx_parcelas_fatura_id ON parcelas(fatura_id);
      CREATE INDEX IF NOT EXISTS idx_parcelas_due_date ON parcelas(due_date);
      CREATE INDEX IF NOT EXISTS idx_parcelas_status ON parcelas(status);

      -- RLS
      ALTER TABLE faturas ENABLE ROW LEVEL SECURITY;
      ALTER TABLE parcelas ENABLE ROW LEVEL SECURITY;
    `;

    // Executar SQL
    const { error } = await supabase.rpc('exec', { sql });

    if (error) {
      console.error('❌ Erro ao criar tabelas:', error);
      return;
    }

    console.log('✅ Tabelas criadas com sucesso!');
    console.log('📋 Tabelas criadas:');
    console.log('  - faturas');
    console.log('  - parcelas');
    console.log('🔒 RLS habilitado');
    console.log('📊 Índices criados');

  } catch (error) {
    console.error('❌ Erro durante a criação:', error);
  }
}

createTables();











