import { useState, useEffect } from "react";
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
}

interface AppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (appointment: Omit<Appointment, 'id'>) => void;
}

// Horários disponíveis
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
              </SelectContent>
            </Select>
          </div>

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
      </DialogContent>
    </Dialog>
  );
}