import { Package, AlertTriangle, Edit, Trash2, MoreVertical } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Product } from "@/hooks/useInventory";

interface ProductCardProps {
  product: Product;
  status: "ok" | "low" | "critical" | "empty";
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
}

export function ProductCard({ product, status, onEdit, onDelete }: ProductCardProps) {
  const getStatusInfo = () => {
    switch (status) {
      case "critical":
        return { text: "Crítico", color: "bg-red-500/20 text-red-600" };
      case "low":
        return { text: "Baixo", color: "bg-yellow-500/20 text-yellow-600" };
      case "empty":
        return { text: "Esgotado", color: "bg-gray-500/20 text-gray-600" };
      case "ok":
      default:
        return { text: "OK", color: "bg-green-500/20 text-green-600" };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <GlassCard className="relative p-4">
      <div className="absolute top-4 right-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(product)} className="cursor-pointer">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(product.id)} className="cursor-pointer text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-start gap-4">
        <div className="p-2 rounded-full bg-brand-gradient mt-1">
          <Package className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground pr-8">{product.name}</h3>
          <p className="text-sm text-muted-foreground">{product.category}</p>
          <div className="mt-3 flex items-end justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Em estoque</p>
              <p className="text-2xl font-bold text-gradient-brand">{product.quantity}</p>
              <p className="text-xs text-muted-foreground">Mínimo: {product.minStock}</p>
            </div>
            <Badge className={statusInfo.color}>{statusInfo.text}</Badge>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}