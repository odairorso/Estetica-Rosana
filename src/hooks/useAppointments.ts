import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/lib/supabase';
import { SYSTEM_CONFIG } from '@/config/system';

export interface Appointment {
  id: number;
  client_id?: number;
  client_name: string;
  client_phone: string;
  service_id?: number;
  service_name?: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  notes: string;
  status: "agendado" | "confirmado" | "concluido" | "cancelado";
  created_at: string;
  package_id?: number;
  package_name?: string;
  appointment_date?: string;
  appointment_time?: string;
  type?: "individual" | "package_session";
  session_number?: number;
  total_sessions?: number;
  sale_date?: string;
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

export function useAppointments() {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar agendamentos do Supabase
  const loadAppointments = useCallback(async () => {
    console.log("📋 Carregando agendamentos do Supabase...");
    setIsLoading(true);
    setError(null);
    
    try {
      if (!supabase) {
        throw new Error('Supabase não está disponível');
      }
      
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('appointment_date', { ascending: true });
      
      if (error) throw error;
      
      console.log("✅ Agendamentos carregados do Supabase:", data?.length || 0);
      setAppointments(data || []);
    } catch (err) {
      console.error('❌ Erro ao carregar agendamentos:', err);
      setError('Erro ao carregar agendamentos do servidor');
      
      // Fallback para localStorage se houver erro
      const stored = localStorage.getItem(SYSTEM_CONFIG.STORAGE_KEYS.APPOINTMENTS);
      if (stored) {
        const data = JSON.parse(stored);
        setAppointments(data);
      }
    }
    
    setIsLoading(false);
  }, []);

  // Salvar no Supabase
  const saveToSupabase = async (appointmentData: any) => {
    if (!supabase) return null;
    
    const { data, error } = await supabase
      .from('appointments')
      .insert([appointmentData])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Erro ao salvar no Supabase:', error);
      throw error;
    }
    
    return data;
  };

  // Atualizar no Supabase
  const updateInSupabase = async (id: number, updates: Partial<Appointment>) => {
    if (!supabase) return null;
    
    const { data, error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Erro ao atualizar no Supabase:', error);
      throw error;
    }
    
    return data;
  };

  const createFromSale = async (saleData: any) => {
    console.log("🆕 Criando agendamento a partir de venda:", saleData);
    
    // Para pacotes, criar APENAS UMA sessão por vez
    if (saleData.type === 'package_session') {
      console.log(`📦 Criando sessão para pacote ${saleData.package_name}`);
      
      // Verificar quantas sessões já existem
      const existingSessions = appointments.filter(apt => 
        apt.client_name === saleData.client_name &&
        apt.package_name === saleData.package_name &&
        apt.package_id === saleData.package_id
      );
      
      const nextSessionNumber = existingSessions.length + 1;
      
      // Verificar se já existe sessão pendente
      const pendingSession = existingSessions.find(apt => 
        apt.status === 'agendado' && 
        (!apt.appointment_date || apt.appointment_date === '')
      );
      
      if (pendingSession) {
        console.log(`⚠️ Já existe sessão pendente:`, pendingSession.id);
        return pendingSession;
      }
      
      // Verificar se excederia o total
      if (nextSessionNumber > (saleData.total_sessions || 5)) {
        console.log(`❌ Não pode criar sessão ${nextSessionNumber}, total é ${saleData.total_sessions}`);
        return null;
      }
      
      const newAppointmentData = {
        client_id: saleData.client_id,
        client_name: saleData.client_name,
        client_phone: saleData.client_phone || '',
        package_id: saleData.package_id,
        package_name: saleData.package_name,
        total_sessions: saleData.total_sessions || 5,
        session_number: nextSessionNumber,
        type: 'package_session',
        price: 0,
        sale_date: saleData.sale_date,
        status: 'agendado',
        notes: `Sessão ${nextSessionNumber} de ${saleData.total_sessions || 5} - ${saleData.package_name}`,
        duration: 60,
        created_at: new Date().toISOString(),
        date: '',
        time: '',
        appointment_date: '',
        appointment_time: '',
      };
      
      try {
        const saved = await saveToSupabase(newAppointmentData);
        if (saved) {
          const updatedAppointments = [...appointments, saved];
          setAppointments(updatedAppointments);
          console.log(`✅ Sessão única criada: ${nextSessionNumber}/${saleData.total_sessions}`);
          return saved;
        }
      } catch (error) {
        console.error('❌ Erro ao salvar sessão no Supabase:', error);
      }
      
      return null;
    }
    
    // Para procedimentos individuais
    const existingAppointment = appointments.find(apt => {
      const sameClient = apt.client_name === saleData.client_name;
      const sameItem = (saleData.type === 'individual' && apt.service_name === saleData.service_name);
      return sameClient && sameItem;
    });
    
    if (existingAppointment) {
      console.log("⏭️ Agendamento já existe, pulando criação:", existingAppointment.id);
      return existingAppointment;
    }
    
    const newAppointmentData = {
      client_id: saleData.client_id,
      client_name: saleData.client_name,
      client_phone: saleData.client_phone || '',
      service_id: saleData.service_id,
      service_name: saleData.service_name,
      type: saleData.type,
      price: saleData.price,
      sale_date: saleData.sale_date,
      status: 'agendado',
      notes: `Aguardando agendamento - ${saleData.service_name}`,
      duration: 60,
      created_at: new Date().toISOString(),
      date: '',
      time: '',
      appointment_date: '',
      appointment_time: '',
    };
    
    try {
      const saved = await saveToSupabase(newAppointmentData);
      if (saved) {
        const updatedAppointments = [...appointments, saved];
        setAppointments(updatedAppointments);
        console.log("✅ Agendamento criado no Supabase:", saved);
        return saved;
      }
    } catch (error) {
      console.error('❌ Erro ao salvar agendamento no Supabase:', error);
    }
    
    return null;
  };

  const scheduleAppointment = async (id: number, date: string, time: string) => {
    console.log(`📅 Agendando procedimento ${id} para ${date} às ${time}`);
    
    try {
      const updated = await updateInSupabase(id, {
        appointment_date: date,
        appointment_time: time,
        date,
        time,
        status: 'agendado'
      });
      
      if (updated) {
        const updatedAppointments = appointments.map(apt => 
          apt.id === id ? updated : apt
        );
        setAppointments(updatedAppointments);
        console.log("✅ Agendamento atualizado no Supabase");
      }
    } catch (error) {
      console.error('❌ Erro ao agendar no Supabase:', error);
    }
  };

  const confirmAttendance = async (id: number) => {
    console.log(`✅ Confirmando presença do agendamento ${id}`);
    
    try {
      const updated = await updateInSupabase(id, {
        status: 'concluido',
        completed_at: new Date().toISOString()
      });
      
      if (updated) {
        const updatedAppointments = appointments.map(apt => 
          apt.id === id ? updated : apt
        );
        setAppointments(updatedAppointments);
        console.log("✅ Presença confirmada no Supabase");
      }
    } catch (error) {
      console.error('❌ Erro ao confirmar presença no Supabase:', error);
    }
  };

  const updateAppointment = async (id: number, updates: Partial<Appointment>) => {
    console.log(`🔄 Atualizando agendamento ${id}:`, updates);
    
    try {
      const updated = await updateInSupabase(id, updates);
      if (updated) {
        const updatedAppointments = appointments.map(apt => 
          apt.id === id ? updated : apt
        );
        setAppointments(updatedAppointments);
        console.log("✅ Agendamento atualizado no Supabase");
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar no Supabase:', error);
    }
  };

  const getActivePackages = () => {
    const active = appointments.filter(apt => 
      apt.type === 'package_session' && 
      apt.status !== 'concluido'
    );
    console.log("📦 Pacotes ativos encontrados:", active.length);
    return active;
  };

  const getPendingProcedures = () => {
    const pending = appointments.filter(apt => 
      apt.type === 'individual' && 
      apt.status === 'agendado' &&
      (!apt.appointment_date || apt.appointment_date === '')
    );
    console.log("📋 Procedimentos pendentes encontrados:", pending.length);
    return pending;
  };

  const getTodaysAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    const todays = appointments.filter(apt => 
      apt.appointment_date === today && 
      (apt.status === 'agendado' || apt.status === 'confirmado')
    );
    console.log("📅 Agendamentos de hoje encontrados:", todays.length);
    return todays;
  };

  const getPackageHistory = (packageId: number) => {
    const history = appointments
      .filter(apt => apt.package_id === packageId && apt.status === 'concluido')
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
