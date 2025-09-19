const fs = require('fs');

console.log('=== VERIFICANDO VENDAS REAIS ===\n');

try {
  const data = fs.readFileSync('debug-sales.json', 'utf8');
  const sales = JSON.parse(data);
  
  console.log(`Total de vendas encontradas: ${sales.length}\n`);
  
  sales.forEach((sale, i) => {
    console.log(`Venda ${i+1}:`);
    console.log(`  Cliente: ${sale.clientName || sale.client_name || 'SEM NOME'}`);
    console.log(`  Telefone: ${sale.clientPhone || sale.client_phone || 'SEM TELEFONE'}`);
    console.log(`  Data: ${sale.sale_date || 'SEM DATA'}`);
    console.log(`  Itens: ${sale.items?.length || 0}`);
    
    if (sale.items && sale.items.length > 0) {
      sale.items.forEach((item, j) => {
        console.log(`    ${j+1}. ${item.itemName} (${item.type}) - R$ ${item.price}`);
      });
    }
    console.log('');
  });
  
} catch (error) {
  console.log('Erro ao ler arquivo:', error.message);
}

// Verificar também se há dados no localStorage simulado
console.log('\n=== VERIFICANDO CLIENTES CADASTRADOS ===');
try {
  // Simular verificação de clientes
  console.log('Verificando se existem clientes cadastrados...');
} catch (error) {
  console.log('Erro:', error.message);
}