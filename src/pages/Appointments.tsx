import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { Plus, Calendar as CalendarIcon, MoreVertical, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppointmentModal } from '../components/services/AppointmentModal';
import { useAppointments, Appointment } from "@/hooks/useAppointments";
import { useToast } from "@/hooks/use-toast";
import { format, isToday, isTomorrow, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Appointments() {
  const { appointments, isLoading, error, updateAppointment } = useAppointments();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openDropdown]);

  // Função para normalizar datas
  const normalizeDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return format(date, 'yyyy-MM-dd');
  };

  // Filtrar agendamentos por data e status
  const filteredAppointments = appointments.filter(apt => {
    const aptDate = normalizeDate(apt.appointment_date);
    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
    
    const dateMatch = aptDate === selectedDateStr;
    const statusMatch = statusFilter === "all" || apt.status === statusFilter;
    
    return dateMatch && statusMatch;
  });

  // Função para obter propriedades do status
  const getStatusProps = (status: string) => {
    switch (status) {
      case 'agendado':
        return { variant: 'secondary' as const, text: 'Agendado' };
      case 'confirmado':
        return { variant: 'default' as const, text: 'Confirmado' };
      case 'concluido':
        return { variant: 'success' as const, text: 'Concluído' };
      case 'cancelado':
        return { variant: 'destructive' as const, text: 'Cancelado' };
      default:
        return { variant: 'secondary' as const, text: 'Agendado' };
    }
  };

  // Função para alterar status do agendamento
  const handleStatusChange = async (appointment: Appointment, newStatus: string) => {
    try {
      await updateAppointment(appointment.id, { status: newStatus as any });
      toast({
        title: "Status atualizado",
        description: `Agendamento ${newStatus} com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do agendamento.",
        variant: "destructive",
      });
    }
  };

  // Função para formatar data relativa
  const getRelativeDate = (date: Date) => {
    if (isToday(date)) return "Hoje";
    if (isTomorrow(date)) return "Amanhã";
    if (isYesterday(date)) return "Ontem";
    return format(date, "dd 'de' MMMM", { locale: ptBR });
  };

  const handleSaveAppointment = () => {
    setModalOpen(false);
    toast({
      title: "Agendamento criado",
      description: "Novo agendamento foi criado com sucesso.",
    });
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-2">Erro ao carregar agendamentos</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Agendamentos - Estética Rosana</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Agendamentos</h1>
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Agendamento
          </Button>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Seletor de Data */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {getRelativeDate(selectedDate)}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                locale={ptBR}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* Filtro de Status */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="agendado">Agendado</SelectItem>
              <SelectItem value="confirmado">Confirmado</SelectItem>
              <SelectItem value="concluido">Concluído</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lista de Agendamentos */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Carregando agendamentos...</p>
              </div>
            </div>
          ) : filteredAppointments.length > 0 ? (
            filteredAppointments.map((apt) => {
              const statusProps = getStatusProps(apt.status);
              
              return (
                <div key={apt.id} className="p-4 border rounded-lg bg-card">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{apt.client_name}</h3>
                        <Badge variant={statusProps.variant}>
                          {statusProps.text}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p><strong>Serviço:</strong> {apt.serviceName}</p>
                        <p><strong>Horário:</strong> {apt.appointment_time}</p>
                        <p><strong>Telefone:</strong> {apt.client_phone}</p>
                        {apt.notes && <p><strong>Observações:</strong> {apt.notes}</p>}
                      </div>
                    </div>
                    
                    {/* Dropdown de Ações */}
                    <div className="relative">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdown(openDropdown === apt.id.toString() ? null : apt.id.toString());
                        }}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                      {openDropdown === apt.id.toString() && (
                        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[120px]">
                          <div className="py-1">
                            {apt.status !== 'confirmado' && (
                              <button 
                                className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                                onClick={(e) => {
                                  e.stopPropagation();
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
                                onClick={(e) => {
                                  e.stopPropagation();
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
                                onClick={(e) => {
                                  e.stopPropagation();
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
              );
            })
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Nenhum agendamento encontrado para {getRelativeDate(selectedDate)}
                {statusFilter !== "all" && ` com status "${statusFilter}"`}.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Novo Agendamento */}
      <AppointmentModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleSaveAppointment}
        service={null}
      />
    </>
  );
}