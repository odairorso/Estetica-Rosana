import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
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
import { format, parseISO, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Appointments() {
  const { appointments, addAppointment, updateAppointment, isLoading } = useAppointments();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [testDropdownOpen, setTestDropdownOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { toast } = useToast();



  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openDropdown]);

  // Função segura para normalizar datas
  const normalizeDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'yyyy-MM-dd');
    } catch (error) {
      console.error('Erro ao normalizar data:', error);
      return '0000-00-00';
    }
  };

  // Filtrar agendamentos para a data selecionada
  const filteredAppointments = appointments.filter(apt => {
    try {
      const aptDate = normalizeDate(apt.appointment_date);
      const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
      return aptDate === selectedDateStr;
    } catch (error) {
      console.error('Erro ao filtrar agendamentos:', error);
      return false;
    }
  }).sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));

  const handleSaveAppointment = async (appointmentData: any) => {
    try {
      const dataToSave = {
        service_id: appointmentData.service_id,
        client_id: appointmentData.client_id,
        client_name: appointmentData.client_name,
        client_phone: appointmentData.client_phone,
        duration: appointmentData.duration,
        price: appointmentData.price,
        notes: appointmentData.notes || '',
        status: "agendado" as const,
        appointment_date: format(appointmentData.date, 'yyyy-MM-dd'),
        appointment_time: appointmentData.time,
      };

      const result = await addAppointment(dataToSave);
      
      if (result) {
        toast({
          title: "Agendamento confirmado!",
          description: `${appointmentData.serviceName} agendado para ${appointmentData.client_name}.`,
        });
        setModalOpen(false);
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível criar o agendamento.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao criar o agendamento.",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (appointment: Appointment, status: Appointment['status']) => {
    try {
      await updateAppointment(appointment.id, { status });
      toast({
        title: "Status atualizado!",
        description: `O agendamento de ${appointment.client_name} foi atualizado para "${getStatusText(status)}".`,
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status.",
        variant: "destructive",
      });
    }
  };

  const getStatusProps = (status: Appointment['status']) => {
    switch (status) {
      case "agendado":
        return { text: "Agendado", color: "bg-blue-500/20 text-blue-600 border-blue-500/30", icon: Hourglass };
      case "confirmado":
        return { text: "Confirmado", color: "bg-green-500/20 text-green-600 border-green-500/30", icon: CheckCircle };
      case "concluido":
        return { text: "Concluído", color: "bg-purple-500/20 text-purple-600 border-purple-500/30", icon: User };
      case "cancelado":
        return { text: "Cancelado", color: "bg-red-500/20 text-red-600 border-red-500/30", icon: XCircle };
      default:
        return { text: "Agendado", color: "bg-blue-500/20 text-blue-600 border-blue-500/30", icon: Hourglass };
    }
  };

  const getStatusText = (status: Appointment['status']) => {
    return getStatusProps(status).text;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gradient mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando agendamentos...</p>
        </div>
      </div>
    );
  }

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

        <div className="space-y-4">
          {filteredAppointments.map((apt) => {
            const statusProps = getStatusProps(apt.status);
            const StatusIcon = statusProps.icon;
            
            return (
              <GlassCard key={apt.id} className="hover-lift p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex items-center gap-2 min-w-[80px]">
                      <Clock className="h-5 w-5 text-brand-start" />
                      <span className="font-bold text-lg text-foreground">{apt.appointment_time}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-5 w-5 text-brand-end" />
                        <span className="font-semibold text-foreground truncate">{apt.client_name}</span>
                      </div>
                      <p className="text-muted-foreground text-sm truncate">{apt.serviceName}</p>
                      {apt.notes && (
                        <p className="text-muted-foreground text-xs mt-1 italic truncate">"{apt.notes}"</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge className={`${statusProps.color} font-semibold flex items-center gap-1`}>
                      <StatusIcon className="h-3 w-3" />
                      {statusProps.text}
                    </Badge>
                    <div className="relative">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => setOpenDropdown(openDropdown === apt.id ? null : apt.id)}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                      {openDropdown === apt.id && (
                        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[120px]">
                          <div className="py-1">
                            {apt.status !== 'confirmado' && (
                              <button 
                                className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                                onClick={() => {
                                  handleStatusChange(apt, 'confirmado');
                                  setOpenDropdown(null);
                                }}
                              >
                                Confirmar
                              </button>
                            )}
                            {apt.status !== 'concluido' && (
                              <button 
                                className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                                onClick={() => {
                                  handleStatusChange(apt, 'concluido');
                                  setOpenDropdown(null);
                                }}
                              >
                                Concluir
                              </button>
                            )}
                            {apt.status !== 'cancelado' && (
                              <button 
                                className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 text-red-600"
                                onClick={() => {
                                  handleStatusChange(apt, 'cancelado');
                                  setOpenDropdown(null);
                                }}
                              >
                                Cancelar
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </GlassCard>
            );
          })}
          
          {filteredAppointments.length === 0 && (
            <GlassCard className="text-center py-12">
              <CalendarIcon className="h-12 w-12 text-brand-start mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {isToday(selectedDate) ? 'Nenhum agendamento para hoje' : 'Nenhum agendamento para esta data'}
              </h3>
              <p className="text-muted-foreground mb-4">
                Selecione outra data ou crie um novo agendamento
              </p>
              <NeonButton icon={Plus} onClick={() => setModalOpen(true)}>
                Criar Novo Agendamento
              </NeonButton>
            </GlassCard>
          )}
        </div>
      </div>

      <AppointmentModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleSaveAppointment}
        service={null} // Corrigido: passe null como serviço quando não há serviço específico
      />
    </>
  );
}