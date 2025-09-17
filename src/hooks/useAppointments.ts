import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface Appointment {
  id: number;
  service_id: number;
  client_id: number;
  client_name: string;
  client_phone: string;
  appointment_date: string;
  appointment_time: string;
  duration: number;
  price: number;
  notes: string;
  status: "agendado" | "confirmado" | "concluido" | "cancelado";
  created_at: string;
  serviceName?: string;
}

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAppointments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*, services(name)')
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });

      if (error) throw error;
      
      // Use 'any' to avoid TS errors from Supabase type inference
      const formattedData = (data as any[]).map(apt => ({
        ...apt,
        appointment_time: apt.appointment_time.substring(0, 5),
        serviceName: apt.services?.name ?? 'Serviço não encontrado'
      }));

      setAppointments(formattedData);
    } catch (err: any) {
      console.error("Erro ao carregar agendamentos:", err);
      setError("Falha ao buscar dados. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const addAppointment = async (appointmentData: Omit<Appointment, 'id' | 'created_at' | 'serviceName'>) => {
    try {
      const { data, error } = await supabase.from('appointments').insert([appointmentData] as any).select();
      if (error) throw error;
      await loadAppointments();
      return data;
    } catch (err: any) {
      console.error("Erro ao adicionar agendamento:", err);
      return null;
    }
  };

  const updateAppointment = async (id: number, appointmentData: Partial<Omit<Appointment, 'serviceName'>>) => {
    try {
      const { error } = await supabase.from('appointments').update(appointmentData as any).eq('id', id);
      if (error) throw error;
      await loadAppointments();
    } catch (err: any) {
      console.error("Erro ao atualizar agendamento:", err);
    }
  };

  return { appointments, isLoading, error, addAppointment, updateAppointment };
}
