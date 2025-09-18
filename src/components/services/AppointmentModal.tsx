import { useState, useEffect } from "react";
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
}

interface AppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (appointment: any) => void;
  service?: any; // Mantido para compatibilidade
  packageToSchedule?: PackageType | null;
}

const timeSlots = Array.from({ length: 21 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8;
  const minute = (i % 2) * 30;
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
});

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
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              </SelectContent>
            </Select>
          </div>

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
      </DialogContent>
    </Dialog>
  );
}