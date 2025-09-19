import { Package, Clock, User, Calendar, AlertCircle, Edit, Trash2, MoreVertical, History } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Package as PackageType } from "@/hooks/usePackages";

interface PackageCardProps {
  package: PackageType;
  onEdit: (pkg: PackageType) => void;
  onDelete: (id: number) => void;
  onViewHistory: (pkg: PackageType) => void;
}

export function PackageCard({ package: pkg, onEdit, onDelete, onViewHistory }: PackageCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500/20 text-green-600";
      case "expiring": return "bg-yellow-500/20 text-yellow-600";
      case "completed": return "bg-gray-500/20 text-gray-600";
      case "expired": return "bg-red-500/20 text-red-600";
      default: return "bg-blue-500/20 text-blue-600";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active": return "Ativo";
      case "expiring": return "Vencendo";
      case "completed": return "Finalizado";
      case "expired": return "Expirado";
      default: return "Ativo";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  return (
    <GlassCard className="relative transition-all hover:scale-[1.02]">
      <div className="space-y-4">
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
                <History className="h-4 w-4 mr-2" />
                Ver Histórico
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(pkg)} className="cursor-pointer">
                <Edit className="h-4 w-4 mr-2" />
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

        {/* Header do pacote */}
        <div className="flex items-start justify-between pr-8">
          <div className="flex items-center gap-3 flex-1">
            <div className="rounded-full bg-brand-gradient p-2">
              <Package className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 cursor-pointer" onClick={() => onViewHistory(pkg)}>
              <h3 className="font-semibold text-foreground line-clamp-2 hover:text-brand-start transition-colors">
                {pkg.name}
              </h3>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between">
          <Badge className={getStatusColor(pkg.status)}>
            {getStatusText(pkg.status)}
          </Badge>
          {pkg.status === "expiring" && (
            <div className="flex items-center gap-1 text-yellow-600">
              <AlertCircle className="h-3 w-3" />
              <span className="text-xs">Vence em breve</span>
            </div>
          )}
        </div>

        {/* Informações do pacote */}
        <div className="space-y-3">

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total de Sessões</span>
            <span className="font-medium">{pkg.total_sessions}</span>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Início</span>
              </div>
              <div className="font-medium">{formatDate(pkg.created_at)}</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Validade</span>
              </div>
              <div className="font-medium">{formatDate(pkg.valid_until)}</div>
            </div>
          </div>

          {/* Valor */}
          <div className="pt-2 border-t border-border/50">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Valor total</span>
              <span className="font-semibold text-brand-start">
                R$ {(typeof pkg.price === "number" ? pkg.price : Number(pkg.price || 0)).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}