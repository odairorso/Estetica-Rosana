<<<<<<< HEAD
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
=======
import { Package as PackageType } from "@/hooks/usePackages";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash2 } from "lucide-react";
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522

interface PackageCardProps {
  package: PackageType;
  onEdit: (pkg: PackageType) => void;
  onDelete: (id: number) => void;
  onViewHistory: (pkg: PackageType) => void;
}

export function PackageCard({ package: pkg, onEdit, onDelete, onViewHistory }: PackageCardProps) {
<<<<<<< HEAD
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
    return new Date(dateString).toLocaleDateString('pt-BR');
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
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <User className="h-3 w-3" />
                {pkg.clientName}
              </p>
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
          {/* Progresso das sessões */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Sessões</span>
              <span className="font-medium">
                {pkg.usedSessions}/{pkg.totalSessions}
              </span>
            </div>
            <Progress 
              value={(pkg.usedSessions / pkg.totalSessions) * 100} 
              className="h-2"
            />
            <div className="text-xs text-muted-foreground">
              {pkg.remainingSessions} sessões restantes
            </div>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Início</span>
              </div>
              <div className="font-medium">{formatDate(pkg.startDate)}</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Validade</span>
              </div>
              <div className="font-medium">{formatDate(pkg.expiryDate)}</div>
            </div>
          </div>

          {/* Valor */}
          <div className="pt-2 border-t border-border/50">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Valor total</span>
              <span className="font-semibold text-brand-start">
                R$ {pkg.price?.toFixed(2) || '0.00'}
              </span>
            </div>
          </div>
        </div>

        {/* Observações */}
        {pkg.notes && (
          <div className="pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground line-clamp-2">
              {pkg.notes}
            </p>
          </div>
        )}
=======
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
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
      </div>
    </GlassCard>
  );
}