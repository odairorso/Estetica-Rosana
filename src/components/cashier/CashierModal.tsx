import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Check, ChevronsUpDown, CalendarIcon, Sparkles, Package, CreditCard, QrCode, Banknote } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { useClients } from "@/hooks/useClients";
import { useServices } from "@/hooks/useServices";
import { usePackages } from "@/hooks/usePackages";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CashierModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'service' | 'package';
  onSave: (saleData: any) => void;
}

export function CashierModal({ open, onOpenChange, type, onSave }: CashierModalProps) {
  const { toast } = useToast();
  const { clients } = useClients();
  const { services: availableServices } = useServices();
  const { packages: availablePackages } = usePackages();
  const [clientComboboxOpen, setClientComboboxOpen] = useState(false);
  const [itemComboboxOpen, setItemComboboxOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    client_id: 0,
    item_id: 0,
    itemName: '',
    clientName: '',
    price: 0,
    sale_date: new Date(),
    duration: 0, // Para serviços
    total_sessions: 0, // Para pacotes
    valid_until: '', // Para pacotes
    notes: '',
    payment_method: 'dinheiro' // ✅ Nova propriedade
  });

  useEffect(() => {
    if (open) {
      setFormData({
        client_id: 0,
        item_id: 0,
        itemName: '',
        clientName: '',
        price: 0,
        sale_date: new Date(),
        duration: 0,
        total_sessions: 0,
        valid_until: '',
        notes: '',
        payment_method: 'dinheiro'
      });
    }
  }, [open, type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.client_id || !formData.item_id || !formData.price) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const dataToSave = {
      type,
      client_id: formData.client_id,
      item_id: formData.item_id,
      itemName: formData.itemName,
      clientName: formData.clientName,
      price: formData.price,
      sale_date: format(formData.sale_date, 'yyyy-MM-dd'),
      duration: formData.duration,
      total_sessions: formData.total_sessions,
      valid_until: formData.valid_until,
      notes: formData.notes,
      payment_method: formData.payment_method // ✅ Incluindo no salvamento
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

  const handleItemSelect = (itemId: string) => {
    const id = parseInt(itemId);
    if (type === 'service') {
      const service = availableServices.find(s => s.id === id);
      if (service) {
        setFormData(prev => ({
          ...prev,
          item_id: id,
          itemName: service.name,
          price: service.price,
          duration: service.duration
        }));
      }
    } else {
      const pkg = availablePackages.find(p => p.id === id);
      if (pkg) {
        setFormData(prev => ({
          ...prev,
          item_id: id,
          itemName: pkg.name,
          price: pkg.price,
          total_sessions: pkg.total_sessions,
          valid_until: pkg.valid_until
        }));
      }
    }
    setItemComboboxOpen(false);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // ✅ Função para obter o ícone da forma de pagamento
  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cartao': return <CreditCard className="h-4 w-4" />;
      case 'pix': return <QrCode className="h-4 w-4" />;
      case 'dinheiro':
      default: return <Banknote className="h-4 w-4" />;
    }
  };

  // ✅ Função para obter o nome da forma de pagamento
  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'cartao': return 'Cartão';
      case 'pix': return 'PIX';
      case 'dinheiro':
      default: return 'Dinheiro';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-gradient-brand flex items-center gap-2">
            {type === 'service' ? <Sparkles className="h-5 w-5" /> : <Package className="h-5 w-5" />}
            Nova Venda de {type === 'service' ? 'Procedimento' : 'Pacote'}
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

          {/* Procedimento ou Pacote */}
          <div className="space-y-2">
            <Label>{type === 'service' ? 'Procedimento' : 'Pacote'} *</Label>
            <Popover open={itemComboboxOpen} onOpenChange={setItemComboboxOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={itemComboboxOpen} className="w-full justify-between">
                  {formData.item_id ? 
                    (type === 'service' 
                      ? availableServices.find(s => s.id === formData.item_id)?.name 
                      : availablePackages.find(p => p.id === formData.item_id)?.name)
                    : `Selecione um ${type === 'service' ? 'procedimento' : 'pacote'}...`}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[450px] p-0">
                <Command>
                  <CommandInput placeholder={`Buscar ${type === 'service' ? 'procedimento' : 'pacote'}...`} />
                  <CommandEmpty>{`Nenhum ${type === 'service' ? 'procedimento' : 'pacote'} encontrado.`}</CommandEmpty>
                  <CommandGroup>
                    {(type === 'service' ? availableServices : availablePackages).map((item) => (
                      <CommandItem
                        key={item.id}
                        value={item.name}
                        onSelect={() => handleItemSelect(item.id.toString())}
                      >
                        <Check className={cn("mr-2 h-4 w-4", formData.item_id === item.id ? "opacity-100" : "opacity-0")} />
                        {item.name}
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

          {/* Forma de Pagamento */}
          <div className="space-y-2">
            <Label>Forma de Pagamento *</Label>
            <Select value={formData.payment_method} onValueChange={(value) => handleInputChange('payment_method', value)}>
              <SelectTrigger>
                <SelectValue>
                  <div className="flex items-center gap-2">
                    {getPaymentMethodIcon(formData.payment_method)}
                    {getPaymentMethodName(formData.payment_method)}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dinheiro">
                  <div className="flex items-center gap-2">
                    <Banknote className="h-4 w-4" />
                    Dinheiro
                  </div>
                </SelectItem>
                <SelectItem value="pix">
                  <div className="flex items-center gap-2">
                    <QrCode className="h-4 w-4" />
                    PIX
                  </div>
                </SelectItem>
                <SelectItem value="cartao">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Cartão
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Informações adicionais */}
          {type === 'service' && formData.duration > 0 && (
            <div className="text-sm text-muted-foreground">
              Duração: {formData.duration} minutos
            </div>
          )}
          
          {type === 'package' && formData.total_sessions > 0 && (
            <div className="text-sm text-muted-foreground">
              {formData.total_sessions} sessões - Válido até: {formData.valid_until ? format(new Date(formData.valid_until), "dd/MM/yyyy", { locale: ptBR }) : 'N/A'}
            </div>
          )}

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
            <Button type="submit" className="flex-1 bg-brand-gradient hover:opacity-90">
              Registrar Venda
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}