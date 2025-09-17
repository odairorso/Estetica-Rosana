import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Check, ChevronsUpDown, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { useClients } from "@/hooks/useClients";
import { usePackages } from "@/hooks/usePackages";
import { useToast } from "@/hooks/use-toast";

interface SalesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (saleData: any) => void;
}

export function SalesModal({ open, onOpenChange, onSave }: SalesModalProps) {
  const { toast } = useToast();
  const { clients } = useClients();
  const { packages: availablePackages } = usePackages();
  const [clientComboboxOpen, setClientComboboxOpen] = useState(false);
  const [packageComboboxOpen, setPackageComboboxOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    client_id: 0,
    package_id: 0,
    packageName: '',
    clientName: '',
    price: 0,
    sale_date: new Date(),
    valid_until: '',
    total_sessions: 0,
    notes: ''
  });

  useEffect(() => {
    if (open) {
      setFormData({
        client_id: 0,
        package_id: 0,
        packageName: '',
        clientName: '',
        price: 0,
        sale_date: new Date(),
        valid_until: '',
        total_sessions: 0,
        notes: ''
      });
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.client_id || !formData.package_id || !formData.price) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const dataToSave = {
      client_id: formData.client_id,
      package_id: formData.package_id,
      packageName: formData.packageName,
      clientName: formData.clientName,
      price: formData.price,
      sale_date: format(formData.sale_date, 'yyyy-MM-dd'),
      valid_until: formData.valid_until,
      total_sessions: formData.total_sessions,
      notes: formData.notes
    };

    onSave(dataToSave);
  };

  const handleClientSelect = (clientId: string) => {
    const id = parseInt(clientId);
    const client = clients.find(c => c.id === id);
    if (client) {
      setFormData(prev => ({
        ...prev,
        client_id: id,
        clientName: client.name
      }));
      setClientComboboxOpen(false);
    }
  };

  const handlePackageSelect = (packageId: string) => {
    const id = parseInt(packageId);
    const pkg = availablePackages.find(p => p.id === id);
    if (pkg) {
      setFormData(prev => ({
        ...prev,
        package_id: id,
        packageName: pkg.name,
        price: pkg.price,
        valid_until: pkg.valid_until,
        total_sessions: pkg.total_sessions
      }));
      setPackageComboboxOpen(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-gradient-brand">
            Nova Venda de Pacote
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cliente */}
          <div className="space-y-2">
            <Label>Cliente *</Label>
            <Popover open={clientComboboxOpen} onOpenChange={setClientComboboxOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={clientComboboxOpen} className="w-full justify-between">
                  {formData.client_id ? clients.find(c => c.id === formData.client_id)?.name : "Selecione um cliente..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
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
                        <Check className={cn("mr-2 h-4 w-4", formData.client_id === client.id ? "opacity-100" : "opacity-0")} />
                        {client.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Pacote */}
          <div className="space-y-2">
            <Label>Pacote *</Label>
            <Popover open={packageComboboxOpen} onOpenChange={setPackageComboboxOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={packageComboboxOpen} className="w-full justify-between">
                  {formData.package_id ? availablePackages.find(p => p.id === formData.package_id)?.name : "Selecione um pacote..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[450px] p-0">
                <Command>
                  <CommandInput placeholder="Buscar pacote..." />
                  <CommandEmpty>Nenhum pacote encontrado.</CommandEmpty>
                  <CommandGroup>
                    {availablePackages.map((pkg) => (
                      <CommandItem
                        key={pkg.id}
                        value={pkg.name}
                        onSelect={() => handlePackageSelect(pkg.id.toString())}
                      >
                        <Check className={cn("mr-2 h-4 w-4", formData.package_id === pkg.id ? "opacity-100" : "opacity-0")} />
                        {pkg.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Data da Venda */}
          <div className="space-y-2">
            <Label htmlFor="sale_date">Data da Venda *</Label>
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !formData.sale_date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.sale_date ? format(formData.sale_date, "dd/MM/yyyy", { locale: ptBR }) : <span>Selecione a data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.sale_date}
                  onSelect={(date) => date && handleInputChange('sale_date', date)}
                  locale={ptBR}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Valor */}
          <div className="space-y-2">
            <Label htmlFor="price">Valor da Venda (R$) *</Label>
            <Input 
              id="price" 
              type="number" 
              min="0" 
              step="0.01" 
              value={formData.price} 
              onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)} 
              required 
            />
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea 
              id="notes" 
              value={formData.notes} 
              onChange={(e) => handleInputChange('notes', e.target.value)} 
              rows={3} 
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">Cancelar</Button>
            <Button type="submit" className="flex-1 bg-brand-gradient hover:opacity-90">Registrar Venda</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}