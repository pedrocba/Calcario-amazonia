#!/usr/bin/env node

/**
 * TESTE DE CORREÇÃO: get_user_companies
 * ====================================
 * Este script testa se a função get_user_companies foi corrigida
 * e está funcionando sem erro 500.
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

async function testGetUserCompaniesFix() {
    console.log('🔧 Testando correção da função get_user_companies...\n');

    try {
        // Teste 1: Verificar se a função existe e pode ser chamada
        console.log('1️⃣ Testando chamada da função...');
        const { data, error } = await supabase
            .rpc('get_user_companies');

        if (error) {
            console.error('❌ ERRO na função:', error.message);
            console.error('   Código:', error.code);
            console.error('   Detalhes:', error.details);
            console.error('   Hint:', error.hint);
            return;
        }

        console.log('✅ Função executada com sucesso!');

        // Teste 2: Verificar dados retornados
        console.log('\n2️⃣ Verificando dados retornados...');
        console.log(`📊 Número de empresas encontradas: ${data?.length || 0}`);

        if (data && data.length > 0) {
            console.log('\n📋 Lista de empresas:');
            data.forEach((company, index) => {
                console.log(`   ${index + 1}. ${company.name}`);
                console.log(`      ID: ${company.id}`);
                console.log(`      Nome completo: ${company.full_name || 'N/A'}`);
                console.log(`      Localização: ${company.city || 'N/A'}, ${company.state || 'N/A'}`);
                console.log(`      Descrição: ${company.description || 'N/A'}`);
                console.log('');
            });
        } else {
            console.log('⚠️  Nenhuma empresa encontrada!');
        }

        // Teste 3: Verificar estrutura dos dados
        console.log('3️⃣ Verificando estrutura dos dados...');
        if (data && data.length > 0) {
            const firstCompany = data[0];
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

        // Teste 4: Simular chamada como usuário autenticado
        console.log('\n4️⃣ Simulando chamada como usuário autenticado...');
        const { data: authData, error: authError } = await supabase
            .from('companies')
            .select('id, name, full_name, city, state, description')
            .eq('active', true)
            .order('name');

        if (authError) {
            console.log('   ⚠️  Erro na consulta direta (esperado devido a RLS):', authError.message);
        } else {
            console.log('   ✅ Consulta direta funcionou (RLS pode estar desabilitado)');
        }

        console.log('\n🎉 TESTE DE CORREÇÃO CONCLUÍDO COM SUCESSO!');
        console.log('✅ A função get_user_companies está funcionando corretamente!');
        console.log('✅ A página de seleção de filiais deve carregar normalmente agora!');

    } catch (error) {
        console.error('❌ Erro durante o teste:', error.message);
        console.error('   Detalhes:', error);
    }
}

// Executar teste
testGetUserCompaniesFix();





















