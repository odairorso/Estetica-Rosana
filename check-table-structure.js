import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zojtuknkuwvkbnaorfqd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvanR1a25rdXd2a2JuYW9yZnFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNTMyNDksImV4cCI6MjA3MzYyOTI0OX0.RpA1fg0EMLK0mBrGBVljgzozi6c6J7tFw_S90LjxaiI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function finalStructureTest() {
  console.log('🔍 Teste final da estrutura da tabela appointments...');
  
  try {
    // Pegar service_id e client_id válidos
    const { data: services } = await supabase
      .from('services')
      .select('id')
      .limit(1);
      
    const { data: clients } = await supabase
      .from('clients')
      .select('id, name, phone')
      .limit(1);
      
    if (!services || services.length === 0) {
      console.log('❌ Nenhum serviço encontrado');
      return;
    }
    
    if (!clients || clients.length === 0) {
      console.log('❌ Nenhum cliente encontrado');
      return;
    }
    
    const serviceId = services[0].id;
    const client = clients[0];
    
    console.log('📋 Usando service_id:', serviceId);
    console.log('📋 Usando client:', client);

    // Teste com estrutura completa e IDs válidos
    const testData = {
      service_id: serviceId,
      client_id: client.id,
      client_name: client.name,
      client_phone: client.phone,
      appointment_date: '2024-01-15',
      appointment_time: '10:00',
      duration: 60,
      price: 100,
      notes: 'Teste final',
      status: 'agendado'
    };

    console.log('\n📝 Testando estrutura final:');
    console.log('Dados:', testData);

    const { data, error } = await supabase
      .from('appointments')
      .insert([testData])
      .select()
      .single();

    if (error) {
      console.log(`❌ Erro: ${error.message}`);
    } else {
      console.log('✅ SUCESSO! Estrutura confirmada:');
      console.log('📊 Campos da tabela:', Object.keys(data).sort());
      console.log('📋 Dados inseridos:', data);
      
      // Deletar o registro de teste
      await supabase.from('appointments').delete().eq('id', data.id);
      console.log('🗑️ Registro de teste removido');
      
      console.log('\n🎯 ESTRUTURA DESCOBERTA:');
      console.log('- service_id: obrigatório (foreign key)');
      console.log('- client_id: obrigatório (foreign key)');
      console.log('- client_name: obrigatório');
      console.log('- client_phone: opcional');
      console.log('- appointment_date: campo de data');
      console.log('- appointment_time: campo de hora');
      console.log('- duration: opcional');
      console.log('- price: opcional');
      console.log('- notes: opcional');
      console.log('- status: obrigatório');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

finalStructureTest();