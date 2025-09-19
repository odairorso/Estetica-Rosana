// Script para debug do dropdown
console.log('=== DEBUG DROPDOWN ===');

// Função para verificar elementos dropdown
function debugDropdown() {
    console.log('Verificando elementos dropdown...');
    
    // Procurar por elementos do Radix UI
    const radixElements = document.querySelectorAll('[data-radix-dropdown-menu-content]');
    console.log('Elementos Radix dropdown encontrados:', radixElements.length);
    
    radixElements.forEach((el, index) => {
        console.log(`Dropdown ${index}:`, {
            element: el,
            visible: el.offsetParent !== null,
            display: getComputedStyle(el).display,
            visibility: getComputedStyle(el).visibility,
            opacity: getComputedStyle(el).opacity,
            zIndex: getComputedStyle(el).zIndex,
            position: getComputedStyle(el).position,
            transform: getComputedStyle(el).transform
        });
    });
    
    // Procurar por botões de trigger
    const triggers = document.querySelectorAll('[data-radix-dropdown-menu-trigger]');
    console.log('Triggers encontrados:', triggers.length);
    
    triggers.forEach((trigger, index) => {
        console.log(`Trigger ${index}:`, trigger);
        
        // Adicionar evento de click para debug
        trigger.addEventListener('click', () => {
            console.log('Trigger clicado!');
            setTimeout(() => {
                const content = document.querySelector('[data-radix-dropdown-menu-content]');
                if (content) {
                    console.log('Dropdown content após click:', {
                        element: content,
                        visible: content.offsetParent !== null,
                        display: getComputedStyle(content).display,
                        visibility: getComputedStyle(content).visibility,
                        opacity: getComputedStyle(content).opacity,
                        zIndex: getComputedStyle(content).zIndex,
                        position: getComputedStyle(content).position,
                        transform: getComputedStyle(content).transform,
                        rect: content.getBoundingClientRect()
                    });
                } else {
                    console.log('Nenhum dropdown content encontrado após click');
                }
            }, 100);
        });
    });
    
    // Verificar se há elementos com z-index alto
    const allElements = document.querySelectorAll('*');
    const highZIndex = [];
    
    allElements.forEach(el => {
        const zIndex = getComputedStyle(el).zIndex;
        if (zIndex !== 'auto' && parseInt(zIndex) > 40) {
            highZIndex.push({
                element: el,
                zIndex: zIndex,
                tagName: el.tagName,
                className: el.className
            });
        }
    });
    
    console.log('Elementos com z-index alto:', highZIndex);
    
    // Verificar elementos li
    const liElements = document.querySelectorAll('li');
    console.log('Elementos LI encontrados:', liElements.length);
    
    liElements.forEach((li, index) => {
        console.log(`LI ${index}:`, {
            element: li,
            text: li.textContent,
            parent: li.parentElement?.tagName,
            visible: li.offsetParent !== null
        });
    });
}

// Executar debug quando a página carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', debugDropdown);
} else {
    debugDropdown();
}

// Executar debug a cada 2 segundos para capturar mudanças
setInterval(debugDropdown, 2000);

console.log('Script de debug carregado!');