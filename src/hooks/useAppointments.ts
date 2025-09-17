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

// Dados mock para fallback quando Supabase falhar
const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 1,
    service_id: 1,
    client_id: 1,
    client_name: "Ana Silva",
    client_phone: "(11) 99999-9999",
    appointment_date: "2024-01-15",
    appointment_time: "14:00",
    duration: 60,
    price: 150,
    notes: "Cliente preferencial",
    status: "confirmado",
    created_at: "2024-01-10T10:00:00Z",
    serviceName: "Limpeza de Pele"
  },
  {
    id: 2,
    service_id: 2,
    client_id: 2,
    client_name: "Beatriz Costa",
    client_phone: "(11) 98888-8888",
    appointment_date: "2024-01-16",
    appointment_time: "15:30",
    duration: 90,
    price: 200,
    notes: "",
    status: "agendado",
    created_at: "2024-01-11T11:00:00Z",
    serviceName: "Drenagem Linfática"
  }
];

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAppointments = useCallback(async () => {
    console.log('🔄 Tentando carregar agendamentos...');
    console.log('📡 Supabase disponível:', !!supabase);
    
    if (!supabase) {
      console.warn('⚠️ Supabase não disponível, usando dados mock');
      setError('Conexão offline - usando dados locais');
      setAppointments(MOCK_APPOINTMENTS);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
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
        console.error('❌ Erro ao carregar agendamentos:', error);
        setError('Erro ao carregar dados do servidor');
        setAppointments(MOCK_APPOINTMENTS); // Fallback
      } else {
        console.log('✅ Agendamentos carregados com sucesso:', data?.length);
        const formattedData = (data || []).map(a => ({
          ...a,
          serviceName: a.services ? a.services.name : 'Serviço Removido',
        }));
        setAppointments(formattedData as any);
      }
    } catch (error) {
      console.error('❌ Erro crítico ao carregar agendamentos:', error);
      setError('Erro de conexão - usando dados locais');
      setAppointments(MOCK_APPOINTMENTS); // Fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const addAppointment = async (appointmentData: any) => {
    if (!supabase) {
      console.warn('⚠️ Supabase não disponível, adicionando localmente');
      const newAppointment = {
        ...appointmentData,
        id: Math.max(...appointments.map(a => a.id)) + 1,
        created_at: new Date().toISOString(),
        serviceName: 'Serviço Local'
      };
      setAppointments(prev => [newAppointment, ...prev]);
      return newAppointment;
    }
    
    try {
      const { data, error } = await supabase.from('appointments').insert([appointmentData]).select().single();
      if (error) {
        console.error('❌ Erro ao adicionar agendamento:', error);
        return null;
      }
      await loadAppointments();
      return data;
    } catch (error) {
      console.error('❌ Erro crítico ao adicionar agendamento:', error);
      return null;
    }
  };

  const updateAppointment = async (id: number, appointmentData: Partial<Appointment>) => {
    if (!supabase) {
      console.warn('⚠️ Supabase não disponível, atualizando localmente');
      setAppointments(prev => prev.map(apt => 
        apt.id === id ? { ...apt, ...appointmentData } : apt
      ));
      return;
    }
    
    try {
      const { error } = await supabase.from('appointments').update(appointmentData).eq('id', id);
      if (error) {
        console.error('❌ Erro ao atualizar agendamento:', error);
        return;
      }
      await loadAppointments();
    } catch (error) {
      console.error('❌ Erro crítico ao atualizar agendamento:', error);
    }
  };

  const deleteAppointment = async (id: number) => {
    if (!supabase) {
      console.warn('⚠️ Supabase não disponível, removendo localmente');
      setAppointments(prev => prev.filter(apt => apt.id !== id));
      return;
    }
    
    try {
      const { error } = await supabase.from('appointments').delete().eq('id', id);
      if (error) {
        console.error('❌ Erro ao excluir agendamento:', error);
        return;
      }
      await loadAppointments();
    } catch (error) {
      console.error('❌ Erro crítico ao excluir agendamento:', error);
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