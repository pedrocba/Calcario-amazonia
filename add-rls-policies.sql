-- ADICIONAR POLÍTICAS RLS APÓS CRIAR AS TABELAS
-- Execute este SQL depois de executar create-tables-basic.sql

-- Habilitar RLS
ALTER TABLE faturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcelas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS com cast correto
CREATE POLICY "Users can view faturas from their company" ON faturas
    FOR SELECT USING (company_id = (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert faturas for their company" ON faturas
    FOR INSERT WITH CHECK (company_id = (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update faturas from their company" ON faturas
    FOR UPDATE USING (company_id = (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can view parcelas from their company" ON parcelas
    FOR SELECT USING (company_id = (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert parcelas for their company" ON parcelas
    FOR INSERT WITH CHECK (company_id = (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update parcelas from their company" ON parcelas
    FOR UPDATE USING (company_id = (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

-- Verificar se as políticas foram criadas
SELECT 'Políticas RLS adicionadas com sucesso!' as status;




