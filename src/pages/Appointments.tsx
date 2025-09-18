import { Helmet } from "react-helmet-async";
import { useState } from "react";
import {
  Plus,
  Calendar as CalendarIcon,
  MoreVertical,
  Hourglass,
  AlertTriangle,
  WifiOff,
  Package as PackageIcon,
  CheckCircle,
  XCircle,
  User,
  History,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Progress } from "@/components/ui/progress";

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
  const { appointments, addAppointment, updateAppointment, isLoading, error, refreshAppointments } = useAppointments();
  const { packages, isLoading: packagesLoading } = usePackages();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedPackageForHistory, setSelectedPackageForHistory] = useState<PackageType | null>(null);
  const [packageToSchedule, setPackageToSchedule] = useState<PackageType | null>(null);

  const filteredAppointments = appointments
    .filter((apt) => isSameDateSafe(selectedDate, apt.appointment_date))
    .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));

  const activePackages = packages.filter(p => p.status === 'active' && p.remaining_sessions > 0);

  const handleSaveAppointment = async (appointmentData: any) => {
    const result = await addAppointment(appointmentData);
    if (result) {
      toast({
        title: "Agendamento confirmado!",
        description: `${result.serviceName || "Serviço"} agendado para ${result.client_name}.`,
      });
      setModalOpen(false);
      setPackageToSchedule(null); // Limpa o pacote selecionado
    } else {
      toast({ title: "Erro", description: "Não foi possível criar o agendamento.", variant: "destructive" });
    }
  };

  const handleStatusChange = async (appointment: Appointment, status: Appointment["status"]) => {
    await updateAppointment(appointment.id, { status });
    toast({ title: "Status atualizado!", description: `Agendamento de ${appointment.client_name} atualizado.` });
  };

  const openPackageHistory = (pkg: PackageType) => {
    setSelectedPackageForHistory(pkg);
    setHistoryModalOpen(true);
  };

  const handleScheduleFromPackage = (pkg: PackageType) => {
    setPackageToSchedule(pkg);
    setModalOpen(true);
  };

  const getStatusProps = (status: Appointment["status"]) => {
    switch (status) {
      case "agendado": return { text: "Agendado", color: "bg-blue-500/20 text-blue-600", icon: Hourglass };
      case "confirmado": return { text: "Confirmado", color: "bg-green-500/20 text-green-600", icon: CheckCircle };
      case "concluido": return { text: "Concluído", color: "bg-purple-500/20 text-purple-600", icon: User };
      case "cancelado": return { text: "Cancelado", color: "bg-red-500/20 text-red-600", icon: XCircle };
      default: return { text: "Agendado", color: "bg-blue-500/20 text-blue-600", icon: Hourglass };
    }
  };

  return (
    <>
      <Helmet>
        <title>Agendamentos | Gestão de Clínica Estética</title>
        <meta name="description" content="Calendário, controle de agendamentos e gestão de sessões de pacotes." />
      </Helmet>

      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient-brand">Agenda e Pacotes</h1>
            <p className="text-muted-foreground">Visualize a agenda do dia e gerencie as sessões dos pacotes</p>
          </div>
          <NeonButton icon={Plus} onClick={() => { setPackageToSchedule(null); setModalOpen(true); }}>
            Novo Agendamento
          </NeonButton>
        </div>

        {error && (
          <Alert variant={error.includes("offline") ? "default" : "destructive"}>
            {error.includes("offline") ? <WifiOff className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            <AlertTitle>{error.includes("offline") ? "Modo Offline" : "Erro de Conexão"}</AlertTitle>
            <AlertDescription>
              {error}
              <Button variant="link" className="p-0 h-auto ml-2" onClick={refreshAppointments}>Tentar novamente</Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 flex flex-col gap-6">
            <GlassCard className="p-2 flex justify-center"><Calendar mode="single" selected={selectedDate} onSelect={(date) => date && setSelectedDate(date)} locale={ptBR} className="p-0" /></GlassCard>
            
            <GlassCard className="flex-1">
              <h2 className="text-lg font-semibold mb-4 text-foreground p-4">Pacotes Ativos</h2>
              <div className="space-y-3 max-h-[40vh] overflow-y-auto px-4 pb-4">
                {packagesLoading ? (
                  <Skeleton className="h-20 w-full" />
                ) : activePackages.length > 0 ? (
                  activePackages.map(pkg => (
                    <div key={pkg.id} className="p-3 rounded-lg bg-card/50 border">
                      <p className="font-semibold text-sm">{pkg.name}</p>
                      <p className="text-xs text-muted-foreground mb-2">{pkg.clientName}</p>
                      <Progress value={(pkg.used_sessions / pkg.total_sessions) * 100} className="h-1.5" />
                      <p className="text-xs text-muted-foreground mt-1">{pkg.used_sessions} de {pkg.total_sessions} sessões usadas</p>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" className="flex-1 text-xs h-8 bg-brand-gradient" onClick={() => handleScheduleFromPackage(pkg)}><Plus className="h-3 w-3 mr-1" /> Agendar Sessão</Button>
                        <Button size="sm" variant="outline" className="flex-1 text-xs h-8" onClick={() => openPackageHistory(pkg)}><History className="h-3 w-3 mr-1" /> Histórico</Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-sm text-muted-foreground py-6">Nenhum pacote ativo.</p>
                )}
              </div>
            </GlassCard>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              Agendamentos para {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
            </h2>
            {isLoading ? (
              <div className="space-y-4"><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /></div>
            ) : filteredAppointments.length === 0 ? (
              <GlassCard className="text-center py-12">
                <CalendarIcon className="h-12 w-12 text-brand-start mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Nenhum agendamento para esta data</h3>
                <p className="text-muted-foreground">Selecione outro dia ou crie um novo agendamento.</p>
              </GlassCard>
            ) : (
              filteredAppointments.map((apt) => {
                const statusProps = getStatusProps(apt.status);
                return (
                  <GlassCard key={apt.id} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="text-center w-16">
                          <p className="font-bold text-lg text-foreground">{apt.appointment_time}</p>
                          <p className="text-xs text-muted-foreground">{apt.duration} min</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">{apt.client_name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground truncate">
                            {apt.package_id && <PackageIcon className="h-3 w-3 text-brand-start shrink-0" />}
                            <span>{apt.serviceName}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge className={`${statusProps.color} font-semibold`}><statusProps.icon className="h-3 w-3 mr-1" />{statusProps.text}</Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleStatusChange(apt, "confirmado")}>Confirmar</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(apt, "concluido")}>Concluir</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(apt, "cancelado")} className="text-destructive">Cancelar</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </GlassCard>
                );
              })
            )}
          </div>
        </div>
      </div>

      <AppointmentModal open={modalOpen} onOpenChange={setModalOpen} onSave={handleSaveAppointment} packageToSchedule={packageToSchedule} />
      <SessionHistoryModal open={historyModalOpen} onOpenChange={setHistoryModalOpen} package={selectedPackageForHistory} />
    </>
  );
}