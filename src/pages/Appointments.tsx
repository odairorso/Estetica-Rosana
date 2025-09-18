import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import {
  Plus,
  Calendar as CalendarIcon, // Alias para evitar conflito
  Clock,
  User,
  Package,
  CheckCircle,
  XCircle,
  History,
  Phone,
  DollarSign,
  CalendarDays,
  TrendingUp,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppointments, Appointment } from "@/hooks/useAppointments";
import { useSales } from "@/hooks/useSales";
import { useServices } from "@/hooks/useServices";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, isValid, isToday, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter, // Adicionando DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Appointments() {
  const { toast } = useToast();
  const { appointments, createFromSale, scheduleAppointment, confirmAttendance, getActivePackages, getPendingProcedures, getTodaysAppointments, isLoading, error } = useAppointments();
  const { sales } = useSales();
  const { services } = useServices();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedTime, setSelectedTime] = useState("09:00");

  // Processar vendas do caixa que ainda não viraram agendamentos
  useEffect(() => {
    sales.forEach(sale => {
      sale.items.forEach(item => {
        // Verifica se já existe agendamento para esta venda
        const existingAppointment = appointments.find(apt => 
          apt.client_id === sale.client_id && 
          apt.service_id === item.item_id &&
          apt.type === (item.type === 'service' ? 'individual' : 'package_session')
        );

        if (!existingAppointment) {
          // Cria agendamento automaticamente
          createFromSale({
            client_id: sale.client_id,
            client_name: sale.clientName,
            client_phone: '', // Pode ser buscado do cliente
            service_id: item.type === 'service' ? item.item_id : undefined,
            service_name: item.itemName,
            package_id: item.type === 'package' ? item.item_id : undefined,
            package_name: item.itemName,
            total_sessions: item.type === 'package' ? item.quantity : undefined,
            price: item.price * item.quantity,
            sale_date: sale.sale_date,
            type: item.type === 'service' ? 'individual' : 'package_session',
          });
        }
      });
    });
  }, [sales, appointments]);

  const pendingProcedures = getPendingProcedures();
  const activePackages = getActivePackages();
  const todaysAppointments = getTodaysAppointments();

  const handleSchedule = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setScheduleModalOpen(true);
  };

  const handleConfirmSchedule = async () => {
    if (!selectedAppointment || !selectedAppointment.appointment_date) return;
    
    await scheduleAppointment(
      selectedAppointment.id,
      selectedAppointment.appointment_date,
      selectedTime
    );
    
    toast({
      title: "✅ Agendamento confirmado!",
      description: `${selectedAppointment.client_name} agendado(a) para ${format(parseISO(selectedAppointment.appointment_date!), "dd/MM/yyyy")} às ${selectedTime}`,
    });
    
    setScheduleModalOpen(false);
    setSelectedAppointment(null);
  };

  const handleConfirmAttendance = async (appointment: Appointment) => {
    await confirmAttendance(appointment.id);
    
    toast({
      title: "✅ Presença confirmada!",
      description: `Atendimento de ${appointment.client_name} registrado com sucesso.`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_scheduling': return 'bg-yellow-500/20 text-yellow-700';
      case 'scheduled': return 'bg-blue-500/20 text-blue-700';
      case 'confirmed': return 'bg-green-500/20 text-green-700';
      case 'completed': return 'bg-purple-500/20 text-purple-700';
      case 'cancelled': return 'bg-red-500/20 text-red-700';
      default: return 'bg-gray-500/20 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending_scheduling': return 'Aguardando agendamento';
      case 'scheduled': return 'Agendado';
      case 'confirmed': return 'Confirmado';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Agendamentos | Gestão de Clínica Estética</title>
        <meta name="description" content="Controle de procedimentos e sessões de pacotes - gestão completa de agendamentos" />
      </Helmet>

      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient-brand">Agendamentos</h1>
            <p className="text-muted-foreground">Controle de procedimentos e sessões de pacotes</p>
          </div>
          <div className="flex gap-3">
            <NeonButton icon={CalendarDays}>
              Ver Calendário
            </NeonButton>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erro de Conexão</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Seção 1: Procedimentos Individuais Aguardando Agendamento */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-yellow-500" />
              Procedimentos Aguardando Agendamento
              <Badge variant="secondary" className="ml-2">{pendingProcedures.length}</Badge>
            </h2>
          </div>
          
          {pendingProcedures.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum procedimento aguardando agendamento</p>
              <p className="text-sm mt-1">As vendas do caixa aparecerão aqui automaticamente</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingProcedures.map((procedure) => (
                <div key={procedure.id} className="p-4 rounded-lg bg-card/50 border border-border/50 hover:bg-card/70 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-yellow-500/20">
                        <User className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{procedure.client_name}</p>
                        <p className="text-sm text-muted-foreground">{procedure.service_name}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            R$ {procedure.price.toFixed(2)}
                          </span>
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" />
                            Vendido: {format(parseISO(procedure.sale_date), "dd/MM/yyyy")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(procedure.status)}>
                        {getStatusText(procedure.status)}
                      </Badge>
                      <Button
                        size="sm"
                        className="bg-brand-gradient hover:opacity-90"
                        onClick={() => handleSchedule(procedure)}
                      >
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        Agendar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Seção 2: Pacotes Ativos */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-500" />
              Pacotes Ativos
              <Badge variant="secondary" className="ml-2">{activePackages.length}</Badge>
            </h2>
          </div>
          
          {activePackages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum pacote ativo no momento</p>
              <p className="text-sm mt-1">Os pacotes vendidos no caixa aparecerão aqui</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activePackages.map((pkg) => {
                const usedSessions = pkg.session_number || 0;
                const totalSessions = pkg.total_sessions || 0;
                const remainingSessions = totalSessions - usedSessions;
                const progress = (usedSessions / totalSessions) * 100;

                return (
                  <div key={pkg.id} className="p-4 rounded-lg bg-card/50 border border-border/50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-blue-500/20">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{pkg.client_name}</p>
                          <p className="text-sm text-muted-foreground">{pkg.package_name}</p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              R$ {pkg.price.toFixed(2)}
                            </span>
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="h-3 w-3" />
                              Comprado: {format(parseISO(pkg.sale_date), "dd/MM/yyyy")}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-blue-500/20 text-blue-700">
                        {remainingSessions}/{totalSessions} sessões
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-medium">{usedSessions} de {totalSessions} sessões usadas</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                        >
                          <History className="h-3 w-3 mr-1" />
                          Ver Histórico
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 bg-brand-gradient hover:opacity-90"
                        >
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          Próxima Sessão
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>

        {/* Seção 3: Agendamentos de Hoje */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-500" />
              Agendamentos de Hoje
              <Badge variant="secondary" className="ml-2">{todaysAppointments.length}</Badge>
            </h2>
            <span className="text-sm text-muted-foreground">
              {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </span>
          </div>
          
          {todaysAppointments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum agendamento para hoje</p>
              <p className="text-sm mt-1">Ótimo dia para organizar a agenda!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todaysAppointments
                .sort((a, b) => (a.appointment_time || '').localeCompare(b.appointment_time || ''))
                .map((appointment) => (
                  <div key={appointment.id} className="p-4 rounded-lg bg-card/50 border border-border/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-center w-16">
                          <p className="font-bold text-lg text-foreground">{appointment.appointment_time}</p>
                          <p className="text-xs text-muted-foreground">{appointment.duration}min</p>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{appointment.client_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {appointment.service_name || appointment.package_name}
                            {appointment.type === 'package_session' && (
                              <span className="ml-1">- Sessão {appointment.session_number}/{appointment.total_sessions}</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getStatusColor(appointment.status)}>
                          {getStatusText(appointment.status)}
                        </Badge>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleConfirmAttendance(appointment)}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Confirmar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </GlassCard>

        {/* Modal de Agendamento */}
        <Dialog open={scheduleModalOpen} onOpenChange={setScheduleModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agendar Procedimento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Input value={selectedAppointment?.client_name || ''} disabled />
              </div>
              <div className="space-y-2">
                <Label>Procedimento</Label>
                <Input value={selectedAppointment?.service_name || ''} disabled />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input
                    type="date"
                    value={selectedAppointment?.appointment_date || ''}
                    onChange={(e) => setSelectedAppointment(prev => prev ? {...prev, appointment_date: e.target.value} : null)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Horário</Label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 21 }, (_, i) => {
                        const hour = Math.floor(i / 2) + 8;
                        const minute = (i % 2) * 30;
                        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                        return <SelectItem key={time} value={time}>{time}</SelectItem>;
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setScheduleModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleConfirmSchedule} className="bg-brand-gradient hover:opacity-90">
                  Confirmar Agendamento
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}