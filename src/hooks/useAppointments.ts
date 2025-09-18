import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";
import { usePackages } from './usePackages';
import { isValid, parseISO } from 'date-fns';

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
  package_id?: number; // ID do pacote relacionado
}

// Função segura para validar datas
const isValidDateString = (dateString: string | null | undefined): boolean => {
  if (!dateString) return false;
  try {
    const date = parseISO(dateString);
    return isValid(date);
  } catch {
    return false;
  }
};

// Função para garantir formato de data válido
const ensureValidDate = (dateString: string | null | undefined): string => {
  if (isValidDateString(dateString)) return dateString!;
  return new Date().toISOString().split('T')[0]; // Fallback para data atual
};

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
  const { toast } = useToast();
  const { useSession } = usePackages();

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

      // Filtrar e formatar dados para garantir datas válidas
      const formattedData = (data || [])
        .map(a => ({
          ...a,
          serviceName: a.services ? a.services.name : 'Serviço Removido',
          // Garantir que appointment_date seja válida
          appointment_date: ensureValidDate(a.appointment_date),
          // Garantir que appointment_time seja válida
          appointment_time: a.appointment_time || "09:00",
        }))
        .filter(a => a.appointment_date && a.appointment_time); // Remover agendamentos sem data/hora
      
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
      alert('Modo Offline: O agendamento não pode essere salvo.');
      return null;
    }
    
    try {
      const { package_id, serviceName, ...restOfData } = appointmentData;

      // Validar e formatar dados antes de enviar
      const validatedData = {
        ...restOfData,
        appointment_date: ensureValidDate(restOfData.appointment_date),
        appointment_time: restOfData.appointment_time || "09:00",
        price: restOfData.price || 0,
        duration: restOfData.duration || 60,
      };

      // Objeto limpo apenas com os campos que existem na tabela
      const appointmentToInsert = {
        client_id: validatedData.client_id,
        service_id: validatedData.service_id,
        date: validatedData.appointment_date, // Correção do nome da coluna
        time: validatedData.appointment_time, // Correção do nome da coluna
        duration: validatedData.duration,
        price: validatedData.price,
        notes: validatedData.notes,
        status: validatedData.status,
        client_name: validatedData.client_name,
        client_phone: validatedData.client_phone,
        service_name: serviceName, // Adicionado campo que faltava
      };

      const { data: appointment, error } = await supabase
        .from('appointments')
        .insert([appointmentToInsert])
        .select()
        .single();

      if (error) throw error;

      // Se for uma sessão de pacote, registra no histórico DO PACOTE
      if (package_id && appointment) {
        // Registrar uso da sessão do pacote
        await useSession(package_id, `Sessão do serviço: ${serviceName || 'não especificado'}`);
        
        // Registrar no histórico de sessões
        const { error: sessionError } = await supabase
          .from('session_history')
          .insert({
            package_id: package_id,
            session_date: appointment.appointment_date,
            notes: `Sessão referente ao agendamento do serviço: ${serviceName || 'não especificado'}. ${restOfData.notes || ''}`.trim()
          });
        
        if (sessionError) {
          console.error('❌ Erro ao registrar sessão do pacote:', sessionError);
          toast({
            title: "Atenção: Erro ao abater sessão",
            description: "O agendamento foi criado, mas não foi possível registrar o uso da sessão. Por favor, ajuste manualmente no pacote.",
            variant: "destructive",
            duration: 10000,
          });
        } else {
          toast({
            title: "Sessão registrada!",
            description: `Uma sessão foi abatida do pacote.`,
          });
        }
      }

      await loadAppointments(); // Recarrega a lista
      return { ...appointment, serviceName };
    } catch (err) {
      console.error('❌ Erro ao adicionar agendamento:', err);
      setError('Não foi possível salvar o agendamento.');
      return null;
    }
  };

  const updateAppointment = async (id: number, appointmentData: Partial<Appointment>) => {
    if (!supabase) {
      alert('Modo Offline: O agendamento não pode essere atualizado.');
      return;
    }
    
    try {
      // Validar dados antes de atualizar
      const validatedData = {
        ...appointmentData,
        appointment_date: appointmentData.appointment_date ? ensureValidDate(appointmentData.appointment_date) : undefined,
        appointment_time: appointmentData.appointment_time || "09:00",
      };

      const { error } = await supabase.from('appointments').update(validatedData).eq('id', id);
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