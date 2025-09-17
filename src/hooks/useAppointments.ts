import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

export interface Appointment {
  id: string;
  service_id: string;
  service_name: string;
  client_id: string;
  client_name: string;
  client_phone: string;
  date: string; // YYYY-MM-DD
  time: string;
  duration: number;
  price: number;
  notes: string;
  status: "agendado" | "confirmado" | "concluido" | "cancelado";
  created_at: string;
}

const fetchAppointments = async () => {
  const { data, error } = await supabase.from('appointments').select('*').order('date').order('time');
  if (error) throw new Error(error.message);
  return data;
};

const addAppointment = async (appointmentData: Omit<Appointment, 'id' | 'created_at'>) => {
  const { data, error } = await supabase.from('appointments').insert([appointmentData]).select();
  if (error) throw new Error(error.message);
  return data[0];
};

const updateAppointment = async (appointmentData: Partial<Appointment> & { id: string }) => {
  const { id, ...updateData } = appointmentData;
  const { data, error } = await supabase.from('appointments').update(updateData).eq('id', id).select();
  if (error) throw new Error(error.message);
  return data[0];
};

const deleteAppointment = async (id: string) => {
  const { error } = await supabase.from('appointments').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

export function useAppointments() {
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading } = useQuery<Appointment[]>({
    queryKey: ['appointments'],
    queryFn: fetchAppointments,
  });

  const addMutation = useMutation({
    mutationFn: addAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  const getAppointmentsByDate = (date: Date) => {
    const targetDate = format(date, "yyyy-MM-dd");
    return appointments.filter(appointment => appointment.date === targetDate);
  };

  return {
    appointments,
    isLoading,
    addAppointment: addMutation.mutate,
    updateAppointment: updateMutation.mutate,
    deleteAppointment: deleteMutation.mutate,
    getAppointmentsByDate,
  };
}