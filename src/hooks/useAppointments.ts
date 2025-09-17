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

// Dados mock para fallback quando Supabase falhar
const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 1,
    service_id: 1,
    client_id: 1,
    client_name: "Ana Silva (Exemplo)",
    client_phone: "(11) 99999-9999",
    appointment_date: new Date().toISOString().split('T')[0],
    appointment_time: "14:00",
    duration: 60,
    price: 150,
    notes: "Este é um agendamento de exemplo para modo offline.",
    status: "confirmado",
    created_at: "2024-01-10T10:00:00Z",
    serviceName: "Limpeza de Pele (Exemplo)"
  },
];

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAppointments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    if (!supabase) {
      console.warn('⚠️ Supabase não conectado. Usando dados de exemplo locais.');
      setAppointments(MOCK_APPOINTMENTS);
      setError('Você está em modo offline. Os dados não estão sendo salvos no servidor.');
      setIsLoading(false);
      return;
    }
    
    try {
      const { data, error: dbError } = await supabase
        .from('appointments')
        .select(`
          *,
          services (name)
        `)
        .order('appointment_date', { ascending: false })
        .order('appointment_time', { ascending: false });

      if (dbError) throw dbError;

      const formattedData = (data || []).map(a => ({
        ...a,
        serviceName: a.services ? a.services.name : 'Serviço Removido',
      }));
      
      setAppointments(formattedData as any);
    } catch (err: any) {
      console.error('❌ Erro crítico ao carregar agendamentos:', err);
      setError('Falha ao buscar dados do servidor. Verifique sua conexão.');
      setAppointments(MOCK_APPOINTMENTS); // Fallback para dados de exemplo em caso de erro
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const addAppointment = async (appointmentData: any) => {
    if (!supabase) {
      alert('Modo Offline: O agendamento não pode ser salvo.');
      return null;
    }
    
    try {
      const { data, error } = await supabase.from('appointments').insert([appointmentData]).select().single();
      if (error) throw error;
      await loadAppointments(); // Recarrega a lista
      return data;
    } catch (err) {
      console.error('❌ Erro ao adicionar agendamento:', err);
      setError('Não foi possível salvar o agendamento.');
      return null;
    }
  };

  const updateAppointment = async (id: number, appointmentData: Partial<Appointment>) => {
    if (!supabase) {
      alert('Modo Offline: O agendamento não pode ser atualizado.');
      return;
    }
    
    try {
      const { error } = await supabase.from('appointments').update(appointmentData).eq('id', id);
      if (error) throw error;
      await loadAppointments(); // Recarrega a lista
    } catch (err) {
      console.error('❌ Erro ao atualizar agendamento:', err);
      setError('Não foi possível atualizar o agendamento.');
    }
  };

  return {
    appointments,
    isLoading,
    error,
    addAppointment,
    updateAppointment,
    refreshAppointments: loadAppointments,
  };
}