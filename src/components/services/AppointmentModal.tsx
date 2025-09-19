import { useState, useEffect } from "react";
<<<<<<< HEAD
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Clock, User, MessageSquare, CalendarIcon, Sparkles, Package as PackageIcon, Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useServices } from "@/hooks/useServices";
import { usePackages } from "@/hooks/usePackages";
import { useClients } from "@/hooks/useClients";
import { useToast } from "@/hooks/use-toast";

// Interfaces (ajustadas para refletir a nova lógica)
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
=======
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Clock, User, Package, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { usePackages, Package as PackageType } from "@/hooks/usePackages";
import { useServices } from "@/hooks/useServices";
import { useClients } from "@/hooks/useClients";
import { useToast } from "@/hooks/use-toast";

interface FormData {
  client_id: number;
  client_name: string;
  client_phone: string;
  package_id: number;
  service_id: number;
  serviceName: string;
  date: string;
  time: string;
  notes: string;
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
}

interface AppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
<<<<<<< HEAD
  onSave: (appointment: Omit<Appointment, 'id'>) => void;
}

// Horários disponíveis
=======
  onSave: (appointment: any) => void;
  service?: any; // Mantido para compatibilidade
  packageToSchedule?: PackageType | null;
}

>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
const timeSlots = Array.from({ length: 21 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8;
  const minute = (i % 2) * 30;
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
});

<<<<<<< HEAD
export function AppointmentModal({ open, onOpenChange, onSave }: AppointmentModalProps) {
  const { services, isLoading: servicesLoading } = useServices();
  const { packages, isLoading: packagesLoading } = usePackages();
  const { clients, isLoading: clientsLoading } = useClients();
  const { toast } = useToast();

  // Estados do formulário
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectionType, setSelectionType] = useState<"package" | "procedure">("procedure");
  const [selectedPackageId, setSelectedPackageId] = useState<string>("");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("09:00");
  const [notes, setNotes] = useState<string>("");

  // Resetar estado ao abrir/fechar o modal
  useEffect(() => {
    if (open) {
      setSelectedClientId("");
      setSelectionType("procedure");
      setSelectedPackageId("");
      setSelectedServiceId("");
      setSelectedDate(new Date());
      setSelectedTime("09:00");
      setNotes("");
    }
  }, [open]);

  // Derivar dados a partir das seleções
  const selectedClient = clients.find(c => c.id === selectedClientId);
  
  const clientPackages = packages.filter(p => 
    p.client_id === parseInt(selectedClientId) && 
    p.status === 'active' && 
    p.remaining_sessions > 0
  );

  const selectedPackage = packages.find(p => p.id === selectedPackageId);
  const selectedService = services.find(s => s.id === selectedServiceId);

  // Handler para salvar
  const handleSave = () => {
    if (!selectedClientId) {
      toast({ title: "Erro", description: "Selecione um cliente.", variant: "destructive" });
      return;
    }
    if (selectionType === 'procedure' && !selectedServiceId) {
      toast({ title: "Erro", description: "Selecione um procedimento.", variant: "destructive" });
      return;
    }
    if (selectionType === 'package' && !selectedPackageId) {
      toast({ title: "Erro", description: "Selecione um pacote.", variant: "destructive" });
      return;
    }

    const appointment: Omit<Appointment, 'id'> = {
      client_id: parseInt(selectedClientId),
      client_name: selectedClient?.name || "",
      client_phone: selectedClient?.phone || "",
      appointment_date: format(selectedDate, 'yyyy-MM-dd'),
      appointment_time: selectedTime,
      notes: notes,
      status: "agendado",
      type: selectionType === 'procedure' ? "service" : "package",
      ...(selectionType === 'procedure' && selectedService ? {
        service_id: parseInt(selectedServiceId),
        duration: selectedService.duration,
        price: selectedService.price,
      } : {
        package_id: selectedPackageId,
        duration: 60, // Duração padrão para sessão de pacote
        price: 0, // Preço já foi pago no pacote
      })
    };
    
    onSave(appointment);
    onOpenChange(false);
    toast({ title: "Sucesso!", description: "Agendamento criado com sucesso." });
=======
export function AppointmentModal({ open, onOpenChange, onSave, packageToSchedule }: AppointmentModalProps) {
  const { packages } = usePackages();
  const { services } = useServices();
  const { clients } = useClients();
  const { toast } = useToast();

  const [formData, setFormData] = useState<FormData>({
    client_id: 0,
    client_name: '',
    client_phone: '',
    package_id: 0,
    service_id: 0,
    serviceName: '',
    date: new Date().toISOString().split('T')[0],
    time: "09:00",
    notes: '',
  });

  const [clientComboboxOpen, setClientComboboxOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(null);
  const [selectionType, setSelectionType] = useState<'package' | 'service' | null>(null);

  useEffect(() => {
    if (open) {
      // Se um pacote foi passado para agendamento, pré-preenche o formulário
      if (packageToSchedule) {
        setFormData({
          client_id: packageToSchedule.client_id,
          client_name: packageToSchedule.clientName || '',
          client_phone: '', // Pode ser buscado do cliente se necessário
          package_id: packageToSchedule.id,
          service_id: 0, // O serviço será selecionado
          serviceName: '',
          date: new Date().toISOString().split('T')[0],
          time: "09:00",
          notes: '',
        });
        setSelectedPackage(packageToSchedule);
        setSelectionType('package');
      } else {
        // Reseta o formulário se for um novo agendamento normal
        setFormData({
          client_id: 0,
          client_name: '',
          client_phone: '',
          package_id: 0,
          service_id: 0,
          serviceName: '',
          date: new Date().toISOString().split('T')[0],
          time: "09:00",
          notes: '',
        });
        setSelectedPackage(null);
        setSelectionType(null);
      }
    }
  }, [open, packageToSchedule]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.client_id) {
      toast({ title: "Erro", description: "Selecione um cliente.", variant: "destructive" });
      return;
    }

    if (!formData.package_id && !formData.service_id) {
      toast({ title: "Erro", description: "Selecione um pacote ou um serviço.", variant: "destructive" });
      return;
    }
    
    // Para agendamento de pacote, o serviço também precisa ser selecionado
    if (formData.package_id && !formData.service_id) {
      toast({ title: "Erro", description: "Selecione qual serviço do pacote será realizado.", variant: "destructive" });
      return;
    }

    const selectedService = services.find(s => s.id === formData.service_id);
    const selectedClient = clients.find(c => c.id === formData.client_id);

    const dataForHook = {
      package_id: formData.package_id || null,
      service_id: formData.service_id || null,
      serviceName: selectedService?.name || "Sessão de Pacote",
      client_id: formData.client_id,
      client_name: selectedClient?.name || formData.client_name,
      client_phone: selectedClient?.phone || formData.client_phone,
      appointment_date: formData.date,
      appointment_time: formData.time,
      duration: selectedService?.duration || 60,
      price: selectionType === 'package' ? 0 : selectedService?.price || 0, // Preço é zero para sessão de pacote
      notes: formData.notes,
      status: "agendado" as const,
    };

    onSave(dataForHook);
    onOpenChange(false);
  };

  const handleClientSelect = (clientId: string) => {
    const id = parseInt(clientId);
    const client = clients.find(c => c.id === id);
    if (client) {
      setFormData(prev => ({
        ...prev,
        client_id: id,
        client_name: client.name,
        client_phone: client.phone
      }));
    }
    setClientComboboxOpen(false);
  };

  const handleSelectionTypeChange = (type: 'package' | 'service') => {
    setSelectionType(type);
    setFormData(prev => ({
      ...prev,
      package_id: 0,
      service_id: 0
    }));
    setSelectedPackage(null);
  };

  const handlePackageSelect = (packageId: string) => {
    const id = parseInt(packageId);
    const selected = packages.find(p => p.id === id);
    setSelectedPackage(selected || null);
    setFormData(prev => ({ ...prev, package_id: id }));
  };

  const handleServiceSelect = (serviceId: string) => {
    const id = parseInt(serviceId);
    const selectedService = services.find(s => s.id === id);
    setFormData(prev => ({ 
      ...prev, 
      service_id: id,
      serviceName: selectedService?.name || ""
    }));
  };

  const handleDateChange = (date: string) => {
    setFormData(prev => ({ ...prev, date }));
  };

  const handleTimeSelect = (time: string) => {
    setFormData(prev => ({ ...prev, time }));
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
<<<<<<< HEAD
      <DialogContent className="w-[95vw] max-w-[600px] max-h-[95vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            Novo Agendamento
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 sm:space-y-6 py-2 sm:py-4">
          {/* 1. Seleção de Cliente */}
          <div className="space-y-2">
            <Label className="font-medium flex items-center gap-2"><User size={16} /> Cliente *</Label>
            <Select value={selectedClientId} onValueChange={id => {
              setSelectedClientId(id);
              setSelectedPackageId(""); // Reseta o pacote ao trocar de cliente
              setSelectedServiceId(""); // Reseta o serviço ao trocar de cliente
            }}>
              <SelectTrigger><SelectValue placeholder="Selecione um cliente..." /></SelectTrigger>
              <SelectContent>
                {clientsLoading ? <SelectItem value="loading" disabled>Carregando...</SelectItem> :
                  clients.map(client => <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>)}
=======
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Novo Agendamento
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cliente */}
          <div className="space-y-2">
            <Label>Cliente *</Label>
            <Popover open={clientComboboxOpen} onOpenChange={setClientComboboxOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={clientComboboxOpen} className="w-full justify-between" disabled={!!packageToSchedule}>
                  {formData.client_id ? clients.find(c => c.id === formData.client_id)?.name : "Selecione um cliente..."}
                  <User className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[450px] p-0">
                <Command>
                  <CommandInput placeholder="Buscar cliente..." />
                  <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                  <CommandGroup>
                    {clients.map((client) => (
                      <CommandItem
                        key={client.id}
                        value={client.name}
                        onSelect={() => handleClientSelect(client.id.toString())}
                      >
                        <User className="mr-2 h-4 w-4" />
                        {client.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Pacote ou Serviço */}
          <div className="space-y-2">
            <Label>Tipo de Agendamento *</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={selectionType === 'package' ? "default" : "outline"}
                className={selectionType === 'package' ? "bg-brand-gradient" : ""}
                onClick={() => handleSelectionTypeChange('package')}
                disabled={!!packageToSchedule}
              >
                <Package className="mr-2 h-4 w-4" />
                Sessão de Pacote
              </Button>
              <Button
                type="button"
                variant={selectionType === 'service' ? "default" : "outline"}
                className={selectionType === 'service' ? "bg-brand-gradient" : ""}
                onClick={() => handleSelectionTypeChange('service')}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Procedimento Avulso
              </Button>
            </div>
          </div>

          {/* Seleção de Pacote */}
          {selectionType === 'package' && (
            <div className="space-y-2">
              <Label htmlFor="package">Pacote</Label>
              <Select value={formData.package_id.toString()} onValueChange={handlePackageSelect} disabled={!!packageToSchedule}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um pacote do cliente" />
                </SelectTrigger>
                <SelectContent>
                  {packages
                    .filter(p => p.client_id === formData.client_id && p.status === 'active' && p.remaining_sessions > 0)
                    .map((pkg) => (
                      <SelectItem key={pkg.id} value={pkg.id.toString()}>
                        {pkg.name} ({pkg.remaining_sessions} restantes)
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Seleção de Serviço */}
          {(selectionType === 'service' || (selectionType === 'package' && formData.package_id > 0)) && (
            <div className="space-y-2">
              <Label htmlFor="service">
                {selectionType === 'package' ? "Serviço a ser realizado na sessão *" : "Procedimento *"}
              </Label>
              <Select value={formData.service_id.toString()} onValueChange={handleServiceSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o serviço" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id.toString()}>
                      {service.name} ({service.duration} min)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Data */}
          <div className="space-y-2">
            <Label htmlFor="date">Data *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleDateChange(e.target.value)}
              required
            />
          </div>

          {/* Horário */}
          <div className="space-y-2">
            <Label htmlFor="time">Horário *</Label>
            <Select value={formData.time} onValueChange={handleTimeSelect} required>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
              </SelectContent>
            </Select>
          </div>

<<<<<<< HEAD
          {/* Renderiza o resto do form apenas se um cliente for selecionado */}
          {selectedClientId && (
            <>
              {/* 2. Seleção de Pacote ou Procedimento */}
              <div className="space-y-3">
                <Label className="font-medium">Selecionar Pacotes ou Procedimentos *</Label>
                <RadioGroup value={selectionType} onValueChange={(val: "package" | "procedure") => setSelectionType(val)} className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="package" id="r_package" />
                    <Label htmlFor="r_package">Pacote</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="procedure" id="r_procedure" />
                    <Label htmlFor="r_procedure">Procedimento</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* 3a. Dropdown de Pacotes (se tipo for pacote) */}
              {selectionType === 'package' && (
                <div className="space-y-2">
                  <Label className="font-medium flex items-center gap-2"><PackageIcon size={16} /> Pacote *</Label>
                  <Select value={selectedPackageId} onValueChange={setSelectedPackageId} disabled={clientPackages.length === 0}>
                    <SelectTrigger>
                      <SelectValue placeholder={clientPackages.length > 0 ? "Selecione um pacote do cliente..." : "Cliente sem pacotes ativos"} />
                    </SelectTrigger>
                    <SelectContent>
                      {packagesLoading ? <SelectItem value="loading" disabled>Carregando...</SelectItem> :
                        clientPackages.map(p => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} ({p.remaining_sessions} sessões restantes)
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* 3b. Dropdown de Procedimentos (se tipo for procedimento) */}
              {selectionType === 'procedure' && (
                <div className="space-y-2">
                  <Label className="font-medium flex items-center gap-2"><Sparkles size={16} /> Procedimento *</Label>
                  <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                    <SelectTrigger><SelectValue placeholder="Selecione um procedimento..." /></SelectTrigger>
                    <SelectContent>
                      {servicesLoading ? <SelectItem value="loading" disabled>Carregando...</SelectItem> :
                        services.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* 4. Informações do Pacote (se um pacote for selecionado) */}
              {selectedPackage && (
                <Card className="bg-muted/50">
                  <CardHeader className="p-4">
                    <CardTitle className="text-base flex items-center gap-2"><Info size={16} /> Informações do Pacote</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 text-sm space-y-2">
                    <div className="flex justify-between"><span>Cliente:</span> <span className="font-medium">{selectedPackage.clientName}</span></div>
                    <div className="flex justify-between"><span>Sessões:</span> <span className="font-medium">{selectedPackage.remaining_sessions}/{selectedPackage.total_sessions}</span></div>
                    <div className="flex justify-between"><span>Válido até:</span> <span className="font-medium">{format(parseISO(selectedPackage.expires_at), "dd/MM/yyyy")}</span></div>
                  </CardContent>
                </Card>
              )}

              {/* 5. Data e Horário */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-medium flex items-center gap-2"><CalendarIcon size={16} /> Data *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "dd/MM/yyyy") : <span>Escolha uma data</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent mode="single" selected={selectedDate} onSelect={(d) => d && setSelectedDate(d)} initialFocus disabled={(date) => date < new Date()} />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label className="font-medium flex items-center gap-2"><Clock size={16} /> Horário *</Label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger><SelectValue placeholder="Escolha um horário" /></SelectTrigger>
                    <SelectContent>
                      {timeSlots.map(time => <SelectItem key={time} value={time}>{time}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 6. Observações */}
              <div className="space-y-2">
                <Label className="font-medium flex items-center gap-2"><MessageSquare size={16} /> Observações</Label>
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Anotações sobre o agendamento..." />
              </div>
            </>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 order-2 sm:order-1">Cancelar</Button>
          <Button onClick={handleSave} className="flex-1 order-1 sm:order-2" disabled={!selectedClientId || (selectionType === 'procedure' && !selectedServiceId) || (selectionType === 'package' && !selectedPackageId)}>Agendar</Button>
        </div>
=======
          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea 
              id="notes" 
              value={formData.notes} 
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} 
              rows={3} 
              placeholder="Anotações sobre o agendamento..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">Cancelar</Button>
            <Button type="submit" className="flex-1 bg-brand-gradient hover:opacity-90">
              Agendar
            </Button>
          </div>
        </form>
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
      </DialogContent>
    </Dialog>
  );
}