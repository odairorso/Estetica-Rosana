const { createClient } = require('@supabase/supabase-js');

// Configurações corretas do Supabase
const supabaseUrl = 'https://zojtuknkuwvkbnaorfqd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvanR1a25rdXd2a2JuYW9yZnFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNTMyNDksImV4cCI6MjA3MzYyOTI0OX0.RpA1fg0EMLK0mBrGBVljgzozi6c6J7tFw_S90LjxaiI';

const supabase = createClient(supabaseUrl, supabaseKey);

// Função para gerar horário aleatório entre 9h e 17h
function generateRandomTime() {
  const hours = Math.floor(Math.random() * 9) + 9; // 9 às 17
  const minutes = Math.random() < 0.5 ? '00' : '30'; // 00 ou 30 minutos
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

// Função para gerar data aleatória nos próximos 30 dias
function generateRandomDate() {
  const today = new Date();
  const futureDate = new Date(today.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000);
  return futureDate.toISOString().split('T')[0];
}

// Função para calcular duração baseada no tipo de serviço
function calculateDuration(serviceName) {
  const serviceName_lower = serviceName.toLowerCase();
  
  if (serviceName_lower.includes('limpeza')) return 60;
  if (serviceName_lower.includes('massagem')) return 90;
  if (serviceName_lower.includes('peeling')) return 45;
  if (serviceName_lower.includes('hidratação')) return 75;
  if (serviceName_lower.includes('depilação')) return 30;
  
  return 60; // duração padrão
}

// Função para encontrar serviço baseado no nome do item
function findServiceByName(services, itemName) {
  if (!itemName || !services) return null;
  
  const itemLower = itemName.toLowerCase();
  
  // Procurar correspondência exata ou parcial
  return services.find(service => {
    const serviceLower = service.name.toLowerCase();
    return serviceLower.includes(itemLower) || itemLower.includes(serviceLower);
  });
}

async function processSalesToAppointments() {
  console.log('🚀 Iniciando processamento de vendas para agendamentos...\n');

  try {
    // 1. Buscar todas as vendas com clientes
    console.log('📋 Buscando vendas...');
    const { data: sales, error: salesError } = await supabase
      .from('sales')
      .select(`
        *,
        clients (
          id,
          name,
          phone
        )
      `);

    if (salesError) {
      console.error('❌ Erro ao buscar vendas:', salesError);
      return;
    }

    console.log(`✅ Encontradas ${sales?.length || 0} vendas\n`);

    if (!sales || sales.length === 0) {
      console.log('ℹ️ Nenhuma venda encontrada para processar.');
      return;
    }

    // 2. Buscar todos os serviços disponíveis
    console.log('🔧 Buscando serviços disponíveis...');
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('*');

    if (servicesError) {
      console.error('❌ Erro ao buscar serviços:', servicesError);
      return;
    }

    console.log(`✅ Encontrados ${services?.length || 0} serviços\n`);

    if (!services || services.length === 0) {
      console.log('❌ Nenhum serviço encontrado. Não é possível criar agendamentos.');
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    // 3. Processar cada venda
    for (const sale of sales) {
      console.log(`\n📦 Processando venda ID: ${sale.id}`);
      console.log(`   Cliente: ${sale.client_name}`);
      console.log(`   Valor total: R$ ${sale.total}`);

      if (!sale.clients) {
        console.log('   ⚠️ Venda sem cliente associado - pulando...');
        errorCount++;
        continue;
      }

      // 4. Processar itens da venda
      let items = [];
      try {
        if (typeof sale.items === 'string') {
          items = JSON.parse(sale.items);
        } else if (Array.isArray(sale.items)) {
          items = sale.items;
        } else if (sale.items && typeof sale.items === 'object') {
          items = [sale.items];
        }
      } catch (e) {
        console.log(`   ❌ Erro ao processar itens: ${e.message}`);
        errorCount++;
        continue;
      }

      if (!items || items.length === 0) {
        console.log('   ⚠️ Nenhum item encontrado na venda - pulando...');
        errorCount++;
        continue;
      }

      console.log(`   📋 Processando ${items.length} item(s):`);

      // 5. Criar agendamento para cada item
      for (const item of items) {
        const itemName = item.itemName || item.name || 'Item não especificado';
        const itemPrice = item.price || (sale.total / items.length);
        
        console.log(`\n     🔸 Item: ${itemName}`);
        console.log(`       Preço: R$ ${itemPrice}`);

        // Encontrar serviço correspondente
        let service = findServiceByName(services, itemName);
        
        if (!service) {
          // Usar primeiro serviço como fallback
          service = services[0];
          console.log(`       ⚠️ Serviço não encontrado, usando fallback: ${service.name}`);
        } else {
          console.log(`       ✅ Serviço encontrado: ${service.name}`);
        }

        // Criar dados do agendamento
        const appointmentData = {
          service_id: service.id,
          client_id: sale.clients.id,
          client_name: sale.clients.name,
          client_phone: sale.clients.phone || '(11) 99999-9999',
          appointment_date: generateRandomDate(),
          appointment_time: generateRandomTime(),
          duration: calculateDuration(service.name),
          price: itemPrice,
          status: 'agendado',
          notes: `Agendamento criado automaticamente a partir da venda #${sale.id} - Item: ${itemName}`
        };

        console.log(`       📅 Criando agendamento para ${appointmentData.appointment_date} às ${appointmentData.appointment_time}`);

        // Inserir agendamento
        const { data: appointment, error: appointmentError } = await supabase
          .from('appointments')
          .insert(appointmentData)
          .select();

        if (appointmentError) {
          console.log(`       ❌ Erro ao criar agendamento: ${appointmentError.message}`);
          errorCount++;
        } else {
          console.log(`       ✅ Agendamento criado com sucesso! ID: ${appointment[0].id}`);
          successCount++;
        }
      }
    }

    // 6. Resumo final
    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMO DO PROCESSAMENTO');
    console.log('='.repeat(50));
    console.log(`✅ Agendamentos criados com sucesso: ${successCount}`);
    console.log(`❌ Erros encontrados: ${errorCount}`);
    console.log(`📋 Total de vendas processadas: ${sales.length}`);

    // 7. Verificar agendamentos criados
    console.log('\n📋 Verificando agendamentos criados...');
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false });

    if (appointmentsError) {
      console.log(`❌ Erro ao buscar agendamentos: ${appointmentsError.message}`);
    } else {
      console.log(`✅ Total de agendamentos no sistema: ${appointments?.length || 0}`);
      
      if (appointments && appointments.length > 0) {
        console.log('\n📅 Últimos agendamentos criados:');
        appointments.slice(0, 10).forEach((apt, index) => {
          console.log(`\n${index + 1}. Cliente: ${apt.client_name}`);
          console.log(`   Data: ${apt.appointment_date} às ${apt.appointment_time}`);
          console.log(`   Duração: ${apt.duration} min`);
          console.log(`   Status: ${apt.status}`);
          console.log(`   Preço: R$ ${apt.price}`);
          console.log(`   Observações: ${apt.notes || 'N/A'}`);
        });
      }
    }

  } catch (error) {
    console.error('💥 Erro geral no processamento:', error);
  }
}

// Executar o processamento
processSalesToAppointments();