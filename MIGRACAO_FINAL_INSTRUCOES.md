# 🚀 **MIGRAÇÃO FINAL - INSTRUÇÕES DE EXECUÇÃO**

## 📋 **Plano de Execução Completo**

### **Fase 1: Preparação (5 minutos)**

#### **1.1 Backup do Sistema Atual**
```bash
# Fazer backup do banco atual (se necessário)
pg_dump -h your-host -U your-user -d your-db > backup_antes_migracao.sql
```

#### **1.2 Verificar Variáveis de Ambiente**
```bash
# Verificar se o arquivo .env está correto
cat .env | grep SUPABASE
```

**Deve conter:**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### **Fase 2: Limpeza (2 minutos)**

#### **2.1 Executar Limpeza no Supabase**
1. Acesse o **Supabase Dashboard**
2. Vá para **SQL Editor**
3. Execute o arquivo `cleanup-test-data.sql`
4. Verifique se a limpeza foi bem-sucedida

**Resultado esperado:**
```
Dados de teste limpos com sucesso! Pronto para migração completa.
```

### **Fase 3: Migração (10-30 minutos)**

#### **3.1 Executar Script de Migração**
```bash
# Instalar dependências (se necessário)
npm install dotenv

# Executar migração
node migrate-complete-data.js
```

**Logs esperados:**
```
ℹ️ [timestamp] 🚀 Iniciando migração completa de dados...
ℹ️ [timestamp] ✅ Conexão com Supabase estabelecida
ℹ️ [timestamp] Iniciando migração da tabela: companies
ℹ️ [timestamp] Migrando 2 registros em 1 lotes
ℹ️ [timestamp] Lote 1/1 migrado com sucesso (2 registros)
ℹ️ [timestamp] ✅ Migração da tabela companies concluída: 2/2 registros migrados
...
ℹ️ [timestamp] 🎉 Migração concluída com sucesso!
```

#### **3.2 Verificar Migração**
```bash
# Executar verificação
node verify-migration.js
```

**Resultado esperado:**
```
✅ [timestamp] 🔍 Iniciando verificação pós-migração...
✅ [timestamp] ✅ Conexão com Supabase estabelecida
✅ [timestamp] Tabela companies: 2 registros encontrados
✅ [timestamp] Tabela products: 2 registros encontrados
...
✅ [timestamp] 🎉 Verificação concluída com sucesso! Sistema pronto para uso.
```

### **Fase 4: Validação (5 minutos)**

#### **4.1 Testar Sistema Web**
1. Acesse `http://localhost:5173/login`
2. Faça login com as credenciais
3. Verifique se consegue acessar o dashboard
4. Teste a seleção de filial
5. Verifique se os dados aparecem corretamente

#### **4.2 Verificar Dados no Supabase**
1. Acesse o **Supabase Dashboard**
2. Vá para **Table Editor**
3. Verifique as tabelas:
   - `companies` - deve ter pelo menos 1 registro
   - `products` - deve ter registros
   - `users` - deve ter usuários
   - `vehicles` - se aplicável

### **Fase 5: Finalização (2 minutos)**

#### **5.1 Documentar Migração**
```bash
# Criar log da migração
echo "Migração executada em: $(date)" >> migration-log.txt
echo "Status: SUCESSO" >> migration-log.txt
```

#### **5.2 Limpeza de Arquivos Temporários**
```bash
# Remover arquivos de migração (opcional)
rm migrate-complete-data.js
rm verify-migration.js
rm cleanup-test-data.sql
```

## 🚨 **Troubleshooting**

### **Problema: Erro de Conexão**
```bash
# Verificar variáveis de ambiente
echo $VITE_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY
```

### **Problema: Erro de Permissão**
- Verificar se a `SUPABASE_SERVICE_ROLE_KEY` está correta
- Verificar se o usuário tem permissões de administrador

### **Problema: Dados Duplicados**
- Executar `cleanup-test-data.sql` novamente
- Verificar se não há dados duplicados

### **Problema: RLS Bloqueando**
- Verificar se as políticas RLS estão corretas
- Executar `fix-rls-recursion.sql` se necessário

## 📊 **Checklist de Validação**

- [ ] **Conexão Supabase** - ✅ Funcionando
- [ ] **Limpeza executada** - ✅ Dados de teste removidos
- [ ] **Migração executada** - ✅ Dados migrados
- [ ] **Verificação executada** - ✅ Integridade validada
- [ ] **Sistema web funcionando** - ✅ Login e navegação OK
- [ ] **Dados visíveis** - ✅ Empresas e produtos aparecem
- [ ] **RLS funcionando** - ✅ Políticas ativas
- [ ] **Performance OK** - ✅ Sistema responsivo

## 🎯 **Resultado Final Esperado**

✅ **Sistema 100% funcional** com todos os dados migrados
✅ **Autenticação funcionando** sem erros
✅ **Seleção de filial** operacional
✅ **Dados consistentes** e íntegros
✅ **Performance otimizada** e responsiva

## 📞 **Suporte**

Se encontrar problemas durante a migração:
1. Verificar logs detalhados
2. Executar verificação (`verify-migration.js`)
3. Verificar políticas RLS no Supabase
4. Consultar documentação do Supabase

---

**Status:** ✅ **PRONTO PARA EXECUÇÃO**
**Tempo estimado:** 20-40 minutos
**Complexidade:** Média
**Risco:** Baixo (com backup)






















