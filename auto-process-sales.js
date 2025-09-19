import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zojtuknkuwvkbnaorfqd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvanR1a25rdXd2a2JuYW9yZnFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNTMyNDksImV4cCI6MjA3MzYyOTI0OX0.RpA1fg0EMLK0mBrGBVljgzozi6c6J7tFw_S90LjxaiI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function processarVendasParaAgendamentos() {
  console.log('🚀 Iniciando processamento automático de vendas para agendamentos...');
  
  try {
    // 1. Buscar todas as vendas
    console.log('📋 Buscando vendas...');
    const { data: sales, error: salesError } = await supabase
      .from('sales')
      .select('*');

    if (salesError) {
      console.error('❌ Erro ao buscar vendas:', salesError);
      return;
    }

    console.log(`📊 Encontradas ${sales?.length || 0} vendas`);

    if (!sales || sales.length === 0) {
      console.log('📭 Nenhuma venda encontrada');
      return;
    }

    // 2. Buscar agendamentos existentes para evitar duplicatas
    console.log('🔍 Verificando agendamentos existentes...');
    const { data: existingAppointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('*');

    if (appointmentsError) {
      console.error('❌ Erro ao buscar agendamentos:', appointmentsError);
      return;
    }

    console.log(`📅 Encontrados ${existingAppointments?.length || 0} agendamentos existentes`);

    // 3. Buscar dados de referência (clientes e serviços)
    console.log('📚 Carregando dados de referência...');
    
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*');

    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('*');

    if (clientsError || servicesError) {
      console.error('❌ Erro ao carregar dados de referência:', { clientsError, servicesError });
      return;
    }

    console.log(`👥 ${clients?.length || 0} clientes e 🛠️ ${services?.length || 0} serviços carregados`);

    // 4. Processar cada venda e seus itens
    let newAppointments = 0;
    let skippedItems = 0;
    let totalItems = 0;

    for (const sale of sales) {
      console.log(`\n🔄 Processando venda ID: ${sale.id} - Cliente: ${sale.client_name}`);
      
      if (!sale.items || !Array.isArray(sale.items)) {
        console.log('⚠️ Venda sem itens válidos, pulando...');
        continue;
      }

      // Buscar cliente pelo ID da venda
      const client = clients?.find(c => c.id === sale.client_id);
      if (!client) {
        console.log(`❌ Cliente não encontrado: ID ${sale.client_id}`);
        continue;
      }

      // Processar cada item da venda
      for (const item of sale.items) {
        totalItems++;
        
        // Só processar serviços e pacotes
        if (item.type !== 'service' && item.type !== 'package') {
          console.log(`⏭️ Item ${item.itemName} (${item.type}) não gera agendamento`);
          skippedItems++;
          continue;
        }

        console.log(`📝 Processando ${item.type}: ${item.itemName}`);

        // Para serviços, verificar se existe agendamento
        if (item.type === 'service') {
          // Buscar serviço pelo item_id
          const service = services?.find(s => s.id === item.item_id);
          if (!service) {
            console.log(`❌ Serviço não encontrado: ID ${item.item_id}`);
            skippedItems++;
            continue;
          }

          // Verificar se já existe agendamento para este serviço
          const existingAppointment = existingAppointments?.find(apt => 
            apt.client_id === client.id && 
            apt.service_id === service.id
          );

          if (existingAppointment) {
            console.log(`⏭️ Agendamento já existe para ${client.name} - ${service.name}`);
            skippedItems++;
            continue;
          }

          // Calcular data do agendamento (próxima semana + dias baseado no item)
          const appointmentDate = new Date();
          appointmentDate.setDate(appointmentDate.getDate() + 7 + (item.id % 7)); // Espalhar ao longo da semana
          const dateStr = appointmentDate.toISOString().split('T')[0]; // YYYY-MM-DD

          // Calcular horário (baseado no item ID para variar)
          const baseHour = 9 + (item.id % 8); // Entre 9h e 16h
          const timeStr = `${baseHour.toString().padStart(2, '0')}:00`;

          // Criar agendamento
          const appointmentData = {
            service_id: service.id,
            client_id: client.id,
            client_name: client.name,
            client_phone: client.phone || '',
            appointment_date: dateStr,
            appointment_time: timeStr,
            duration: service.duration || 60,
            price: item.price,
            notes: `Agendamento criado automaticamente da venda #${sale.id} - ${item.itemName}`,
            status: 'agendado'
          };

          console.log(`📅 Criando agendamento: ${client.name} - ${service.name} em ${dateStr} às ${timeStr}`);

          // Inserir agendamento
          const { data: newAppointment, error: insertError } = await supabase
            .from('appointments')
            .insert([appointmentData])
            .select()
            .single();

          if (insertError) {
            console.error(`❌ Erro ao criar agendamento para ${service.name}:`, insertError);
            skippedItems++;
          } else {
            console.log(`✅ Agendamento criado com sucesso! ID: ${newAppointment.id}`);
            newAppointments++;
            existingAppointments.push(newAppointment); // Adicionar à lista para evitar duplicatas
          }
        }

        // Para pacotes, criar múltiplos agendamentos (sessões)
        if (item.type === 'package') {
          console.log(`📦 Processando pacote: ${item.itemName} (${item.quantity} sessões)`);
          
          // Para pacotes, vamos criar agendamentos genéricos ou usar o primeiro serviço disponível
          const defaultService = services?.[0]; // Usar primeiro serviço como padrão
          if (!defaultService) {
            console.log(`❌ Nenhum serviço padrão encontrado para pacote`);
            skippedItems++;
            continue;
          }

          // Criar agendamentos para cada sessão do pacote
          for (let session = 1; session <= item.quantity; session++) {
            // Verificar se já existe agendamento para esta sessão do pacote
            const existingPackageAppointment = existingAppointments?.find(apt => 
              apt.client_id === client.id && 
              apt.notes?.includes(`pacote #${item.item_id} - sessão ${session}`)
            );

            if (existingPackageAppointment) {
              console.log(`⏭️ Agendamento já existe para sessão ${session} do pacote`);
              continue;
            }

            // Calcular data (espalhar sessões ao longo de semanas)
            const appointmentDate = new Date();
            appointmentDate.setDate(appointmentDate.getDate() + 7 + (session * 7)); // Uma sessão por semana
            const dateStr = appointmentDate.toISOString().split('T')[0];

            // Calcular horário
            const baseHour = 9 + ((item.id + session) % 8);
            const timeStr = `${baseHour.toString().padStart(2, '0')}:00`;

            const packageAppointmentData = {
              service_id: defaultService.id,
              client_id: client.id,
              client_name: client.name,
              client_phone: client.phone || '',
              appointment_date: dateStr,
              appointment_time: timeStr,
              duration: 60,
              price: item.price / item.quantity, // Dividir preço pelas sessões
              notes: `Pacote: ${item.itemName} - pacote #${item.item_id} - sessão ${session}/${item.quantity} (venda #${sale.id})`,
              status: 'agendado'
            };

            console.log(`📅 Criando sessão ${session}/${item.quantity}: ${dateStr} às ${timeStr}`);

            const { data: newPackageAppointment, error: packageInsertError } = await supabase
              .from('appointments')
              .insert([packageAppointmentData])
              .select()
              .single();

            if (packageInsertError) {
              console.error(`❌ Erro ao criar sessão ${session} do pacote:`, packageInsertError);
            } else {
              console.log(`✅ Sessão ${session} criada com sucesso! ID: ${newPackageAppointment.id}`);
              newAppointments++;
              existingAppointments.push(newPackageAppointment);
            }
          }
        }
      }
    }

    // 5. Relatório final
    console.log('\n📊 RELATÓRIO FINAL:');
    console.log(`✅ Novos agendamentos criados: ${newAppointments}`);
    console.log(`⏭️ Itens ignorados: ${skippedItems}`);
    console.log(`📋 Total de itens processados: ${totalItems}`);
    console.log(`💰 Total de vendas analisadas: ${sales.length}`);

    if (newAppointments > 0) {
      console.log('\n🎉 Processamento concluído com sucesso!');
      console.log('💡 Os agendamentos foram criados para as próximas semanas');
      console.log('📅 Você pode ajustar as datas e horários conforme necessário');
      console.log('📦 Pacotes foram divididos em sessões semanais');
    } else {
      console.log('\n📝 Nenhum novo agendamento foi necessário');
      console.log('💡 Todos os serviços e pacotes já possuem agendamentos correspondentes');
    }

  } catch (error) {
    console.error('❌ Erro geral no processamento:', error);
  }
}

// Executar o processamento
processarVendasParaAgendamentos();