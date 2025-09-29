/**
 * 🔧 CORREÇÃO NO NAVEGADOR - Erro de Perfil/Filial
 * ================================================
 * 
 * Cole este código no console do navegador (F12 -> Console)
 * e execute para corrigir o problema automaticamente.
 */

(async function fixProfileError() {
  console.log('🔧 INICIANDO CORREÇÃO NO NAVEGADOR...\n');

  try {
    // Verificar se o Supabase está disponível
    if (typeof window.supabase === 'undefined') {
      console.error('❌ Supabase não está disponível!');
      console.log('💡 Certifique-se de estar na página da aplicação.');
      return;
    }

    // 1. Verificar autenticação
    console.log('1️⃣ Verificando autenticação...');
    const { data: { user }, error: authError } = await window.supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('❌ Usuário não está autenticado!');
      console.log('💡 Faça login na aplicação primeiro.');
      return;
    }
    
    console.log('✅ Usuário autenticado:', user.email);

    // 2. Criar empresa padrão se não existir
    console.log('\n2️⃣ Verificando/criando empresa padrão...');
    const defaultCompanyId = '00000000-0000-0000-0000-000000000001';
    
    const { data: existingCompany } = await window.supabase
      .from('companies')
      .select('id')
      .eq('id', defaultCompanyId)
      .single();
    
    if (!existingCompany) {
      const { error: insertCompanyError } = await window.supabase
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
        console.log('💡 Execute o script SQL primeiro para criar as tabelas.');
        return;
      } else {
        console.log('✅ Empresa padrão criada');
      }
    } else {
      console.log('✅ Empresa padrão já existe');
    }

    // 3. Verificar se o usuário já tem perfil
    console.log('\n3️⃣ Verificando perfil do usuário...');
    const { data: existingProfile } = await window.supabase
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
        const { data: company } = await window.supabase
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

    // 4. Criar/atualizar perfil do usuário
    console.log('\n4️⃣ Criando/atualizando perfil do usuário...');
    const profileData = {
      user_id: user.id,
      company_id: defaultCompanyId,
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
      email: user.email,
      role: 'admin'
    };

    const { error: upsertError } = await window.supabase
      .from('profiles')
      .upsert(profileData, { 
        onConflict: 'user_id',
        ignoreDuplicates: false 
      });
    
    if (upsertError) {
      console.error('❌ Erro ao criar/atualizar perfil:', upsertError);
      console.log('💡 Execute o script SQL primeiro para criar as tabelas.');
      return;
    }
    
    console.log('✅ Perfil do usuário criado/atualizado:', profileData);

    // 5. Testar a geração de código de produto
    console.log('\n5️⃣ Testando geração de código de produto...');
    try {
      const { data: lastProduct } = await window.supabase
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
    console.log('✅ Empresa padrão configurada');
    console.log('✅ Perfil do usuário criado/atualizado');
    console.log('💡 Agora teste criar um produto na aplicação!');

  } catch (error) {
    console.error('❌ Erro inesperado durante a correção:', error);
  }
})();






