import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Clock, User, MessageSquare, CalendarIcon, Sparkles, Package } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { Service, useServices } from "@/hooks/useServices";
import { useClients } from "@/hooks/useClients";
import { usePackages, Package as PackageType } from "@/hooks/usePackages";
import { useToast } from "@/hooks/use-toast";

interface FormData {
  service_id: number;
  serviceName: string;
  client_id: number;
  client_name: string;
  client_phone: string;
  date: Date;
  time: string;
  duration: number;
  price: number;
  notes: string;
  status: "agendado" | "confirmado" | "concluido" | "cancelado";
  package_id: number | null;
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

export function AppointmentModal({ open, onOpenChange, service, onSave }: AppointmentModalProps) {
  const { clients } = useClients();
  const { services } = useServices();
  const { packages } = usePackages();
  const { toast } = useToast();

  const [appointmentType, setAppointmentType] = useState<'service' | 'package'>('service');
  const [clientPackages, setClientPackages] = useState<PackageType[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");

  const [formData, setFormData] = useState<FormData>({
    service_id: 0,
    serviceName: "",
    client_id: 0,
    client_name: "",
    client_phone: "",
    date: new Date(),
    time: "09:00",
    duration: 60,
    price: 0,
    notes: "",
    status: "agendado",
    package_id: null,
  });

  useEffect(() => {
    if (open) {
      const initialService = service || null;
      const initialServiceId = initialService ? initialService.id.toString() : "";
      
      setSelectedServiceId(initialServiceId);
      setSelectedClientId("");
      setAppointmentType('service');
      setClientPackages([]);

      setFormData({
        service_id: initialService?.id || 0,
        serviceName: initialService?.name || "",
        client_id: 0,
        client_name: "",
        client_phone: "",
        date: new Date(),
        time: "09:00",
        duration: initialService?.duration || 60,
        price: initialService?.price || 0,
        notes: "",
        status: "agendado",
        package_id: null,
      });
    }
  }, [service, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client_id || !formData.service_id) {
      toast({ title: "Erro", description: "Cliente e serviço são obrigatórios.", variant: "destructive" });
      return;
    }
    if (appointmentType === 'package' && !formData.package_id) {
      toast({ title: "Erro", description: "Selecione um pacote para usar a sessão.", variant: "destructive" });
      return;
    }

    const dataForHook = {
      service_id: formData.service_id,
      serviceName: formData.serviceName,
      client_id: formData.client_id,
      client_name: formData.client_name,
      client_phone: formData.client_phone,
      appointment_date: format(formData.date, 'yyyy-MM-dd'),
      appointment_time: formData.time,
      duration: formData.duration,
      price: appointmentType === 'package' ? 0 : formData.price,
      notes: formData.notes,
      status: formData.status,
      package_id: appointmentType === 'package' ? formData.package_id : null,
    };

    onSave(dataForHook);
    onOpenChange(false);
  };

  const handleChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    const selectedClient = clients.find(c => c.id.toString() === clientId);
    if (selectedClient) {
      handleChange("client_id", selectedClient.id);
      handleChange("client_name", selectedClient.name);
      handleChange("client_phone", selectedClient.phone);

      const activePackages = packages.filter(p => 
        p.client_id === selectedClient.id && p.status === 'active' && p.remaining_sessions > 0
      );
      setClientPackages(activePackages);
      if (activePackages.length === 0) {
        setAppointmentType('service');
      }
    } else {
      setClientPackages([]);
    }
  };

  const handleServiceSelect = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    const selectedService = services.find(s => s.id.toString() === serviceId);
    if (selectedService) {
      handleChange("service_id", selectedService.id);
      handleChange("serviceName", selectedService.name);
      handleChange("duration", selectedService.duration);
      if (appointmentType === 'service') {
        handleChange("price", selectedService.price);
      }
    }
  };

  useEffect(() => {
    const selectedService = services.find(s => s.id.toString() === selectedServiceId);
    if (appointmentType === 'package') {
      handleChange("price", 0);
    } else if (selectedService) {
      handleChange("price", selectedService.price);
    }
  }, [appointmentType, selectedServiceId, services]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Novo Agendamento
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados do Cliente */}
          <div className="space-y-2">
            <Label htmlFor="client">Cliente *</Label>
            <Select value={selectedClientId} onValueChange={handleClientSelect} required>
              <SelectTrigger><SelectValue placeholder="Selecione um cliente" /></SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id.toString()}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tipo de Agendamento */}
          {selectedClientId && (
            <div className="space-y-2">
              <Label>Tipo de Agendamento</Label>
              <RadioGroup value={appointmentType} onValueChange={(v) => setAppointmentType(v as any)} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="service" id="service" />
                  <Label htmlFor="service">Serviço Avulso</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="package" id="package" disabled={clientPackages.length === 0} />
                  <Label htmlFor="package" className={clientPackages.length === 0 ? 'text-muted-foreground' : ''}>
                    Sessão de Pacote {clientPackages.length === 0 && "(Nenhum)"}
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Pacote ou Serviço */}
          <div className="space-y-4">
            {appointmentType === 'package' && (
              <div className="space-y-2">
                <Label htmlFor="package_id">Pacote do Cliente *</Label>
                <Select onValueChange={(v) => handleChange("package_id", parseInt(v))} required>
                  <SelectTrigger><SelectValue placeholder="Selecione um pacote ativo" /></SelectTrigger>
                  <SelectContent>
                    {clientPackages.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.name} ({p.remaining_sessions} restantes)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="service_id">Serviço a ser realizado *</Label>
              <Select value={selectedServiceId} onValueChange={handleServiceSelect} required>
                <SelectTrigger><SelectValue placeholder="Escolha um serviço" /></SelectTrigger>
                <SelectContent>
                  {services.map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Data e Horário */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-10 px-3 py-2 text-sm",
                      !formData.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? format(formData.date, "dd/MM/yyyy") : <span>Selecione a data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={formData.date}
                    onSelect={(d) => d && handleChange("date", d)}
                    disabled={(d) => d < new Date(new Date().setDate(new Date().getDate() - 1))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Horário *</Label>
              <Select value={formData.time} onValueChange={(v) => handleChange("time", v)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o horário" />
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

          {/* Preço */}
          <div className="space-y-2">
            <Label htmlFor="price">Valor do Agendamento (R$)</Label>
            <Input 
              id="price" 
              type="number" 
              value={formData.price} 
              onChange={(e) => handleChange("price", parseFloat(e.target.value))} 
              disabled={appointmentType === 'package'} 
            />
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea 
              id="notes" 
              value={formData.notes} 
              onChange={(e) => handleChange("notes", e.target.value)} 
              rows={2} 
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">Cancelar</Button>
            <Button type="submit" className="flex-1">Confirmar Agendamento</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}