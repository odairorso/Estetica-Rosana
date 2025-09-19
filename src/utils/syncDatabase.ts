// Função para limpar e sincronizar dados com Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zojtuknkuwvkbnaorfqd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvanR1a25rdXd2a2JuYW9yZnFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNTMyNDksImV4cCI6MjA3MzYyOTI0OX0.RpA1fg0EMLK0mBrGBVljgzozi6c6J7tFw_S90LjxaiI';

// Criar cliente Supabase apenas para sincronização
let supabase: any = null;

export async function clearAndSyncDatabase() {
  console.log("🗑️ INICIANDO LIMPEZA E SINCRONIZAÇÃO DO BANCO DE DADOS...");
  
  try {
    // Habilitar temporariamente conexões para sincronização
    (window as any).enableSupabaseSync?.();
    
    // Criar cliente Supabase temporário
    if (!supabase) {
      supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        }
      });
    }
    // 1. LIMPAR TODAS AS TABELAS DO SUPABASE
    console.log("🗑️ Limpando tabelas do Supabase...");
    
    const clearResults = await Promise.allSettled([
      supabase.from('appointments').delete().neq('id', 0),
      supabase.from('sales').delete().neq('id', 0),
      supabase.from('packages').delete().neq('id', 0),
      supabase.from('clients').delete().neq('id', 0),
      supabase.from('services').delete().neq('id', 0)
    ]);
    
    console.log("✅ Tabelas limpas:", clearResults);
    
    // 2. BUSCAR DADOS LOCAIS (SEUS DADOS REAIS)
    console.log("📦 Buscando dados locais...");
    
    const localClients = JSON.parse(localStorage.getItem('clinic-clients-v2') || '[]');
    const localAppointments = JSON.parse(localStorage.getItem('clinic-appointments-v2') || '[]');
    const localSales = JSON.parse(localStorage.getItem('clinic-sales-v2') || '[]');
    const localPackages = JSON.parse(localStorage.getItem('clinic-packages-v2') || '[]');
    const localServices = JSON.parse(localStorage.getItem('clinic-services-v2') || '[]');
    
    console.log("📊 Dados locais encontrados:", {
      clientes: localClients.length,
      agendamentos: localAppointments.length,
      vendas: localSales.length,
      pacotes: localPackages.length,
      serviços: localServices.length
    });
    
    // 3. ENVIAR DADOS LOCAIS PARA O SUPABASE
    console.log("📤 Enviando dados locais para o Supabase...");
    
    const uploadResults = [];
    
    // Clientes
    if (localClients.length > 0) {
      const clientsResult = await supabase.from('clients').insert(
        localClients.map(client => ({
          id: client.id,
          name: client.name,
          email: client.email || '',
          phone: client.phone || '',
          cpf: client.cpf || '',
          street: client.street || '',
          number: client.number || '',
          complement: client.complement || '',
          neighborhood: client.neighborhood || '',
          city: client.city || '',
          state: client.state || '',
          zip_code: client.zip_code || '',
          active_packages: client.active_packages || 0,
          total_visits: client.total_visits || 0,
          created_at: client.created_at || new Date().toISOString()
        }))
      );
      uploadResults.push({ table: 'clients', result: clientsResult });
    }
    
    // Serviços
    if (localServices.length > 0) {
      const servicesResult = await supabase.from('services').insert(
        localServices.map(service => ({
          id: service.id,
          name: service.name,
          description: service.description || '',
          price: service.price,
          duration: service.duration || 60,
          category: service.category || 'Facial',
          status: service.status || 'active',
          created_at: service.created_at || new Date().toISOString()
        }))
      );
      uploadResults.push({ table: 'services', result: servicesResult });
    }
    
    // Pacotes
    if (localPackages.length > 0) {
      const packagesResult = await supabase.from('packages').insert(
        localPackages.map(pkg => ({
          id: pkg.id,
          name: pkg.name,
          description: pkg.description || '',
          total_sessions: pkg.total_sessions,
          price: pkg.price,
          valid_until: pkg.valid_until,
          status: pkg.status || 'active',
          created_at: pkg.created_at || new Date().toISOString()
        }))
      );
      uploadResults.push({ table: 'packages', result: packagesResult });
    }
    
    // Vendas
    if (localSales.length > 0) {
      const salesResult = await supabase.from('sales').insert(
        localSales.map(sale => ({
          id: sale.id,
          client_id: sale.client_id,
          items: sale.items,
          total: sale.total,
          sale_date: sale.sale_date,
          payment_method: sale.payment_method || 'dinheiro',
          notes: sale.notes || '',
          created_at: sale.created_at || new Date().toISOString()
        }))
      );
      uploadResults.push({ table: 'sales', result: salesResult });
    }
    
    // Agendamentos
    if (localAppointments.length > 0) {
      const appointmentsResult = await supabase.from('appointments').insert(
        localAppointments.map(apt => ({
          id: apt.id,
          client_id: apt.client_id,
          client_name: apt.client_name,
          client_phone: apt.client_phone || '',
          service_id: apt.service_id,
          service_name: apt.service_name,
          package_id: apt.package_id,
          package_name: apt.package_name,
          total_sessions: apt.total_sessions,
          session_number: apt.session_number,
          date: apt.date || new Date().toISOString().split('T')[0],
          time: apt.time || '09:00',
          duration: apt.duration || 60,
          price: apt.price || 0,
          notes: apt.notes || '',
          status: apt.status,
          type: apt.type,
          created_at: apt.created_at || new Date().toISOString()
        }))
      );
      uploadResults.push({ table: 'appointments', result: appointmentsResult });
    }
    
    console.log("✅ Dados enviados para o Supabase:", uploadResults);
    
    // Desabilitar conexões novamente
    (window as any).disableSupabaseSync?.();
    
    return {
      success: true,
      message: 'Banco limpo e sincronizado com sucesso!',
      stats: {
        clientes: localClients.length,
        agendamentos: localAppointments.length,
        vendas: localSales.length,
        pacotes: localPackages.length,
        serviços: localServices.length
      }
    };
    
  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
    
    // Garantir que as conexões sejam desabilitadas mesmo em caso de erro
    (window as any).disableSupabaseSync?.();
    
    return {
      success: false,
      message: 'Erro ao sincronizar dados',
      error: error
    };
  }
}