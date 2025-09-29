/**
 * 🔍 DIAGNÓSTICO COMPLETO - ERRO DE PERFIL/FILIAL
 * ==============================================
 * 
 * Este script identifica exatamente por que o erro 
 * "Perfil ou filial do usuário não encontrados" está ocorrendo.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rfdedsmxhsxalyzxstxh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmZGVkc214aHN4YWx5enhzdHhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjQyMzEsImV4cCI6MjA3MzY0MDIzMX0.YETntgLIODtULiblwg5yFsDJ_kJ-HFWMgWBXf6V-T4g';

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseProfileError() {
  console.log('🔍 INICIANDO DIAGNÓSTICO COMPLETO...\n');

  try {
    // 1. Verificar se o usuário está autenticado
    console.log('1️⃣ Verificando autenticação do usuário...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ Erro de autenticação:', authError);
      return;
    }
    
    if (!user) {
      console.log('⚠️ PROBLEMA: Usuário não está autenticado!');
      console.log('💡 SOLUÇÃO: Faça login na aplicação primeiro.');
      return;
    }
    
    console.log('✅ Usuário autenticado:', {
      id: user.id,
      email: user.email,
      created_at: user.created_at
    });

    // 2. Verificar se a tabela profiles existe
    console.log('\n2️⃣ Verificando se a tabela profiles existe...');
    try {
      const { data: profilesTest, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      if (profilesError) {
        console.error('❌ PROBLEMA: Tabela profiles não existe ou não é acessível!');
        console.log('💡 SOLUÇÃO: Execute o script de criação da tabela profiles.');
        console.log('📋 Erro:', profilesError);
        return;
      }
      
      console.log('✅ Tabela profiles existe e é acessível');
    } catch (error) {
      console.error('❌ Erro inesperado ao acessar tabela profiles:', error);
      return;
    }

    // 3. Verificar se o usuário tem perfil na tabela profiles
    console.log('\n3️⃣ Verificando perfil do usuário na tabela profiles...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (profileError) {
      console.error('❌ PROBLEMA: Erro ao buscar perfil do usuário!');
      console.log('📋 Erro:', profileError);
      
      if (profileError.code === 'PGRST116') {
        console.log('💡 SOLUÇÃO: Usuário não tem perfil na tabela profiles.');
        console.log('📝 Execute o script para criar o perfil do usuário.');
      }
      return;
    }
    
    if (!profile) {
      console.log('⚠️ PROBLEMA: Usuário não tem perfil na tabela profiles!');
      console.log('💡 SOLUÇÃO: Criar perfil para o usuário.');
      return;
    }
    
    console.log('✅ Perfil encontrado:', {
      user_id: profile.user_id,
      company_id: profile.company_id,
      full_name: profile.full_name,
      role: profile.role
    });

    // 4. Verificar se o company_id é válido
    console.log('\n4️⃣ Verificando se o company_id é válido...');
    if (!profile.company_id) {
      console.log('⚠️ PROBLEMA: Perfil não tem company_id!');
      console.log('💡 SOLUÇÃO: Atualizar o perfil com um company_id válido.');
      return;
    }
    
    console.log('✅ Company ID encontrado:', profile.company_id);

    // 5. Verificar se a empresa existe na tabela companies
    console.log('\n5️⃣ Verificando se a empresa existe na tabela companies...');
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', profile.company_id)
      .single();
    
    if (companyError) {
      console.error('❌ PROBLEMA: Erro ao buscar empresa!');
      console.log('📋 Erro:', companyError);
      return;
    }
    
    if (!company) {
      console.log('⚠️ PROBLEMA: Empresa não existe na tabela companies!');
      console.log('💡 SOLUÇÃO: Criar a empresa ou corrigir o company_id no perfil.');
      return;
    }
    
    console.log('✅ Empresa encontrada:', {
      id: company.id,
      name: company.name,
      code: company.code,
      type: company.type,
      active: company.active
    });

    // 6. Testar a geração de código de produto
    console.log('\n6️⃣ Testando geração de código de produto...');
    try {
      const { data: lastProduct } = await supabase
        .from('products')
        .select('code')
        .eq('company_id', profile.company_id)
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
      console.error('❌ PROBLEMA: Erro ao gerar código de produto!');
      console.log('📋 Erro:', error);
    }

    console.log('\n🎯 DIAGNÓSTICO COMPLETO!');
    console.log('✅ Todos os componentes estão funcionando corretamente.');
    console.log('💡 Se o erro ainda persistir, pode ser um problema de cache ou sessão.');

  } catch (error) {
    console.error('❌ Erro inesperado durante o diagnóstico:', error);
  }
}

// Executar o diagnóstico
diagnoseProfileError();






