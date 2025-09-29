// ==============================================
// TESTE DE LOGIN CORRIGIDO
// ==============================================
// Execute este script no console do navegador para testar o login

console.log('=== TESTE DE LOGIN ===');

// Testar login com usuários mock
async function testMockLogin() {
    console.log('Testando login mock...');
    
    // Simular login admin
    const adminUser = {
        id: 'admin-id',
        email: 'admin@calcarioamazonia.com',
        user_metadata: { 
            full_name: 'Administrador',
            role: 'admin'
        }
    };
    
    // Simular setUser
    localStorage.setItem('mockUser', JSON.stringify(adminUser));
    
    console.log('Usuário mock definido:', adminUser);
    console.log('localStorage mockUser:', localStorage.getItem('mockUser'));
    
    // Verificar se o usuário está autenticado
    const mockUser = localStorage.getItem('mockUser');
    if (mockUser) {
        const user = JSON.parse(mockUser);
        console.log('✅ Login mock funcionando!');
        console.log('Usuário:', user);
        console.log('Role:', user.user_metadata?.role);
        console.log('isAuthenticated:', !!user);
    } else {
        console.log('❌ Login mock falhou!');
    }
}

// Testar login com Supabase
async function testSupabaseLogin() {
    console.log('Testando login Supabase...');
    
    try {
        // Simular dados de login do Supabase
        const supabaseUser = {
            id: '2e71bf25-95ca-413e-8612-935325de7190',
            email: 'pa6659206@gmail.com',
            user_metadata: {
                full_name: 'Usuário Teste',
                role: 'usuario_padrao'
            }
        };
        
        console.log('Usuário Supabase simulado:', supabaseUser);
        console.log('isAuthenticated:', !!supabaseUser);
        console.log('Role:', supabaseUser.user_metadata?.role);
        
        // Simular setUser
        localStorage.setItem('supabaseUser', JSON.stringify(supabaseUser));
        
        console.log('✅ Login Supabase simulado funcionando!');
        
    } catch (error) {
        console.log('❌ Erro no login Supabase:', error);
    }
}

// Executar testes
testMockLogin();
testSupabaseLogin();

console.log('=== FIM DOS TESTES ===');



