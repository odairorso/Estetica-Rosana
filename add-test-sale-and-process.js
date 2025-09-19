// Script para adicionar venda de teste no localStorage e processar
// Execute este script no console do navegador na página de Agendamentos

console.log("🚀 Adicionando venda de teste com 8 sessões...");

// Buscar vendas existentes
const existingSales = JSON.parse(localStorage.getItem('clinic-sales-v2') || '[]');
console.log(`📋 Vendas existentes: ${existingSales.length}`);

// Criar nova venda de teste
const newSale = {
  id: Date.now() + Math.floor(Math.random() * 1000),
  clientName: "Ana Costa Teste",
  client_name: "Ana Costa Teste",
  client_phone: "(11) 98888-8888",
  items: [
    {
      id: "package-premium-test",
      itemName: "Pacote Premium Teste",
      type: "package",
      price: 2000.00,
      quantity: 8, // 8 sessões
      total: 2000.00
    }
  ],
  total: 2000.00,
  paymentMethod: "cartao",
  date: new Date().toISOString(),
  notes: "Venda de teste para demonstrar 8 sessões numeradas"
};

// Adicionar à lista
existingSales.push(newSale);

// Salvar no localStorage
localStorage.setItem('clinic-sales-v2', JSON.stringify(existingSales));

console.log("✅ Venda de teste adicionada!");
console.log(`Cliente: ${newSale.clientName}`);
console.log(`Pacote: ${newSale.items[0].itemName} - ${newSale.items[0].quantity} sessões`);
console.log(`ID da venda: ${newSale.id}`);

// Agora processar as vendas
async function processarVendasExistentes() {
  console.log("🔄 Iniciando processamento das vendas existentes...");
  
  // Buscar vendas do localStorage
  const salesStorage = localStorage.getItem('clinic-sales-v2');
  if (!salesStorage) {
    console.log("📝 Nenhuma venda encontrada no localStorage");
    return;
  }
  
  const sales = JSON.parse(salesStorage);
  console.log(`📊 Encontradas ${sales.length} vendas para processar`);
  
  // Buscar agendamentos existentes
  const appointmentsStorage = localStorage.getItem('clinic-appointments-v2');
  const existingAppointments = appointmentsStorage ? JSON.parse(appointmentsStorage) : [];
  console.log(`📝 Agendamentos existentes: ${existingAppointments.length}`);
  
  let agendamentosCriados = 0;
  const novosAgendamentos = [];
  
  for (const sale of sales) {
    console.log(`🔍 Processando venda: ${sale.clientName || sale.client_name} - ${sale.items?.length || 0} itens`);
    
    if (!sale.items || !Array.isArray(sale.items)) {
      console.log(`⚠️ Venda sem itens válidos, pulando...`);
      continue;
    }
    
    for (const item of sale.items) {
      // Só processa serviços e pacotes
      if (item.type !== 'service' && item.type !== 'package') {
        console.log(`⏭️ Produto ${item.itemName} não gera agendamento`);
        continue;
      }
      
      if (item.type === 'package') {
        // Para pacotes, criar múltiplos agendamentos (uma para cada sessão)
        const totalSessions = item.quantity || 1;
        console.log(`📦 Processando pacote: ${item.itemName} (${totalSessions} sessões)`);
        
        for (let sessionNumber = 1; sessionNumber <= totalSessions; sessionNumber++) {
          // Verificar se já existe agendamento para esta sessão
          const existingPackageSession = existingAppointments.find(apt => 
            apt.client_name === (sale.clientName || sale.client_name) &&
            apt.package_name === item.itemName &&
            apt.session_number === sessionNumber
          );
          
          if (existingPackageSession) {
            console.log(`⏭️ Agendamento já existe para sessão ${sessionNumber} do pacote`);
            continue;
          }
          
          // Criar novo agendamento para esta sessão
          const newAppointment = {
            id: Date.now() + Math.random(),
            client_name: sale.clientName || sale.client_name,
            client_phone: sale.client_phone || '',
            type: 'package_session',
            package_name: item.itemName,
            session_number: sessionNumber,
            total_sessions: totalSessions,
            status: 'pending',
            date: null,
            time: null,
            notes: `Sessão ${sessionNumber} de ${totalSessions} - ${item.itemName}`,
            created_at: new Date().toISOString(),
            sale_id: sale.id
          };
          
          novosAgendamentos.push(newAppointment);
          agendamentosCriados++;
          console.log(`✅ Criado agendamento para sessão ${sessionNumber}/${totalSessions} - ${item.itemName}`);
        }
      } else if (item.type === 'service') {
        // Verificar se já existe agendamento para este serviço
        const existingService = existingAppointments.find(apt => 
          apt.client_name === (sale.clientName || sale.client_name) &&
          apt.service_name === item.itemName
        );
        
        if (existingService) {
          console.log(`⏭️ Agendamento já existe para ${sale.clientName || sale.client_name} - ${item.itemName}`);
          continue;
        }
        
        // Criar novo agendamento para serviço
        const newAppointment = {
          id: Date.now() + Math.random(),
          client_name: sale.clientName || sale.client_name,
          client_phone: sale.client_phone || '',
          type: 'service',
          service_name: item.itemName,
          status: 'pending',
          date: null,
          time: null,
          notes: `Serviço: ${item.itemName}`,
          created_at: new Date().toISOString(),
          sale_id: sale.id
        };
        
        novosAgendamentos.push(newAppointment);
        agendamentosCriados++;
        console.log(`✅ Criado agendamento para serviço: ${item.itemName}`);
      }
    }
  }
  
  // Salvar todos os agendamentos (existentes + novos)
  const todosAgendamentos = [...existingAppointments, ...novosAgendamentos];
  localStorage.setItem('clinic-appointments-v2', JSON.stringify(todosAgendamentos));
  
  console.log(`\n📊 RELATÓRIO FINAL:`);
  console.log(`✅ Novos agendamentos criados: ${agendamentosCriados}`);
  console.log(`📋 Total de agendamentos: ${todosAgendamentos.length}`);
  console.log(`💰 Total de vendas processadas: ${sales.length}`);
  
  if (agendamentosCriados > 0) {
    console.log(`\n🎉 Processamento concluído! Recarregue a página para ver os novos agendamentos.`);
  } else {
    console.log(`\n📝 Nenhum novo agendamento foi necessário`);
  }
}

console.log("\n🔄 Processando vendas...");
processarVendasExistentes();