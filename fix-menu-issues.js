#!/usr/bin/env node

/**
 * SCRIPT DE CORREÇÃO AUTOMÁTICA - PROBLEMAS DE MENU
 * ================================================
 * Script para corrigir automaticamente problemas comuns nos menus
 */

import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = process.cwd();
const PAGES_DIR = path.join(PROJECT_ROOT, 'src', 'pages');
const CONFIG_DIR = path.join(PROJECT_ROOT, 'src', 'config');

console.log('🔧 CORREÇÃO AUTOMÁTICA DE PROBLEMAS DE MENU\n');

// 1. Verificar e corrigir problemas de case sensitivity
console.log('1️⃣ Verificando problemas de case sensitivity...');
try {
  const navigationPath = path.join(CONFIG_DIR, 'navigation.js');
  let navigationContent = fs.readFileSync(navigationPath, 'utf8');
  
  // Padronizar paths para começar com maiúscula
  const pathRegex = /path:\s*['"`]([^'"`]+)['"`]/g;
  let match;
  const corrections = [];
  
  while ((match = pathRegex.exec(navigationContent)) !== null) {
    const originalPath = match[1];
    const correctedPath = '/' + originalPath.split('/').pop().charAt(0).toUpperCase() + 
                         originalPath.split('/').pop().slice(1);
    
    if (originalPath !== correctedPath) {
      corrections.push({ original: originalPath, corrected: correctedPath });
    }
  }
  
  if (corrections.length > 0) {
    console.log(`   ⚠️  Encontrados ${corrections.length} problemas de case:`);
    corrections.forEach(correction => {
      console.log(`      ${correction.original} → ${correction.corrected}`);
    });
    
    // Aplicar correções
    corrections.forEach(correction => {
      navigationContent = navigationContent.replace(
        `path: '${correction.original}'`,
        `path: '${correction.corrected}'`
      );
      navigationContent = navigationContent.replace(
        `path: "${correction.original}"`,
        `path: "${correction.corrected}"`
      );
    });
    
    fs.writeFileSync(navigationPath, navigationContent);
    console.log(`   ✅ Correções aplicadas no arquivo de navegação`);
  } else {
    console.log(`   ✅ Nenhum problema de case encontrado`);
  }
  
} catch (error) {
  console.error('   ❌ Erro ao corrigir case sensitivity:', error.message);
}

// 2. Verificar e corrigir rotas duplicadas
console.log('\n2️⃣ Verificando rotas duplicadas...');
try {
  const routesPath = path.join(PROJECT_ROOT, 'src', 'pages', 'index.jsx');
  let routesContent = fs.readFileSync(routesPath, 'utf8');
  
  // Extrair todas as rotas
  const routeRegex = /path=["`']([^"`']+)["`']/g;
  const routes = [];
  let match;
  
  while ((match = routeRegex.exec(routesContent)) !== null) {
    routes.push(match[1]);
  }
  
  // Encontrar duplicatas
  const duplicates = routes.filter((route, index) => routes.indexOf(route) !== index);
  const uniqueDuplicates = [...new Set(duplicates)];
  
  if (uniqueDuplicates.length > 0) {
    console.log(`   ⚠️  Encontradas ${uniqueDuplicates.length} rotas duplicadas:`);
    uniqueDuplicates.forEach(duplicate => {
      console.log(`      ${duplicate}`);
    });
    console.log(`   💡 Considere remover as duplicatas manualmente`);
  } else {
    console.log(`   ✅ Nenhuma rota duplicada encontrada`);
  }
  
} catch (error) {
  console.error('   ❌ Erro ao verificar rotas duplicadas:', error.message);
}

// 3. Verificar e corrigir imports faltando
console.log('\n3️⃣ Verificando imports faltando...');
try {
  const indexPath = path.join(PROJECT_ROOT, 'src', 'pages', 'index.jsx');
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  
  // Extrair imports existentes
  const importRegex = /import\s+(\w+)\s+from\s+["`']\.\/([^"`']+)["`']/g;
  const imports = [];
  let match;
  
  while ((match = importRegex.exec(indexContent)) !== null) {
    imports.push({ name: match[1], file: match[2] });
  }
  
  // Verificar se todos os imports têm arquivos correspondentes
  const missingFiles = [];
  imports.forEach(importItem => {
    const filePath = path.join(PAGES_DIR, importItem.file + '.jsx');
    if (!fs.existsSync(filePath)) {
      missingFiles.push(importItem);
    }
  });
  
  if (missingFiles.length > 0) {
    console.log(`   ⚠️  Encontrados ${missingFiles.length} imports sem arquivo:`);
    missingFiles.forEach(importItem => {
      console.log(`      ${importItem.name} → ${importItem.file}.jsx`);
    });
  } else {
    console.log(`   ✅ Todos os imports têm arquivos correspondentes`);
  }
  
} catch (error) {
  console.error('   ❌ Erro ao verificar imports:', error.message);
}

// 4. Verificar e corrigir problemas de roteamento
console.log('\n4️⃣ Verificando problemas de roteamento...');
try {
  const navigationPath = path.join(CONFIG_DIR, 'navigation.js');
  const navigationContent = fs.readFileSync(navigationPath, 'utf8');
  
  // Extrair paths do menu
  const pathRegex = /path:\s*['"`]([^'"`]+)['"`]/g;
  const menuPaths = [];
  let match;
  
  while ((match = pathRegex.exec(navigationContent)) !== null) {
    menuPaths.push(match[1]);
  }
  
  // Verificar se todas as rotas do menu estão definidas no index.jsx
  const routesPath = path.join(PROJECT_ROOT, 'src', 'pages', 'index.jsx');
  const routesContent = fs.readFileSync(routesPath, 'utf8');
  
  const missingRoutes = [];
  menuPaths.forEach(menuPath => {
    if (!routesContent.includes(`path="${menuPath}"`)) {
      missingRoutes.push(menuPath);
    }
  });
  
  if (missingRoutes.length > 0) {
    console.log(`   ⚠️  Encontradas ${missingRoutes.length} rotas faltando no index.jsx:`);
    missingRoutes.forEach(route => {
      console.log(`      ${route}`);
    });
    console.log(`   💡 Adicione essas rotas no arquivo index.jsx`);
  } else {
    console.log(`   ✅ Todas as rotas do menu estão definidas`);
  }
  
} catch (error) {
  console.error('   ❌ Erro ao verificar roteamento:', error.message);
}

// 5. Criar arquivo de teste de funcionalidade
console.log('\n5️⃣ Criando arquivo de teste de funcionalidade...');
try {
  const testContent = `// TESTE DE FUNCIONALIDADE DOS MENUS
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
  console.log(\`🔍 Testando \${menu.name}...\`);
  
  // Verificar se o link existe no DOM
  const link = document.querySelector(\`a[href="\${menu.path}"]\`);
  if (link) {
    console.log(\`   ✅ Link encontrado: \${menu.name}\`);
    
    // Simular clique
    link.click();
    
    // Verificar se a URL mudou
    setTimeout(() => {
      if (window.location.pathname === menu.path) {
        console.log(\`   ✅ Navegação funcionando: \${menu.name}\`);
      } else {
        console.log(\`   ❌ Navegação falhou: \${menu.name}\`);
      }
    }, 1000);
    
  } else {
    console.log(\`   ❌ Link não encontrado: \${menu.name}\`);
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
`;

  const testPath = path.join(PROJECT_ROOT, 'test-menu-browser.js');
  fs.writeFileSync(testPath, testContent);
  console.log(`   ✅ Arquivo de teste criado: ${testPath}`);
  
} catch (error) {
  console.error('   ❌ Erro ao criar arquivo de teste:', error.message);
}

console.log('\n🎉 CORREÇÃO AUTOMÁTICA CONCLUÍDA!');
console.log('\n📋 PRÓXIMOS PASSOS:');
console.log('1. Execute: npm run dev:simple');
console.log('2. Abra o console do navegador (F12)');
console.log('3. Cole e execute o conteúdo de test-menu-browser.js');
console.log('4. Verifique se todos os menus funcionam');

console.log('\n🔧 COMANDOS ÚTEIS:');
console.log('npm run dev:simple     # Executar sistema');
console.log('node test-api.js       # Testar API');
console.log('node test-menu-functionality.js  # Teste completo');





















