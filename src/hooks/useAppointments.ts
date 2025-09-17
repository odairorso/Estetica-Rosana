import { useState, useEffect } from "react";
import { format } from "date-fns";

export interface Appointment {
  id: number;
  serviceId: number;
  serviceName: string;
  clientName: string;
  clientPhone: string;
  date: Date;
  time: string;
  duration: number;
  price: number;
  notes: string;
  status: "agendado" | "confirmado" | "concluido" | "cancelado";
  createdAt: Date;
}

const STORAGE_KEY = "clinic-appointments";

const initialAppointments: Appointment[] = [
  {
    id: 1,
    serviceId: 1,
    serviceName: "Limpeza de Pele Profunda",
    clientName: "Ana Silva",
    clientPhone: "(11) 99999-9999",
    date: new Date(),
    time: "09:00",
    duration: 60,
    price: 120.00,
    notes: "Cliente com pele sensível.",
    status: "confirmado",
    createdAt: new Date()
  },
  {
    id: 2,
    serviceId: 2,
    serviceName: "Drenagem Linfática",
    clientName: "Beatriz Santos",
    clientPhone: "(11) 88888-8888",
    date: new Date(),
    time: "14:00",
    duration: 45,
    price: 80.00,
    notes: "",
    status: "agendado",
    createdAt: new Date()
  }
];

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      // Re-hydrate dates
      return JSON.parse(stored).map((a: any) => ({
        ...a,
        date: new Date(a.date),
        createdAt: new Date(a.createdAt)
      }));
    }
    return initialAppointments;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
  }, [appointments]);

  const addAppointment = (newAppointment: Omit<Appointment, 'id' | 'createdAt'>) => {
    const id = Date.now();
    const appointment: Appointment = {
      ...newAppointment,
      id,
      createdAt: new Date(),
    };
    
    setAppointments(prev => [...prev, appointment]);
    return appointment;
  };

  const updateAppointment = (updatedAppointment: Appointment) => {
    setAppointments(prev => prev.map(appointment => 
      appointment.id === updatedAppointment.id ? updatedAppointment : appointment
    ));
  };

  const deleteAppointment = (id: number) => {
    setAppointments(prev => prev.filter(appointment.id !== id));
  };

  const getAppointmentsByDate = (date: Date) => {
    const targetDate = format(date, "yyyy-MM-dd");
    return appointments.filter(appointment => 
      format(appointment.date, "yyyy-MM-dd") === targetDate
    );
  };

  const getUpcomingAppointments = (limit: number = 5) => {
    const now = new Date();
    return appointments
      .filter(appointment => {
        const appointmentDateTime = new Date(appointment.date);
        appointmentDateTime.setHours(
          parseInt(appointment.time.split(':')[0]),
          parseInt(appointment.time.split(':')[1])
        );
        return appointmentDateTime >= now && appointment.status !== "cancelado";
      })
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        dateA.setHours(parseInt(a.time.split(':')[0]), parseInt(a.time.split(':')[1]));
        dateB.setHours(parseInt(b.time.split(':')[0]), parseInt(b.time.split(':')[1]));
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, limit);
  };

  const getTodayAppointments = () => {
    return getAppointmentsByDate(new Date());
  };

  const getAppointmentStats = () => {
    const total = appointments.length;
    const confirmed = appointments.filter(a => a.status === "confirmado").length;
    const completed = appointments.filter(a => a.status === "concluido").length;
    const cancelled = appointments.filter(a => a.status === "cancelado").length;
    const totalRevenue = appointments
      .filter(a => a.status === "concluido")
      .reduce((sum, a) => sum + a.price, 0);

    return {
      total,
      confirmed,
      completed,
      cancelled,
      totalRevenue,
    };
  };

  return {
    appointments,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    getAppointmentsByDate,
    getUpcomingAppointments,
    getTodayAppointments,
    getAppointmentStats,
  };
}