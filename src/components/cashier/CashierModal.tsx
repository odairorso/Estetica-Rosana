import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Check, ChevronsUpDown, CreditCard, QrCode, Banknote, Sparkles, Package, Box, Plus, Minus, Trash2, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useClients } from "@/hooks/useClients";
import { useServices } from "@/hooks/useServices";
import { usePackages } from "@/hooks/usePackages";
import { useInventory } from "@/hooks/useInventory";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface CartItem {
  id: number;
  type: 'service' | 'package' | 'product';
  item_id: number;
  itemName: string;
  price: number;
  quantity: number;
}

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
    client_id: 0,
    clientName: '',
    items: [] as CartItem[],
    payment_method: 'dinheiro',
    notes: ''
  });

  const [currentItem, setCurrentItem] = useState({
    type: 'service' as 'service' | 'package' | 'product',
    item_id: 0,
    itemName: '',
    price: 0,
    quantity: 1
  });

  const [clientComboboxOpen, setClientComboboxOpen] = useState(false);
  const [itemComboboxOpen, setItemComboboxOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setFormData({
        client_id: 0,
        clientName: '',
        items: [],
        payment_method: 'dinheiro',
        notes: ''
      });
      setCurrentItem({
        type: 'service',
        item_id: 0,
        itemName: '',
        price: 0,
        quantity: 1
      });
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.client_id || formData.items.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione um cliente e adicione pelo menos um item ao carrinho.",
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
    
    if (currentItem.type === 'service') {
      const service = services.find(s => s.id === id);
      if (service) {
        setCurrentItem(prev => ({
          ...prev,
          item_id: id,
          itemName: service.name,
          price: service.price
        }));
      }
    } else if (currentItem.type === 'package') {
      const pkg = packages.find(p => p.id === id);
      if (pkg) {
        setCurrentItem(prev => ({
          ...prev,
          item_id: id,
          itemName: pkg.name,
          price: pkg.price
        }));
      }
    } else {
      const product = products.find(p => p.id === id);
      if (product) {
        setCurrentItem(prev => ({
          ...prev,
          item_id: id,
          itemName: product.name,
          price: product.costPrice
        }));
      }
    }
    setItemComboboxOpen(false);
  };

  const addToCart = () => {
    if (!currentItem.item_id || currentItem.price <= 0) {
      toast({
        title: "Erro",
        description: "Selecione um item e defina um preço válido.",
        variant: "destructive",
      });
      return;
    }

    const newItem: CartItem = {
      id: Math.max(0, ...formData.items.map(i => i.id)) + 1,
      type: currentItem.type,
      item_id: currentItem.item_id,
      itemName: currentItem.itemName,
      price: currentItem.price,
      quantity: currentItem.quantity
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));

    // Reset current item
    setCurrentItem({
      type: currentItem.type,
      item_id: 0,
      itemName: '',
      price: 0,
      quantity: 1
    });

    toast({
      title: "Item adicionado!",
      description: `${currentItem.itemName} foi adicionado ao carrinho.`,
    });
  };

  const removeFromCart = (itemId: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  const updateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    }));
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
    switch (currentItem.type) {
      case 'service': return services;
      case 'package': return packages;
      case 'product': return products;
      default: return [];
    }
  };

  const getItemTypeName = () => {
    switch (currentItem.type) {
      case 'service': return 'procedimento';
      case 'package': return 'pacote';
      case 'product': return 'produto';
      default: return 'item';
    }
  };

  const getItemTypeIcon = () => {
    switch (currentItem.type) {
      case 'service': return <Sparkles className="h-4 w-4" />;
      case 'package': return <Package className="h-4 w-4" />;
      case 'product': return <Box className="h-4 w-4" />;
      default: return <Box className="h-4 w-4" />;
    }
  };

  const total = formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-gradient-brand flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Nova Venda com Carrinho
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
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

          {/* Adicionar itens ao carrinho */}
          <div className="space-y-4">
            <Label>Adicionar Itens ao Carrinho</Label>
            
            {/* Tipo de item */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={currentItem.type === 'service' ? "default" : "outline"}
                className={currentItem.type === 'service' ? "bg-brand-gradient" : ""}
                onClick={() => setCurrentItem(prev => ({ ...prev, type: 'service', item_id: 0, itemName: '', price: 0 }))}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Procedimento
              </Button>
              <Button
                type="button"
                variant={currentItem.type === 'package' ? "default" : "outline"}
                className={currentItem.type === 'package' ? "bg-brand-gradient" : ""}
                onClick={() => setCurrentItem(prev => ({ ...prev, type: 'package', item_id: 0, itemName: '', price: 0 }))}
              >
                <Package className="h-4 w-4 mr-2" />
                Pacote
              </Button>
              <Button
                type="button"
                variant={currentItem.type === 'product' ? "default" : "outline"}
                className={currentItem.type === 'product' ? "bg-brand-gradient" : ""}
                onClick={() => setCurrentItem(prev => ({ ...prev, type: 'product', item_id: 0, itemName: '', price: 0 }))}
              >
                <Box className="h-4 w-4 mr-2" />
                Produto
              </Button>
            </div>

            {/* Seleção do item */}
            <div className="space-y-2">
              <Label>{getItemTypeName()} *</Label>
              <Popover open={itemComboboxOpen} onOpenChange={setItemComboboxOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" aria-expanded={itemComboboxOpen} className="w-full justify-between">
                    {currentItem.item_id ? 
                      getItemOptions().find(item => item.id === currentItem.item_id)?.name
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
                          <Check className={cn("mr-2 h-4 w-4", currentItem.item_id === item.id ? "opacity-100" : "opacity-0")} />
                          {item.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Quantidade e Preço */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantidade</Label>
                <Input 
                  id="quantity" 
                  type="number" 
                  min="1" 
                  value={currentItem.quantity} 
                  onChange={(e) => setCurrentItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Preço (R$) *</Label>
                <Input 
                  id="price" 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  value={currentItem.price} 
                  onChange={(e) => setCurrentItem(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))} 
                  required 
                />
              </div>
            </div>

            {/* Botão para adicionar ao carrinho */}
            <Button 
              type="button" 
              onClick={addToCart}
              className="w-full bg-brand-gradient hover:opacity-90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar ao Carrinho
            </Button>
          </div>

          {/* Carrinho */}
          {formData.items.length > 0 && (
            <div className="space-y-3">
              <Label>Carrinho ({formData.items.length} itens)</Label>
              <div className="border rounded-lg divide-y">
                {formData.items.map((item) => (
                  <div key={item.id} className="p-3 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {getItemTypeIcon()}
                        <span className="font-medium">{item.itemName}</span>
                        <Badge variant="outline" className="text-xs">
                          {getItemTypeName()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        R$ {item.price.toFixed(2).replace('.', ',')} cada
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <span className="font-medium text-green-600 min-w-[80px] text-right">
                        R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                      </span>
                      
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {/* Total */}
                <div className="p-3 bg-muted/50">
                  <div className="flex items-center justify-between font-semibold">
                    <span>Total:</span>
                    <span className="text-green-600 text-lg">
                      R$ {total.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Forma de Pagamento */}
          <div className="space-y-2">
            <Label>Forma de Pagamento *</Label>
            <Select 
              value={formData.payment_method} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, payment_method: value }))}
            >
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
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} 
              rows={3} 
              placeholder="Observações sobre a venda..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-brand-gradient hover:opacity-90"
              disabled={formData.items.length === 0}
            >
              Finalizar Venda
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
