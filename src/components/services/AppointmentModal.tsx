import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Clock, User, MessageSquare, CalendarIcon, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Service, useServices } from "@/hooks/useServices";
import { useClients } from "@/hooks/useClients";

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
  service?: Service | null;
  onSave: (appointment: any) => void;
}

const timeSlots = Array.from({ length: 21 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8;
  const minute = (i % 2) * 30;
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
});

const initialFormData = {
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
  status: "agendado" as const,
};

export function AppointmentModal({ open, onOpenChange, service: initialService, onSave }: AppointmentModalProps) {
  const { clients } = useClients();
  const { services } = useServices();
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<Omit<Appointment, "id">>(initialFormData);

  useEffect(() => {
    if (open) {
      if (initialService) {
        setSelectedService(initialService);
        setFormData({
          ...initialFormData,
          serviceId: initialService.id,
          serviceName: initialService.name,
          duration: initialService.duration,
          price: initialService.price,
          date: new Date(),
        });
      } else {
        setSelectedService(null);
        setFormData(initialFormData);
      }
      setSelectedClientId("");
    }
  }, [initialService, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !formData.clientId || !formData.date || !formData.time) {
      return;
    }
    const finalData = {
      ...formData,
      date: format(formData.date, "yyyy-MM-dd"),
    };
    onSave(finalData);
    onOpenChange(false);
  };

  const handleChange = (field: keyof Omit<Appointment, "id">, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    const selectedClient = clients.find((c) => c.id.toString() === clientId);
    if (selectedClient) {
      handleChange("clientId", selectedClient.id);
      handleChange("clientName", selectedClient.name);
      handleChange("clientPhone", selectedClient.phone);
    }
  };

  const handleServiceSelect = (serviceId: string) => {
    const service = services.find((s) => s.id.toString() === serviceId);
    if (service) {
      setSelectedService(service);
      setFormData((prev) => ({
        ...prev,
        serviceId: service.id,
        serviceName: service.name,
        duration: service.duration,
        price: service.price,
      }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {selectedService ? `Agendar ${selectedService.name}` : "Novo Agendamento"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!initialService && (
            <div className="space-y-2">
              <Label htmlFor="service-select" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Serviço *
              </Label>
              <Select onValueChange={handleServiceSelect} required>
                <SelectTrigger id="service-select">
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      {s.name} - {s.duration}min - R${s.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <fieldset disabled={!selectedService} className="space-y-6 disabled:opacity-50">
            {selectedService && !initialService && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Detalhes do Serviço</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Serviço:</span>
                    <p className="font-medium">{selectedService.name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Duração:</span>
                    <p className="font-medium">{selectedService.duration} min</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Preço:</span>
                    <p className="font-medium">R$ {selectedService.price.toFixed(2).replace(".", ",")}</p>
                  </div>
                </div>
              </div>
            )}

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
                {clients.length === 0 && <p className="text-xs text-muted-foreground mt-1">Nenhum cliente cadastrado. Vá para a aba Clientes primeiro.</p>}
              </div>
            </div>

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
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !formData.date && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.date ? format(formData.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : <span>Selecione uma data</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent mode="single" selected={formData.date} onSelect={(date) => date && handleChange("date", date)} disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))} initialFocus locale={ptBR} />
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

            <div className="space-y-2">
              <Label htmlFor="notes" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Observações (opcional)
              </Label>
              <Textarea id="notes" value={formData.notes} onChange={(e) => handleChange("notes", e.target.value)} placeholder="Informações adicionais..." rows={3} />
            </div>

            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <h4 className="font-medium mb-2">Resumo do Agendamento</h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-muted-foreground">Cliente:</span> {formData.clientName || "Selecione um cliente"}
                </p>
                <p>
                  <span className="text-muted-foreground">Data:</span> {formData.date ? format(formData.date, "dd/MM/yyyy", { locale: ptBR }) : "Data não selecionada"} às {formData.time}
                </p>
                <p>
                  <span className="text-muted-foreground">Valor:</span> R$ {formData.price.toFixed(2).replace(".", ",")}
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                Confirmar Agendamento
              </Button>
            </div>
          </fieldset>
        </form>
      </DialogContent>
    </Dialog>
  );
}