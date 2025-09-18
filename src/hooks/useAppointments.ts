import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, isValid, isToday, isPast } from 'date-fns';

export interface Appointment {
  id: number;
  client_id: number;
  client_name: string;
  client_phone: string;
  service_id?: number;
  service_name?: string;
  package_id?: number;
  package_name?: string;
  appointment_date?: string; // Pode ser null para procedimentos pendentes
  appointment_time?: string;
  duration: number;
  price: number;
  notes: string;
  status: "pending_scheduling" | "scheduled" | "confirmed" | "completed" | "cancelled";
  type: "individual" | "package_session";
  session_number?: number; // Para pacotes (1, 2, 3...)
  total_sessions?: number; // Total do pacote
  created_at: string;
  sale_date: string;
  completed_at?: string;
}

export interface PackageSession extends Appointment {
  total_sessions: number;
  used_sessions: number;
  remaining_sessions: number;
  session_history: {
    id: number;
    date: string;
    time: string;
    status: 'completed' | 'scheduled';
    notes?: string;
  }[];
}

const APPOINTMENTS_STORAGE_KEY = 'clinic-appointments-v2';

export function useAppointments() {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para carregar agendamentos do Supabase ou localStorage
  const loadAppointments = useCallback(async () => {
    console.log("🔄 Carregando agendamentos...");
    setIsLoading(true);
    setError(null);
    
    if (!supabase) {
      // Modo offline - carrega do localStorage
      console.log("⚠️ Supabase não disponível, carregando do localStorage");
      const stored = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        console.log("📋 Agendamentos carregados do localStorage:", data.length);
        setAppointments(data);
      } else {
        console.log("📋 Nenhum agendamento no localStorage");
      }
      setIsLoading(false);
      return;
    }
    
    try {
      const { data, error: dbError } = await supabase
        .from('appointments')
        .select('*')
        .order('created_at', { ascending: false });

      if (dbError) throw dbError;
      
      console.log("📋 Agendamentos carregados do Supabase:", data?.length || 0);
      
      const formattedData = (data || []).map(apt => ({
        ...apt,
        // Garantir que datas sejam válidas
        appointment_date: apt.appointment_date || undefined,
        appointment_time: apt.appointment_time || undefined,
      }));
      
      setAppointments(formattedData as any);
      
      // Salvar cópia local para modo offline
      localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(formattedData));
    } catch (err: any) {
      console.error('❌ Erro ao carregar agendamentos:', err);
      setError('Erro ao conectar com o servidor');
      
      // Fallback para dados locais
      const stored = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        console.log("📋 Agendamentos carregados do localStorage (fallback):", data.length);
        setAppointments(data);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Criar agendamento a partir de venda do caixa
  const createFromSale = async (saleData: {
    client_id: number;
    client_name: string;
    client_phone: string;
    service_id?: number;
    service_name?: string;
    package_id?: number;
    package_name?: string;
    total_sessions?: number;
    price: number;
    sale_date: string;
    type: 'individual' | 'package_session';
  }) => {
    console.log("🆕 Criando agendamento a partir de venda:", saleData);
    
    if (!supabase) {
      // Modo offline
      console.log("⚠️ Modo offline - criando agendamento local");
      const newAppointment: Appointment = {
        id: Math.max(0, ...appointments.map(a => a.id)) + 1,
        ...saleData,
        status: saleData.type === 'individual' ? 'pending_scheduling' : 'scheduled',
        notes: '',
        duration: 60, // Padrão
        created_at: new Date().toISOString(),
        appointment_date: saleData.type === 'individual' ? undefined : saleData.sale_date,
        appointment_time: saleData.type === 'individual' ? undefined : '09:00',
      };
      
      const updatedAppointments = [...appointments, newAppointment];
      setAppointments(updatedAppointments);
      localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(updatedAppointments));
      console.log("✅ Agendamento criado offline:", newAppointment);
      return newAppointment;
    }
    
    try {
      console.log("🔄 Criando agendamento no Supabase...");
      // Montar payload apenas com campos definidos
      const payload: any = {
        client_id: saleData.client_id,
        client_name: saleData.client_name,
        client_phone: saleData.client_phone,
        price: saleData.price,
        status: saleData.type === 'individual' ? 'pending_scheduling' : 'scheduled',
        type: saleData.type,
        notes: '',
        duration: 60,
        sale_date: saleData.sale_date,
      };

      if (saleData.service_id) {
        payload.service_id = saleData.service_id;
        payload.service_name = saleData.service_name || null;
      }
      if (saleData.package_id) {
        payload.package_id = saleData.package_id;
        payload.package_name = saleData.package_name || null;
        payload.total_sessions = saleData.total_sessions;
        payload.session_number = saleData.type === 'package_session' ? 1 : null;
        // Para pacotes, já definimos a data da primeira sessão
        payload.appointment_date = saleData.sale_date;
        payload.appointment_time = '09:00';
      }

      const { data, error } = await supabase
        .from('appointments')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao criar agendamento (Supabase):', error);
        throw error;
      }
      
      console.log("✅ Agendamento criado no Supabase:", data);
      await loadAppointments(); // Recarrega lista
      return data;
    } catch (err) {
      console.error('❌ Erro crítico ao criar agendamento:', err);
      return null;
    }
  };

  // Agendar procedimento pendente
  const scheduleAppointment = async (id: number, date: string, time: string) => {
    console.log(`📅 Agendando procedimento ${id} para ${date} às ${time}`);
    
    if (!supabase) {
      setAppointments(prev => prev.map(apt => 
        apt.id === id 
          ? { ...apt, appointment_date: date, appointment_time: time, status: 'scheduled' }
          : apt
      ));
      return;
    }
    
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ 
          appointment_date: date, 
          appointment_time: time, 
          status: 'scheduled' 
        })
        .eq('id', id);
      
      if (error) throw error;
      await loadAppointments();
      console.log("✅ Agendamento atualizado com sucesso");
    } catch (err) {
      console.error('❌ Erro ao agendar:', err);
    }
  };

  // Confirmar presença e completar
  const confirmAttendance = async (id: number) => {
    console.log(`✅ Confirmando presença do agendamento ${id}`);
    
    if (!supabase) {
      setAppointments(prev => prev.map(apt => 
        apt.id === id 
          ? { ...apt, status: 'completed', completed_at: new Date().toISOString() }
          : apt
      ));
      return;
    }
    
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
      await loadAppointments();
      console.log("✅ Presença confirmada com sucesso");
    } catch (err) {
      console.error('❌ Erro ao confirmar presença:', err);
    }
  };

  // Atualizar status
  const updateAppointment = async (id: number, updates: Partial<Appointment>) => {
    console.log(`🔄 Atualizando agendamento ${id}:`, updates);
    
    if (!supabase) {
      setAppointments(prev => prev.map(apt => 
        apt.id === id ? { ...apt, ...updates } : apt
      ));
      return;
    }
    
    try {
      const { error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      await loadAppointments();
      console.log("✅ Agendamento atualizado com sucesso");
    } catch (err) {
      console.error('❌ Erro ao atualizar:', err);
    }
  };

  // Agrupar pacotes por cliente
  const getActivePackages = () => {
    const active = appointments.filter(apt => 
      apt.type === 'package_session' && 
      apt.status !== 'completed' &&
      (apt.remaining_sessions || 0) > 0
    );
    console.log("📦 Pacotes ativos encontrados:", active.length);
    return active;
  };

  // Pegar procedimentos pendentes
  const getPendingProcedures = () => {
    const pending = appointments.filter(apt => 
      apt.type === 'individual' && 
      apt.status === 'pending_scheduling'
    );
    console.log("📋 Procedimentos pendentes encontrados:", pending.length);
    return pending;
  };

  // Pegar agendamentos de hoje
  const getTodaysAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    const todays = appointments.filter(apt => 
      apt.appointment_date === today && 
      apt.status === 'scheduled'
    );
    console.log("📅 Agendamentos de hoje encontrados:", todays.length);
    return todays;
  };

  // Pegar histórico de sessões de um pacote
  const getPackageHistory = (packageId: number) => {
    const history = appointments
      .filter(apt => apt.package_id === packageId && apt.status === 'completed')
      .sort((a, b) => (a.completed_at || '').localeCompare(b.completed_at || ''));
    console.log(`📜 Histórico do pacote ${packageId}:`, history.length, "sessões");
    return history;
  };

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  return {
    appointments,
    isLoading,
    error,
    createFromSale,
    scheduleAppointment,
    confirmAttendance,
    updateAppointment,
    getActivePackages,
    getPendingProcedures,
    getTodaysAppointments,
    getPackageHistory,
    refreshAppointments: loadAppointments,
  };
}