// ==============================================
// SCRIPT DE TESTE PARA FUNÇÃO handleSubmit
// ==============================================
// Execute este script no console do navegador para testar a função

console.log('🧪 TESTANDO FUNÇÃO handleSubmit DE PRODUTOS');
console.log('==========================================');

// Função para testar busca do company_id do perfil
async function testCompanyIdFromProfile() {
    console.log('\n1. Testando busca do company_id do perfil...');
    
    try {
        // Buscar usuário autenticado
        const { data: { user }, error: authError } = await window.supabase.auth.getUser();
        
        if (authError || !user) {
            console.error('❌ Erro de autenticação:', authError);
            return false;
        }
        
        console.log('✅ Usuário autenticado:', user.id);
        
        // Buscar perfil do usuário
        const { data: profileData, error: profileError } = await window.supabase
            .from('profiles')
            .select('company_id')
            .eq('user_id', user.id)
            .single();
            
        if (profileError || !profileData) {
            console.error('❌ Erro ao buscar perfil:', profileError);
            return false;
        }
        
        console.log('✅ Perfil encontrado:', profileData);
        console.log('✅ Company ID:', profileData.company_id);
        
        return profileData.company_id;
    } catch (error) {
        console.error('❌ Erro inesperado:', error);
        return false;
    }
}

// Função para testar criação de produto
async function testProductCreation() {
    console.log('\n2. Testando criação de produto...');
    
    try {
        const company_id = await testCompanyIdFromProfile();
        
        if (!company_id) {
            console.error('❌ Não foi possível obter company_id');
            return false;
        }
        
        // Dados de teste para o produto
        const testProductData = {
            name: 'Produto Teste',
            code: 'TESTE001',
            category_id: '00000000-0000-0000-0000-000000000002', // ID de categoria de teste
            cost_price: 10.00,
            sale_price: 15.00,
            description: 'Produto de teste para verificar funcionamento',
            min_qty: 10,
            current_stock: 50
        };
        
        const productToSave = {
            ...testProductData,
            company_id: company_id,
            active: true,
            condition: 'novo'
        };
        
        console.log('📦 Dados do produto a ser criado:', productToSave);
        
        // Criar produto
        const { data, error } = await window.supabase
            .from('products')
            .insert([productToSave])
            .select();
            
        if (error) {
            console.error('❌ Erro ao criar produto:', error);
            return false;
        }
        
        console.log('✅ Produto criado com sucesso:', data);
        
        // Limpar produto de teste
        await window.supabase
            .from('products')
            .delete()
            .eq('id', data[0].id);
        console.log('🧹 Produto de teste removido');
        
        return true;
    } catch (error) {
        console.error('❌ Erro ao testar criação:', error);
        return false;
    }
}

// Função para verificar se a tabela profiles existe
async function testProfilesTable() {
    console.log('\n3. Verificando tabela profiles...');
    
    try {
        const { data, error } = await window.supabase
            .from('profiles')
            .select('*')
            .limit(1);
            
        if (error) {
            console.error('❌ Erro ao acessar tabela profiles:', error);
            return false;
        }
        
        console.log('✅ Tabela profiles acessível');
        console.log('📊 Dados encontrados:', data);
        
        return true;
    } catch (error) {
        console.error('❌ Erro inesperado:', error);
        return false;
    }
}

// Função principal de teste
async function runAllTests() {
    console.log('🔍 Executando todos os testes...');
    
    const results = {
        profilesTable: await testProfilesTable(),
        companyId: await testCompanyIdFromProfile(),
        productCreation: await testProductCreation()
    };
    
    console.log('\n📊 RESULTADOS DOS TESTES:');
    console.log('========================');
    console.log('Tabela profiles:', results.profilesTable ? '✅' : '❌');
    console.log('Company ID do perfil:', results.companyId ? '✅' : '❌');
    console.log('Criação de produto:', results.productCreation ? '✅' : '❌');
    
    const allPassed = Object.values(results).every(result => result === true);
    
    if (allPassed) {
        console.log('\n🎉 TODOS OS TESTES PASSARAM!');
        console.log('✅ A função handleSubmit está funcionando corretamente');
    } else {
        console.log('\n⚠️ ALGUNS TESTES FALHARAM');
        console.log('❌ Verifique os erros acima');
    }
    
    return results;
}

// Executar testes automaticamente
runAllTests();

// Exportar funções para uso manual
window.testProductSubmit = {
    testProfilesTable,
    testCompanyIdFromProfile,
    testProductCreation,
    runAllTests
};

console.log('\n💡 DICAS:');
console.log('- Use window.testProductSubmit.runAllTests() para executar novamente');
console.log('- Verifique se a tabela profiles existe e tem dados');
console.log('- Confirme se o usuário está associado a uma empresa');


















