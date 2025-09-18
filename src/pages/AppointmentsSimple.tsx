import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import {
  Plus,
  Calendar as CalendarIcon,
  Clock,
  User,
  Package,
  CheckCircle,
  Sparkles,
  ShoppingCart,
  DollarSign,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppointments } from "@/hooks/useAppointments";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
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

export default function AppointmentsSimple() {
  const { toast } = useToast();
  const { appointments, scheduleAppointment, confirmAttendance, isLoading } = useAppointments();
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("09:00");

  // Itens aguardando agendamento (vindos das vendas do caixa)
  const pendingAppointments = appointments.filter(appointment => 
    appointment.status === 'agendado' && 
    (!appointment.appointment_date || appointment.appointment_date === '')
  );

  // Agendamentos já marcados para hoje
  const todaysAppointments = appointments.filter(appointment => {
    if (!appointment.appointment_date) return false;
    const appointmentDate = new Date(appointment.appointment_date);
    const today = new Date();
    return (
      appointmentDate.toDateString() === today.toDateString() &&
      appointment.appointment_date !== ''
    );
  });

  const handleSchedule = (appointment: any) => {
    setSelectedAppointment(appointment);
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setScheduleModalOpen(true);
  };

  const handleConfirmSchedule = async () => {
    if (!selectedAppointment || !selectedDate) return;
    
    try {
      await scheduleAppointment(selectedAppointment.id, selectedDate, selectedTime);
      
      toast({
        title: "✅ Agendamento confirmado!",
        description: `${selectedAppointment.client_name} agendado(a) para ${format(new Date(selectedDate), "dd/MM/yyyy", { locale: ptBR })} às ${selectedTime}`,
      });
      
      setScheduleModalOpen(false);
      setSelectedAppointment(null);
    } catch (error) {
      toast({
        title: "❌ Erro",
        description: "Erro ao agendar. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleConfirmAttendance = async (appointment: any) => {
    try {
      await confirmAttendance(appointment.id);
      toast({
        title: "✅ Presença confirmada",
        description: `Presença de ${appointment.client_name} confirmada com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "❌ Erro",
        description: "Erro ao confirmar presença. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Carregando agendamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Agendamentos | Gestão de Clínica Estética</title>
        <meta name="description" content="Controle de agendamentos - marque seus procedimentos e pacotes" />
      </Helmet>

      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient-brand">Agendamentos</h1>
            <p className="text-muted-foreground">Marque seus procedimentos e pacotes vendidos</p>
          </div>
        </div>

        {/* SEÇÃO 1: ITENS AGUARDANDO AGENDAMENTO */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-full bg-gradient-to-r from-orange-500 to-red-500 p-2">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Aguardando Agendamento</h2>
              <p className="text-sm text-muted-foreground">
                Procedimentos e pacotes vendidos no caixa • {pendingAppointments.length} item{pendingAppointments.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {pendingAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Nenhum item aguardando agendamento</p>
                <div className="flex gap-3 justify-center">
                  <Button 
                    variant="outline" 
                    className="bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200"
                    onClick={() => window.location.href = '/caixa'}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    🛒 Ir para o Caixa
                  </Button>
                  <span className="text-muted-foreground text-sm self-center">Faça vendas para criar agendamentos</span>
                </div>
              </div>
            ) : (
              pendingAppointments.map((appointment) => (
                <div key={appointment.id} className="border border-border/50 rounded-lg p-4 bg-gradient-to-r from-orange-50/50 to-red-50/50 dark:from-orange-950/20 dark:to-red-950/20">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="rounded-full bg-gradient-to-r from-orange-500 to-red-500 p-2">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground text-lg">{appointment.client_name}</h3>
                          <p className="text-sm text-muted-foreground">Cliente</p>
                        </div>
                      </div>
                      
                      <div className="ml-11 space-y-2">
                        <div className="flex items-center gap-2">
                          {appointment.type === 'individual' ? (
                            <Sparkles className="h-4 w-4 text-purple-500" />
                          ) : (
                            <Package className="h-4 w-4 text-blue-500" />
                          )}
                          <span className="font-medium text-foreground">
                            {appointment.service_name || appointment.package_name}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {appointment.type === 'individual' ? 'Procedimento' : 'Pacote'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-foreground">
                            Pago: R$ {appointment.price?.toFixed(2).replace('.', ',') || '0,00'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-orange-500" />
                          <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                            AGUARDANDO AGENDAMENTO
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Button 
                        size="sm" 
                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                        onClick={() => handleSchedule(appointment)}
                      >
                        🗓️ AGENDAR AGORA
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>

        {/* SEÇÃO 2: AGENDAMENTOS DE HOJE */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-full bg-green-500/20 p-2">
              <CalendarIcon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Agendamentos de Hoje</h2>
              <p className="text-sm text-muted-foreground">
                Controle de presença • {todaysAppointments.length} agendamento{todaysAppointments.length !== 1 ? 's' : ''} para hoje
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {todaysAppointments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CalendarIcon className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">Nenhum agendamento para hoje</p>
                <p className="text-sm mt-2">Os agendamentos marcados aparecerão aqui</p>
              </div>
            ) : (
              todaysAppointments.map((appointment) => (
                <div key={appointment.id} className="p-6 rounded-xl bg-gradient-to-r from-green-50/50 to-blue-50/50 border border-green-200/30 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Horário */}
                      <div className="text-center p-3 bg-white/70 rounded-lg border border-green-200/50">
                        <p className="text-lg font-bold text-green-600">
                          {appointment.appointment_time || '09:00'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(), 'dd/MM', { locale: ptBR })}
                        </p>
                      </div>
                      
                      <div className="h-12 w-px bg-green-200" />
                      
                      {/* Informações do Cliente */}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                          👤 {appointment.client_name}
                        </h3>
                        <p className="text-green-600 font-medium flex items-center gap-2 mt-1">
                          {appointment.type === 'package_session' ? '📦' : '🔸'} {appointment.service_name || appointment.package_name}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge className="bg-green-500/20 text-green-700">
                            📅 Agendado
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    {/* Botões de Ação */}
                    <div className="flex items-center gap-3">
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6"
                        onClick={() => handleConfirmAttendance(appointment)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        ✅ CONFIRMAR PRESENÇA
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>

        {/* Modal de Agendamento */}
        <Dialog open={scheduleModalOpen} onOpenChange={setScheduleModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agendar {selectedAppointment?.type === 'individual' ? 'Procedimento' : 'Pacote'}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Input value={selectedAppointment?.client_name || ''} disabled />
              </div>

              <div className="space-y-2">
                <Label>{selectedAppointment?.type === 'individual' ? 'Procedimento' : 'Pacote'}</Label>
                <Input value={selectedAppointment?.service_name || selectedAppointment?.package_name || ''} disabled />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Data</Label>
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
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
    </>
  );
}