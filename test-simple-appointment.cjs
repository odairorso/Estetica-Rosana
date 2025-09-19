const { createClient } = require('@supabase/supabase-js');

// Configurações reais do Supabase
const supabaseUrl = 'https://zojtuknkuwvkbnaorfqd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvanR1a25rdXd2a2JuYW9yZnFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNTMyNDksImV4cCI6MjA3MzYyOTI0OX0.RpA1fg0EMLK0mBrGBVljgzozi6c6J7tFw_S90LjxaiI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSimpleAppointment() {
  console.log('🧪 TESTANDO INSERÇÃO SIMPLES DE AGENDAMENTO');
  console.log('==========================================\n');
  
  try {
    // Teste 1: Inserção com campos mínimos obrigatórios
    console.log('📝 Teste 1: Inserção com campos mínimos...');
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const simpleAppointment = {
      service_name: 'Teste Limpeza de Pele',
      client_name: 'Maria Silva',
      client_phone: '(11) 99999-9999',
      date: tomorrow.toISOString().split('T')[0], // YYYY-MM-DD
      time: '10:00',
      duration: 60,
      price: 150.00,
      status: 'agendado',
      notes: 'Teste de inserção automática'
    };
    
    console.log('Dados a inserir:', JSON.stringify(simpleAppointment, null, 2));
    
    const { data, error } = await supabase
      .from('appointments')
      .insert([simpleAppointment])
      .select();
    
    if (error) {
      console.log('❌ Erro na inserção:', error.message);
      console.log('Detalhes do erro:', error);
    } else {
      console.log('✅ Agendamento criado com sucesso!');
      console.log('Dados inseridos:', data);
    }
    
    // Teste 2: Verificar agendamentos existentes
    console.log('\n📋 Verificando agendamentos existentes...');
    
    const { data: allAppointments, error: selectError } = await supabase
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (selectError) {
      console.log('❌ Erro ao buscar agendamentos:', selectError.message);
    } else {
      console.log(`✅ Total de agendamentos: ${allAppointments.length}`);
      
      allAppointments.forEach((apt, i) => {
        console.log(`\n${i+1}. ID: ${apt.id}`);
        console.log(`   Cliente: ${apt.client_name}`);
        console.log(`   Serviço: ${apt.service_name}`);
        console.log(`   Data: ${apt.date} às ${apt.time}`);
        console.log(`   Status: ${apt.status}`);
        console.log(`   Preço: R$ ${apt.price}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    console.error('Stack:', error.stack);
  }
}

testSimpleAppointment();