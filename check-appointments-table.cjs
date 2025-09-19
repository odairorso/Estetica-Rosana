const { createClient } = require('@supabase/supabase-js');

// Configurações reais do Supabase
const supabaseUrl = 'https://zojtuknkuwvkbnaorfqd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvanR1a25rdXd2a2JuYW9yZnFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNTMyNDksImV4cCI6MjA3MzYyOTI0OX0.RpA1fg0EMLK0mBrGBVljgzozi6c6J7tFw_S90LjxaiI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAppointmentsTable() {
  console.log('🔍 VERIFICANDO ESTRUTURA DA TABELA APPOINTMENTS');
  console.log('===============================================\n');
  
  try {
    // Tentar inserir um agendamento simples para ver quais campos são aceitos
    const testAppointment = {
      client_name: 'Teste',
      service_name: 'Teste',
      type: 'service',
      status: 'scheduled',
      appointment_date: new Date().toISOString(),
      price: 100,
      session_number: 1,
      total_sessions: 1
    };
    
    console.log('📝 Tentando inserir agendamento de teste...');
    const { data, error } = await supabase
      .from('appointments')
      .insert([testAppointment])
      .select();
    
    if (error) {
      console.log('❌ Erro ao inserir:', error.message);
      console.log('💡 Detalhes do erro:', error);
    } else {
      console.log('✅ Agendamento de teste criado com sucesso!');
      console.log('📊 Dados inseridos:', data);
      
      // Deletar o agendamento de teste
      if (data && data[0] && data[0].id) {
        await supabase
          .from('appointments')
          .delete()
          .eq('id', data[0].id);
        console.log('🗑️ Agendamento de teste removido');
      }
    }
    
    // Tentar buscar um agendamento existente para ver a estrutura
    console.log('\n🔍 Verificando agendamentos existentes...');
    const { data: existingAppointments, error: selectError } = await supabase
      .from('appointments')
      .select('*')
      .limit(1);
    
    if (selectError) {
      console.log('❌ Erro ao buscar agendamentos:', selectError.message);
    } else {
      console.log(`📋 Agendamentos encontrados: ${existingAppointments.length}`);
      if (existingAppointments.length > 0) {
        console.log('📊 Estrutura do primeiro agendamento:');
        console.log(JSON.stringify(existingAppointments[0], null, 2));
      }
    }
    
    // Tentar descobrir a estrutura da tabela
    console.log('\n🔍 Tentando descobrir campos aceitos...');
    
    const fieldsToTest = [
      'client_name',
      'client_phone', 
      'service_name',
      'package_name',
      'type',
      'status',
      'appointment_date',
      'price',
      'session_number',
      'total_sessions',
      'sale_id',
      'notes',
      'duration'
    ];
    
    for (const field of fieldsToTest) {
      const testData = { [field]: 'test_value' };
      
      const { error } = await supabase
        .from('appointments')
        .insert([testData])
        .select();
      
      if (error) {
        if (error.message.includes('null value in column')) {
          console.log(`⚠️  Campo ${field}: Obrigatório (não pode ser null)`);
        } else if (error.message.includes('Could not find')) {
          console.log(`❌ Campo ${field}: Não existe na tabela`);
        } else {
          console.log(`🔸 Campo ${field}: ${error.message}`);
        }
      } else {
        console.log(`✅ Campo ${field}: Aceito`);
        // Deletar o teste
        await supabase
          .from('appointments')
          .delete()
          .eq(field, 'test_value');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

checkAppointmentsTable();