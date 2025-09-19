// Script para debugar o localStorage
console.log("=== DEBUG LOCALSTORAGE ===");

// Verificar vendas
try {
  const salesData = localStorage.getItem('clinic-sales-v2');
  if (salesData) {
    const sales = JSON.parse(salesData);
    console.log("📦 VENDAS ENCONTRADAS:", sales.length);
    sales.forEach((sale, index) => {
      console.log(`\n--- Venda ${index + 1} ---`);
      console.log(`Cliente: ${sale.clientName || sale.client_name}`);
      console.log(`Data: ${sale.sale_date}`);
      console.log(`Total: R$ ${sale.total}`);
      console.log(`Itens: ${sale.items ? sale.items.length : 0}`);
      
      if (sale.items) {
        sale.items.forEach((item, itemIndex) => {
          console.log(`  Item ${itemIndex + 1}: ${item.itemName} (${item.type}) - Qty: ${item.quantity} - R$ ${item.price}`);
        });
      }
    });
  } else {
    console.log("❌ Nenhuma venda encontrada");
  }
} catch (error) {
  console.error("❌ Erro ao ler vendas:", error);
}

// Verificar agendamentos
try {
  const appointmentsData = localStorage.getItem('clinic-appointments-v2');
  if (appointmentsData) {
    const appointments = JSON.parse(appointmentsData);
    console.log("\n📅 AGENDAMENTOS ENCONTRADOS:", appointments.length);
    appointments.forEach((apt, index) => {
      console.log(`\n--- Agendamento ${index + 1} ---`);
      console.log(`Cliente: ${apt.client_name}`);
      console.log(`Tipo: ${apt.type}`);
      console.log(`Pacote: ${apt.package_name}`);
      console.log(`Serviço: ${apt.service_name}`);
      console.log(`Total Sessions: ${apt.total_sessions}`);
      console.log(`Session Number: ${apt.session_number}`);
      console.log(`Status: ${apt.status}`);
    });
  } else {
    console.log("\n❌ Nenhum agendamento encontrado");
  }
} catch (error) {
  console.error("❌ Erro ao ler agendamentos:", error);
}