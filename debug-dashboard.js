#!/usr/bin/env node

/**
 * SCRIPT DE DEBUG - DASHBOARD
 * ===========================
 * Script para testar se a API está funcionando e identificar
 * problemas que podem estar causando a tela branca.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Configuração do Supabase não encontrada!');
    process.exit(1);
}

// Cliente Supabase
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function debugDashboard() {
    console.log('🔍 DEBUG DO DASHBOARD - CBA Mineração\n');

    try {
        // 1. Testar conexão com Supabase
        console.log('1️⃣ Testando conexão com Supabase...');
        const { data: companies, error: companiesError } = await supabase
            .from('companies')
            .select('id, name, active')
            .limit(5);

        if (companiesError) {
            console.error('❌ Erro ao conectar com Supabase:', companiesError.message);
            return;
        }

        console.log('✅ Conexão com Supabase OK');
        console.log(`📊 Empresas encontradas: ${companies?.length || 0}`);
        if (companies && companies.length > 0) {
            console.log('   Primeira empresa:', companies[0]);
        }

        // 2. Testar função get_user_companies
        console.log('\n2️⃣ Testando função get_user_companies...');
        const { data: userCompanies, error: userCompaniesError } = await supabase
            .rpc('get_user_companies');

        if (userCompaniesError) {
            console.error('❌ Erro na função get_user_companies:', userCompaniesError.message);
        } else {
            console.log('✅ Função get_user_companies OK');
            console.log(`📊 Empresas retornadas: ${userCompanies?.length || 0}`);
        }

        // 3. Testar dados de produtos
        console.log('\n3️⃣ Testando dados de produtos...');
        const { data: products, error: productsError } = await supabase
            .from('products')
            .select('id, name, active, company_id')
            .limit(5);

        if (productsError) {
            console.error('❌ Erro ao buscar produtos:', productsError.message);
        } else {
            console.log('✅ Produtos OK');
            console.log(`📊 Produtos encontrados: ${products?.length || 0}`);
        }

        // 4. Testar dados de veículos
        console.log('\n4️⃣ Testando dados de veículos...');
        const { data: vehicles, error: vehiclesError } = await supabase
            .from('vehicles')
            .select('id, plate, status, company_id')
            .limit(5);

        if (vehiclesError) {
            console.error('❌ Erro ao buscar veículos:', vehiclesError.message);
        } else {
            console.log('✅ Veículos OK');
            console.log(`📊 Veículos encontrados: ${vehicles?.length || 0}`);
        }

        // 5. Testar API externa (se estiver rodando)
        console.log('\n5️⃣ Testando API externa...');
        try {
            const response = await fetch('http://localhost:3001/api/health');
            if (response.ok) {
                const data = await response.json();
                console.log('✅ API externa OK:', data.message);
            } else {
                console.log('⚠️  API externa não está rodando (isso é normal se não executou o servidor)');
            }
        } catch (error) {
            console.log('⚠️  API externa não está rodando (isso é normal se não executou o servidor)');
        }

        console.log('\n🎉 DEBUG CONCLUÍDO!');
        console.log('\n📋 PRÓXIMOS PASSOS:');
        console.log('1. Se todos os testes passaram, o problema pode estar no frontend');
        console.log('2. Verifique o console do navegador para erros JavaScript');
        console.log('3. Verifique se o usuário está logado e tem uma filial selecionada');
        console.log('4. Execute: npm run dev para testar o frontend');

    } catch (error) {
        console.error('❌ Erro durante o debug:', error.message);
        console.error('   Detalhes:', error);
    }
}

// Executar debug
debugDashboard();














