import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zojtuknkuwvkbnaorfqd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvanR1a25rdXd2a2JuYW9yZnFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNTMyNDksImV4cCI6MjA3MzYyOTI0OX0.RpA1fg0EMLK0mBrGBVljgzozi6c6J7tFw_S90LjxaiI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAppointmentsAndSales() {
  console.log('🔍 Verificando tabela appointments...');
  
  try {
    // Verificar appointments
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false });

    if (appointmentsError) {
      console.error('❌ Erro ao buscar appointments:', appointmentsError);
    } else {
      console.log(`📅 Total de appointments encontrados: ${appointments.length}`);
      if (appointments.length > 0) {
        console.log('📋 Últimos appointments:');
        appointments.slice(0, 3).forEach((apt, index) => {
          console.log(`  ${index + 1}. ${apt.client_name} - ${apt.service_name} - ${apt.date} ${apt.time} - Status: ${apt.status}`);
        });
      }
    }

    // Verificar sales
    console.log('\n🔍 Verificando tabela sales...');
    const { data: sales, error: salesError } = await supabase
      .from('sales')
      .select('*')
      .order('created_at', { ascending: false });

    if (salesError) {
      console.error('❌ Erro ao buscar sales:', salesError);
    } else {
      console.log(`💰 Total de vendas encontradas: ${sales.length}`);
      if (sales.length > 0) {
        console.log('📋 Últimas vendas:');
        sales.slice(0, 3).forEach((sale, index) => {
          const items = Array.isArray(sale.items) ? sale.items : [];
          const serviceNames = items.map(item => item.name || item.service_name).join(', ');
          console.log(`  ${index + 1}. Cliente: ${sale.client_name} - Serviços: ${serviceNames || 'N/A'} - Valor: R$ ${sale.total} - Data: ${sale.sale_date}`);
        });
      }
    }

    // Verificar se há vendas sem agendamentos correspondentes
    if (sales && sales.length > 0 && appointments) {
      console.log('\n🔄 Verificando conversão de vendas para agendamentos...');
      const salesWithoutAppointments = sales.filter(sale => {
        const items = Array.isArray(sale.items) ? sale.items : [];
        return !items.some(item => {
          const serviceName = item.name || item.service_name;
          return appointments.some(apt => 
            apt.client_name === sale.client_name && 
            apt.service_name === serviceName
          );
        });
      });
      
      if (salesWithoutAppointments.length > 0) {
        console.log(`⚠️  ${salesWithoutAppointments.length} vendas não foram convertidas em agendamentos:`);
        salesWithoutAppointments.forEach((sale, index) => {
          const items = Array.isArray(sale.items) ? sale.items : [];
          const serviceNames = items.map(item => item.name || item.service_name).join(', ');
          console.log(`  ${index + 1}. ${sale.client_name} - Serviços: ${serviceNames || 'N/A'} - ${sale.sale_date}`);
        });
      } else {
        console.log('✅ Todas as vendas foram convertidas em agendamentos!');
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkAppointmentsAndSales();