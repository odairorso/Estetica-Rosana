import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import {
  Plus,
  Calendar as CalendarIcon,
  Clock,
  User,
<<<<<<< HEAD
  CheckCircle,
  XCircle,
  MoreVertical,
  Hourglass,
  AlertTriangle,
  WifiOff,
  Package as PackageIcon,
=======
  Package,
  CheckCircle,
  XCircle,
  History,
  Phone,
  DollarSign,
  CalendarDays,
  TrendingUp,
  RefreshCw,
  Trash2,
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
<<<<<<< HEAD
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppointmentModal } from "@/components/services/AppointmentModal";
import { useAppointments, Appointment } from "@/hooks/useAppointments";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { usePackages, Package as PackageType } from "@/hooks/usePackages";
import { SessionHistoryModal } from "@/components/packages/SessionHistoryModal";

// Função segura para validar e formatar datas
const safeFormatDate = (dateString: string | null | undefined, fallback: string = "Data inválida") => {
  if (!dateString) return fallback;
  
  try {
    const date = parseISO(dateString);
    return isValid(date) ? format(date, "dd/MM/yyyy", { locale: ptBR }) : fallback;
  } catch {
    return fallback;
  }
};

// Função segura para comparar datas
const isSameDateSafe = (date1: Date, dateString: string | null | undefined) => {
  if (!dateString) return false;
  
  try {
    const date2 = parseISO(dateString);
    return isValid(date2) ? format(date2, "yyyy-MM-dd") === format(date1, "yyyy-MM-dd") : false;
  } catch {
    return false;
  }
};

export default function Appointments() {
  const {
    appointments,
    addAppointment,
    updateAppointment,
=======
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Appointments() {
  const { toast } = useToast();
  const {
    appointments,
    createFromSale,
    scheduleAppointment,
    confirmAttendance,
    getActivePackages,
    getPendingProcedures,
    getTodaysAppointments,
    getPackageHistory,
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
    isLoading,
    error,
    refreshAppointments,
  } = useAppointments();
<<<<<<< HEAD
  const { packages } = usePackages();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();

  // Estado para o modal de histórico de pacotes
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(null);

  // Função segura para filtrar agendamentos por data
  const filteredAppointments = appointments
    .filter((apt) => {
      return isSameDateSafe(selectedDate, apt.appointment_date);
    })
    .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));

  useEffect(() => {
    console.log('Agendamentos carregados:', appointments);
    console.log('Agendamentos filtrados:', filteredAppointments);
  }, [appointments, filteredAppointments]);

  const handleSaveAppointment = async (appointmentData: any) => {
    const result = await addAppointment(appointmentData);
    if (result) {
      toast({
        title: "Agendamento confirmado!",
        description: `${result.serviceName || "Serviço"} agendado para ${result.client_name}.`,
      });
      setModalOpen(false);
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível criar o agendamento.",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (
    appointment: Appointment,
    status: Appointment["status"]
  ) => {
    await updateAppointment(appointment.id, { status });
    toast({
      title: "Status atualizado!",
      description: `Agendamento de ${appointment.client_name} atualizado.`,
    });
  };

  const getStatusProps = (status: Appointment["status"]) => {
    switch (status) {
      case "agendado":
        return {
          text: "Agendado",
          color: "bg-blue-500/20 text-blue-600",
          icon: Hourglass,
        };
      case "confirmado":
        return {
          text: "Confirmado",
          color: "bg-green-500/20 text-green-600",
          icon: CheckCircle,
        };
      case "concluido":
        return {
          text: "Concluído",
          color: "bg-purple-500/20 text-purple-600",
          icon: User,
        };
      case "cancelado":
        return {
          text: "Cancelado",
          color: "bg-red-500/20 text-red-600",
          icon: XCircle,
        };
      default:
        return {
          text: "Agendado",
          color: "bg-blue-500/20 text-blue-600",
          icon: Hourglass,
        };
    }
  };

  const openPackageHistory = (packageId: number) => {
    const pkg = packages.find((p) => p.id === packageId) || null;
    setSelectedPackage(pkg);
    setHistoryModalOpen(true);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      );
    }

    if (filteredAppointments.length === 0) {
      return (
        <GlassCard className="text-center py-12">
          <CalendarIcon className="h-12 w-12 text-brand-start mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Nenhum agendamento para esta data
          </h3>
          <p className="text-muted-foreground mb-4">
            Selecione outro dia ou crie um novo agendamento.
          </p>
          <NeonButton icon={Plus} onClick={() => setModalOpen(true)}>
            Criar Novo Agendamento
          </NeonButton>
        </GlassCard>
      );
    }

    return (
      <div className="space-y-4">
        {filteredAppointments.map((apt) => {
          const statusProps = getStatusProps(apt.status);
          const StatusIcon = statusProps.icon;
          const isPackage = !!apt.package_id; // indica se é agendamento de pacote

          return (
            <GlassCard key={apt.id} className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {/* Horário e Duração */}
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="font-bold text-lg text-foreground">{apt.appointment_time}</p>
                    <p className="text-xs text-muted-foreground">{apt.duration} min</p>
                  </div>
                </div>

                {/* Cliente e Serviço */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{apt.client_name}</p>
                  <p className="text-sm text-muted-foreground truncate">{apt.serviceName}</p>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <Badge className={`${statusProps.color} font-semibold`}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusProps.text}
                  </Badge>

                  {/* Botão de histórico para pacotes */}
                  {isPackage && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openPackageHistory(apt.package_id!)}
                      className="h-8 w-8"
                    >
                      <PackageIcon className="h-4 w-4 text-brand-start" />
                    </Button>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleStatusChange(apt, "confirmado")}>
                        Confirmar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(apt, "concluido")}>
                        Concluir
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(apt, "cancelado")}
                        className="text-destructive"
                      >
                        Cancelar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    );
  };
=======
  const { sales, isLoading: salesLoading, forceCreateAppointments } = useSales();
  const { services } = useServices();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedTime, setSelectedTime] = useState("09:00");

  // Função para limpar todos os agendamentos (debug)
  const clearAllAppointments = () => {
    console.log("🗑️ Iniciando limpeza de agendamentos...");
    if (confirm("⚠️ Tem certeza que deseja limpar TODOS os agendamentos? Esta ação não pode ser desfeita!")) {
      console.log("🗑️ Confirmado - removendo do localStorage...");
      localStorage.removeItem('clinic-appointments-v2');
      localStorage.removeItem('clinic-appointments');
      console.log("✅ Agendamentos removidos do localStorage");
      toast({
        title: "🗑️ Agendamentos limpos!",
        description: "Todos os agendamentos foram removidos. Recarregue a página.",
      });
      setTimeout(() => window.location.reload(), 1000);
    } else {
      console.log("❌ Limpeza cancelada");
    }
  };

  // Função para debug detalhado
  const debugSystem = () => {
    console.log("=== 🐛 DEBUG COMPLETO DO SISTEMA ===");
    console.log("📊 Vendas:", sales.length);
    console.log("📋 Agendamentos:", appointments.length);
    console.log("💰 Últimas 3 vendas:", sales.slice(0, 3).map(s => ({
      cliente: s.clientName,
      data: s.sale_date,
      itens: s.items.map(i => `${i.itemName} (${i.type})`)
    })));
    console.log("📋 Últimos 3 agendamentos:", appointments.slice(0, 3).map(a => ({
      cliente: a.client_name,
      tipo: a.type,
      status: a.status,
      servico: a.service_name,
      pacote: a.package_name
    })));
    
    // Verificar itens que deveriam ter agendamentos
    const itemsThatShouldHaveAppointments = sales.flatMap(sale => 
      sale.items.filter(item => item.type === 'service' || item.type === 'package')
    );
    
    console.log("📦 Itens que deveriam ter agendamentos:", itemsThatShouldHaveAppointments.length);
    itemsThatShouldHaveAppointments.forEach(item => {
      const hasAppointment = appointments.some(apt => 
        (apt.service_name === item.itemName && apt.type === 'individual') ||
        (apt.package_name === item.itemName && apt.type === 'package_session')
      );
      console.log(`${hasAppointment ? '✅' : '❌'} ${item.itemName} (${item.type}): ${hasAppointment ? 'Tem agendamento' : 'SEM agendamento'}`);
    });
    
    console.log("=== FIM DO DEBUG ===");
  };

  // Tornar funções acessíveis globalmente para debug via console
  useEffect(() => {
    // @ts-ignore
    window.debugAppointments = debugSystem;
    // @ts-ignore
    window.clearAppointments = clearAllAppointments;
    // @ts-ignore
    window.forceAppointments = forceCreateAppointments;
    // @ts-ignore
    window.appointmentsData = appointments;
    // @ts-ignore
    window.salesData = sales;
    
    console.log("🛠️ Funções de debug disponíveis no console:");
    console.log("  - debugAppointments() - Ver estado completo");
    console.log("  - clearAppointments() - Limpar todos os agendamentos");
    console.log("  - forceAppointments() - Forçar criação de agendamentos");
  }, [appointments, sales]);

  // Processar vendas do caixa que ainda não viraram agendamentos
  useEffect(() => {
    if (salesLoading || appointments.length === 0) return;

    console.log("🔄 Processando vendas do caixa automaticamente...");
    let novosAgendamentos = 0;

    sales.forEach(sale => {
      sale.items.forEach(item => {
        // Verifica se já existe agendamento para esta venda
        const existingAppointment = appointments.find(apt => 
          apt.client_id === sale.client_id && 
          ((item.type === 'service' && apt.service_id === item.item_id) ||
           (item.type === 'package' && apt.package_id === item.item_id)) &&
          apt.type === (item.type === 'service' ? 'individual' : 'package_session')
        );

        if (!existingAppointment) {
          console.log(`🆕 Criando agendamento: ${sale.clientName} - ${item.itemName}`);
          // Cria agendamento automaticamente
          createFromSale({
            client_id: sale.client_id,
            client_name: sale.clientName,
            client_phone: '',
            service_id: item.type === 'service' ? item.item_id : undefined,
            service_name: item.itemName,
            package_id: item.type === 'package' ? item.item_id : undefined,
            package_name: item.itemName,
            total_sessions: item.type === 'package' ? item.quantity : undefined,
            price: item.price * item.quantity,
            sale_date: sale.sale_date,
            type: item.type === 'service' ? 'individual' : 'package_session',
          });
          novosAgendamentos++;
        } else {
          console.log(`✅ Agendamento já existe: ${sale.clientName} - ${item.itemName}`);
        }
      });
    });

    if (novosAgendamentos > 0) {
      console.log(`✨ ${novosAgendamentos} novos agendamentos criados`);
    }
  }, [sales, appointments, salesLoading]);

  // Recarregar agendamentos quando a página carrega
  useEffect(() => {
    console.log("🔄 Recarregando agendamentos...");
    refreshAppointments();
  }, []);

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
      description: `${selectedAppointment.client_name} agendado(a) para ${format(parseISO(selectedAppointment.appointment_date), "dd/MM/yyyy")} às ${selectedTime}`,
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

  const pendingProcedures = getPendingProcedures();
  const activePackages = getActivePackages();
  const todaysAppointments = getTodaysAppointments();

  // Novas seções: procedimentos concluídos e pacotes concluídos
  const completedProcedures = appointments.filter(apt => apt.type === 'individual' && apt.status === 'completed');
  const completedPackages = appointments.filter(apt => apt.type === 'package_session' && apt.status === 'completed');

  if (isLoading || salesLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522

  return (
    <>
      <Helmet>
        <title>Agendamentos | Gestão de Clínica Estética</title>
<<<<<<< HEAD
        <meta name="description" content="Calendário e controle de agendamentos." />
      </Helmet>

      <div className="space-y-6">
=======
        <meta name="description" content="Controle de procedimentos e sessões de pacotes - gestão completa de agendamentos" />
      </Helmet>

      <div className="space-y-6 p-6">
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient-brand">Agendamentos</h1>
<<<<<<< HEAD
            <p className="text-muted-foreground">Selecione uma data para ver os horários</p>
          </div>
          <NeonButton icon={Plus} onClick={() => setModalOpen(true)}>
            Novo Agendamento
          </NeonButton>
        </div>

        {/* Erro / Modo offline */}
        {error && (
          <Alert variant={error.includes("offline") ? "default" : "destructive"}>
            {error.includes("offline") ? (
              <WifiOff className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <AlertTitle>
              {error.includes("offline") ? "Modo Offline" : "Erro de Conexão"}
            </AlertTitle>
            <AlertDescription>
              {error}
              <Button
                variant="link"
                className="p-0 h-auto ml-2"
                onClick={refreshAppointments}
              >
                Tentar novamente
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Calendário + Lista */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendário */}
          <GlassCard className="lg:col-span-1 p-2 flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              locale={ptBR}
              className="p-0"
            />
          </GlassCard>

          {/* Lista de agendamentos */}
          <div className="lg:col-span-2 space-y-4">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Modal de criação/edição */}
      <AppointmentModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleSaveAppointment}
        service={null}
      />

      {/* Modal de histórico de sessões do pacote */}
      <SessionHistoryModal
        open={historyModalOpen}
        onOpenChange={setHistoryModalOpen}
        package={selectedPackage}
      />
=======
            <p className="text-muted-foreground">Controle de procedimentos e sessões de pacotes</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={debugSystem}
              className="bg-blue-500/20 text-blue-700 hover:bg-blue-500/30"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Debug
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearAllAppointments}
              className="bg-red-500/20 text-red-700 hover:bg-red-500/30"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar Tudo
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={forceCreateAppointments}
              className="bg-yellow-500/20 text-yellow-700 hover:bg-yellow-500/30"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Forçar Criação
            </Button>
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
                const progress = totalSessions ? (usedSessions / totalSessions) * 100 : 0;

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
                            {appointment.type === 'package_session' && appointment.session_number && (
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

        {/* Seção 4: Procedimentos Concluídos */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-purple-500" />
              Procedimentos Concluídos
              <Badge variant="secondary" className="ml-2">{completedProcedures.length}</Badge>
            </h2>
          </div>
          
          {completedProcedures.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum procedimento concluído ainda</p>
              <p className="text-sm mt-1">Os procedimentos finalizados aparecerão aqui</p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedProcedures.map((procedure) => (
                <div key={procedure.id} className="p-4 rounded-lg bg-card/50 border border-border/50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-purple-500/20">
                        <User className="h-4 w-4 text-purple-600" />
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
                            Concluído: {procedure.completed_at ? format(parseISO(procedure.completed_at), "dd/MM/yyyy") : 'Data não registrada'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-purple-500/20 text-purple-700">
                      Concluído
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Seção 5: Pacotes Concluídos */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-500" />
              Pacotes Concluídos
              <Badge variant="secondary" className="ml-2">{completedPackages.length}</Badge>
            </h2>
          </div>
          
          {completedPackages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum pacote concluído ainda</p>
              <p className="text-sm mt-1">Os pacotes aparecerão aqui quando todas as sessões forem concluídas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {completedPackages.map((pkg) => {
                const history = getPackageHistory(pkg.package_id || 0);
                const firstSession = history[0];
                const lastSession = history[history.length - 1];

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
                              Concluído em: {lastSession?.completed_at ? format(parseISO(lastSession.completed_at), "dd/MM/yyyy") : '--'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-blue-500/20 text-blue-700">
                        {history.length}/{pkg.total_sessions} sessões
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Sessões Realizadas</span>
                        <span className="font-medium">{history.length} de {pkg.total_sessions}</span>
                      </div>
                      <Progress value={(history.length / (pkg.total_sessions || 1)) * 100} className="h-2" />
                      
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                        >
                          <History className="h-3 w-3 mr-1" />
                          Ver Histórico
                        </Button>
                        <Badge className="bg-green-500/20 text-green-700">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Pacote Finalizado
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
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
                  <Label htmlFor="date">Data</Label>
                  <Input
                    id="date"
                    type="date"
                    value={selectedAppointment?.appointment_date || ''}
                    onChange={(e) => setSelectedAppointment(prev => prev ? {...prev, appointment_date: e.target.value} : null)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Horário</Label>
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
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
    </>
  );
}