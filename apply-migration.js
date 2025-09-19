// Script para aplicar a migração no Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zojtuknkuwvkbnaorfqd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvanR1a25rdXd2a2JuYW9yZnFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNTMyNDksImV4cCI6MjA3MzYyOTI0OX0.RpA1fg0EMLK0mBrGBVljgzozi6c6J7tFw_S90LjxaiI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  console.log('🔍 Aplicando migração para atualizar schema da tabela packages...');
  
  try {
    // Primeiro, vamos tentar adicionar as colunas usando ALTER TABLE
    console.log('📝 Adicionando coluna client_name...');
    
    // Adicionar client_name
    const { error: error1 } = await supabase
      .from('packages')
      .select('client_name')
      .limit(1);
    
    if (error1 && error1.code === 'PGRST204') {
      console.log('❌ Coluna client_name não existe, mas não podemos criar via API');
      console.log('💡 Você precisa executar esta migração no painel do Supabase:');
      console.log('ALTER TABLE packages ADD COLUMN client_name text;');
      console.log('ALTER TABLE packages ADD COLUMN session_history jsonb DEFAULT \'[]\'::jsonb;');
    } else {
      console.log('✅ Coluna client_name já existe');
    }
    
    // Verificar session_history
    console.log('📝 Verificando coluna session_history...');
    const { error: error2 } = await supabase
      .from('packages')
      .select('session_history')
      .limit(1);
    
    if (error2 && error2.code === 'PGRST204') {
      console.log('❌ Coluna session_history não existe');
    } else {
      console.log('✅ Coluna session_history já existe');
    }
    
    // Verificar todas as colunas atuais
    const { data: currentData, error: currentError } = await supabase
      .from('packages')
      .select('*')
      .limit(1);
    
    if (!currentError && currentData && currentData.length > 0) {
      console.log('🔍 Colunas atuais na tabela packages:');
      console.log(Object.keys(currentData[0]));
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

applyMigration();