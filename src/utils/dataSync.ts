// Utilitários para sincronizar dados reais entre Supabase e localStorage

export async function exportDataFromSupabase() {
  const { supabase } = await import('@/lib/supabase');
  
  if (!supabase) {
    throw new Error('Supabase não está configurado');
  }

  try {
    // Buscar todos os dados reais do Supabase
    const [clientsResult, appointmentsResult, salesResult, packagesResult] = await Promise.all([
      supabase.from('clients').select('*'),
      supabase.from('appointments').select('*'),
      supabase.from('sales').select('*'),
      supabase.from('packages').select('*')
    ]);

    const exportedData = {
      clients: clientsResult.data || [],
      appointments: appointmentsResult.data || [],
      sales: salesResult.data || [],
      packages: packagesResult.data || [],
      exportedAt: new Date().toISOString()
    };

    // Salvar dados reais no localStorage
    localStorage.setItem('clinic-clients-v2', JSON.stringify(exportedData.clients));
    localStorage.setItem('clinic-appointments-v2', JSON.stringify(exportedData.appointments));
    localStorage.setItem('clinic-sales-v2', JSON.stringify(exportedData.sales));
    localStorage.setItem('clinic-packages-v2', JSON.stringify(exportedData.packages));

    console.log('✅ Dados reais exportados do Supabase para localStorage');
    return exportedData;
    
  } catch (error) {
    console.error('❌ Erro ao exportar dados do Supabase:', error);
    throw error;
  }
}

export async function importDataToSupabase() {
  const { supabase } = await import('@/lib/supabase');
  
  if (!supabase) {
    throw new Error('Supabase não está configurado');
  }

  try {
    // Buscar dados do localStorage
    const clients = JSON.parse(localStorage.getItem('clinic-clients-v2') || '[]');
    const appointments = JSON.parse(localStorage.getItem('clinic-appointments-v2') || '[]');
    const sales = JSON.parse(localStorage.getItem('clinic-sales-v2') || '[]');
    const packages = JSON.parse(localStorage.getItem('clinic-packages-v2') || '[]');

    // Enviar dados para o Supabase
    const results = await Promise.all([
      clients.length > 0 ? supabase.from('clients').upsert(clients) : null,
      appointments.length > 0 ? supabase.from('appointments').upsert(appointments) : null,
      sales.length > 0 ? supabase.from('sales').upsert(sales) : null,
      packages.length > 0 ? supabase.from('packages').upsert(packages) : null
    ]);

    console.log('✅ Dados do localStorage enviados para o Supabase');
    return results;
    
  } catch (error) {
    console.error('❌ Erro ao importar dados para o Supabase:', error);
    throw error;
  }
}

export function createDataSyncButtons() {
  return {
    exportButton: {
      text: '📥 Baixar Dados Reais do Supabase',
      action: exportDataFromSupabase
    },
    importButton: {
      text: '📤 Enviar Dados para o Supabase',
      action: importDataToSupabase
    }
  };
}