import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Check, ChevronsUpDown, CreditCard, QrCode, Banknote, Sparkles, Package, Box } from "lucide-react";
import { cn } from "@/lib/utils";
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

  const getItemTypeIcon = () => {
    switch (formData.type) {
      case 'service': return <Sparkles className="h-4 w-4" />;
      case 'package': return <Package className="h-4 w-4" />;
      case 'product': return <Box className="h-4 w-4" />;
      default: return <Box className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-gradient-brand flex items-center gap-2">
            <div className="rounded-full bg-brand-gradient p-2">
              {getItemTypeIcon()}
            </div>
            Nova Venda
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo de venda */}
          <div className="space-y-2">
            <Label>Tipo de Venda</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={formData.type === 'service' ? "default" : "outline"}
                className={formData.type === 'service' ? "bg-brand-gradient" : ""}
                onClick={() => handleInputChange('type', 'service')}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Procedimento
              </Button>
              <Button
                type="button"
                variant={formData.type === 'package' ? "default" : "outline"}
                className={formData.type === 'package' ? "bg-brand-gradient" : ""}
                onClick={() => handleInputChange('type', 'package')}
              >
                <Package className="h-4 w-4 mr-2" />
                Pacote
              </Button>
              <Button
                type="button"
                variant={formData.type === 'product' ? "default" : "outline"}
                className={formData.type === 'product' ? "bg-brand-gradient" : ""}
                onClick={() => handleInputChange('type', 'product')}
              >
                <Box className="h-4 w-4 mr-2" />
                Produto
              </Button>
            </div>
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
              <PopoverContent className="w-full p-0">
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
              <PopoverContent className="w-full p-0">
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
            <Label htmlFor="price">Valor (R$) *</Label>
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
            <Label>Forma de Pagamento</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={formData.payment_method === 'dinheiro' ? "default" : "outline"}
                className={formData.payment_method === 'dinheiro' ? "bg-yellow-500" : ""}
                onClick={() => handleInputChange('payment_method', 'dinheiro')}
              >
                <Banknote className="h-4 w-4 mr-2" />
                Dinheiro
              </Button>
              <Button
                type="button"
                variant={formData.payment_method === 'cartao' ? "default" : "outline"}
                className={formData.payment_method === 'cartao' ? "bg-blue-500" : ""}
                onClick={() => handleInputChange('payment_method', 'cartao')}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Cartão
              </Button>
              <Button
                type="button"
                variant={formData.payment_method === 'pix' ? "default" : "outline"}
                className={formData.payment_method === 'pix' ? "bg-green-500" : ""}
                onClick={() => handleInputChange('payment_method', 'pix')}
              >
                <QrCode className="h-4 w-4 mr-2" />
                PIX
              </Button>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea 
              id="notes" 
              value={formData.notes} 
              onChange={(e) => handleInputChange('notes', e.target.value)} 
              rows={2} 
              placeholder="Observações sobre a venda..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 bg-brand-gradient hover:opacity-90">
              Finalizar Venda
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}