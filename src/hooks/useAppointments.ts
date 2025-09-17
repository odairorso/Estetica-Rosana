import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Appointment {
  id: string;
  serviceId: string;
  serviceName: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  date: string; // YYYY-MM-DD
  time: string;
  duration: number;
  price: number;
  notes: string;
  status: "agendado" | "confirmado" | "concluido" | "cancelado";
  createdAt: string;
}

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load appointments from Supabase on mount
  useEffect(() => {
    const loadAppointments = async () => {
      if (!supabase) {
        console.warn('Supabase not available, using fallback data');
        // Fallback data if Supabase is not available
        const fallbackAppointments: Appointment[] = [
          {
            id: "1",
            serviceId: "1",
            serviceName: "Limpeza de Pele",
            clientId: "1",
            clientName: "Ana Silva",
            clientPhone: "(11) 98765-4321",
            date: "2023-06-10",
            time: "14:00",
            duration: 60,
            price: 120,
            notes: "Cliente com pele sensível",
            status: "confirmado",
            createdAt: "2023-06-01"
          },
          {
            id: "2",
            serviceId: "2",
            serviceName: "Drenagem Linfática",
            clientId: "2",
            clientName: "Carlos Oliveira",
            clientPhone: "(11) 99876-5432",
            date: "2023-06-12",
            time: "10:30",
            duration: 50,
            price: 80,
            notes: "",
            status: "agendado",
            createdAt: "2023-06-02"
          }
        ];
        setAppointments(fallbackAppointments);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .order('date', { ascending: true });

        if (error) {
          console.error('Error loading appointments:', error);
          return;
        }

        // Transform Supabase data to match our interface
        const transformedAppointments: Appointment[] = data.map(appointment => ({
          id: appointment.id,
          serviceId: appointment.service_id || '',
          serviceName: appointment.service_name || '',
          clientId: appointment.client_id || '',
          clientName: appointment.client_name || '',
          clientPhone: appointment.client_phone || '',
          date: appointment.date || '',
          time: appointment.time || '',
          duration: appointment.duration || 0,
          price: appointment.price || 0,
          notes: appointment.notes || '',
          status: appointment.status || 'agendado',
          createdAt: appointment.created_at?.split('T')[0] || ''
        }));

        setAppointments(transformedAppointments);
      } catch (error) {
        console.error('Error loading appointments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAppointments();
  }, []);

  const addAppointment = async (appointmentData: Omit<Appointment, 'id' | 'createdAt'>) => {
    if (!supabase) {
      console.warn('Supabase not available');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([{
          service_id: appointmentData.serviceId,
          service_name: appointmentData.serviceName,
          client_id: appointmentData.clientId,
          client_name: appointmentData.clientName,
          client_phone: appointmentData.clientPhone,
          date: appointmentData.date,
          time: appointmentData.time,
          duration: appointmentData.duration,
          price: appointmentData.price,
          notes: appointmentData.notes,
          status: appointmentData.status
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding appointment:', error);
        return null;
      }

      const newAppointment: Appointment = {
        id: data.id,
        serviceId: data.service_id || '',
        serviceName: data.service_name || '',
        clientId: data.client_id || '',
        clientName: data.client_name || '',
        clientPhone: data.client_phone || '',
        date: data.date || '',
        time: data.time || '',
        duration: data.duration || 0,
        price: data.price || 0,
        notes: data.notes || '',
        status: data.status || 'agendado',
        createdAt: data.created_at?.split('T')[0] || ''
      };

      setAppointments([...appointments, newAppointment]);
      return newAppointment;
    } catch (error) {
      console.error('Error adding appointment:', error);
      return null;
    }
  };

  const updateAppointment = async (id: string, appointmentData: Partial<Appointment>) => {
    if (!supabase) {
      console.warn('Supabase not available');
      return;
    }

    try {
      const updateData: any = {};
      if (appointmentData.serviceId !== undefined) updateData.service_id = appointmentData.serviceId;
      if (appointmentData.serviceName !== undefined) updateData.service_name = appointmentData.serviceName;
      if (appointmentData.clientId !== undefined) updateData.client_id = appointmentData.clientId;
      if (appointmentData.clientName !== undefined) updateData.client_name = appointmentData.clientName;
      if (appointmentData.clientPhone !== undefined) updateData.client_phone = appointmentData.clientPhone;
      if (appointmentData.date !== undefined) updateData.date = appointmentData.date;
      if (appointmentData.time !== undefined) updateData.time = appointmentData.time;
      if (appointmentData.duration !== undefined) updateData.duration = appointmentData.duration;
      if (appointmentData.price !== undefined) updateData.price = appointmentData.price;
      if (appointmentData.notes !== undefined) updateData.notes = appointmentData.notes;
      if (appointmentData.status !== undefined) updateData.status = appointmentData.status;

      const { error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating appointment:', error);
        return;
      }

      setAppointments(appointments.map(appointment => 
        appointment.id === id ? { ...appointment, ...appointmentData } : appointment
      ));
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const deleteAppointment = async (id: string) => {
    if (!supabase) {
      console.warn('Supabase not available');
      return;
    }

    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting appointment:', error);
        return;
      }

      setAppointments(appointments.filter(appointment => appointment.id !== id));
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  };

  const getAppointment = (id: string) => {
    return appointments.find(a => a.id === id);
  };

  const getAppointmentsByDate = (date: string) => {
    return appointments.filter(a => a.date === date);
  };

  const getAppointmentsByClient = (clientId: string) => {
    return appointments.filter(a => a.clientId === clientId);
  };

  return {
    appointments,
    isLoading,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    getAppointment,
    getAppointmentsByDate,
    getAppointmentsByClient,
  };
}