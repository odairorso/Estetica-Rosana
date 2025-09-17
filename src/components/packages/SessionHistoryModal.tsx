import { Calendar, Clock, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GlassCard } from "@/components/ui/glass-card";
import { Package, SessionHistoryEntry } from "@/hooks/usePackages";

interface SessionHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  package: Package | null;
}

export function SessionHistoryModal({ open, onOpenChange, package: pkg }: SessionHistoryModalProps) {
  if (!pkg) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const sortedHistory = [...(pkg.sessionHistory || [])].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="rounded-full bg-brand-gradient p-2">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            Histórico de Sessões - {pkg.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Resumo do pacote */}
          <GlassCard className="p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Cliente:</span>
                <p className="font-medium">{pkg.clientName}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Progresso:</span>
                <p className="font-medium">{pkg.usedSessions}/{pkg.totalSessions} sessões</p>
              </div>
              <div>
                <span className="text-muted-foreground">Valor do pacote:</span>
                <p className="font-medium text-green-600">R$ {pkg.price.toFixed(2).replace('.', ',')}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Válido até:</span>
                <p className="font-medium">{formatDate(pkg.validUntil)}</p>
              </div>
            </div>
          </GlassCard>

          {/* Lista de sessões */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Sessões Realizadas ({sortedHistory.length})
            </h3>

            {sortedHistory.length === 0 ? (
              <GlassCard className="p-6 text-center">
                <div className="space-y-2">
                  <Calendar className="h-8 w-8 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">Nenhuma sessão realizada ainda</p>
                </div>
              </GlassCard>
            ) : (
              <div className="space-y-2">
                {sortedHistory.map((session, index) => (
                  <GlassCard key={session.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-brand-gradient p-1.5 mt-1">
                          <Calendar className="h-3 w-3 text-white" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{formatDate(session.date)}</span>
                            <span className="text-xs text-muted-foreground">
                              #{sortedHistory.length - index}
                            </span>
                          </div>
                          {session.notes && (
                            <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
                              <FileText className="h-3 w-3 mt-0.5 shrink-0" />
                              <span>{session.notes}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>

          {/* Estatísticas */}
          {sortedHistory.length > 0 && (
            <GlassCard className="p-4">
              <h4 className="font-medium mb-3">Estatísticas</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Primeira sessão:</span>
                  <p className="font-medium">
                    {formatDate(sortedHistory[sortedHistory.length - 1].date)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Última sessão:</span>
                  <p className="font-medium">
                    {formatDate(sortedHistory[0].date)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Valor por sessão:</span>
                  <p className="font-medium text-green-600">
                    R$ {(pkg.price / pkg.totalSessions).toFixed(2).replace('.', ',')}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Sessões restantes:</span>
                  <p className="font-medium text-brand-start">
                    {pkg.remainingSessions}
                  </p>
                </div>
              </div>
            </GlassCard>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}