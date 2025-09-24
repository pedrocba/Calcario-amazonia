// Teste para verificar a conversão de UUID
// Execute: node test-uuid-conversion.js

function convertToUUID(idString) {
  if (!idString) return null;
  
  // Se já é um UUID válido, retorna
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(idString)) {
    return idString;
  }
  
  // Se é uma string de 24 caracteres sem hífens, converte para UUID
  if (typeof idString === 'string' && idString.length === 24) {
    const formatted = `${idString.slice(0, 8)}-${idString.slice(8, 12)}-${idString.slice(12, 16)}-${idString.slice(16, 20)}-${idString.slice(20, 24)}`;
    console.log(`🔄 Convertendo ID: "${idString}" → "${formatted}"`);
    
    // Verificar se o UUID convertido é válido
    if (uuidRegex.test(formatted)) {
      return formatted;
    } else {
      console.warn(`⚠️  UUID convertido não é válido: "${formatted}"`);
      // Tentar gerar um UUID válido a partir da string
      return generateValidUUID(idString);
    }
  }
  
  // Se não conseguiu converter, retorna o valor original
  console.warn(`⚠️  Não foi possível converter para UUID: "${idString}"`);
  return idString;
}

function generateValidUUID(idString) {
  // Usar a string como base para gerar um UUID válido
  const padded = idString.padEnd(32, '0').slice(0, 32);
  const formatted = `${padded.slice(0, 8)}-${padded.slice(8, 12)}-4${padded.slice(13, 16)}-8${padded.slice(17, 20)}-${padded.slice(20, 32)}`;
  console.log(`🔧 Gerando UUID válido: "${idString}" → "${formatted}"`);
  return formatted;
}

// Teste com o ID do erro
const testId = "68cacb913d169d191be6c90d";
console.log('🧪 Testando conversão de UUID:');
console.log('ID original:', testId);
console.log('Tamanho:', testId.length);
console.log('Tipo:', typeof testId);

const converted = convertToUUID(testId);
console.log('ID convertido:', converted);
console.log('Tamanho convertido:', converted?.length);

// Verificar se é um UUID válido
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
console.log('É UUID válido?', uuidRegex.test(converted));
