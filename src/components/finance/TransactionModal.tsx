import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
<<<<<<< HEAD
import { getCurrentDateString } from "@/lib/utils";
=======
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522

interface TransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (transactionData: any) => void;
}

export function TransactionModal({ open, onOpenChange, onSave }: TransactionModalProps) {
  const { toast } = useToast();
<<<<<<< HEAD

=======
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    description: '',
    amount: 0,
<<<<<<< HEAD
    date: getCurrentDateString(),
=======
    date: new Date().toISOString().split('T')[0],
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
    category: ''
  });

  useEffect(() => {
    if (open) {
      setFormData({
        type: 'expense',
        description: '',
        amount: 0,
<<<<<<< HEAD
        date: getCurrentDateString(),
=======
        date: new Date().toISOString().split('T')[0],
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
        category: ''
      });
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || formData.amount <= 0 || !formData.category) {
      toast({ title: "Erro", description: "Preencha todos os campos.", variant: "destructive" });
      return;
    }
    onSave(formData);
    onOpenChange(false);
    toast({ title: "Sucesso!", description: "Transação registrada." });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Transação Manual</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={formData.type} onValueChange={(v) => setFormData(p => ({...p, type: v as any}))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Despesa</SelectItem>
                <SelectItem value="income">Receita</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input id="description" value={formData.description} onChange={e => setFormData(p => ({...p, description: e.target.value}))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Valor (R$)</Label>
            <Input id="amount" type="number" value={formData.amount} onChange={e => setFormData(p => ({...p, amount: parseFloat(e.target.value) || 0}))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Input id="category" value={formData.category} onChange={e => setFormData(p => ({...p, category: e.target.value}))} placeholder="Ex: Aluguel, Material" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input id="date" type="date" value={formData.date} onChange={e => setFormData(p => ({...p, date: e.target.value}))} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}