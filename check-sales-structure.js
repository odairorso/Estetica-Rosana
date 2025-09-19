import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zojtuknkuwvkbnaorfqd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvanR1a25rdXd2a2JuYW9yZnFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNTMyNDksImV4cCI6MjA3MzYyOTI0OX0.RpA1fg0EMLK0mBrGBVljgzozi6c6J7tFw_S90LjxaiI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSalesStructure() {
  console.log('🔍 Verificando estrutura das vendas...');
  
  try {
    // Buscar vendas
    const { data: sales, error: salesError } = await supabase
      .from('sales')
      .select('*');

    if (salesError) {
      console.error('❌ Erro ao buscar vendas:', salesError);
      return;
    }

    console.log(`📊 Encontradas ${sales?.length || 0} vendas`);

    if (sales && sales.length > 0) {
      console.log('\n📋 Estrutura da primeira venda:');
      console.log('Campos:', Object.keys(sales[0]).sort());
      console.log('\n📝 Dados da primeira venda:');
      console.log(JSON.stringify(sales[0], null, 2));
      
      if (sales.length > 1) {
        console.log('\n📝 Dados da segunda venda:');
        console.log(JSON.stringify(sales[1], null, 2));
      }
    }

    // Buscar serviços para referência
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('*');

    if (servicesError) {
      console.error('❌ Erro ao buscar serviços:', servicesError);
      return;
    }

    console.log(`\n🛠️ Serviços disponíveis (${services?.length || 0}):`);
    services?.forEach(service => {
      console.log(`- ID: ${service.id}, Nome: ${service.name}, Preço: ${service.price}`);
    });

    // Buscar clientes para referência
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*');

    if (clientsError) {
      console.error('❌ Erro ao buscar clientes:', clientsError);
      return;
    }

    console.log(`\n👥 Clientes disponíveis (${clients?.length || 0}):`);
    clients?.forEach(client => {
      console.log(`- ID: ${client.id}, Nome: ${client.name}, Telefone: ${client.phone}`);
    });

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkSalesStructure();