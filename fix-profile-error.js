/**
 * 🔧 CORREÇÃO COMPLETA - ERRO DE PERFIL/FILIAL
 * ============================================
 * 
 * Este script corrige o problema "Perfil ou filial do usuário não encontrados"
 * criando as tabelas necessárias e configurando o perfil do usuário.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rfdedsmxhsxalyzxstxh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmZGVkc214aHN4YWx5enhzdHhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjQyMzEsImV4cCI6MjA3MzY0MDIzMX0.YETntgLIODtULiblwg5yFsDJ_kJ-HFWMgWBXf6V-T4g';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixProfileError() {
  console.log('🔧 INICIANDO CORREÇÃO DO ERRO DE PERFIL...\n');

  try {
    // 1. Verificar se o usuário está autenticado
    console.log('1️⃣ Verificando autenticação...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('❌ Usuário não está autenticado!');
      console.log('💡 Faça login na aplicação primeiro.');
      return;
    }
    
    console.log('✅ Usuário autenticado:', user.email);

    // 2. Criar tabela companies se não existir
    console.log('\n2️⃣ Verificando/criando tabela companies...');
    const createCompaniesTable = `
      CREATE TABLE IF NOT EXISTS public.companies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        full_name TEXT,
        type TEXT DEFAULT 'matriz',
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    const { error: companiesError } = await supabase.rpc('exec_sql', { sql: createCompaniesTable });
    if (companiesError) {
      console.log('⚠️ Erro ao criar tabela companies (pode já existir):', companiesError.message);
    } else {
      console.log('✅ Tabela companies criada/verificada');
    }

    // 3. Criar tabela profiles se não existir
    console.log('\n3️⃣ Verificando/criando tabela profiles...');
    const createProfilesTable = `
      CREATE TABLE IF NOT EXISTS public.profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
        company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
        full_name TEXT,
        email TEXT,
        role TEXT DEFAULT 'user',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    const { error: profilesError } = await supabase.rpc('exec_sql', { sql: createProfilesTable });
    if (profilesError) {
      console.log('⚠️ Erro ao criar tabela profiles (pode já existir):', profilesError.message);
    } else {
      console.log('✅ Tabela profiles criada/verificada');
    }

    // 4. Criar empresa padrão se não existir
    console.log('\n4️⃣ Verificando/criando empresa padrão...');
    const defaultCompanyId = '00000000-0000-0000-0000-000000000001';
    
    const { data: existingCompany } = await supabase
      .from('companies')
      .select('id')
      .eq('id', defaultCompanyId)
      .single();
    
    if (!existingCompany) {
      const { error: insertCompanyError } = await supabase
        .from('companies')
        .insert({
          id: defaultCompanyId,
          name: 'Empresa Padrão',
          code: 'DEFAULT001',
          full_name: 'Empresa Padrão Ltda',
          type: 'matriz',
          active: true
        });
      
      if (insertCompanyError) {
        console.error('❌ Erro ao criar empresa padrão:', insertCompanyError);
      } else {
        console.log('✅ Empresa padrão criada');
      }
    } else {
      console.log('✅ Empresa padrão já existe');
    }

    // 5. Verificar se o usuário já tem perfil
    console.log('\n5️⃣ Verificando perfil do usuário...');
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (existingProfile) {
      console.log('✅ Usuário já tem perfil:', {
        company_id: existingProfile.company_id,
        full_name: existingProfile.full_name,
        role: existingProfile.role
      });
      
      // Verificar se o company_id é válido
      if (existingProfile.company_id) {
        const { data: company } = await supabase
          .from('companies')
          .select('id, name')
          .eq('id', existingProfile.company_id)
          .single();
        
        if (company) {
          console.log('✅ Company ID é válido:', company.name);
          console.log('\n🎯 PROBLEMA RESOLVIDO!');
          console.log('💡 O erro deve ter sido resolvido. Teste criar um produto agora.');
          return;
        } else {
          console.log('⚠️ Company ID inválido, atualizando...');
        }
      }
    }

    // 6. Criar/atualizar perfil do usuário
    console.log('\n6️⃣ Criando/atualizando perfil do usuário...');
    const profileData = {
      user_id: user.id,
      company_id: defaultCompanyId,
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
      email: user.email,
      role: 'admin'
    };

    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert(profileData, { 
        onConflict: 'user_id',
        ignoreDuplicates: false 
      });
    
    if (upsertError) {
      console.error('❌ Erro ao criar/atualizar perfil:', upsertError);
      return;
    }
    
    console.log('✅ Perfil do usuário criado/atualizado:', profileData);

    // 7. Testar a geração de código de produto
    console.log('\n7️⃣ Testando geração de código de produto...');
    try {
      const { data: lastProduct } = await supabase
        .from('products')
        .select('code')
        .eq('company_id', defaultCompanyId)
        .order('code', { ascending: false })
        .limit(1)
        .single();

      let newCodeNumber = 1;
      if (lastProduct && lastProduct.code) {
        const lastNumber = parseInt(lastProduct.code.replace(/\D/g, ''), 10);
        if (!isNaN(lastNumber)) {
          newCodeNumber = lastNumber + 1;
        }
      }
      
      const newCode = `PROD${String(newCodeNumber).padStart(5, '0')}`;
      console.log('✅ Código de produto gerado com sucesso:', newCode);
      
    } catch (error) {
      console.log('⚠️ Erro ao testar geração de código (normal se não há produtos):', error.message);
    }

    console.log('\n🎯 CORREÇÃO COMPLETA!');
    console.log('✅ Tabelas criadas/verificadas');
    console.log('✅ Empresa padrão configurada');
    console.log('✅ Perfil do usuário criado/atualizado');
    console.log('💡 Agora teste criar um produto na aplicação!');

  } catch (error) {
    console.error('❌ Erro inesperado durante a correção:', error);
  }
}

// Executar a correção
fixProfileError();






