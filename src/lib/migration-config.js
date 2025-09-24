// Configuração para migração do Base44 para Supabase
export const MIGRATION_CONFIG = {

  // Configurações de migração
  batchSize: 100, // Tamanho do lote para inserção
  delayBetweenBatches: 1000, // Delay entre lotes (ms)
  
  // Campos que precisam de transformação especial
  fieldTransformations: {
    // Converter timestamps do Base44 para formato PostgreSQL
    timestampFields: [
      'created_at',
      'updated_at', 
      'timestamp',
      'loginTime',
      'last_login',
      'date',
      'data_entrada',
      'data_saida'
    ],
    
    // Campos que são arrays de objetos (JSON)
    jsonFields: [
      'permissions',
      'details',
      'metadata',
      'config'
    ]
  }
}

// Função para transformar dados durante a migração
export function transformDataForSupabase(data, entityName) {
  const transformed = { ...data }
  
  // Transformar timestamps
  MIGRATION_CONFIG.fieldTransformations.timestampFields.forEach(field => {
    if (transformed[field]) {
      // Converter para formato ISO se necessário
      if (typeof transformed[field] === 'string') {
        transformed[field] = new Date(transformed[field]).toISOString()
      }
    }
  })
  
  // Transformar campos JSON
  MIGRATION_CONFIG.fieldTransformations.jsonFields.forEach(field => {
    if (transformed[field] && typeof transformed[field] === 'object') {
      transformed[field] = JSON.stringify(transformed[field])
    }
  })
  
  return transformed
}
