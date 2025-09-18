import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { Plus, Calendar as CalendarIcon, MoreVertical, Filter, Clock, User, Phone, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AppointmentModal } from '../components/services/AppointmentModal';
import { useAppointments, Appointment } from "@/hooks/useAppointments";
import { useToast } from "@/hooks/use-toast";
import { format, isToday, isTomorrow, isYesterday, parseISO, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function Appointments() {
  const { appointments, isLoading, error, updateAppointment, addAppointment } = useAppointments();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [clientSearch, setClientSearch] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  // Normalizar data para comparação
  const normalizeDate = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };

  // Filtrar agendamentos por data, status e cliente
  const filteredAppointments = appointments.filter((appointment) => {
    const appointmentDate = parseISO(appointment.appointment_date);
    const matchesDate = selectedDate ? 
      appointmentDate >= startOfDay(selectedDate) && appointmentDate <= endOfDay(selectedDate) : true;
    const matchesStatus = statusFilter === "all" || appointment.status === statusFilter;
    const matchesClient = clientSearch === "" || 
      appointment.client_name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      appointment.client_phone.includes(clientSearch);
    
    return matchesDate && matchesStatus && matchesClient;
  });

  // Obter propriedades do status
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "agendado":
        return "secondary" as const;
      case "confirmado":
        return "default" as const;
      case "concluido":
        return "success" as const;
      case "cancelado":
        return "destructive" as const;
      default:
        return "secondary" as const;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "agendado":
        return "Agendado";
      case "confirmado":
        return "Confirmado";
      case "concluido":
        return "Concluído";
      case "cancelado":
        return "Cancelado";
      default:
        return status;
    }
  };

  // Alterar status do agendamento
  const handleStatusChange = async (appointmentId: number, newStatus: string) => {
    try {
      await updateAppointment(appointmentId, newStatus);
      setOpenDropdown(null);
    } catch (error) {
      console.error("Erro ao alterar status:", error);
    }
  };

  // Salvar novo agendamento
  const handleSaveAppointment = async (appointmentData: any) => {
    try {
      await addAppointment(appointmentData);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Erro ao salvar agendamento:", error);
    }
  };

  const getRelativeDate = (date: Date) => {
    if (isToday(date)) return "Hoje";
    if (isTomorrow(date)) return "Amanhã";
    if (isYesterday(date)) return "Ontem";
    return format(date, "dd 'de' MMMM", { locale: ptBR });
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
        <meta name="description" content="Gerencie seus agendamentos de serviços e pacotes" />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Agendamentos</h1>
            <p className="text-gray-600 mt-1">Gerencie seus agendamentos de serviços e pacotes</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Novo Agendamento
          </Button>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Filtro por Data */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Data</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, "dd/MM/yyyy", { locale: ptBR })
                  ) : (
                    <span>Selecione uma data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Filtro por Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
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

          {/* Busca por Cliente */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Cliente</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome ou telefone..."
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Lista de Agendamentos */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-gray-500 mt-2">Carregando agendamentos...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {clientSearch ? "Nenhum agendamento encontrado" : "Nenhum agendamento para esta data"}
                </h3>
                <p className="text-gray-500 mb-4">
                  {clientSearch 
                    ? `Não encontramos agendamentos para "${clientSearch}"`
                    : "Que tal criar um novo agendamento?"
                  }
                </p>
                {!clientSearch && (
                  <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Agendamento
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredAppointments.map((appointment) => (
              <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium text-gray-900">{appointment.client_name}</span>
                        </div>
                        <Badge variant={getStatusVariant(appointment.status)}>
                          {getStatusLabel(appointment.status)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>{appointment.client_phone}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{appointment.appointment_time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>
                            {appointment.type === "service" 
                              ? `Serviço: ${appointment.service_name || "N/A"}`
                              : `Pacote: ${appointment.package_name || "N/A"}`
                            }
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">
                            {appointment.type === "service" 
                              ? `R$ ${appointment.price.toFixed(2).replace('.', ',')}`
                              : "Sessão do Pacote"
                            }
                          </span>
                        </div>
                      </div>
                      
                      {appointment.notes && (
                        <p className="text-sm text-gray-500 mt-2 italic">{appointment.notes}</p>
                      )}
                    </div>
                    
                    <DropdownMenu 
                      open={openDropdown === appointment.id.toString()} 
                      onOpenChange={(open) => setOpenDropdown(open ? appointment.id.toString() : null)}
                    >
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {appointment.status === "agendado" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(appointment.id, "confirmado")}>
                            Confirmar
                          </DropdownMenuItem>
                        )}
                        {(appointment.status === "agendado" || appointment.status === "confirmado") && (
                          <DropdownMenuItem onClick={() => handleStatusChange(appointment.id, "concluido")}>
                            Marcar como Concluído
                          </DropdownMenuItem>
                        )}
                        {appointment.status !== "cancelado" && appointment.status !== "concluido" && (
                          <DropdownMenuItem 
                            onClick={() => handleStatusChange(appointment.id, "cancelado")}
                            className="text-red-600"
                          >
                            Cancelar
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <AppointmentModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleSaveAppointment}
      />
    </>
  );
}