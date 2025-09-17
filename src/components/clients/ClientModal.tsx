import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Client } from "@/hooks/useClients";
import { useToast } from "@/hooks/use-toast";

interface ClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client | null;
  onSave: (clientData: any) => void;
  mode: 'create' | 'edit';
}

const getInitialFormData = () => ({
  name: '',
  email: '',
  phone: '',
  cpf: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  zip_code: '',
  avatar: null as string | null,
  active_packages: 0,
  next_appointment: '',
  total_visits: 0,
});

export function ClientModal({ open, onOpenChange, client, onSave, mode }: ClientModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState(getInitialFormData());

  useEffect(() => {
    if (open) {
      if (client && mode === 'edit') {
        setFormData({
          name: client.name || '',
          email: client.email || '',
          phone: client.phone || '',
          cpf: client.cpf || '',
          street: client.street || '',
          number: client.number || '',
          complement: client.complement || '',
          neighborhood: client.neighborhood || '',
          city: client.city || '',
          state: client.state || '',
          zip_code: client.zip_code || '',
          avatar: client.avatar || null,
          active_packages: client.active_packages || 0,
          next_appointment: client.next_appointment || '',
          total_visits: client.total_visits || 0,
        });
      } else {
        setFormData(getInitialFormData());
      }
    }
  }, [client, mode, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.cpf.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const clientData = {
      ...formData,
      next_appointment: formData.next_appointment || null,
    };

    onSave(clientData);
    onOpenChange(false);
    
    toast({
      title: mode === 'create' ? "Cliente cadastrado!" : "Cliente atualizado!",
      description: mode === 'create' 
        ? `${formData.name} foi adicionado à sua base de clientes.`
        : `As informações de ${formData.name} foram atualizadas.`,
    });
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-gradient-brand">
            {mode === 'create' ? 'Novo Cliente' : 'Editar Cliente'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo *</Label>
              <Input id="name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone *</Label>
              <Input id="phone" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF *</Label>
              <Input id="cpf" value={formData.cpf} onChange={(e) => handleInputChange('cpf', e.target.value)} required />
            </div>
          </div>

          <h3 className="text-sm font-medium text-foreground pt-2">Endereço</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="street">Rua/Avenida</Label>
              <Input id="street" value={formData.street} onChange={(e) => handleInputChange('street', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="number">Número</Label>
              <Input id="number" value={formData.number} onChange={(e) => handleInputChange('number', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="complement">Complemento</Label>
              <Input id="complement" value={formData.complement} onChange={(e) => handleInputChange('complement', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="neighborhood">Bairro</Label>
              <Input id="neighborhood" value={formData.neighborhood} onChange={(e) => handleInputChange('neighborhood', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input id="city" value={formData.city} onChange={(e) => handleInputChange('city', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">Estado</Label>
              <Input id="state" value={formData.state} onChange={(e) => handleInputChange('state', e.target.value)} maxLength={2} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip_code">CEP</Label>
              <Input id="zip_code" value={formData.zip_code} onChange={(e) => handleInputChange('zip_code', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="active_packages">Pacotes ativos</Label>
              <Input id="active_packages" type="number" min="0" value={formData.active_packages} onChange={(e) => handleInputChange('active_packages', parseInt(e.target.value) || 0)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="next_appointment">Próximo agendamento</Label>
              <Input id="next_appointment" type="datetime-local" value={formData.next_appointment} onChange={(e) => handleInputChange('next_appointment', e.target.value)} />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">Cancelar</Button>
            <Button type="submit" className="flex-1 bg-brand-gradient hover:opacity-90">{mode === 'create' ? 'Cadastrar' : 'Salvar'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}