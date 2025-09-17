import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Check, ChevronsUpDown, CalendarIcon, CreditCard, QrCode, Banknote } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { useClients } from "@/hooks/useClients";
import { useServices } from "@/hooks/useServices";
import { usePackages } from "@/hooks/usePackages";
import { useInventory } from "@/hooks/useInventory";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CashierModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (saleData: any) => void;
}

export function CashierModal({ open, onOpenChange, onSave }: CashierModalProps) {
  const { toast } = useToast();
  const { clients } = useClients();
  const { services } = useServices();
  const { packages } = usePackages();
  const { products } = useInventory();
  
  const [formData, setFormData] = useState({
    type: 'service' as 'service' | 'package' | 'product',
    client_id: 0,
    item_id: 0,
    itemName: '',
    clientName: '',
    price: 0,
    quantity: 1,
    notes: '',
    payment_method: 'dinheiro'
  });

  const [clientComboboxOpen, setClientComboboxOpen] = useState(false);
  const [itemComboboxOpen, setItemComboboxOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setFormData({
        type: 'service',
        client_id: 0,
        item_id: 0,
        itemName: '',
        clientName: '',
        price: 0,
        quantity: 1,
        notes: '',
        payment_method: 'dinheiro'
      });
    }
  }, [open]);

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

    onSave(formData);
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
    
    if (formData.type === 'service') {
      const service = services.find(s => s.id === id);
      if (service) {
        setFormData(prev => ({
          ...prev,
          item_id: id,
          itemName: service.name,
          price: service.price
        }));
      }
    } else if (formData.type === 'package') {
      const pkg = packages.find(p => p.id === id);
      if (pkg) {
        setFormData(prev => ({
          ...prev,
          item_id: id,
          itemName: pkg.name,
          price: pkg.price
        }));
      }
    } else {
      const product = products.find(p => p.id === id);
      if (product) {
        setFormData(prev => ({
          ...prev,
          item_id: id,
          itemName: product.name,
          price: product.costPrice
        }));
      }
    }
    setItemComboboxOpen(false);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cartao': return <CreditCard className="h-4 w-4" />;
      case 'pix': return <QrCode className="h-4 w-4" />;
      case 'dinheiro':
      default: return <Banknote className="h-4 w-4" />;
    }
  };

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'cartao': return 'Cartão';
      case 'pix': return 'PIX';
      case 'dinheiro':
      default: return 'Dinheiro';
    }
  };

  const getItemOptions = () => {
    switch (formData.type) {
      case 'service': return services;
      case 'package': return packages;
      case 'product': return products;
      default: return [];
    }
  };

  const getItemTypeName = () => {
    switch (formData.type) {
      case 'service': return 'procedimento';
      case 'package': return 'pacote';
      case 'product': return 'produto';
      default: return 'item';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-gradient-brand">
            Nova Venda
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo de venda */}
          <div className="space-y-2">
            <Label>Tipo de Venda *</Label>
            <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="service">Procedimento</SelectItem>
                <SelectItem value="package">Pacote</SelectItem>
                <SelectItem value="product">Produto</SelectItem>
              </SelectContent>
            </Select>
          </div>

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

          {/* Item */}
          <div className="space-y-2">
            <Label>{formData.type === 'service' ? 'Procedimento' : 
                   formData.type === 'package' ? 'Pacote' : 'Produto'} *</Label>
            <Popover open={itemComboboxOpen} onOpenChange={setItemComboboxOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={itemComboboxOpen} className="w-full justify-between">
                  {formData.item_id ? 
                    getItemOptions().find(item => item.id === formData.item_id)?.name
                    : `Selecione um ${getItemTypeName()}...`}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[450px] p-0">
                <Command>
                  <CommandInput placeholder={`Buscar ${getItemTypeName()}...`} />
                  <CommandEmpty>{`Nenhum ${getItemTypeName()} encontrado.`}</CommandEmpty>
                  <CommandGroup>
                    {getItemOptions().map((item) => (
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

          {/* Quantidade (apenas para produtos) */}
          {formData.type === 'product' && (
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade *</Label>
              <Input 
                id="quantity" 
                type="number" 
                min="1" 
                value={formData.quantity} 
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)} 
                required 
              />
            </div>
          )}

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

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea 
              id="notes" 
              value={formData.notes} 
              onChange={(e) => handleInputChange('notes', e.target.value)} 
              rows={3} 
              placeholder="Observações sobre a venda..."
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