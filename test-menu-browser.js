// TESTE DE FUNCIONALIDADE DOS MENUS
// Execute este arquivo no console do navegador para testar todos os menus

console.log('🧪 TESTE DE FUNCIONALIDADE DOS MENUS');

// Lista de menus para testar
const menusToTest = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Produtos', path: '/Products' },
  { name: 'Almoxarifado', path: '/Warehouse' },
  { name: 'Transferências', path: '/Transfers' },
  { name: 'Relatórios', path: '/Reports' },
  { name: 'Pesagem', path: '/Weighing' },
  { name: 'Veículos', path: '/Vehicles' },
  { name: 'Financeiro', path: '/Finance' },
  { name: 'Usuários', path: '/Users' },
  { name: 'Requisições', path: '/Requisicoes' },
  { name: 'Retiradas', path: '/Retiradas' },
  { name: 'Acesso Sistema', path: '/AcessoSistema' },
  { name: 'Estoque EPIs', path: '/EstoqueEPIs' },
  { name: 'Transferência Simples', path: '/TransferenciaSimples' },
  { name: 'Remessas', path: '/Remessas' },
  { name: 'Ativos TI', path: '/AtivosTI' },
  { name: 'Posto Combustível', path: '/PostoCombustivel' },
  { name: 'Clientes', path: '/Clientes' },
  { name: 'Vendas', path: '/Vendas' }
];

// Função para testar um menu
function testMenu(menu) {
  console.log(`🔍 Testando ${menu.name}...`);
  
  // Verificar se o link existe no DOM
  const link = document.querySelector(`a[href="${menu.path}"]`);
  if (link) {
    console.log(`   ✅ Link encontrado: ${menu.name}`);
    
    // Simular clique
    link.click();
    
    // Verificar se a URL mudou
    setTimeout(() => {
      if (window.location.pathname === menu.path) {
        console.log(`   ✅ Navegação funcionando: ${menu.name}`);
      } else {
        console.log(`   ❌ Navegação falhou: ${menu.name}`);
      }
    }, 1000);
    
  } else {
    console.log(`   ❌ Link não encontrado: ${menu.name}`);
  }
}

// Executar teste
console.log('Iniciando teste de funcionalidade...');
menusToTest.forEach((menu, index) => {
  setTimeout(() => {
    testMenu(menu);
  }, index * 2000); // Testar um menu a cada 2 segundos
});

console.log('Teste iniciado! Verifique os resultados acima.');
