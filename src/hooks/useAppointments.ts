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
      console.warn("Cliente Supabase não disponível. Carregando dados locais.");
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

      if (error) {
        console.error('Erro ao carregar agendamentos:', error);
        // Se houver erro, tentar carregar sem o join
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('appointments')
          .select('*')
          .order('appointment_date', { ascending: false })
          .order('appointment_time', { ascending: false });

        if (fallbackError) throw fallbackError;
        
        const formattedData = (fallbackData || []).map(a => ({
          ...a,
          serviceName: 'Serviço',
        }));
        
        setAppointments(formattedData as any);
      } else {
        const formattedData = (data || []).map(a => ({
          ...a,
          serviceName: a.services ? a.services.name : 'Serviço Removido',
        }));
        
        setAppointments(formattedData as any);
      }
    } catch (error) {
      console.error('Erro crítico ao carregar agendamentos:', error);
      // Em caso de erro total, usar dados locais de exemplo
      const mockAppointments: Appointment[] = [
        {
          id: 1,
          service_id: 1,
          client_id: 1,
          client_name: "Maria Silva",
          client_phone: "(11) 99999-9999",
          appointment_date: "2024-01-15",
          appointment_time: "14:00",
          duration: 60,
          price: 150,
          notes: "Cliente preferencial",
          status: "confirmado",
          created_at: "2024-01-10T10:00:00Z",
          serviceName: "Limpeza de Pele"
        }
      ];
      setAppointments(mockAppointments);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const addAppointment = async (appointmentData: any) => {
    if (!supabase) {
      console.error("Cliente Supabase não disponível. Não é possível adicionar agendamento.");
      return null;
    }
    
    try {
      const { data, error } = await supabase.from('appointments').insert([appointmentData]).select().single();
      if (error) {
        console.error('Erro ao adicionar agendamento:', error);
        return null;
      }
      await loadAppointments();
      return data;
    } catch (error) {
      console.error('Erro crítico ao adicionar agendamento:', error);
      return null;
    }
  };

  const updateAppointment = async (id: number, appointmentData: Partial<Appointment>) => {
    if (!supabase) {
      console.error("Cliente Supabase não disponível. Não é possível atualizar agendamento.");
      return;
    }
    
    try {
      const { error } = await supabase.from('appointments').update(appointmentData).eq('id', id);
      if (error) {
        console.error('Erro ao atualizar agendamento:', error);
        return;
      }
      await loadAppointments();
    } catch (error) {
      console.error('Erro crítico ao atualizar agendamento:', error);
    }
  };

  const deleteAppointment = async (id: number) => {
    if (!supabase) {
      console.error("Cliente Supabase não disponível. Não é possível excluir agendamento.");
      return;
    }
    
    try {
      const { error } = await supabase.from('appointments').delete().eq('id', id);
      if (error) {
        console.error('Erro ao excluir agendamento:', error);
        return;
      }
      await loadAppointments();
    } catch (error) {
      console.error('Erro crítico ao excluir agendamento:', error);
    }
  };

  return {
    appointments,
    isLoading,
    addAppointment,
    updateAppointment,
    deleteAppointment,
  };
}