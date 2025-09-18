// Configurações do sistema para controlar comportamentos
export const SYSTEM_CONFIG = {
  // Forçar modo offline COMPLETO para evitar loops infinitos do Supabase
  FORCE_OFFLINE_MODE: true,
  DISABLE_SUPABASE: true, // Nova flag para desabilitar completamente o Supabase
  
  // Configurações de debug
  DEBUG_MODE: true,
  
  // Configurações de agendamentos
  AUTO_CREATE_APPOINTMENTS: true,
  
  // Outras configurações
  STORAGE_KEYS: {
    APPOINTMENTS: 'clinic-appointments-v2',
    SALES: 'clinic-sales-v2',
    CLIENTS: 'clinic-clients-v2',
    SERVICES: 'clinic-services-v2',
    PACKAGES: 'clinic-packages-v2',
  },
  
  // Configurações de status válidos
  VALID_STATUS: {
    AGENDADO: 'agendado',
    CONFIRMADO: 'confirmado', 
    CONCLUIDO: 'concluido',
    CANCELADO: 'cancelado'
  }
};