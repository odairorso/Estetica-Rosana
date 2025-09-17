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
              <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                <History className="h-3 w-3" />
                {(pkg.session_history || []).length} sessões registradas - clique para ver histórico
              </p>
            </div>
          </div>
        </div>

        {/* Status badge */}
        <div className="flex justify-end">
          <Badge className={getStatusColor(pkg.status)}>
            {getStatusText(pkg.status)}
          </Badge>
        </div>

        {/* Descrição */}
        {pkg.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {pkg.description}
          </p>
        )}

        {/* Progresso das sessões */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Sessões utilizadas</span>
            <span className="font-medium">
              {pkg.used_sessions}/{pkg.total_sessions}
            </span>
          </div>
          <Progress 
            value={(pkg.used_sessions / pkg.total_sessions) * 100} 
            className="h-2"
          />
          <div className="text-center">
            <span className="text-lg font-bold text-brand-start">
              {pkg.remaining_sessions}
            </span>
            <span className="text-sm text-muted-foreground ml-1">
              sessões restantes
            </span>
          </div>
        </div>

        {/* Informações adicionais */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Valor:</span>
            <span className="font-semibold text-green-600">
              R$ {pkg.price.toFixed(2).replace('.', ',')}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Última sessão:</span>
            <span>{formatDate(pkg.last_used)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Válido até:</span>
            <span className={`flex items-center gap-1 ${
              pkg.status === "expiring" ? "text-yellow-600" : ""
            }`}>
              {pkg.status === "expiring" && <AlertCircle className="h-3 w-3" />}
              {formatDate(pkg.valid_until)}
            </span>
          </div>
        </div>

        {/* Alertas */}
        {pkg.status === "expiring" && (
          <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3 text-sm">
            <div className="flex items-center gap-2 text-yellow-600">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Pacote vencendo em breve!</span>
            </div>
          </div>
        )}

        {pkg.remaining_sessions <= 2 && pkg.status === "active" && (
          <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3 text-sm">
            <div className="flex items-center gap-2 text-blue-600">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">
                {pkg.remaining_sessions === 0 ? "Pacote finalizado!" : "Poucas sessões restantes"}
              </span>
            </div>
          </div>
        )}

        {pkg.status === "expired" && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Pacote expirado</span>
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
}