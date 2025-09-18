import { Package as PackageType } from "@/hooks/usePackages";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash2 } from "lucide-react";

interface PackageCardProps {
  package: PackageType;
  onEdit: (pkg: PackageType) => void;
  onDelete: (id: number) => void;
  onViewHistory: (pkg: PackageType) => void;
}

export function PackageCard({ package: pkg, onEdit, onDelete, onViewHistory }: PackageCardProps) {
  // Formatar preço em reais
  const formatPrice = (value: number) =>
    `R$ ${value.toFixed(2).replace(".", ",")}`;

  return (
    <GlassCard className="relative p-4 hover:scale-[1.02] transition-transform">
      {/* Menu de ações */}
      <div className="absolute top-4 right-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onViewHistory(pkg)} className="cursor-pointer text-blue-600">
              Histórico
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(pkg)} className="cursor-pointer">
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(pkg.id)}
              className="cursor-pointer text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Nome do pacote */}
      <h3 className="font-semibold text-lg text-foreground mb-2 line-clamp-1">
        {pkg.name}
      </h3>

      {/* Valor */}
      <p className="text-sm text-muted-foreground mb-1">
        Valor: <span className="font-medium text-green-600">{formatPrice(pkg.price)}</span>
      </p>

      {/* Quantidade de sessões */}
      <p className="text-sm text-muted-foreground">
        Sessões: <span className="font-medium">{pkg.total_sessions}</span>
      </p>

      {/* Badge opcional de status (mantido para referência visual) */}
      <div className="mt-3">
        <Badge variant="secondary">{pkg.status}</Badge>
      </div>
    </GlassCard>
  );
}