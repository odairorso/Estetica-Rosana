import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { Plus, Calendar, Clock, User, Phone, X } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useClients } from "@/hooks/useClients";

const mockAppointments = [
  { id: 1, time: "09:00", client: "Ana Silva", service: "Limpeza de Pele", status: "confirmed" },
  { id: 2, time: "14:00", client: "Beatriz Santos", service: "Drenagem", status: "pending" },
  { id: 3, time: "16:30", client: "Carla Oliveira", service: "Hidratação", status: "confirmed" }
];

export default function Appointments() {
  const { clients } = useClients();
  const [selectedDate] = useState("16/09/2024");
  const [appointments, setAppointments] = useState(mockAppointments);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [newAppointment, setNewAppointment] = useState({
    time: "",
    client: "",
    service: "",
    phone: ""
  });

  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    const selectedClient = clients.find(c => c.id.toString() === clientId);
    if (selectedClient) {
      setNewAppointment(prev => ({
        ...prev,
        client: selectedClient.name,
        phone: selectedClient.phone
      }));
    }
  };

  const resetForm = () => {
    setNewAppointment({ time: "", client: "", service: "", phone: "" });
    setSelectedClientId("");
  };

  const handleAddAppointment = () => {
    if (!newAppointment.time || !newAppointment.client || !newAppointment.service) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const newApt = {
      id: appointments.length + 1,
      time: newAppointment.time,
      client: newAppointment.client,
      service: newAppointment.service,
      status: "confirmed" as const
    };

    setAppointments([...appointments, newApt]);
    resetForm();
    setIsDialogOpen(false);
    
    toast({
      title: "Sucesso!",
      description: "Agendamento criado com sucesso",
    });
  };

  return (
    <>
      <Helmet>
        <title>Agendamentos | Gestão de Clínica Estética</title>
        <meta name="description" content="Calendário e controle de agendamentos em formato brasileiro." />
        <link rel="canonical" href="/agendamentos" />
      </Helmet>

      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gradient-brand">Agendamentos</h1>
            <p className="text-foreground/80 font-medium">Data: {selectedDate}</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <NeonButton icon={Plus} variant="primary">
                Novo Agendamento
              </NeonButton>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-gradient-brand">Novo Agendamento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="time" className="text-foreground">Horário *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newAppointment.time}
                      onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="service" className="text-foreground">Serviço *</Label>
                    <Select onValueChange={(value) => setNewAppointment({ ...newAppointment, service: value })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Limpeza de Pele">Limpeza de Pele</SelectItem>
                        <SelectItem value="Drenagem Linfática">Drenagem Linfática</SelectItem>
                        <SelectItem value="Hidratação Facial">Hidratação Facial</SelectItem>
                        <SelectItem value="Botox">Botox</SelectItem>
                        <SelectItem value="Preenchimento">Preenchimento</SelectItem>
                        <SelectItem value="Peeling">Peeling</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="client" className="text-foreground">Cliente *</Label>
                  <Select value={selectedClientId} onValueChange={handleClientSelect}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          <div className="flex flex-col">
                            <span className="font-medium">{client.name}</span>
                            <span className="text-xs text-muted-foreground">{client.phone}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {clients.length === 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Nenhum cliente cadastrado. Vá para a aba Clientes primeiro.
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="phone" className="text-foreground">Telefone</Label>
                  <Input
                    id="phone"
                    value={newAppointment.phone}
                    onChange={(e) => setNewAppointment({ ...newAppointment, phone: e.target.value })}
                    placeholder="Será preenchido automaticamente"
                    className="mt-1"
                    readOnly={!!selectedClientId}
                  />
                  {selectedClientId && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Telefone preenchido automaticamente do cadastro do cliente
                    </p>
                  )}
                </div>
                
                <div className="flex gap-3 pt-4">
                  <NeonButton
                    variant="outline"
                    onClick={() => {
                      resetForm();
                      setIsDialogOpen(false);
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </NeonButton>
                  <NeonButton
                    variant="primary"
                    onClick={handleAddAppointment}
                    className="flex-1"
                  >
                    Agendar
                  </NeonButton>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {appointments.map((apt) => (
            <GlassCard key={apt.id} className="hover-lift">
              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-brand-start icon-glow" />
                    <span className="font-bold text-lg text-white">{apt.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-brand-end" />
                    <span className="font-semibold text-white">{apt.client}</span>
                  </div>
                  <span className="text-gray-200 font-medium">{apt.service}</span>
                </div>
                <Badge 
                  className={apt.status === "confirmed" 
                    ? "bg-green-500/20 text-green-600 border-green-500/30 font-semibold" 
                    : "bg-yellow-500/20 text-yellow-600 border-yellow-500/30 font-semibold"
                  }
                >
                  {apt.status === "confirmed" ? "Confirmado" : "Pendente"}
                </Badge>
              </div>
            </GlassCard>
          ))}
          
          {appointments.length === 0 && (
            <GlassCard className="text-center py-12">
              <Calendar className="h-12 w-12 text-brand-start mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Nenhum agendamento hoje</h3>
              <p className="text-foreground/70">Clique em "Novo Agendamento" para começar</p>
            </GlassCard>
          )}
        </div>
      </div>
    </>
  );
}
