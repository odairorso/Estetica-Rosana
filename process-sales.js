// Script para processar vendas existentes e criar agendamentos
// Execute este script no console do navegador na página de Agendamentos

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
  console.log(`📅 Agendamentos existentes: ${existingAppointments.length}`);
  
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
      
      // Verificar se já existe agendamento para este item
      const existingAppointment = existingAppointments.find(apt => {
        const sameClient = apt.client_name === (sale.clientName || sale.client_name);
        const sameItem = (
          (item.type === 'service' && apt.service_name === item.itemName) ||
          (item.type === 'package' && apt.package_name === item.itemName)
        );
        return sameClient && sameItem;
      });
      
      if (existingAppointment) {
        console.log(`✅ Agendamento já existe: ${sale.clientName || sale.client_name} - ${item.itemName}`);
        continue;
      }
      
      console.log(`🆕 Criando agendamento: ${sale.clientName || sale.client_name} - ${item.itemName}`);
      
      const newId = Math.max(0, ...existingAppointments.map(a => a.id || 0), ...novosAgendamentos.map(a => a.id || 0)) + 1;
      
      const novoAgendamento = {
        id: newId,
        client_id: sale.client_id || 0,
        client_name: sale.clientName || sale.client_name,
        client_phone: sale.clientPhone || '',
        service_id: item.type === 'service' ? item.item_id : undefined,
        service_name: item.type === 'service' ? item.itemName : undefined,
        package_id: item.type === 'package' ? item.item_id : undefined,
        package_name: item.type === 'package' ? item.itemName : undefined,
        total_sessions: item.type === 'package' ? item.quantity : undefined,
        session_number: item.type === 'package_session' ? 1 : undefined,
        type: item.type === 'service' ? 'individual' : 'package_session',
        price: item.price * item.quantity,
        sale_date: sale.sale_date,
        status: 'agendado',
        notes: `Criado automaticamente da venda - ${item.itemName}`,
        duration: 60,
        created_at: new Date().toISOString(),
        date: item.type === 'individual' ? '' : sale.sale_date,
        time: item.type === 'individual' ? '' : '09:00',
        appointment_date: item.type === 'individual' ? '' : sale.sale_date,
        appointment_time: item.type === 'individual' ? '' : '09:00',
      };
      
      novosAgendamentos.push(novoAgendamento);
      agendamentosCriados++;
      console.log(`✅ Agendamento criado: ${item.itemName}`);
    }
  }
  
  // Salvar novos agendamentos
  if (novosAgendamentos.length > 0) {
    const todosAgendamentos = [...existingAppointments, ...novosAgendamentos];
    localStorage.setItem('clinic-appointments-v2', JSON.stringify(todosAgendamentos));
    console.log(`💾 Salvos ${novosAgendamentos.length} novos agendamentos`);
  }
  
  console.log(`🎉 Processamento concluído: ${agendamentosCriados} novos agendamentos criados`);
  console.log("🔄 Recarregue a página para ver os agendamentos");
  
  alert(`✅ Processamento concluído!\n${agendamentosCriados} agendamentos criados.\n\nRecarregue a página para ver os resultados.`);
  
  return agendamentosCriados;
}

// Execute a função
console.log("🚀 Script carregado! Execute processarVendasExistentes() para processar as vendas");