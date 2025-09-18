import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
<<<<<<< HEAD
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package } from "@/hooks/usePackages";
import { useClients } from "@/hooks/useClients";
import { useToast } from "@/hooks/use-toast";
import { dateToString } from "@/lib/utils";
=======
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Package } from "@/hooks/usePackages";
import { useClients } from "@/hooks/useClients";
import { useToast } from "@/hooks/use-toast";
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522

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
<<<<<<< HEAD
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    clientId: 0,
    clientName: '',
    totalSessions: 1,
    price: 0,
    validUntil: ''
=======
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
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
  });

  useEffect(() => {
    if (pkg && mode === 'edit') {
      setFormData({
        name: pkg.name,
        description: pkg.description,
<<<<<<< HEAD
        clientId: pkg.clientId,
        clientName: pkg.clientName,
        totalSessions: pkg.totalSessions,
        price: pkg.price,
        validUntil: pkg.validUntil
=======
        client_id: pkg.client_id,
        total_sessions: pkg.total_sessions,
        price: pkg.price,
        gross_price: pkg.price,
        discount: 0,
        valid_until: pkg.valid_until
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
      });
    } else if (mode === 'create') {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 6);
      setFormData({
        name: '',
        description: '',
<<<<<<< HEAD
        clientId: 0,
        clientName: '',
        totalSessions: 1,
        price: 0,
        validUntil: dateToString(futureDate)
=======
        client_id: 0,
        total_sessions: 1,
        gross_price: 0,
        discount: 0,
        price: 0,
        valid_until: futureDate.toISOString().split('T')[0]
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
      });
    }
  }, [pkg, mode, open]);

<<<<<<< HEAD
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.clientId || !formData.totalSessions || !formData.price) {
=======
  useEffect(() => {
    const gross = Number(formData.gross_price) || 0;
    const disc = Number(formData.discount) || 0;
    const finalPrice = Math.max(0, gross - disc);
    handleInputChange('price', finalPrice);
  }, [formData.gross_price, formData.discount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.client_id || !formData.total_sessions) {
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

<<<<<<< HEAD
    const selectedClient = clients.find(c => c.id === formData.clientId);
    if (!selectedClient) {
      toast({
        title: "Erro",
        description: "Cliente selecionado não encontrado.",
        variant: "destructive",
      });
      return;
    }

    const packageData = {
      ...formData,
      clientName: selectedClient.name,
    };

    onSave(packageData);
=======
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
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
    onOpenChange(false);
    
    toast({
      title: mode === 'create' ? "Pacote criado!" : "Pacote atualizado!",
<<<<<<< HEAD
      description: mode === 'create' 
        ? `Pacote "${formData.name}" foi criado para ${selectedClient.name}.`
        : `O pacote "${formData.name}" foi atualizado.`,
=======
      description: `Pacote "${formData.name}" foi salvo para ${selectedClient.name}.`,
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
    });
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

<<<<<<< HEAD
  const handleClientChange = (clientId: string) => {
    const id = parseInt(clientId);
    const client = clients.find(c => c.id === id);
    setFormData(prev => ({ 
      ...prev, 
      clientId: id,
      clientName: client?.name || ''
    }));
  };

=======
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
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
<<<<<<< HEAD
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Ex: Pacote Limpeza de Pele Premium"
              required
            />
=======
            <Input id="name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} required />
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
<<<<<<< HEAD
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descreva os serviços incluídos no pacote..."
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="client">Cliente *</Label>
            <Select value={formData.clientId.toString()} onValueChange={handleClientChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id.toString()}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
=======
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
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
<<<<<<< HEAD
              <Label htmlFor="totalSessions">Total de sessões *</Label>
              <Input
                id="totalSessions"
                type="number"
                min="1"
                value={formData.totalSessions}
                onChange={(e) => handleInputChange('totalSessions', parseInt(e.target.value) || 1)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Valor total (R$) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                placeholder="0,00"
                required
              />
=======
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
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
            </div>
          </div>

          <div className="space-y-2">
<<<<<<< HEAD
            <Label htmlFor="validUntil">Válido até *</Label>
            <Input
              id="validUntil"
              type="date"
              value={formData.validUntil}
              onChange={(e) => handleInputChange('validUntil', e.target.value)}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              className="flex-1 bg-brand-gradient hover:opacity-90"
            >
              {mode === 'create' ? 'Criar Pacote' : 'Salvar'}
            </Button>
=======
            <Label>Valor Final (R$)</Label>
            <Input value={formData.price.toFixed(2)} readOnly disabled className="font-bold text-lg text-green-600" />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">Cancelar</Button>
            <Button type="submit" className="flex-1 bg-brand-gradient hover:opacity-90">{mode === 'create' ? 'Criar Pacote' : 'Salvar'}</Button>
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}