import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Clock, Package } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePackages, Package as PackageType } from "@/hooks/usePackages";
import { useServices } from "@/hooks/useServices";
import { useToast } from "@/hooks/use-toast";

interface FormData {
  package_id: number;
  service_id: number;
  serviceName: string;
  date: string; // kept for internal use but not exposed to user
  time: string;
  notes: string;
}

interface AppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (appointment: any) => void;
}

const timeSlots = Array.from({ length: 21 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8;
  const minute = (i % 2) * 30;
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
});

export function AppointmentModal({ open, onOpenChange, onSave }: AppointmentModalProps) {
  const { packages } = usePackages();
  const { services } = useServices();
  const { toast } = useToast();

  const [formData, setFormData] = useState<FormData>({
    package_id: 0,
    service_id: 0,
    serviceName: '',
    date: new Date().toISOString().split('T')[0], // default to today
    time: "09:00",
    notes: '',
  });

  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(null);

  useEffect(() => {
    if (open) {
      setFormData({
        package_id: 0,
        service_id: 0,
        serviceName: '',
        date: new Date().toISOString().split('T')[0], // reset to today on open
        time: "09:00",
        notes: '',
      });
      setSelectedPackage(null);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.package_id || !formData.service_id) {
      toast({ title: "Erro", description: "Selecione um pacote e um serviço.", variant: "destructive" });
      return;
    }

    const selectedService = services.find(s => s.id === formData.service_id);
    const selectedPackage = packages.find(p => p.id === formData.package_id);

    const dataForHook = {
      package_id: formData.package_id,
      service_id: formData.service_id,
      serviceName: selectedService?.name || "",
      client_id: selectedPackage?.client_id || 0,
      client_name: selectedPackage?.clientName || "",
      client_phone: "",
      appointment_date: formData.date, // date is set automatically to today
      appointment_time: formData.time,
      duration: selectedService?.duration || 60,
      price: 0,
      notes: formData.notes,
      status: "agendado" as const,
    };

    onSave(dataForHook);
    onOpenChange(false);
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

  const handleTimeSelect = (time: string) => {
    setFormData(prev => ({ ...prev, time }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Agendar Sessão de Pacote
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Pacote */}
          <div className="space-y-2">
            <Label htmlFor="package">Pacote *</Label>
            <Select value={formData.package_id.toString()} onValueChange={handlePackageSelect} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um pacote" />
              </SelectTrigger>
              <SelectContent>
                {packages
                  .filter(p => p.status === 'active' && p.remaining_sessions > 0)
                  .map((pkg) => (
                    <SelectItem key={pkg.id} value={pkg.id.toString()}>
                      {pkg.name} - {pkg.clientName} ({pkg.remaining_sessions} sessões restantes)
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
          </div>

          {/* Serviço */}
          <div className="space-y-2">
            <Label htmlFor="service">Serviço *</Label>
            <Select value={formData.service_id.toString()} onValueChange={handleServiceSelect} required>
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
              rows={2} 
              placeholder="Anotações sobre a sessão..."
            />
          </div>

          {/* Informações do pacote selecionado */}
          {selectedPackage && (
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <h4 className="font-medium text-sm mb-2">Informações do Pacote</h4>
              <div className="text-xs space-y-1 text-muted-foreground">
                <p>Cliente: {selectedPackage.clientName}</p>
                <p>Sessões: {selectedPackage.used_sessions}/{selectedPackage.total_sessions}</p>
                <p>Válido até: {format(new Date(selectedPackage.valid_until), "dd/MM/yyyy")}</p>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">Cancelar</Button>
            <Button type="submit" className="flex-1 bg-brand-gradient hover:opacity-90">
              Agendar Sessão
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}