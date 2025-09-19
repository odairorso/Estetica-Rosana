// Script para criar uma venda de teste com pacote de múltiplas sessões
const fs = require('fs');

// Ler dados existentes do localStorage
let sales = [];
try {
  const salesData = fs.readFileSync('./debug-sales.json', 'utf8');
  sales = JSON.parse(salesData);
  console.log(`📋 Vendas existentes: ${sales.length}`);
} catch (e) {
  console.log('Criando nova lista de vendas...');
}

// Criar nova venda de teste com ID único
const newSale = {
  id: Date.now() + Math.floor(Math.random() * 1000), // ID único
  clientName: "Ana Costa Teste",
  client_name: "Ana Costa Teste", // Ambos os formatos
  client_phone: "(11) 98888-8888",
  items: [
    {
      id: "package-premium-test",
      itemName: "Pacote Premium Teste",
      type: "package",
      price: 2000.00,
      quantity: 8, // 8 sessões para testar bem
      total: 2000.00
    }
  ],
  total: 2000.00,
  paymentMethod: "cartao",
  date: new Date().toISOString(),
  notes: "Venda de teste para demonstrar 8 sessões numeradas"
};

// Adicionar à lista
sales.push(newSale);

// Salvar no arquivo de debug
fs.writeFileSync('./debug-sales.json', JSON.stringify(sales, null, 2));

console.log('✅ Venda de teste criada!');
console.log(`Cliente: ${newSale.clientName}`);
console.log(`Pacote: ${newSale.items[0].itemName} - ${newSale.items[0].quantity} sessões`);
console.log(`Total: R$ ${newSale.total.toFixed(2)}`);
console.log(`ID da venda: ${newSale.id}`);

console.log('\n🔄 Agora execute: node auto-process-sales.js');