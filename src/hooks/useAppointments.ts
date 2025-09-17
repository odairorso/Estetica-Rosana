import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface Appointment {
  id: number;
  service_id: number;
  client_id: number;
  client_name: string;
  client_phone: string;
  appointment_date: string; // YYYY-MM-DD
  appointment_time: string;
  duration: number;
  price: number;
  notes: string;
  status: "agendado" | "confirmado" | "concluido" | "cancelado";
  created_at: string;
  serviceName?: string; // Opcional - vem do JOIN
}

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAppointments = useCallback(async () => {
    console.log('🔄 Tentando carregar agendamentos...');
    console.log('📡 Supabase disponível:', !!supabase);
    
    if (!supabase) {
      console.warn('⚠️ Supabase não disponível');
      setError('Conexão offline');
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Usar JOIN correto com a tabela services
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          services (name)
        `)
        .order('appointment_date', { ascending: false })
        .order('appointment_time', { ascending: false });

      if (error) {
        console.error('❌ Erro ao carregar agendamentos:', error);
        setError('Erro ao carregar dados');
      } else {
        console.log('✅ Agendamentos carregados:', data?.length);
        
        // Formatar dados corretamente com serviceName do JOIN
        const formattedData = (data || []).map(a => ({
          ...a,
          serviceName: a.services?.name || 'Serviço não encontrado',
        }));
        
        setAppointments(formattedData as any);
      }
    } catch (error) {
      console.error('❌ Erro crítico:', error);
      setError('Erro de conexão');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const addAppointment = async (appointmentData: any) => {
    if (!supabase) {
      console.warn('⚠️ Supabase não disponível');
      return null;
    }
    
    try {
      const { data, error } = await supabase.from('appointments').insert([appointmentData]).select().single();
      if (error) {
        console.error('❌ Erro ao adicionar:', error);
        return null;
      }
      await loadAppointments();
      return data;
    } catch (error) {
      console.error('❌ Erro crítico:', error);
      return null;
    }
  };

  const updateAppointment = async (id: number, appointmentData: Partial<Appointment>) => {
    if (!supabase) {
      console.warn('⚠️ Supabase não disponível');
      return;
    }
    
    try {
      const { error } = await supabase.from('appointments').update(appointmentData).eq('id', id);
      if (error) {
        console.error('❌ Erro ao atualizar:', error);
        return;
      }
      await loadAppointments();
    } catch (error) {
      console.error('❌ Erro crítico:', error);
    }
  };

  const deleteAppointment = async (id: number) => {
    if (!supabase) {
      console.warn('⚠️ Supabase não disponível');
      return;
    }
    
    try {
      const { error } = await supabase.from('appointments').delete().eq('id', id);
      if (error) {
        console.error('❌ Erro ao excluir:', error);
        return;
      }
      await loadAppointments();
    } catch (error) {
      console.error('❌ Erro crítico:', error);
    }
  };

  return {
    appointments,
    isLoading,
    error,
    addAppointment,
    updateAppointment,
    deleteAppointment,
  };
}