// Script atualizado para processar vendas existentes e criar agendamentos PENDENTES
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
      
      console.log(`🆕 Criando agendamento PENDENTE: ${sale.clientName || sale.client_name} - ${item.itemName}`);
      
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
        type: item.type === 'service' ? 'individual' : 'package_session',
        price: item.price * item.quantity,
        sale_date: sale.sale_date,
        status: 'agendado', // Status agendado mas sem data = aguardando agendamento
        notes: `Aguardando agendamento - ${item.itemName}`,
        duration: 60,
        created_at: new Date().toISOString(),
        // Campos vazios - serão preenchidos quando o usuário agendar manualmente
        date: '', 
        time: '',
        appointment_date: '',
        appointment_time: '',
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
  
  console.log(`🎉 Processamento concluído: ${agendamentosCriados} agendamentos criados e aguardando sua marcação de data/hora`);
  console.log("🔄 Recarregue a página para ver os agendamentos");
  
  alert(`✅ Processamento concluído!
${agendamentosCriados} itens estão aguardando agendamento.

Agora você pode marcar as datas e horários manualmente.

Recarregue a página para ver os resultados.`);
  
  return agendamentosCriados;
}

// Execute a função
console.log("🚀 Script atualizado carregado! Execute processarVendasExistentes() para processar as vendas");