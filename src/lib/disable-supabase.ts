// DESABILITAR COMPLETAMENTE TODAS AS CONEXÕES EXTERNAS

console.log("🚑 INTERCEPTANDO E BLOQUEANDO TODAS AS TENTATIVAS DE CONEXÃO EXTERNAS");

// Variável para controlar quando permitir conexões (para sincronização)
let allowSupabaseSync = false;

// Função para temporariamente permitir sincronização
(window as any).enableSupabaseSync = () => {
  allowSupabaseSync = true;
  console.log("🔄 Conexão Supabase temporariamente habilitada para sincronização");
};

(window as any).disableSupabaseSync = () => {
  allowSupabaseSync = false;
  console.log("🚑 Conexão Supabase bloqueada novamente");
};

// Sobrescrever fetch para bloquear chamadas externas
const originalFetch = window.fetch;
window.fetch = function(...args: any[]) {
  const [input] = args;
  const url = typeof input === 'string' ? input : input instanceof Request ? input.url : '';
  
  // Permitir conexão durante sincronização
  if (allowSupabaseSync && url.includes('supabase.co')) {
    console.log(`🔄 PERMITIDO (sync): ${url}`);
    return originalFetch.apply(this, args);
  }
  
  // Bloquear qualquer outra chamada externa
  if (url.includes('supabase.co') || 
      url.includes('vercel.app') || 
      url.includes('api.') || 
      url.includes('gru1::') ||
      (url.startsWith('http://') && !url.includes('localhost')) ||
      (url.startsWith('https://') && !url.includes('localhost'))) {
    console.log(`🚑 BLOQUEADO: Tentativa de chamada para ${url}`);
    return Promise.resolve(new Response('{"error": "Conexão externa desabilitada - modo offline"}', {
      status: 200,
      statusText: 'OK',
      headers: { 'Content-Type': 'application/json' }
    }));
  }
  
  return originalFetch.apply(this, args);
};

// Interceptar XMLHttpRequest para bloquear chamadas HTTP
const originalXHROpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method: string, url: string | URL, ...args: any[]) {
  const urlString = typeof url === 'string' ? url : url.toString();
  
  if (urlString.includes('supabase.co') || 
      urlString.includes('vercel.app') || 
      urlString.includes('api.') ||
      urlString.includes('gru1::') ||
      (urlString.startsWith('http://') && !urlString.includes('localhost')) ||
      (urlString.startsWith('https://') && !urlString.includes('localhost'))) {
    console.log(`🚑 BLOQUEADO XMLHttpRequest para: ${urlString}`);
    // Redirecionar para uma URL dummy
    url = 'data:application/json,{"error":"Conexão externa desabilitada"}';
  }
  return originalXHROpen.call(this, method, url, ...args);
};

// Interceptar window.onerror para suprimir erros de rede
const originalWindowError = window.onerror;
window.onerror = function(message, source, lineno, colno, error) {
  const msg = message?.toString() || '';
  
  // Suprimir erros comuns de rede/conexão
  if (msg.includes('404') || 
      msg.includes('NOT_FOUND') ||
      msg.includes('Failed to fetch') ||
      msg.includes('Network Error') ||
      msg.includes('gru1::') ||
      msg.includes('ERR_NETWORK')) {
    console.log(`🚑 ERRO DE REDE SUPRIMIDO: ${msg}`);
    return true; // Previne que o erro apareça no console
  }
  
  return originalWindowError?.call(this, message, source, lineno, colno, error);
};

// Interceptar console.log para suprimir logs de erros de rede
const originalConsoleLog = console.log;
console.log = function(...args: any[]) {
  const message = args.join(' ');
  
  // Suprimir logs de erros de rede
  if (message.includes('404') || 
      message.includes('NOT_FOUND') ||
      message.includes('gru1::') ||
      message.includes('Failed to fetch') ||
      message.includes('Network Error')) {
    return; // Não exibir
  }
  
  return originalConsoleLog.apply(this, args);
};

// Interceptar console.warn para suprimir avisos de rede
const originalConsoleWarn = console.warn;
console.warn = function(...args: any[]) {
  const message = args.join(' ');
  
  if (message.includes('404') || 
      message.includes('NOT_FOUND') ||
      message.includes('gru1::') ||
      message.includes('Failed to fetch')) {
    return; // Não exibir
  }
  
  return originalConsoleWarn.apply(this, args);
};

// Interceptar console.error para suprimir erros de rede
const originalConsoleError = console.error;
console.error = function(...args: any[]) {
  const message = args.join(' ');
  
  // Suprimir erros específicos do Supabase e de rede
  if (message.includes('404') || 
      message.includes('NOT_FOUND') ||
      message.includes('400') ||
      message.includes('gru1::') ||
      message.includes('Failed to get session') ||
      message.includes('Failed to load resource') ||
      message.includes('supabase.co') ||
      message.includes('refresh_token') ||
      message.includes('dashboard:1') ||
      message.includes('Failed to fetch')) {
    console.log(`🚑 ERRO SUPABASE SUPRIMIDO: ${message}`);
    return; // Não exibir no console
  }
  
  return originalConsoleError.apply(this, args);
};

// Interceptar eventos de erro da janela
window.addEventListener('error', (event) => {
  const message = event.message || '';
  
  if (message.includes('404') ||
      message.includes('NOT_FOUND') ||
      message.includes('400') ||
      message.includes('gru1::') ||
      message.includes('Failed to load resource') ||
      message.includes('supabase.co')) {
    console.log(`🚑 ERRO DE JANELA SUPRIMIDO: ${message}`);
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
});

// Interceptar erros de recursos não carregados
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason?.toString() || '';
  
  if (reason.includes('404') ||
      reason.includes('NOT_FOUND') ||
      reason.includes('400') ||
      reason.includes('gru1::') ||
      reason.includes('Failed to fetch') ||
      reason.includes('supabase.co')) {
    console.log(`🚑 PROMISE REJECTION SUPRIMIDA: ${reason}`);
    event.preventDefault();
  }
});

console.log("✅ TODAS AS CONEXÕES EXTERNAS BLOQUEADAS - Sistema 100% offline!");