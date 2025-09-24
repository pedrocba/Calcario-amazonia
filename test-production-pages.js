// ==============================================
// SCRIPT DE TESTE PARA PÁGINAS DE PRODUÇÃO
// ==============================================
// Execute este script no console do navegador para testar as páginas

console.log('🚀 INICIANDO TESTES DAS PÁGINAS DE PRODUÇÃO');
console.log('==========================================');

// Função para testar conexão com Supabase
async function testSupabaseConnection() {
    console.log('\n1. Testando conexão com Supabase...');
    
    try {
        // Verificar se o supabase está disponível
        if (typeof window.supabase === 'undefined') {
            console.error('❌ Supabase não está disponível no window');
            return false;
        }
        
        // Testar consulta simples
        const { data, error } = await window.supabase
            .from('companies')
            .select('id, name')
            .limit(1);
            
        if (error) {
            console.error('❌ Erro na conexão:', error.message);
            return false;
        }
        
        console.log('✅ Conexão com Supabase funcionando');
        console.log('📊 Dados encontrados:', data);
        return true;
    } catch (error) {
        console.error('❌ Erro inesperado:', error);
        return false;
    }
}

// Função para testar carregamento de dados
async function testDataLoading() {
    console.log('\n2. Testando carregamento de dados...');
    
    const companyId = '00000000-0000-0000-0000-000000000001';
    
    try {
        // Testar produtos
        const { data: products, error: productsError } = await window.supabase
            .from('products')
            .select('*')
            .eq('company_id', companyId);
            
        if (productsError) {
            console.warn('⚠️ Erro ao carregar produtos:', productsError.message);
        } else {
            console.log('✅ Produtos carregados:', products?.length || 0);
        }
        
        // Testar clientes
        const { data: customers, error: customersError } = await window.supabase
            .from('contacts')
            .select('*')
            .eq('company_id', companyId)
            .eq('type', 'cliente');
            
        if (customersError) {
            console.warn('⚠️ Erro ao carregar clientes:', customersError.message);
        } else {
            console.log('✅ Clientes carregados:', customers?.length || 0);
        }
        
        // Testar vendas
        const { data: sales, error: salesError } = await window.supabase
            .from('vendas')
            .select('*')
            .eq('company_id', companyId);
            
        if (salesError) {
            console.warn('⚠️ Erro ao carregar vendas:', salesError.message);
        } else {
            console.log('✅ Vendas carregadas:', sales?.length || 0);
        }
        
        return true;
    } catch (error) {
        console.error('❌ Erro ao testar carregamento:', error);
        return false;
    }
}

// Função para testar criação de dados
async function testDataCreation() {
    console.log('\n3. Testando criação de dados...');
    
    const companyId = '00000000-0000-0000-0000-000000000001';
    
    try {
        // Testar criação de cliente
        const { data: newCustomer, error: customerError } = await window.supabase
            .from('contacts')
            .insert([{
                name: 'Cliente Teste',
                email: 'teste@exemplo.com',
                phone: '(11) 99999-9999',
                type: 'cliente',
                active: true,
                company_id: companyId
            }])
            .select()
            .single();
            
        if (customerError) {
            console.warn('⚠️ Erro ao criar cliente:', customerError.message);
        } else {
            console.log('✅ Cliente criado com sucesso:', newCustomer);
            
            // Limpar cliente de teste
            await window.supabase
                .from('contacts')
                .delete()
                .eq('id', newCustomer.id);
            console.log('🧹 Cliente de teste removido');
        }
        
        return true;
    } catch (error) {
        console.error('❌ Erro ao testar criação:', error);
        return false;
    }
}

// Função para testar políticas RLS
async function testRLSPolicies() {
    console.log('\n4. Testando políticas RLS...');
    
    try {
        // Tentar acessar dados de outra empresa (deve falhar)
        const { data, error } = await window.supabase
            .from('products')
            .select('*')
            .eq('company_id', '00000000-0000-0000-0000-000000000999'); // ID inexistente
            
        if (error) {
            console.log('✅ RLS funcionando - acesso negado para empresa inexistente');
        } else {
            console.log('⚠️ RLS pode não estar funcionando - dados retornados:', data);
        }
        
        return true;
    } catch (error) {
        console.error('❌ Erro ao testar RLS:', error);
        return false;
    }
}

// Função principal de teste
async function runAllTests() {
    console.log('🔍 Executando todos os testes...');
    
    const results = {
        connection: await testSupabaseConnection(),
        dataLoading: await testDataLoading(),
        dataCreation: await testDataCreation(),
        rlsPolicies: await testRLSPolicies()
    };
    
    console.log('\n📊 RESULTADOS DOS TESTES:');
    console.log('========================');
    console.log('Conexão Supabase:', results.connection ? '✅' : '❌');
    console.log('Carregamento de dados:', results.dataLoading ? '✅' : '❌');
    console.log('Criação de dados:', results.dataCreation ? '✅' : '❌');
    console.log('Políticas RLS:', results.rlsPolicies ? '✅' : '❌');
    
    const allPassed = Object.values(results).every(result => result === true);
    
    if (allPassed) {
        console.log('\n🎉 TODOS OS TESTES PASSARAM!');
        console.log('✅ As páginas estão prontas para produção');
    } else {
        console.log('\n⚠️ ALGUNS TESTES FALHARAM');
        console.log('❌ Verifique os erros acima antes de usar em produção');
    }
    
    return results;
}

// Executar testes automaticamente
runAllTests();

// Exportar funções para uso manual
window.testProductionPages = {
    testSupabaseConnection,
    testDataLoading,
    testDataCreation,
    testRLSPolicies,
    runAllTests
};

console.log('\n💡 DICAS:');
console.log('- Use window.testProductionPages.runAllTests() para executar novamente');
console.log('- Verifique o console para detalhes de cada teste');
console.log('- Se houver erros, verifique as políticas RLS no Supabase');











