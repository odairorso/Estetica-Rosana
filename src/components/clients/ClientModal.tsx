import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
<<<<<<< HEAD
import { Textarea } from "@/components/ui/textarea";
=======
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
import { Client } from "@/hooks/useClients";
import { useToast } from "@/hooks/use-toast";

interface ClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client | null;
  onSave: (clientData: any) => void;
  mode: 'create' | 'edit';
}

<<<<<<< HEAD
export function ClientModal({ open, onOpenChange, client, onSave, mode }: ClientModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: ''
    },
    avatar: null as string | null,
    activePackages: 0,
    nextAppointment: ''
  });

  useEffect(() => {
    if (client && mode === 'edit') {
      setFormData({
        name: client.name,
        email: client.email,
        phone: client.phone,
        cpf: client.cpf,
        address: {
          street: client.address?.street || '',
          number: client.address?.number || '',
          complement: client.address?.complement || '',
          neighborhood: client.address?.neighborhood || '',
          city: client.address?.city || '',
          state: client.address?.state || '',
          zipCode: client.address?.zipCode || ''
        },
        avatar: client.avatar,
        activePackages: client.activePackages,
        nextAppointment: client.nextAppointment || ''
      });
    } else if (mode === 'create') {
      setFormData({
        name: '',
        email: '',
        phone: '',
        cpf: '',
        address: {
          street: '',
          number: '',
          complement: '',
          neighborhood: '',
          city: '',
          state: '',
          zipCode: ''
        },
        avatar: null,
        activePackages: 0,
        nextAppointment: ''
      });
=======
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
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
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
<<<<<<< HEAD
      nextAppointment: formData.nextAppointment || null
=======
      next_appointment: formData.next_appointment || null,
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
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
<<<<<<< HEAD
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [addressField]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
=======
    setFormData(prev => ({ ...prev, [field]: value }));
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-gradient-brand">
            {mode === 'create' ? 'Novo Cliente' : 'Editar Cliente'}
          </DialogTitle>
        </DialogHeader>
        
<<<<<<< HEAD
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Digite o nome completo"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(11) 99999-9999"
                required
              />
=======
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo *</Label>
              <Input id="name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone *</Label>
              <Input id="phone" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} required />
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
<<<<<<< HEAD
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="cliente@email.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => handleInputChange('cpf', e.target.value)}
                placeholder="000.000.000-00"
                required
              />
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">Endereço</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="street">Rua/Avenida</Label>
                <Input
                  id="street"
                  value={formData.address.street}
                  onChange={(e) => handleInputChange('address.street', e.target.value)}
                  placeholder="Nome da rua"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="number">Número</Label>
                <Input
                  id="number"
                  value={formData.address.number}
                  onChange={(e) => handleInputChange('address.number', e.target.value)}
                  placeholder="123"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="complement">Complemento</Label>
                <Input
                  id="complement"
                  value={formData.address.complement}
                  onChange={(e) => handleInputChange('address.complement', e.target.value)}
                  placeholder="Apto, casa, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="neighborhood">Bairro</Label>
                <Input
                  id="neighborhood"
                  value={formData.address.neighborhood}
                  onChange={(e) => handleInputChange('address.neighborhood', e.target.value)}
                  placeholder="Nome do bairro"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={formData.address.city}
                  onChange={(e) => handleInputChange('address.city', e.target.value)}
                  placeholder="São Paulo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  value={formData.address.state}
                  onChange={(e) => handleInputChange('address.state', e.target.value)}
                  placeholder="SP"
                  maxLength={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">CEP</Label>
                <Input
                  id="zipCode"
                  value={formData.address.zipCode}
                  onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                  placeholder="00000-000"
                />
              </div>
=======
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
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
<<<<<<< HEAD
              <Label htmlFor="activePackages">Pacotes ativos</Label>
              <Input
                id="activePackages"
                type="number"
                min="0"
                value={formData.activePackages}
                onChange={(e) => handleInputChange('activePackages', parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nextAppointment">Próximo agendamento</Label>
              <Input
                id="nextAppointment"
                type="datetime-local"
                value={formData.nextAppointment}
                onChange={(e) => handleInputChange('nextAppointment', e.target.value)}
              />
=======
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
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
            </div>
          </div>

          <div className="flex gap-3 pt-4">
<<<<<<< HEAD
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
              {mode === 'create' ? 'Cadastrar' : 'Salvar'}
            </Button>
=======
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">Cancelar</Button>
            <Button type="submit" className="flex-1 bg-brand-gradient hover:opacity-90">{mode === 'create' ? 'Cadastrar' : 'Salvar'}</Button>
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}