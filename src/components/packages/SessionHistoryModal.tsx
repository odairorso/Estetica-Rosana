import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Package as PackageType } from "@/hooks/usePackages";

interface SessionHistoryModalProps {
  pkg: PackageType | null;
  open: boolean;
  onClose: () => void;
}

export function SessionHistoryModal({
  pkg,
  open,
  onClose,
}: SessionHistoryModalProps) {
  if (!pkg) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Histórico de Sessões</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-96 pr-4">
          {pkg.sessions && pkg.sessions.length > 0 ? (
            <ul className="space-y-3">
              {pkg.sessions.map((session, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">
                      {session.name || `Sessão ${index + 1}`}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {session.date
                        ? format(new Date(session.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                        : "-"}
                    </span>
                  </div>

                  <Badge
                    className={
                      session.completed
                        ? "bg-green-500/20 text-green-600"
                        : "bg-gray-500/20 text-gray-600"
                    }
                  >
                    {session.completed ? "Concluída" : "Pendente"}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum histórico de sessão disponível.
            </p>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}