const fetch = require('node:fetch');

(async () => {
  try {
    console.log('Verificando página de agendamentos...');
    
    const response = await fetch('http://localhost:8081/agendamentos');
    const html = await response.text();
    
    console.log('Status da resposta:', response.status);
    console.log('Content-Type:', response.headers.get('content-type'));
    
    // Verificar se há elementos li no HTML
    const liMatches = html.match(/<li[^>]*>/g);
    const ulMatches = html.match(/<ul[^>]*>/g);
    const olMatches = html.match(/<ol[^>]*>/g);
    
    console.log('\n=== ANÁLISE DE ELEMENTOS ===');
    console.log('Elementos <li> encontrados:', liMatches ? liMatches.length : 0);
    console.log('Elementos <ul> encontrados:', ulMatches ? ulMatches.length : 0);
    console.log('Elementos <ol> encontrados:', olMatches ? olMatches.length : 0);
    
    if (liMatches) {
      console.log('\nElementos <li> encontrados:');
      liMatches.forEach((match, index) => {
        console.log(`${index + 1}: ${match}`);
      });
    }
    
    // Verificar se há divs com problemas
    const divMatches = html.match(/<div[^>]*>/g);
    console.log('\nElementos <div> encontrados:', divMatches ? divMatches.length : 0);
    
    // Verificar se há erros de React ou JavaScript no HTML
    const hasReactError = html.includes('Error') || html.includes('error') || html.includes('undefined');
    console.log('\nPossíveis erros no HTML:', hasReactError);
    
    // Verificar se há elementos com classes específicas que podem estar causando problemas
    const dropdownMatches = html.match(/dropdown/gi);
    const menuMatches = html.match(/menu/gi);
    
    console.log('\nElementos relacionados a dropdown:', dropdownMatches ? dropdownMatches.length : 0);
    console.log('Elementos relacionados a menu:', menuMatches ? menuMatches.length : 0);
    
    // Mostrar uma amostra do HTML para análise
    console.log('\n=== AMOSTRA DO HTML (primeiros 1000 caracteres) ===');
    console.log(html.substring(0, 1000));
    
  } catch (error) {
    console.error('Erro ao verificar página:', error.message);
  }
})();