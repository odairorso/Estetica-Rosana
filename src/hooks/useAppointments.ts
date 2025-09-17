import { useState, useEffect } from 'react';

export interface Appointment {
  id: number;
  serviceId: number;
  serviceName: string;
  clientId: number;
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

const APPOINTMENTS_STORAGE_KEY = 'clinic-appointments';

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load appointments from localStorage on mount
  useEffect(() => {
    const loadAppointments = () => {
      try {
        const stored = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
        if (stored) {
          setAppointments(JSON.parse(stored));
        } else {
          // Initialize with sample data if empty
          const sampleAppointments: Appointment[] = [
            {
              id: 1,
              serviceId: 1,
              serviceName: "Limpeza de Pele",
              clientId: 1,
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
              id: 2,
              serviceId: 2,
              serviceName: "Drenagem Linfática",
              clientId: 2,
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
          setAppointments(sampleAppointments);
          localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(sampleAppointments));
        }
      } catch (error) {
        console.error('Error loading appointments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAppointments();
  }, []);

  // Save appointments to localStorage whenever they change
  useEffect(() => {
    if (appointments.length > 0) {
      localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(appointments));
    }
  }, [appointments]);

  const addAppointment = (appointmentData: Omit<Appointment, 'id' | 'createdAt'>) => {
    const newAppointment: Appointment = {
      ...appointmentData,
      id: Math.max(0, ...appointments.map(a => a.id)) + 1,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setAppointments([...appointments, newAppointment]);
    return newAppointment;
  };

  const updateAppointment = (appointmentData: Appointment) => {
    setAppointments(appointments.map(appointment => 
      appointment.id === appointmentData.id ? appointmentData : appointment
    ));
  };

  const deleteAppointment = (id: number) => {
    setAppointments(appointments.filter(appointment => appointment.id !== id));
  };

  const getAppointmentsByDate = (date: Date) => {
    const targetDate = date.toISOString().split('T')[0];
    return appointments.filter(appointment => appointment.date === targetDate);
  };

  return {
    appointments,
    isLoading,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    getAppointmentsByDate,
  };
}