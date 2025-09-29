/**
 * SCRIPT PARA LIMPAR LOCALSTORAGE
 * ===============================
 * Execute este script no console do navegador para limpar o localStorage
 * e forçar uma nova seleção de empresa.
 */

console.log('🧹 Limpando localStorage...');

// Limpar empresa selecionada
localStorage.removeItem('selectedCompany');
console.log('✅ selectedCompany removido do localStorage');

// Limpar outras chaves relacionadas
localStorage.removeItem('filiais_permanent_fix_applied');
localStorage.removeItem('filiais_fix_date');
console.log('✅ Chaves de correção removidas do localStorage');

console.log('🎯 Agora atualize a página (F5) para selecionar uma empresa novamente!');














