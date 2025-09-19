// Script para verificar dados no localStorage
const fs = require('fs');

// Simular localStorage
const localStorage = {
  getItem: (key) => {
    try {
      const data = fs.readFileSync(`./temp-${key}.json`, 'utf8');
      return data;
    } catch {
      return null;
    }
  }
};

// Verificar se existem arquivos temporários
console.log('🔍 Verificando dados...');

// Tentar ler dados diretamente dos arquivos de debug
try {
  const salesData = fs.readFileSync('./debug-sales.json', 'utf8');
  const sales = JSON.parse(salesData);
  
  console.log('=== VENDAS ===');
  sales.forEach(sale => {
    console.log(`Cliente: ${sale.clientName || sale.client_name}`);
    if (sale.items) {
      sale.items.forEach(item => {
        if (item.type === 'package') {
          console.log(`  📦 ${item.itemName}: ${item.quantity} sessões`);
        }
      });
    }
  });
} catch (e) {
  console.log('❌ Não foi possível ler dados de vendas');
}

try {
  const appointmentsData = fs.readFileSync('./debug-appointments.json', 'utf8');
  const appointments = JSON.parse(appointmentsData);
  
  console.log('\n=== AGENDAMENTOS DE PACOTES ===');
  appointments.filter(apt => apt.type === 'package_session').forEach(apt => {
    console.log(`${apt.client_name}: ${apt.package_name} - sessão ${apt.session_number}/${apt.total_sessions}`);
  });
} catch (e) {
  console.log('❌ Não foi possível ler dados de agendamentos');
}