import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Product } from "@/hooks/useInventory";
import { useToast } from "@/hooks/use-toast";

interface ProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSave: (productData: any) => void;
  mode: 'create' | 'edit';
}

export function ProductModal({ open, onOpenChange, product, onSave, mode }: ProductModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: 0,
    minStock: 1,
    costPrice: 0,
    supplier: ''
  });

  useEffect(() => {
    if (product && mode === 'edit') {
      setFormData({
        name: product.name,
        category: product.category,
        quantity: product.quantity,
        minStock: product.minStock,
        costPrice: product.costPrice,
        supplier: product.supplier || ''
      });
    } else if (mode === 'create') {
      setFormData({
        name: '',
        category: '',
        quantity: 0,
        minStock: 1,
        costPrice: 0,
        supplier: ''
      });
    }
  }, [product, mode, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.category.trim()) {
      toast({
        title: "Erro",
        description: "Nome e categoria são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    onSave(formData);
    onOpenChange(false);
    
    toast({
      title: mode === 'create' ? "Produto cadastrado!" : "Produto atualizado!",
      description: `O produto "${formData.name}" foi salvo com sucesso.`,
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
            {mode === 'create' ? 'Novo Produto' : 'Editar Produto'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Produto *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Ex: Ácido Hialurônico (Seringa)"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria *</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              placeholder="Ex: Preenchedores"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade em Estoque</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minStock">Estoque Mínimo</Label>
              <Input
                id="minStock"
                type="number"
                min="0"
                value={formData.minStock}
                onChange={(e) => handleInputChange('minStock', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="costPrice">Preço de Custo (R$)</Label>
              <Input
                id="costPrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.costPrice}
                onChange={(e) => handleInputChange('costPrice', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier">Fornecedor</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => handleInputChange('supplier', e.target.value)}
                placeholder="Nome do fornecedor"
              />
            </div>
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
              {mode === 'create' ? 'Cadastrar' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}