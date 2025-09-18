// Suprime erros do Supabase no console em modo offline
export function suppressSupabaseErrors() {
  const originalError = console.error;
  const originalWarn = console.warn;
  
  console.error = (...args: any[]) => {
    const message = args.join(' ');
    
    // Suprimir erros específicos do Supabase
    if (message.includes('Failed to get session') ||
        message.includes('supabase.co') ||
        message.includes('refresh_token') ||
        message.includes('400') && message.includes('token')) {
      return; // Não mostrar estes erros
    }
    
    originalError.apply(console, args);
  };
  
  console.warn = (...args: any[]) => {
    const message = args.join(' ');
    
    // Suprimir warnings do Supabase
    if (message.includes('supabase') ||
        message.includes('auth') ||
        message.includes('session')) {
      return; // Não mostrar estes warnings
    }
    
    originalWarn.apply(console, args);
  };
  
  console.log("🤫 Supressor de erros do Supabase ativado - modo offline");
}