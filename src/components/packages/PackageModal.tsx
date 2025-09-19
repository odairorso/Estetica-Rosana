import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Package } from "@/hooks/usePackages";
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
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    total_sessions: 1,
    gross_price: 0,
    discount: 0,
    price: 0,
    valid_until: ''
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (pkg && mode === 'edit') {
      setFormData({
        name: pkg.name,
        description: pkg.description,
        total_sessions: pkg.total_sessions,
        price: pkg.price,
        gross_price: pkg.price, // On edit, we can assume gross_price was the final price
        discount: 0,
        valid_until: pkg.valid_until
      });
    } else if (mode === 'create') {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 6);
      setFormData({
        name: '',
        description: '',
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
    // Only update if the price is different to avoid re-renders
    if (finalPrice !== formData.price) {
        handleInputChange('price', finalPrice);
    }
  }, [formData.gross_price, formData.discount, formData.price]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.total_sessions) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const dataToSave = {
      name: formData.name,
      description: formData.description,
      total_sessions: formData.total_sessions,
      price: formData.price,
      valid_until: formData.valid_until,
      status: 'active' // Pacotes genéricos são sempre ativos
    };

    onSave(dataToSave);
    onOpenChange(false);
    
    toast({
      title: mode === 'create' ? "Pacote criado!" : "Pacote atualizado!",
      description: `Pacote "${formData.name}" foi salvo como modelo genérico.`,
    });
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
            <Input id="name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} required placeholder="Ex: Pacote Limpeza de Pele Premium" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} rows={3} placeholder="Descreva os serviços incluídos no pacote..." />
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
              <Input id="gross_price" type="number" min="0" step="0.01" value={formData.gross_price} onChange={(e) => handleInputChange('gross_price', parseFloat(e.target.value) || 0)} placeholder="0,00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount">Desconto (R$)</Label>
              <Input id="discount" type="number" min="0" step="0.01" value={formData.discount} onChange={(e) => handleInputChange('discount', parseFloat(e.target.value) || 0)} placeholder="0,00" />
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
