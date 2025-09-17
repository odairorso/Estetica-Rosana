import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Clock, User, MessageSquare, CalendarIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Service } from "@/hooks/useServices";
import { useClients } from "@/hooks/useClients";
import { useAppointments } from "@/hooks/useAppointments";

interface Appointment {
  id?: number;
  serviceId: number;
  serviceName: string;
  clientId: number;
  clientName: string;
  clientPhone: string;
  date: Date;
  time: string;
  duration: number;
  price: number;
  notes: string;
  status: "agendado" | "confirmado" | "concluido" | "cancelado";
}

interface AppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: Service | null;
  onSave: (appointment: Omit<Appointment, 'id'>) => void;
}

// Horários disponíveis (8h às 18h, intervalos de 30 min)
const timeSlots = Array.from({ length: 21 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8;
  const minute = (i % 2) * 30;
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
});

export function AppointmentModal({ open, onOpenChange, service, onSave }: AppointmentModalProps) {
  const { clients } = useClients();
  const { appointments } = useAppointments();
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [formData, setFormData] = useState<Omit<Appointment, 'id'>>({
    serviceId: 0,
    serviceName: "",
    clientId: 0,
    clientName: "",
    clientPhone: "",
    date: new Date(),
    time: "09:00",
    duration: 60,
    price: 0,
    notes: "",
    status: "agendado"
  });

  useEffect(() => {
    if (service && open) {
      setFormData({
        serviceId: service.id,
        serviceName: service.name,
        clientId: 0,
        clientName: "",
        clientPhone: "",
        date: new Date(),
        time: "09:00",
        duration: service.duration,
        price: service.price,
        notes: "",
        status: "agendado"
      });
      setSelectedClientId("");
    }
  }, [service, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientName || !formData.clientPhone || !formData.date || !formData.time) {
      return;
    }

    const formattedData = {
      ...formData,
      date: format(formData.date, 'yyyy-MM-dd'),
    };

    onSave(formattedData);
    onOpenChange(false);
  };

  const handleChange = (field: keyof Omit<Appointment, 'id'>, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    const selectedClient = clients.find(c => c.id.toString() === clientId);
    if (selectedClient) {
      handleChange("clientId", selectedClient.id);
      handleChange("clientName", selectedClient.name);
      handleChange("clientPhone", selectedClient.phone);
    }
  };

  if (!service) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Agendar {service.name}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações do Serviço */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">Detalhes do Serviço</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Serviço:</span>
                <p className="font-medium">{service.name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Duração:</span>
                <p className="font-medium">{service.duration} min</p>
              </div>
              <div>
                <span className="text-muted-foreground">Preço:</span>
                <p className="font-medium">R$ {service.price.toFixed(2).replace('.', ',')}</p>
              </div>
            </div>
          </div>

          {/* Dados do Cliente */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Dados do Cliente
            </h4>
            
            <div className="space-y-2">
              <Label htmlFor="client">Cliente *</Label>
              <Select value={selectedClientId} onValueChange={handleClientSelect} required>
                <SelectTrigger>
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
          </div>

          {/* Data e Horário */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Data e Horário
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data do Agendamento</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? (
                        format(formData.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => date && handleChange("date", date)}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Horário</Label>
                <Select value={formData.time} onValueChange={(value) => handleChange("time", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Observações (opcional)
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Informações adicionais sobre o agendamento..."
              rows={3}
            />
          </div>

          {/* Resumo */}
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <h4 className="font-medium mb-2">Resumo do Agendamento</h4>
            <div className="space-y-1 text-sm">
              <p><span className="text-muted-foreground">Cliente:</span> {formData.clientName || "Selecione um cliente"}</p>
              <p><span className="text-muted-foreground">Telefone:</span> {formData.clientPhone || "Selecione um cliente"}</p>
              <p><span className="text-muted-foreground">Data:</span> {formData.date ? format(formData.date, "dd/MM/yyyy", { locale: ptBR }) : "Data não selecionada"} às {formData.time}</p>
              <p><span className="text-muted-foreground">Duração:</span> {formData.duration} minutos</p>
              <p><span className="text-muted-foreground">Valor:</span> R$ {formData.price.toFixed(2).replace('.', ',')}</p>
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Confirmar Agendamento
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}