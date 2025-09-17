import { Mail, Phone, Calendar, Edit, Trash2, MoreVertical } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Client } from "@/hooks/useClients";

interface ClientCardProps {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (id: number) => void;
}

export function ClientCard({ client, onEdit, onDelete }: ClientCardProps) {
  return (
    <GlassCard className="relative">
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
              <DropdownMenuItem onClick={() => onEdit(client)} className="cursor-pointer">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(client.id)} 
                className="cursor-pointer text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Avatar e nome */}
        <div className="flex items-center space-x-3 pr-8">
          <Avatar className="h-12 w-12">
            <AvatarImage src={client.avatar || ""} />
            <AvatarFallback className="bg-brand-gradient text-white font-semibold">
              {client.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{client.name}</h3>
            <p className="text-sm text-muted-foreground">{client.totalVisits} visitas</p>
          </div>
        </div>

        {/* Informações de contato */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>{client.email}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>{client.phone}</span>
          </div>
          {client.cpf && (
            <div className="text-xs text-muted-foreground">
              CPF: {client.cpf}
            </div>
          )}
          {client.address && client.address.city && (
            <div className="text-xs text-muted-foreground">
              {client.address.city}, {client.address.state}
            </div>
          )}
        </div>

        {/* Status e badges */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {client.activePackages > 0 && (
              <Badge variant="secondary" className="text-xs bg-brand-start/20 text-brand-start">
                {client.activePackages} pacote{client.activePackages > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            Última: {client.lastVisit}
          </div>
        </div>

        {/* Próximo agendamento */}
        {client.nextAppointment && (
          <div className="flex items-center gap-2 rounded-lg bg-brand-start/10 p-2 text-sm">
            <Calendar className="h-4 w-4 text-brand-start" />
            <span className="text-brand-start font-medium">
              Próximo: {new Date(client.nextAppointment).toLocaleString('pt-BR')}
            </span>
          </div>
        )}
      </div>
    </GlassCard>
  );
}