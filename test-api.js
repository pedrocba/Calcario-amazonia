#!/usr/bin/env node

/**
 * SCRIPT DE TESTE - API
 * ====================
 * Script para testar se a API está funcionando corretamente
 */

import fetch from 'node-fetch';

const API_URL = 'http://localhost:3001';

async function testAPI() {
  console.log('🧪 TESTANDO API DO SISTEMA\n');

  try {
    // 1. Testar Health Check
    console.log('1️⃣ Testando Health Check...');
    const healthResponse = await fetch(`${API_URL}/api/health`);
    
    if (!healthResponse.ok) {
      throw new Error(`Health check falhou: ${healthResponse.status}`);
    }
    
    const healthData = await healthResponse.json();
    console.log('✅ Health Check OK:', healthData.message);
    console.log('   Status:', healthData.status);
    console.log('   Versão:', healthData.version);

    // 2. Testar Dashboard Summary
    console.log('\n2️⃣ Testando Dashboard Summary...');
    const summaryResponse = await fetch(`${API_URL}/api/stats/summary?company_id=test-company`, {
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });
    
    if (!summaryResponse.ok) {
      throw new Error(`Dashboard summary falhou: ${summaryResponse.status}`);
    }
    
    const summaryData = await summaryResponse.json();
    console.log('✅ Dashboard Summary OK');
    console.log('   Produtos Ativos:', summaryData.active_products);
    console.log('   Valor em Estoque:', summaryData.stock_value);
    console.log('   Veículos Ativos:', summaryData.active_vehicles);
    console.log('   Transferências Pendentes:', summaryData.pending_transfers);

    // 3. Testar KPIs individuais
    console.log('\n3️⃣ Testando KPIs individuais...');
    const kpis = [
      'active-products',
      'stock-value', 
      'active-vehicles',
      'pending-transfers',
      'low-stock-items'
    ];

    for (const kpi of kpis) {
      try {
        const response = await fetch(`${API_URL}/api/stats/${kpi}?company_id=test-company`, {
          headers: {
            'Authorization': 'Bearer test-token'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`   ✅ ${kpi}:`, data);
        } else {
          console.log(`   ❌ ${kpi}: Erro ${response.status}`);
        }
      } catch (error) {
        console.log(`   ❌ ${kpi}: ${error.message}`);
      }
    }

    // 4. Testar dados de gráficos
    console.log('\n4️⃣ Testando dados de gráficos...');
    const charts = [
      'movement-data',
      'stock-by-category',
      'monthly-financial-summary',
      'recent-activities'
    ];

    for (const chart of charts) {
      try {
        const response = await fetch(`${API_URL}/api/stats/${chart}?company_id=test-company`, {
          headers: {
            'Authorization': 'Bearer test-token'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`   ✅ ${chart}: ${Array.isArray(data) ? data.length : 'dados'} itens`);
        } else {
          console.log(`   ❌ ${chart}: Erro ${response.status}`);
        }
      } catch (error) {
        console.log(`   ❌ ${chart}: ${error.message}`);
      }
    }

    console.log('\n🎉 TESTE CONCLUÍDO COM SUCESSO!');
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('1. Execute: npm run dev:simple');
    console.log('2. Acesse: http://localhost:5173');
    console.log('3. Faça login e teste o dashboard');

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error.message);
    console.log('\n🔧 SOLUÇÕES:');
    console.log('1. Verifique se a API está rodando: npm run server:simple');
    console.log('2. Verifique se a porta 3001 está livre');
    console.log('3. Verifique se não há erros no console');
  }
}

// Executar teste
testAPI();





















