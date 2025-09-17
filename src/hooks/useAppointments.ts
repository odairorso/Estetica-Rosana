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
  serviceName?: string; // Opcional
}

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAppointments = useCallback(async () => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          services (name)
        `)
        .order('appointment_date', { ascending: false })
        .order('appointment_time', { ascending: false });

      if (error) throw error;
      
      const formattedData = data.map(a => ({
        ...a,
        serviceName: a.services ? a.services.name : 'Serviço Removido',
      }));

      setAppointments(formattedData as any);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const addAppointment = async (appointmentData: any) => {
    if (!supabase) return null;
    const { serviceName, ...rest } = appointmentData;
    const { data, error } = await supabase.from('appointments').insert([rest]).select().single();
    if (error) {
      console.error('Erro ao adicionar agendamento:', error);
      return null;
    }
    await loadAppointments();
    return data;
  };

  const updateAppointment = async (id: number, appointmentData: Partial<Appointment>) => {
    if (!supabase) return;
    const { error } = await supabase.from('appointments').update(appointmentData).eq('id', id);
    if (error) console.error('Erro ao atualizar agendamento:', error);
    else await loadAppointments();
  };

  const deleteAppointment = async (id: number) => {
    if (!supabase) return;
    const { error } = await supabase.from('appointments').delete().eq('id', id);
    if (error) console.error('Erro ao excluir agendamento:', error);
    else await loadAppointments();
  };

  return {
    appointments,
    isLoading,
    addAppointment,
    updateAppointment,
    deleteAppointment,
  };
}