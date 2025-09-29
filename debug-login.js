// Script de debug para verificar o problema de login
// Execute no console do navegador

console.log('=== DEBUG LOGIN ===');

// Verificar se o Supabase está funcionando
import('./src/lib/supabaseClient.js').then(module => {
  const supabase = module.default;
  console.log('Supabase client:', supabase);
  
  // Verificar sessão atual
  supabase.auth.getSession().then(({ data: { session }, error }) => {
    console.log('Sessão atual:', session);
    console.log('Erro de sessão:', error);
  });
  
  // Verificar usuário atual
  supabase.auth.getUser().then(({ data: { user }, error }) => {
    console.log('Usuário atual:', user);
    console.log('Erro de usuário:', error);
  });
  
  // Testar login
  const testLogin = async () => {
    try {
      console.log('Testando login...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'superadmin@calcarioamazonia.com',
        password: 'teste123'
      });
      
      console.log('Resultado do login:', { data, error });
    } catch (err) {
      console.error('Erro no teste de login:', err);
    }
  };
  
  // Descomente a linha abaixo para testar o login
  // testLogin();
});

// Verificar se a tabela users existe
fetch('/api/rest/v1/users?select=*&limit=1', {
  headers: {
    'apikey': 'YOUR_SUPABASE_ANON_KEY',
    'Authorization': 'Bearer YOUR_SUPABASE_ANON_KEY'
  }
})
.then(response => response.json())
.then(data => {
  console.log('Tabela users:', data);
})
.catch(error => {
  console.error('Erro ao acessar tabela users:', error);
});

console.log('=== FIM DEBUG ===');






















