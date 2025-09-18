// Script para testar a conexão com o Supabase e verificar a tabela packages
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zojtuknkuwvkbnaorfqd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvanR1a25rdXd2a2JuYW9yZnFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNTMyNDksImV4cCI6MjA3MzYyOTI0OX0.RpA1fg0EMLK0mBrGBVljgzozi6c6J7tFw_S90LjxaiI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabase() {
  console.log('🔍 Testando conexão com Supabase...');
  
  try {
    // Testar conexão básica
    const { data: tables, error: tablesError } = await supabase
      .from('packages')
      .select('*')
      .limit(1);

    if (tablesError) {
      console.error('❌ Erro ao acessar tabela packages:', tablesError);
      return;
    }

    console.log('✅ Conexão com Supabase funcionando!');
    console.log('📋 Dados da tabela packages:', tables);
    
    // Verificar quais colunas existem
    if (tables && tables.length > 0) {
      console.log('🔍 Colunas disponíveis na tabela packages:');
      console.log(Object.keys(tables[0]));
    }

    // Testar se podemos inserir um registro de teste
    const testPackage = {
      name: 'Teste',
      description: 'Pacote de teste',
      client_name: 'Cliente Teste',
      total_sessions: 1,
      used_sessions: 0,
      price: 100,
      valid_until: '2024-12-31',
      status: 'active',
      session_history: JSON.stringify([])
    };

    const { data: insertData, error: insertError } = await supabase
      .from('packages')
      .insert([testPackage])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Erro ao inserir pacote de teste:', insertError);
      return;
    }

    console.log('✅ Pacote de teste inserido com sucesso:', insertData);

    // Limpar o registro de teste
    const { error: deleteError } = await supabase
      .from('packages')
      .delete()
      .eq('id', insertData.id);

    if (deleteError) {
      console.error('❌ Erro ao deletar pacote de teste:', deleteError);
    } else {
      console.log('✅ Pacote de teste removido com sucesso');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testSupabase();