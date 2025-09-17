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
}

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 1,
    serviceId: 1,
    serviceName: "Limpeza de Pele",
    clientId: 1,
    clientName: "Ana Silva",
    clientPhone: "(11) 99999-9999",
    date: "2023-06-15",
    time: "14:00",
    duration: 60,
    price: 120.00,
    notes: "Cliente com pele sensível",
    status: "confirmado"
  },
  {
    id: 2,
    serviceId: 3,
    serviceName: "Drenagem Linfática",
    clientId: 2,
    clientName: "Carlos Oliveira",
    clientPhone: "(11) 88888-8888",
    date: "2023-06-15",
    time: "15:30",
    duration: 60,
    price: 180.00,
    notes: "",
    status: "agendado"
  },
  {
    id: 3,
    serviceId: 4,
    serviceName: "Aplicação de Botox",
    clientId: 1,
    clientName: "Ana Silva",
    clientPhone: "(11) 99999-9999",
    date: "2023-06-20",
    time: "10:00",
    duration: 30,
    price: 800.00,
    notes: "Retorno para reforço",
    status: "agendado"
  }
];

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const storedAppointments = localStorage.getItem('appointments');
      if (storedAppointments) {
        setAppointments(JSON.parse(storedAppointments));
      } else {
        setAppointments(MOCK_APPOINTMENTS);
        localStorage.setItem('appointments', JSON.stringify(MOCK_APPOINTMENTS));
      }
      setIsLoading(false);
    }, 500);
  }, []);

  const addAppointment = (appointmentData: Omit<Appointment, 'id'>) => {
    const newAppointment = {
      ...appointmentData,
      id: Date.now()
    };
    const updatedAppointments = [...appointments, newAppointment];
    setAppointments(updatedAppointments);
    localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
    return newAppointment;
  };

  const updateAppointment = (appointmentData: Appointment) => {
    const updatedAppointments = appointments.map(appointment => 
      appointment.id === appointmentData.id ? appointmentData : appointment
    );
    setAppointments(updatedAppointments);
    localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
    return appointmentData;
  };

  const deleteAppointment = (id: number) => {
    const updatedAppointments = appointments.filter(appointment => appointment.id !== id);
    setAppointments(updatedAppointments);
    localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
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
    getAppointmentsByDate
  };
}