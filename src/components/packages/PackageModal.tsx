import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Package } from "@/hooks/usePackages";
import { useClients } from "@/hooks/useClients";
import { useToast } from "@/hooks/use-toast";

interface PackageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  package?: Package | null;
  onSave: (packageData: any) => void;
  mode: 'create' | 'edit';
}

export function PackageModal({ open, onOpenChange, package: pkg, onSave, mode }: PackageModalProps) {
  const { toast } = useToast();
  const { clients } = useClients();
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    client_id: 0,
    total_sessions: 1,
    gross_price: 0,
    discount: 0,
    price: 0,
    valid_until: ''
  });

  useEffect(() => {
    if (pkg && mode === 'edit') {
      setFormData({
        name: pkg.name,
        description: pkg.description,
        client_id: pkg.client_id,
        total_sessions: pkg.total_sessions,
        price: pkg.price,
        gross_price: pkg.price,
        discount: 0,
        valid_until: pkg.valid_until
      });
    } else if (mode === 'create') {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 6);
      setFormData({
        name: '',
        description: '',
        client_id: 0,
        total_sessions: 1,
        gross_price: 0,
        discount: 0,
        price: 0,
        valid_until: futureDate.toISOString().split('T')[0]
      });
    }
  }, [pkg, mode, open]);

  useEffect(() => {
    const gross = Number(formData.gross_price) || 0;
    const disc = Number(formData.discount) || 0;
    const finalPrice = Math.max(0, gross - disc);
    handleInputChange('price', finalPrice);
  }, [formData.gross_price, formData.discount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.client_id || !formData.total_sessions) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const selectedClient = clients.find(c => c.id === formData.client_id);
    if (!selectedClient) {
      toast({ title: "Erro", description: "Cliente selecionado não encontrado.", variant: "destructive" });
      return;
    }

    const dataToSave = {
      name: formData.name,
      description: formData.description,
      client_id: formData.client_id,
      total_sessions: formData.total_sessions,
      price: formData.price,
      valid_until: formData.valid_until,
    };

    onSave(dataToSave);
    onOpenChange(false);
    
    toast({
      title: mode === 'create' ? "Pacote criado!" : "Pacote atualizado!",
      description: `Pacote "${formData.name}" foi salvo para ${selectedClient.name}.`,
    });
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-gradient-brand">
            {mode === 'create' ? 'Novo Pacote' : 'Editar Pacote'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do pacote *</Label>
            <Input id="name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} rows={3} />
          </div>
          
          <div className="space-y-2">
            <Label>Cliente *</Label>
            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={comboboxOpen} className="w-full justify-between">
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
                        onSelect={() => {
                          handleInputChange('client_id', client.id);
                          setComboboxOpen(false);
                        }}
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="total_sessions">Total de sessões *</Label>
              <Input id="total_sessions" type="number" min="1" value={formData.total_sessions} onChange={(e) => handleInputChange('total_sessions', parseInt(e.target.value) || 1)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="valid_until">Válido até *</Label>
              <Input id="valid_until" type="date" value={formData.valid_until} onChange={(e) => handleInputChange('valid_until', e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gross_price">Valor Bruto (R$)</Label>
              <Input id="gross_price" type="number" min="0" step="0.01" value={formData.gross_price} onChange={(e) => handleInputChange('gross_price', parseFloat(e.target.value) || 0)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount">Desconto (R$)</Label>
              <Input id="discount" type="number" min="0" step="0.01" value={formData.discount} onChange={(e) => handleInputChange('discount', parseFloat(e.target.value) || 0)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Valor Final (R$)</Label>
            <Input value={formData.price.toFixed(2)} readOnly disabled className="font-bold text-lg text-green-600" />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">Cancelar</Button>
            <Button type="submit" className="flex-1 bg-brand-gradient hover:opacity-90">{mode === 'create' ? 'Criar Pacote' : 'Salvar'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}