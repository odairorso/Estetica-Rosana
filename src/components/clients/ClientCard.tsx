import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Phone } from "lucide-react";

interface Client {
  id: number;
  name: string;
  phone?: string;
  totalVisits?: number;
}

interface ClientCardProps {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (id: number) => void;
}

export function ClientCard({ client, onEdit, onDelete }: ClientCardProps) {
  return (
    <Card className="p-4 flex items-center justify-between">
      <div className="flex items-center gap-3 w-full">
        {/* Avatar padrão com inicial */}
        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-brand-gradient text-white font-semibold">
          {client.name.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-foreground">{client.name}</h3>

          {/* Aqui estava o conflito, agora corrigido */}
          {client.totalVisits !== undefined ? (
            <p className="text-sm text-muted-foreground">
              {client.totalVisits} visitas
            </p>
          ) : (
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Phone className="w-3 h-3" /> {client.phone || "Sem telefone"}
            </p>
          )}
        </div>
      </div>

      {/* Ações */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(client)}
          title="Editar"
        >
          <Edit className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="text-destructive"
          onClick={() => onDelete(client.id)}
          title="Excluir"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}