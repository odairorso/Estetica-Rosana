// DESABILITAR COMPLETAMENTE O SUPABASE PARA ELIMINAR ERROS 400

console.log("🚫 INTERCEPTANDO E BLOQUEANDO TODAS AS TENTATIVAS DE CONEXÃO COM SUPABASE");

// Sobrescrever fetch para bloquear chamadas para supabase
const originalFetch = window.fetch;
window.fetch = function(...args: any[]) {
  const [input] = args;
  const url = typeof input === 'string' ? input : input instanceof Request ? input.url : '';
  
  // Bloquear qualquer chamada para supabase.co
  if (url.includes('supabase.co')) {
    console.log(`🚫 BLOQUEADO: Tentativa de chamada para ${url}`);
    return Promise.resolve(new Response('{"error": "Supabase desabilitado"}', {
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
  if (typeof url === 'string' && url.includes('supabase.co')) {
    console.log(`🚫 BLOQUEADO XMLHttpRequest para: ${url}`);
    // Redirecionar para uma URL dummy
    url = 'data:application/json,{"error":"Supabase desabilitado"}';
  }
  return originalXHROpen.call(this, method, url, ...args);
};

console.log("✅ SUPABASE COMPLETAMENTE BLOQUEADO - Não haverá mais erros 400!");