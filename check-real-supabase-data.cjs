const { createClient } = require('@supabase/supabase-js');

// Configurações reais do Supabase encontradas no código
const supabaseUrl = 'https://zojtuknkuwvkbnaorfqd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvanR1a25rdXd2a2JuYW9yZnFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNTMyNDksImV4cCI6MjA3MzYyOTI0OX0.RpA1fg0EMLK0mBrGBVljgzozi6c6J7tFw_S90LjxaiI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSupabaseData() {
  console.log('🔍 VERIFICANDO DADOS REAIS DO SUPABASE');
  console.log('=====================================\n');
  
  try {
    // 1. Verificar vendas
    console.log('📊 VENDAS DO CAIXA:');
    const { data: sales, error: salesError } = await supabase
      .from('sales')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (salesError) {
      console.log('❌ Erro ao buscar vendas:', salesError.message);
    } else {
      console.log(`✅ Total de vendas encontradas: ${sales.length}`);
      sales.forEach((sale, i) => {
        console.log(`\nVenda ${i+1}:`);
        console.log(`  ID: ${sale.id}`);
        console.log(`  Cliente: ${sale.client_name || 'N/A'}`);
        console.log(`  Telefone: ${sale.client_phone || 'N/A'}`);
        console.log(`  Total: R$ ${sale.total || 0}`);
        console.log(`  Data: ${new Date(sale.created_at).toLocaleDateString('pt-BR')}`);
        
        if (sale.items) {
          try {
            const items = JSON.parse(sale.items);
            console.log(`  Itens (${items.length}):`);
            items.forEach((item, j) => {
              console.log(`    ${j+1}. ${item.itemName} (${item.type}) - R$ ${item.price}`);
              if (item.sessions) {
                console.log(`       Sessões: ${item.sessions}`);
              }
            });
          } catch (e) {
            console.log(`  Itens: Erro ao parsear - ${sale.items}`);
          }
        }
      });
    }
    
    // 2. Verificar clientes
    console.log('\n\n👥 CLIENTES CADASTRADOS:');
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (clientsError) {
      console.log('❌ Erro ao buscar clientes:', clientsError.message);
    } else {
      console.log(`✅ Total de clientes encontrados: ${clients.length}`);
      clients.forEach((client, i) => {
        console.log(`\nCliente ${i+1}:`);
        console.log(`  ID: ${client.id}`);
        console.log(`  Nome: ${client.name}`);
        console.log(`  Telefone: ${client.phone || 'N/A'}`);
        console.log(`  Email: ${client.email || 'N/A'}`);
        console.log(`  Data cadastro: ${new Date(client.created_at).toLocaleDateString('pt-BR')}`);
      });
    }
    
    // 3. Verificar pacotes
    console.log('\n\n📦 PACOTES DISPONÍVEIS:');
    const { data: packages, error: packagesError } = await supabase
      .from('packages')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (packagesError) {
      console.log('❌ Erro ao buscar pacotes:', packagesError.message);
    } else {
      console.log(`✅ Total de pacotes encontrados: ${packages.length}`);
      packages.forEach((pkg, i) => {
        console.log(`\nPacote ${i+1}:`);
        console.log(`  ID: ${pkg.id}`);
        console.log(`  Nome: ${pkg.name}`);
        console.log(`  Preço: R$ ${pkg.price || 0}`);
        console.log(`  Sessões: ${pkg.sessions || 'N/A'}`);
        console.log(`  Descrição: ${pkg.description || 'N/A'}`);
      });
    }
    
    // 4. Verificar serviços
    console.log('\n\n🔧 SERVIÇOS/PROCEDIMENTOS:');
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (servicesError) {
      console.log('❌ Erro ao buscar serviços:', servicesError.message);
    } else {
      console.log(`✅ Total de serviços encontrados: ${services.length}`);
      services.forEach((service, i) => {
        console.log(`\nServiço ${i+1}:`);
        console.log(`  ID: ${service.id}`);
        console.log(`  Nome: ${service.name}`);
        console.log(`  Preço: R$ ${service.price || 0}`);
        console.log(`  Duração: ${service.duration || 'N/A'} min`);
        console.log(`  Categoria: ${service.category || 'N/A'}`);
      });
    }
    
    // 5. Verificar agendamentos existentes
    console.log('\n\n📅 AGENDAMENTOS EXISTENTES:');
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (appointmentsError) {
      console.log('❌ Erro ao buscar agendamentos:', appointmentsError.message);
    } else {
      console.log(`✅ Total de agendamentos encontrados: ${appointments.length}`);
      appointments.forEach((apt, i) => {
        console.log(`\nAgendamento ${i+1}:`);
        console.log(`  ID: ${apt.id}`);
        console.log(`  Cliente: ${apt.client_name || 'N/A'}`);
        console.log(`  Serviço/Pacote: ${apt.service_name || apt.package_name || 'N/A'}`);
        console.log(`  Tipo: ${apt.type || 'N/A'}`);
        console.log(`  Status: ${apt.status || 'N/A'}`);
        console.log(`  Data agendamento: ${apt.appointment_date || 'N/A'}`);
        if (apt.session_number) {
          console.log(`  Sessão: ${apt.session_number}/${apt.total_sessions || '?'}`);
        }
      });
    }
    
    console.log('\n\n🎯 RESUMO:');
    console.log(`📊 Vendas: ${sales?.length || 0}`);
    console.log(`👥 Clientes: ${clients?.length || 0}`);
    console.log(`📦 Pacotes: ${packages?.length || 0}`);
    console.log(`🔧 Serviços: ${services?.length || 0}`);
    console.log(`📅 Agendamentos: ${appointments?.length || 0}`);
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

checkSupabaseData();