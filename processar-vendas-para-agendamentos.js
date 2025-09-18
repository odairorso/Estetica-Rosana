// EXECUTE ESTE SCRIPT NO CONSOLE DO NAVEGADOR NA ABA AGENDAMENTOS
// Cole e execute este código para criar agendamentos das vendas existentes

function processarVendasParaAgendamentos() {
  console.log("🔄 Processando vendas existentes para criar agendamentos...");
  
  // Buscar vendas
  const salesData = localStorage.getItem('clinic-sales-v2');
  if (!salesData) {
    alert("❌ Nenhuma venda encontrada!");
    return;
  }
  
  const sales = JSON.parse(salesData);
  console.log(`📊 ${sales.length} vendas encontradas`);
  
  // Buscar agendamentos existentes
  const appointmentsData = localStorage.getItem('clinic-appointments-v2');
  const existingAppointments = appointmentsData ? JSON.parse(appointmentsData) : [];
  
  let novosAgendamentos = [];
  let contador = 0;
  
  // Processar cada venda
  sales.forEach(sale => {
    if (!sale.items) return;
    
    sale.items.forEach(item => {
      // Só processa PACOTES e PROCEDIMENTOS
      if (item.type === 'service' || item.type === 'package') {
        
        // Verificar se já existe
        const jaExiste = existingAppointments.find(apt => 
          apt.client_name === sale.clientName && 
          ((item.type === 'service' && apt.service_name === item.itemName) ||
           (item.type === 'package' && apt.package_name === item.itemName))
        );
        
        if (!jaExiste) {
          const novoId = Math.max(0, ...existingAppointments.map(a => a.id || 0), ...novosAgendamentos.map(a => a.id || 0)) + 1;
          
          // Criar agendamento pendente
          const novoAgendamento = {
            id: novoId,
            client_id: sale.client_id || 0,
            client_name: sale.clientName,
            client_phone: '',
            service_id: item.type === 'service' ? item.item_id : undefined,
            service_name: item.type === 'service' ? item.itemName : undefined,
            package_id: item.type === 'package' ? item.item_id : undefined,
            package_name: item.type === 'package' ? item.itemName : undefined,
            total_sessions: item.type === 'package' ? item.quantity : undefined,
            type: item.type === 'service' ? 'individual' : 'package_session',
            price: item.price * item.quantity,
            sale_date: sale.sale_date,
            status: 'agendado',
            notes: `Aguardando agendamento - ${item.itemName}`,
            duration: 60,
            created_at: new Date().toISOString(),
            // Campos vazios = aguardando agendamento manual
            date: '',
            time: '',
            appointment_date: '',
            appointment_time: '',
          };
          
          novosAgendamentos.push(novoAgendamento);
          contador++;
          console.log(`✅ ${item.itemName} (${item.type}) - ${sale.clientName}`);
        }
      }
    });
  });
  
  // Salvar novos agendamentos
  if (novosAgendamentos.length > 0) {
    const todosAgendamentos = [...existingAppointments, ...novosAgendamentos];
    localStorage.setItem('clinic-appointments-v2', JSON.stringify(todosAgendamentos));
    console.log(`💾 ${novosAgendamentos.length} agendamentos salvos`);
  }
  
  alert(`✅ SUCESSO!

${contador} procedimentos e pacotes foram enviados para a aba AGENDAMENTOS!

Recarregue a página para ver os resultados.`);
  
  return contador;
}

// Executar automaticamente
processarVendasParaAgendamentos();