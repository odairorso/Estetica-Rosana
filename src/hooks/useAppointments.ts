import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const addAppointment = (newAppointment: Omit<Appointment, 'id' | 'createdAt'>) => {
    const id = Math.max(...appointments.map(a => a.id), 0) + 1;
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
    setAppointments(prev => prev.filter(appointment => appointment.id !== id));
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