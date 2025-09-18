// Configurações do sistema para controlar comportamentos
export const SYSTEM_CONFIG = {
  // Ativar modo online
  FORCE_OFFLINE_MODE: false,
  DISABLE_SUPABASE: false, // Habilitar Supabase
  
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