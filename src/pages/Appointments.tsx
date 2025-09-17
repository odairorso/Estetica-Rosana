import { Helmet } from "react-helmet-async";
import { useState } from "react";
import {
  Plus,
  Calendar as CalendarIcon,
  Clock,
  User,
  CheckCircle,
  XCircle,
  MoreVertical,
  Hourglass,
  AlertTriangle,
  WifiOff,
  Package as PackageIcon,
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

export default function Appointments() {
  const {
    appointments,
    addAppointment,
    updateAppointment,
    isLoading,
    error,
    refreshAppointments,
  } = useAppointments();
  const { packages } = usePackages();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();

  // Estado para o modal de histórico de pacotes
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedPackage setSelectedPackage] = useState<PackageType | null>(null);

  const filteredAppointments = appointments
    .filter((apt) => {
      if (!apt.appointment_date) return false;
      const aptDate = parseISO(apt.appointment_date);
      if (!isValid(aptDate)) return false;
      return format(aptDate, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
    })
    .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));

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
          const StatusIcon statusProps.icon;
          const isPackage = !!apt.package_id; // campo opcional que indica ag de pacote

          return (
            <GlassCard key={apt.id} className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {/* Horário e Duração */}
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="font-bold text-lg text-foreground">{apt.appointment_time}</p>
                    <p className="text-xs text-muted-foreground">{apt.duration} min</p>
                  </div>
                  {/* Data formatada de forma legível */}
                  <div className="text-sm text-muted-foreground">
                    {format(parseISO(apt.appointment_date), "dd 'de' MMMM", {
                      locale: ptBR,
                    })}
                  </div>
                </div>

                {/* Cliente e Serviço */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">
                    {apt.client_name}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {apt.serviceName}
                  </p>
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
                      <DropdownMenuItem                        onClick={() => handleStatusChange(apt, "confirmado")}
                      >
                        Confirmar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(apt, "concluido")}
                      >
                        Concluir
                      </DropdownMenu>
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

  return (
    <>
      <Helmet>
        <title>Agendamentos | Gestão de Clínica Estética</title>
        <meta name="description" content="Calendário e controle de agendamentos." />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gradient-brand">
              Agendamentos
            </h1>
            <p className="text-muted-foreground">
              Selecione uma data para ver os horários
            </p>
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
            </AlertTitle <AlertDescription>
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
         GlassCard>

          {/* Lista de agendamentos */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold">
              {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
            </h2>
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
    </>
  );
}