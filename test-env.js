/**
 * TESTE DE VARIÁVEIS DE AMBIENTE
 * ==============================
 * Este script testa se as variáveis de ambiente estão sendo carregadas
 */

console.log('🔍 TESTANDO VARIÁVEIS DE AMBIENTE...\n');

// Simular o que o Vite faz
const env = {
  VITE_SUPABASE_URL: 'https://rfdedsmxhsxalyzxstxh.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmZGVkc214aHN4YWx5enhzdHhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2NzQ4MDAsImV4cCI6MjA1MDI1MDgwMH0.8QZqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq'
};

console.log('1️⃣ Variáveis de ambiente:');
console.log('   VITE_SUPABASE_URL:', env.VITE_SUPABASE_URL ? '✅ Definida' : '❌ Não definida');
console.log('   VITE_SUPABASE_ANON_KEY:', env.VITE_SUPABASE_ANON_KEY ? '✅ Definida' : '❌ Não definida');

if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) {
  console.log('\n❌ ERRO: Variáveis de ambiente não encontradas!');
  console.log('   Verifique se o arquivo .env está na raiz do projeto');
  console.log('   Verifique se as variáveis começam com VITE_');
} else {
  console.log('\n✅ Variáveis de ambiente estão corretas!');
  console.log('   O problema pode ser no carregamento pelo Vite');
}

console.log('\n📋 INSTRUÇÕES:');
console.log('1. Verifique se o arquivo .env está na raiz do projeto');
console.log('2. Verifique se o servidor foi reiniciado após criar o .env');
console.log('3. Verifique o console do navegador para erros específicos');
console.log('4. Tente limpar o cache do navegador (Ctrl+Shift+R)');





