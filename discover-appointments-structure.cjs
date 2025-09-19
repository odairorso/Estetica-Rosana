const { createClient } = require('@supabase/supabase-js');

// Configurações reais do Supabase
const supabaseUrl = 'https://zojtuknkuwvkbnaorfqd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvanR1a25rdXd2a2JuYW9yZnFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNTMyNDksImV4cCI6MjA3MzYyOTI0OX0.RpA1fg0EMLK0mBrGBVljgzozi6c6J7tFw_S90LjxaiI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function discoverAppointmentsStructure() {
  console.log('🔍 DESCOBRINDO ESTRUTURA REAL DA TABELA APPOINTMENTS');
  console.log('==================================================\n');
  
  try {
    // Primeiro, vamos buscar um service_id válido
    console.log('📋 Buscando services para obter um service_id válido...');
    
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('*')
      .limit(1);
    
    if (servicesError) {
      console.log('❌ Erro ao buscar services:', servicesError.message);
      return;
    }
    
    if (!services || services.length === 0) {
      console.log('❌ Nenhum serviço encontrado');
      return;
    }
    
    const serviceId = services[0].id;
    console.log(`✅ Service ID encontrado: ${serviceId}`);
    console.log(`   Nome do serviço: ${services[0].name}`);
    
    // Agora vamos testar diferentes combinações de campos
    console.log('\n🧪 Testando estrutura da tabela appointments...');
    
    const fieldsToTest = [
      'id',
      'service_id',
      'client_id', 
      'client_name',
      'client_phone',
      'appointment_date',
      'date',
      'time',
      'start_time',
      'end_time',
      'duration',
      'price',
      'status',
      'notes',
      'created_at',
      'updated_at'
    ];
    
    const validFields = [];
    const requiredFields = ['service_id']; // Sabemos que este é obrigatório
    
    for (const field of fieldsToTest) {
      const testData = {
        service_id: serviceId // Sempre incluir o campo obrigatório
      };
      
      if (field !== 'service_id') {
        // Adicionar o campo de teste com um valor apropriado
        switch (field) {
          case 'appointment_date':
          case 'date':
            testData[field] = '2025-09-20T10:00:00Z';
            break;
          case 'time':
          case 'start_time':
          case 'end_time':
            testData[field] = '10:00';
            break;
          case 'duration':
            testData[field] = 60;
            break;
          case 'price':
            testData[field] = 100.00;
            break;
          case 'client_name':
            testData[field] = 'Teste';
            break;
          case 'client_phone':
            testData[field] = '(11) 99999-9999';
            break;
          case 'status':
            testData[field] = 'agendado';
            break;
          case 'notes':
            testData[field] = 'Teste de estrutura';
            break;
          default:
            testData[field] = 'teste';
        }
      }
      
      const { data, error } = await supabase
        .from('appointments')
        .insert([testData])
        .select();
      
      if (error) {
        if (error.message.includes('Could not find')) {
          console.log(`❌ Campo '${field}': NÃO EXISTE`);
        } else if (error.message.includes('violates not-null constraint')) {
          console.log(`⚠️  Campo '${field}': EXISTE mas é OBRIGATÓRIO`);
          validFields.push(field);
          if (!requiredFields.includes(field)) {
            requiredFields.push(field);
          }
        } else {
          console.log(`⚠️  Campo '${field}': EXISTE mas erro: ${error.message}`);
          validFields.push(field);
        }
      } else {
        console.log(`✅ Campo '${field}': EXISTE e funcionou!`);
        validFields.push(field);
        
        // Deletar o registro de teste
        if (data && data[0] && data[0].id) {
          await supabase
            .from('appointments')
            .delete()
            .eq('id', data[0].id);
        }
      }
    }
    
    console.log('\n📊 RESUMO DA ESTRUTURA:');
    console.log('======================');
    console.log('✅ Campos válidos:', validFields.join(', '));
    console.log('⚠️  Campos obrigatórios:', requiredFields.join(', '));
    
    // Tentar criar um agendamento completo com os campos válidos
    console.log('\n🎯 Tentando criar agendamento completo...');
    
    const completeAppointment = {
      service_id: serviceId
    };
    
    // Adicionar campos opcionais se existirem
    if (validFields.includes('client_name')) completeAppointment.client_name = 'Maria Silva';
    if (validFields.includes('client_phone')) completeAppointment.client_phone = '(11) 99999-9999';
    if (validFields.includes('appointment_date')) completeAppointment.appointment_date = '2025-09-20T10:00:00Z';
    if (validFields.includes('date')) completeAppointment.date = '2025-09-20';
    if (validFields.includes('time')) completeAppointment.time = '10:00';
    if (validFields.includes('duration')) completeAppointment.duration = 60;
    if (validFields.includes('price')) completeAppointment.price = 150.00;
    if (validFields.includes('status')) completeAppointment.status = 'agendado';
    if (validFields.includes('notes')) completeAppointment.notes = 'Agendamento criado automaticamente da venda';
    
    console.log('Dados do agendamento completo:', JSON.stringify(completeAppointment, null, 2));
    
    const { data: finalData, error: finalError } = await supabase
      .from('appointments')
      .insert([completeAppointment])
      .select();
    
    if (finalError) {
      console.log('❌ Erro ao criar agendamento completo:', finalError.message);
    } else {
      console.log('✅ Agendamento completo criado com sucesso!');
      console.log('Dados retornados:', finalData);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

discoverAppointmentsStructure();