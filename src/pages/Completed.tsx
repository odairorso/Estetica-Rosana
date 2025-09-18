import { Helmet } from "react-helmet-async";
import { useState } from "react";
import {
  CheckCircle,
  Package,
  Calendar,
  Search,
  Filter,
  TrendingUp,
  DollarSign,
  User,
  History,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { useAppointments } from "@/hooks/useAppointments";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { SearchBar } from "@/components/ui/search-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function Completed() {
  const { appointments, getPackageHistory } = useAppointments();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filtrar apenas procedimentos e pacotes finalizados
  const completedItems = appointments.filter(apt => 
    apt.status === 'completed' && 
    (apt.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     apt.service_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     apt.package_name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Separar em procedimentos individuais e pacotes
  const individualProcedures = completedItems.filter(apt => apt.type === 'individual');
  const completedPackages = completedItems.filter(apt => apt.type === 'package_session' && apt.session_number === apt.total_sessions);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <>
      <Helmet>
        <title>Finalizados | Gestão de Clínica Estética</title>
        <meta name="description" content="Histórico de procedimentos e pacotes finalizados" />
      </Helmet>

      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient-brand">Finalizados</h1>
            <p className="text-muted-foreground">Histórico de procedimentos e pacotes concluídos</p>
          </div>
          <div className="flex gap-3">
            <SearchBar 
              placeholder="Buscar por cliente ou procedimento..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid gap-6 md:grid-cols-3">
          <GlassCard>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Procedimentos Concluídos</p>
                <p className="text-2xl font-bold text-green-500">{individualProcedures.length}</p>
              </div>
            </div>
          </GlassCard>
          
          <GlassCard>
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pacotes Finalizados</p>
                <p className="text-2xl font-bold text-blue-500">{completedPackages.length}</p>
              </div>
            </div>
          </GlassCard>
          
          <GlassCard>
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Faturamento Total</p>
                <p className="text-2xl font-bold text-purple-500">
                  {formatCurrency(completedItems.reduce((sum, item) => sum + item.price, 0))}
                </p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Seção: Procedimentos Individuais Concluídos */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Procedimentos Concluídos
              <Badge variant="secondary" className="ml-2">{individualProcedures.length}</Badge>
            </h2>
          </div>
          
          {individualProcedures.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum procedimento concluído ainda</p>
              <p className="text-sm mt-1">Os procedimentos finalizados aparecerão aqui</p>
            </div>
          ) : (
            <div className="space-y-3">
              {individualProcedures.map((procedure) => (
                <div key={procedure.id} className="p-4 rounded-lg bg-card/50 border border-border/50 hover:bg-card/70 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-green-500/20">
                        <User className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{procedure.client_name}</p>
                        <p className="text-sm text-muted-foreground">{procedure.service_name}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Realizado: {procedure.completed_at ? 
                              format(parseISO(procedure.completed_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) :
                              'Data não registrada'
                            }
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {formatCurrency(procedure.price)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-700">
                      Concluído
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Seção: Pacotes Finalizados */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-500" />
              Pacotes Finalizados
              <Badge variant="secondary" className="ml-2">{completedPackages.length}</Badge>
            </h2>
          </div>
          
          {completedPackages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum pacote finalizado ainda</p>
              <p className="text-sm mt-1">Os pacotes aparecerão aqui quando todas as sessões forem concluídas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {completedPackages.map((pkg) => {
                const packageHistory = getPackageHistory(pkg.package_id || 0);
                const firstSession = packageHistory[0];
                const lastSession = packageHistory[packageHistory.length - 1];

                return (
                  <div key={pkg.id} className="p-4 rounded-lg bg-card/50 border border-border/50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-blue-500/20">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{pkg.client_name}</p>
                          <p className="text-sm text-muted-foreground">{pkg.package_name}</p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Período: {firstSession?.completed_at ? 
                                format(parseISO(firstSession.completed_at), "dd/MM/yy") : '--'
                              } a {lastSession?.completed_at ? 
                                format(parseISO(lastSession.completed_at), "dd/MM/yy") : '--'
                              }
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {formatCurrency(pkg.price)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-blue-500/20 text-blue-700">
                        {packageHistory.length}/{pkg.total_sessions} sessões
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Sessões Realizadas</span>
                        <span className="font-medium">{packageHistory.length} de {pkg.total_sessions}</span>
                      </div>
                      <Progress value={(packageHistory.length / (pkg.total_sessions || 1)) * 100} className="h-2" />
                      
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                        >
                          <History className="h-3 w-3 mr-1" />
                          Ver Histórico
                        </Button>
                        <Badge className="bg-green-500/20 text-green-700">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Pacote Finalizado
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>
      </div>
    </>
  );
}