import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { Plus, Calendar as CalendarIcon, Clock, User, CheckCircle, XCircle, MoreVertical, Hourglass } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppointmentModal } from "@/components/services/AppointmentModal";
import { useAppointments, Appointment } from "@/hooks/useAppointments";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Appointments() {
  const { appointments, addAppointment, updateAppointment } = useAppointments();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();

  const todayAppointments = appointments
    .filter(apt => format(new Date(apt.appointment_date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd'))
    .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));

  const handleSaveAppointment = (appointmentData: any) => {
    const dataToSave = {
      ...appointmentData,
      appointment_date: format(appointmentData.date, 'yyyy-MM-dd'),
      appointment_time: appointmentData.time,
    };
    delete dataToSave.date;
    delete dataToSave.time;

    addAppointment(dataToSave);
    toast({
      title: "Agendamento confirmado!",
      description: `${appointmentData.serviceName} agendado para ${appointmentData.clientName}.`,
    });
  };

  const handleStatusChange = (appointment: Appointment, status: Appointment['status']) => {
    updateAppointment(appointment.id, { status });
    toast({
      title: "Status atualizado!",
      description: `O agendamento de ${appointment.client_name} foi atualizado para "${status}".`,
    });
  };

  const getStatusProps = (status: Appointment['status']) => {
    switch (status) {
      case "agendado":
        return { text: "Agendado", color: "bg-blue-500/20 text-blue-600 border-blue-500/30", icon: Hourglass };
      case "confirmado":
        return { text: "Confirmado", color: "bg-green-500/20 text-green-600 border-green-500/30", icon: CheckCircle };
      case "concluido":
        return { text: "Concluído", color: "bg-gray-500/20 text-gray-600 border-gray-500/30", icon: User };
      case "cancelado":
        return { text: "Cancelado", color: "bg-red-500/20 text-red-600 border-red-500/30", icon: XCircle };
      default:
        return { text: "Agendado", color: "bg-blue-500/20 text-blue-600 border-blue-500/30", icon: Hourglass };
    }
  };

  return (
    <>
      <Helmet>
        <title>Agendamentos | Gestão de Clínica Estética</title>
        <meta name="description" content="Calendário e controle de agendamentos." />
        <link rel="canonical" href="/agendamentos" />
      </Helmet>

      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gradient-brand">Agendamentos</h1>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="mt-2 text-lg p-6">
                  <CalendarIcon className="mr-3 h-5 w-5" />
                  {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <NeonButton icon={Plus} variant="primary" onClick={() => setModalOpen(true)}>
            Novo Agendamento
          </NeonButton>
        </div>

        <div className="grid gap-4">
          {todayAppointments.map((apt) => {
            const statusProps = getStatusProps(apt.status);
            return (
              <GlassCard key={apt.id} className="hover-lift p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-brand-start icon-glow" />
                      <span className="font-bold text-lg text-white">{apt.appointment_time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-brand-end" />
                      <span className="font-semibold text-white">{apt.client_name}</span>
                    </div>
                    <span className="text-gray-200 font-medium">{apt.serviceName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={`${statusProps.color} font-semibold`}>
                      {statusProps.text}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleStatusChange(apt, 'confirmado')}>Confirmar</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(apt, 'concluido')}>Marcar como Concluído</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(apt, 'cancelado')} className="text-destructive">Cancelar</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </GlassCard>
            );
          })}
          
          {todayAppointments.length === 0 && (
            <GlassCard className="text-center py-12">
              <CalendarIcon className="h-12 w-12 text-brand-start mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Nenhum agendamento para esta data</h3>
              <p className="text-foreground/70">Selecione outra data ou crie um novo agendamento</p>
            </GlassCard>
          )}
        </div>
      </div>

      <AppointmentModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleSaveAppointment}
      />
    </>
  );
}