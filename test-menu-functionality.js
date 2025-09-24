#!/usr/bin/env node

/**
 * SCRIPT DE TESTE COMPLETO - FUNCIONALIDADE DOS MENUS
 * ==================================================
 * Script para testar se todos os menus estão funcionando corretamente
 */

import fs from 'fs';
import path from 'path';

// Configuração
const PROJECT_ROOT = process.cwd();
const PAGES_DIR = path.join(PROJECT_ROOT, 'src', 'pages');
const CONFIG_DIR = path.join(PROJECT_ROOT, 'src', 'config');

console.log('🧪 TESTE COMPLETO DE FUNCIONALIDADE DOS MENUS\n');

// 1. Verificar arquivo de navegação
console.log('1️⃣ Verificando configuração de navegação...');
try {
  const navigationPath = path.join(CONFIG_DIR, 'navigation.js');
  const navigationContent = fs.readFileSync(navigationPath, 'utf8');
  
  // Extrair todos os paths do menu
  const pathMatches = navigationContent.match(/path:\s*['"`]([^'"`]+)['"`]/g);
  const menuPaths = pathMatches ? pathMatches.map(match => 
    match.replace(/path:\s*['"`]/, '').replace(/['"`]/, '')
  ) : [];
  
  console.log(`   ✅ Arquivo de navegação encontrado`);
  console.log(`   📊 Total de itens de menu: ${menuPaths.length}`);
  console.log(`   🔗 Paths encontrados: ${menuPaths.slice(0, 5).join(', ')}${menuPaths.length > 5 ? '...' : ''}`);
  
} catch (error) {
  console.error('   ❌ Erro ao ler arquivo de navegação:', error.message);
}

// 2. Verificar arquivo de rotas
console.log('\n2️⃣ Verificando configuração de rotas...');
try {
  const routesPath = path.join(PROJECT_ROOT, 'src', 'pages', 'index.jsx');
  const routesContent = fs.readFileSync(routesPath, 'utf8');
  
  // Extrair todas as rotas definidas
  const routeMatches = routesContent.match(/path=["`']([^"`']+)["`']/g);
  const definedRoutes = routeMatches ? routeMatches.map(match => 
    match.replace(/path=["`']/, '').replace(/["`']/, '')
  ) : [];
  
  console.log(`   ✅ Arquivo de rotas encontrado`);
  console.log(`   📊 Total de rotas definidas: ${definedRoutes.length}`);
  console.log(`   🔗 Rotas encontradas: ${definedRoutes.slice(0, 5).join(', ')}${definedRoutes.length > 5 ? '...' : ''}`);
  
} catch (error) {
  console.error('   ❌ Erro ao ler arquivo de rotas:', error.message);
}

// 3. Verificar páginas existentes
console.log('\n3️⃣ Verificando páginas existentes...');
try {
  const pageFiles = fs.readdirSync(PAGES_DIR)
    .filter(file => file.endsWith('.jsx') && !file.startsWith('index'))
    .map(file => file.replace('.jsx', ''));
  
  console.log(`   ✅ Diretório de páginas encontrado`);
  console.log(`   📊 Total de páginas: ${pageFiles.length}`);
  console.log(`   📄 Páginas encontradas: ${pageFiles.slice(0, 10).join(', ')}${pageFiles.length > 10 ? '...' : ''}`);
  
} catch (error) {
  console.error('   ❌ Erro ao ler diretório de páginas:', error.message);
}

// 4. Verificar imports no index.jsx
console.log('\n4️⃣ Verificando imports no index.jsx...');
try {
  const indexPath = path.join(PROJECT_ROOT, 'src', 'pages', 'index.jsx');
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  
  // Extrair imports
  const importMatches = indexContent.match(/import\s+(\w+)\s+from\s+["`']\.\/([^"`']+)["`']/g);
  const imports = importMatches ? importMatches.map(match => {
    const parts = match.match(/import\s+(\w+)\s+from\s+["`']\.\/([^"`']+)["`']/);
    return { name: parts[1], file: parts[2] };
  }) : [];
  
  console.log(`   ✅ Arquivo index.jsx encontrado`);
  console.log(`   📊 Total de imports: ${imports.length}`);
  console.log(`   📦 Imports encontrados: ${imports.slice(0, 5).map(i => i.name).join(', ')}${imports.length > 5 ? '...' : ''}`);
  
} catch (error) {
  console.error('   ❌ Erro ao ler index.jsx:', error.message);
}

// 5. Verificar se há problemas de case sensitivity
console.log('\n5️⃣ Verificando problemas de case sensitivity...');
try {
  const navigationPath = path.join(CONFIG_DIR, 'navigation.js');
  const navigationContent = fs.readFileSync(navigationPath, 'utf8');
  
  // Extrair paths do menu
  const pathMatches = navigationContent.match(/path:\s*['"`]([^'"`]+)['"`]/g);
  const menuPaths = pathMatches ? pathMatches.map(match => 
    match.replace(/path:\s*['"`]/, '').replace(/['"`]/, '')
  ) : [];
  
  // Verificar se há inconsistências de case
  const caseIssues = [];
  menuPaths.forEach(menuPath => {
    if (menuPath !== menuPath.toLowerCase() && menuPath !== menuPath.toUpperCase()) {
      caseIssues.push(menuPath);
    }
  });
  
  if (caseIssues.length > 0) {
    console.log(`   ⚠️  Possíveis problemas de case encontrados: ${caseIssues.join(', ')}`);
  } else {
    console.log(`   ✅ Nenhum problema de case detectado`);
  }
  
} catch (error) {
  console.error('   ❌ Erro ao verificar case sensitivity:', error.message);
}

// 6. Verificar se todas as páginas do menu existem
console.log('\n6️⃣ Verificando se todas as páginas do menu existem...');
try {
  const navigationPath = path.join(CONFIG_DIR, 'navigation.js');
  const navigationContent = fs.readFileSync(navigationPath, 'utf8');
  
  // Extrair paths do menu
  const pathMatches = navigationContent.match(/path:\s*['"`]([^'"`]+)['"`]/g);
  const menuPaths = pathMatches ? pathMatches.map(match => 
    match.replace(/path:\s*['"`]/, '').replace(/['"`]/, '')
  ) : [];
  
  const missingPages = [];
  const existingPages = fs.readdirSync(PAGES_DIR)
    .filter(file => file.endsWith('.jsx') && !file.startsWith('index'))
    .map(file => file.replace('.jsx', ''));
  
  menuPaths.forEach(menuPath => {
    const pageName = menuPath.replace('/', '');
    if (!existingPages.includes(pageName)) {
      missingPages.push(menuPath);
    }
  });
  
  if (missingPages.length > 0) {
    console.log(`   ❌ Páginas faltando: ${missingPages.join(', ')}`);
  } else {
    console.log(`   ✅ Todas as páginas do menu existem`);
  }
  
} catch (error) {
  console.error('   ❌ Erro ao verificar páginas:', error.message);
}

// 7. Gerar relatório de funcionalidade
console.log('\n7️⃣ Gerando relatório de funcionalidade...');

const functionalityReport = {
  timestamp: new Date().toISOString(),
  navigation: {
    totalItems: 0,
    paths: []
  },
  routes: {
    totalRoutes: 0,
    paths: []
  },
  pages: {
    totalPages: 0,
    files: []
  },
  issues: []
};

try {
  // Coletar dados do relatório
  const navigationPath = path.join(CONFIG_DIR, 'navigation.js');
  const navigationContent = fs.readFileSync(navigationPath, 'utf8');
  const pathMatches = navigationContent.match(/path:\s*['"`]([^'"`]+)['"`]/g);
  functionalityReport.navigation.paths = pathMatches ? pathMatches.map(match => 
    match.replace(/path:\s*['"`]/, '').replace(/['"`]/, '')
  ) : [];
  functionalityReport.navigation.totalItems = functionalityReport.navigation.paths.length;
  
  const routesPath = path.join(PROJECT_ROOT, 'src', 'pages', 'index.jsx');
  const routesContent = fs.readFileSync(routesPath, 'utf8');
  const routeMatches = routesContent.match(/path=["`']([^"`']+)["`']/g);
  functionalityReport.routes.paths = routeMatches ? routeMatches.map(match => 
    match.replace(/path=["`']/, '').replace(/["`']/, '')
  ) : [];
  functionalityReport.routes.totalRoutes = functionalityReport.routes.paths.length;
  
  const pageFiles = fs.readdirSync(PAGES_DIR)
    .filter(file => file.endsWith('.jsx') && !file.startsWith('index'))
    .map(file => file.replace('.jsx', ''));
  functionalityReport.pages.files = pageFiles;
  functionalityReport.pages.totalPages = pageFiles.length;
  
  // Salvar relatório
  const reportPath = path.join(PROJECT_ROOT, 'menu-functionality-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(functionalityReport, null, 2));
  
  console.log(`   ✅ Relatório salvo em: ${reportPath}`);
  
} catch (error) {
  console.error('   ❌ Erro ao gerar relatório:', error.message);
}

console.log('\n🎉 TESTE DE FUNCIONALIDADE CONCLUÍDO!');
console.log('\n📋 PRÓXIMOS PASSOS:');
console.log('1. Verifique o relatório gerado: menu-functionality-report.json');
console.log('2. Execute o sistema: npm run dev:simple');
console.log('3. Teste cada menu clicando nele');
console.log('4. Verifique se as páginas carregam corretamente');

console.log('\n🔧 COMANDOS ÚTEIS:');
console.log('npm run dev:simple  # Executar sistema completo');
console.log('npm run dev         # Executar apenas frontend');
console.log('node test-api.js    # Testar API');


