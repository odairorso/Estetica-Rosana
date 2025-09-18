import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Clock, User, MessageSquare, CalendarIcon, Sparkles, Package as PackageIcon } from "lucide-react";
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
import { useServices } from "@/hooks/useServices";
import { usePackages } from "@/hooks/usePackages";
import { useClients } from "@/hooks/useClients";
import { useToast } from "@/hooks/use-toast";

interface Appointment {
  id?: number;
  service_id?: number;
  package_id?: string;
  client_id: number;
  client_name: string;
  client_phone: string;
  appointment_date: string;
  appointment_time: string;
  duration: number;
  price: number;
  notes: string;
  status: "agendado" | "confirmado" | "concluido" | "cancelado";
  type: "service" | "package";
}

interface AppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (appointment: Omit<Appointment, 'id'>) => void;
}

// Horários disponíveis (8h às 18h, intervalos de 30 min)
const timeSlots = Array.from({ length: 21 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8;
  const minute = (i % 2) * 30;
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
});

export function AppointmentModal({ open, onOpenChange, onSave }: AppointmentModalProps) {
  const { services, isLoading: servicesLoading } = useServices();
  const { packages, isLoading: packagesLoading } = usePackages();
  const { clients, isLoading: clientsLoading } = useClients();
  const { toast } = useToast();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointmentType, setAppointmentType] = useState<"service" | "package">("service");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [selectedPackageId, setSelectedPackageId] = useState<string>("");
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("09:00");
  const [notes, setNotes] = useState<string>("");

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setSelectedDate(new Date());
      setAppointmentType("service");
      setSelectedServiceId("");
      setSelectedPackageId("");
      setSelectedClientId("");
      setSelectedTime("09:00");
      setNotes("");
    }
  }, [open]);

  const selectedService = services.find(s => s.id === selectedServiceId);
  const selectedPackage = packages.find(p => p.id === selectedPackageId);
  const selectedClient = clients.find(c => c.id === selectedClientId);

  // Filtrar pacotes ativos do cliente selecionado
  const availablePackages = packages.filter(pkg => 
    pkg.status === "active" && 
    pkg.remaining_sessions > 0 &&
    (!selectedClientId || pkg.client_id === parseInt(selectedClientId))
  );

  const handleSave = () => {
    // Validações
    if (appointmentType === "service" && !selectedServiceId) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um serviço.",
        variant: "destructive",
      });
      return;
    }

    if (appointmentType === "package" && !selectedPackageId) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um pacote.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedClientId) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um cliente.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedDate) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma data.",
        variant: "destructive",
      });
      return;
    }

    const appointment: Omit<Appointment, 'id'> = {
      ...(appointmentType === "service" ? { service_id: parseInt(selectedServiceId) } : { package_id: selectedPackageId }),
      client_id: parseInt(selectedClientId),
      client_name: selectedClient?.name || "",
      client_phone: selectedClient?.phone || "",
      appointment_date: format(selectedDate, 'yyyy-MM-dd'),
      appointment_time: selectedTime,
      duration: appointmentType === "service" ? (selectedService?.duration || 60) : 60,
      price: appointmentType === "service" ? (selectedService?.price || 0) : 0,
      notes: notes,
      status: "agendado",
      type: appointmentType
    };
    
    onSave(appointment);
    onOpenChange(false);
    
    toast({
      title: "Sucesso!",
      description: "Agendamento criado com sucesso.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[600px] max-h-[95vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            Novo Agendamento
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 sm:space-y-6 py-2 sm:py-4">
          {/* Tipo de Agendamento */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Tipo de Agendamento *</Label>
            <RadioGroup value={appointmentType} onValueChange={(value: "service" | "package") => {
              setAppointmentType(value);
              setSelectedServiceId("");
              setSelectedPackageId("");
            }}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="service" id="service" />
                <Label htmlFor="service" className="flex items-center gap-2 cursor-pointer">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Serviço Avulso
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="package" id="package" />
                <Label htmlFor="package" className="flex items-center gap-2 cursor-pointer">
                  <PackageIcon className="h-4 w-4 text-primary" />
                  Usar Sessão do Pacote
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Seleção de Cliente */}
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <Label className="text-sm sm:text-base font-medium">Cliente *</Label>
            </div>
            <Select value={selectedClientId} onValueChange={(value) => {
              setSelectedClientId(value);
              // Reset package selection when client changes
              if (appointmentType === "package") {
                setSelectedPackageId("");
              }
            }}>
              <SelectTrigger className="h-11 sm:h-12">
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {clientsLoading ? (
                  <SelectItem value="loading" disabled>Carregando clientes...</SelectItem>
                ) : clients.length === 0 ? (
                  <SelectItem value="empty" disabled>Nenhum cliente cadastrado</SelectItem>
                ) : (
                  clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{client.name}</span>
                        <span className="text-xs text-muted-foreground">{client.phone}</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Seleção de Serviço ou Pacote */}
          {appointmentType === "service" ? (
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <Label className="text-sm sm:text-base font-medium">Serviço *</Label>
              </div>
              <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                <SelectTrigger className="h-11 sm:h-12">
                  <SelectValue placeholder="Escolha um serviço" />
                </SelectTrigger>
                <SelectContent>
                  {servicesLoading ? (
                    <SelectItem value="loading" disabled>Carregando serviços...</SelectItem>
                  ) : services.length === 0 ? (
                    <SelectItem value="empty" disabled>Nenhum serviço cadastrado</SelectItem>
                  ) : (
                    services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{service.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {service.duration}min • R$ {service.price.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {selectedService && (
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-sm text-muted-foreground">{selectedService.description}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2">
                <PackageIcon className="h-4 w-4 text-primary" />
                <Label className="text-sm sm:text-base font-medium">Pacote *</Label>
              </div>
              <Select value={selectedPackageId} onValueChange={setSelectedPackageId}>
                <SelectTrigger className="h-11 sm:h-12">
                  <SelectValue placeholder="Escolha um pacote" />
                </SelectTrigger>
                <SelectContent>
                  {packagesLoading ? (
                    <SelectItem value="loading" disabled>Carregando pacotes...</SelectItem>
                  ) : availablePackages.length === 0 ? (
                    <SelectItem value="empty" disabled>
                      {selectedClientId ? "Cliente não possui pacotes ativos" : "Selecione um cliente primeiro"}
                    </SelectItem>
                  ) : (
                    availablePackages.map((pkg) => (
                      <SelectItem key={pkg.id} value={pkg.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{pkg.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {pkg.remaining_sessions} sessões restantes
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {selectedPackage && (
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-sm text-muted-foreground">{selectedPackage.description}</p>
                  <p className="text-sm font-medium text-primary mt-1">
                    Sessões restantes: {selectedPackage.remaining_sessions}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Data e Horário */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <Label className="text-base font-medium">Data e Horário *</Label>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Data do Agendamento</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-11 sm:h-12 justify-start text-left font-normal text-sm",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                      {selectedDate ? (
                        <span className="truncate">
                          {format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Horário</Label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger className="h-11 sm:h-12">
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
          </div>

          {/* Observações */}
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <Label className="text-sm sm:text-base font-medium">Observações</Label>
            </div>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Informações adicionais sobre o agendamento..."
              rows={3}
              className="resize-none min-h-[80px] text-sm"
            />
          </div>

          {/* Resumo */}
          {((appointmentType === "service" && selectedService) || (appointmentType === "package" && selectedPackage)) && selectedClient && (
            <div className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
              <h4 className="font-semibold mb-3 text-primary">Resumo do Agendamento</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cliente:</span>
                  <span className="font-medium">{selectedClient.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Telefone:</span>
                  <span>{selectedClient.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo:</span>
                  <span className="font-medium">
                    {appointmentType === "service" ? "Serviço Avulso" : "Sessão do Pacote"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {appointmentType === "service" ? "Serviço:" : "Pacote:"}
                  </span>
                  <span className="font-medium">
                    {appointmentType === "service" ? selectedService?.name : selectedPackage?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data:</span>
                  <span>{format(selectedDate, "dd/MM/yyyy", { locale: ptBR })} às {selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duração:</span>
                  <span>
                    {appointmentType === "service" ? selectedService?.duration : "60"} minutos
                  </span>
                </div>
                {appointmentType === "service" && (
                  <div className="flex justify-between font-semibold text-primary">
                    <span>Valor:</span>
                    <span>R$ {selectedService?.price.toFixed(2).replace('.', ',')}</span>
                  </div>
                )}
                {appointmentType === "package" && selectedPackage && (
                  <div className="flex justify-between font-semibold text-primary">
                    <span>Sessões restantes:</span>
                    <span>{selectedPackage.remaining_sessions - 1} (após este agendamento)</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            className="flex-1 h-11 sm:h-12 order-2 sm:order-1"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            className="flex-1 h-11 sm:h-12 bg-primary hover:bg-primary/90 order-1 sm:order-2"
            disabled={
              !selectedClientId || 
              (appointmentType === "service" && !selectedServiceId) ||
              (appointmentType === "package" && !selectedPackageId)
            }
          >
            Confirmar Agendamento
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
