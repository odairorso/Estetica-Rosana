import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    clientId: 0,
    clientName: '',
    totalSessions: 1,
    price: 0,
    validUntil: ''
  });

  useEffect(() => {
    if (pkg && mode === 'edit') {
      setFormData({
        name: pkg.name,
        description: pkg.description,
        clientId: pkg.clientId,
        clientName: pkg.clientName,
        totalSessions: pkg.totalSessions,
        price: pkg.price,
        validUntil: pkg.validUntil
      });
    } else if (mode === 'create') {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 6);
      setFormData({
        name: '',
        description: '',
        clientId: 0,
        clientName: '',
        totalSessions: 1,
        price: 0,
        validUntil: futureDate.toISOString().split('T')[0]
      });
    }
  }, [pkg, mode, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.clientId || !formData.totalSessions || !formData.price) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

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
    onOpenChange(false);
    
    toast({
      title: mode === 'create' ? "Pacote criado!" : "Pacote atualizado!",
      description: mode === 'create' 
        ? `Pacote "${formData.name}" foi criado para ${selectedClient.name}.`
        : `O pacote "${formData.name}" foi atualizado.`,
    });
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClientChange = (clientId: string) => {
    const id = parseInt(clientId);
    const client = clients.find(c => c.id === id);
    setFormData(prev => ({ 
      ...prev, 
      clientId: id,
      clientName: client?.name || ''
    }));
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
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Ex: Pacote Limpeza de Pele Premium"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
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
            </div>
          </div>

          <div className="space-y-2">
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
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}