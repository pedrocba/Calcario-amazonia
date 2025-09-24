// --- Início do código para check-env.js ---
require('dotenv').config();

console.log("--- Verificando Variáveis de Ambiente ---");

console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("SUPABASE_SERVICE_KEY:", process.env.SUPABASE_SERVICE_KEY);
console.log("BASE44_API_KEY:", process.env.BASE44_API_KEY);

console.log("---------------------------------------");

if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
    console.log("\n✅ Variáveis do Supabase foram encontradas!");
} else {
    console.log("\n❌ ERRO: Uma ou mais variáveis do Supabase não foram carregadas. Verifique se o arquivo .env está na pasta raiz e se os nomes das variáveis estão corretos.");
}
// --- Fim do código ---
