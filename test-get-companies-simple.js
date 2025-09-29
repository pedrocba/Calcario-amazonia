#!/usr/bin/env node

/**
 * TESTE DA FUNÇÃO get_companies_simple
 * ===================================
 * Este script testa se a função get_companies_simple está funcionando
 * corretamente no Supabase.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Configuração do Supabase não encontrada no arquivo .env!');
    process.exit(1);
}

// Cliente Supabase com service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function testGetCompaniesSimple() {
    console.log('🧪 Testando função get_companies_simple...\n');

    try {
        // Teste 1: Verificar se a função existe
        console.log('1️⃣ Verificando se a função existe...');
        const { data: functionExists, error: functionError } = await supabase
            .rpc('get_companies_simple');

        if (functionError) {
            console.error('❌ Erro ao chamar a função:', functionError.message);
            console.error('   Detalhes:', functionError);
            return;
        }

        console.log('✅ Função existe e pode ser chamada!');

        // Teste 2: Verificar dados retornados
        console.log('\n2️⃣ Verificando dados retornados...');
        console.log(`📊 Número de empresas encontradas: ${functionExists?.length || 0}`);

        if (functionExists && functionExists.length > 0) {
            console.log('\n📋 Dados das empresas:');
            functionExists.forEach((company, index) => {
                console.log(`   ${index + 1}. ${company.name} (${company.city}, ${company.state})`);
                console.log(`      ID: ${company.id}`);
                console.log(`      Descrição: ${company.description || 'N/A'}`);
                console.log('');
            });
        } else {
            console.log('⚠️  Nenhuma empresa encontrada!');
        }

        // Teste 3: Verificar estrutura dos dados
        console.log('3️⃣ Verificando estrutura dos dados...');
        if (functionExists && functionExists.length > 0) {
            const firstCompany = functionExists[0];
            const expectedFields = ['id', 'name', 'full_name', 'city', 'state', 'description'];
            const actualFields = Object.keys(firstCompany);
            
            console.log('   Campos esperados:', expectedFields.join(', '));
            console.log('   Campos retornados:', actualFields.join(', '));
            
            const missingFields = expectedFields.filter(field => !actualFields.includes(field));
            if (missingFields.length > 0) {
                console.log('   ⚠️  Campos faltando:', missingFields.join(', '));
            } else {
                console.log('   ✅ Todos os campos esperados estão presentes!');
            }
        }

        console.log('\n🎉 Teste concluído com sucesso!');

    } catch (error) {
        console.error('❌ Erro durante o teste:', error.message);
        console.error('   Detalhes:', error);
    }
}

// Executar teste
testGetCompaniesSimple();





















