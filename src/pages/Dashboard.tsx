import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { Progress } from "@/components/ui/progress";
<<<<<<< HEAD
import { useFinance } from "@/hooks/useFinance";
import { useClients } from "@/hooks/useClients";
import { usePackages } from "@/hooks/usePackages";
import { useAppointments } from "@/hooks/useAppointments";
import { isToday, isThisMonth, parseISO } from "date-fns";
=======
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
import { 
  CalendarClock, 
  Sparkles, 
  TrendingUp, 
  Users, 
  Package, 
  Star,
  Clock,
  Target,
  ArrowRight,
  Zap,
  Heart,
  Calendar,
  DollarSign,
  Activity
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
<<<<<<< HEAD
  
  // Hooks para dados reais
  const { getMetrics } = useFinance();
  const { clients } = useClients();
  const { packages } = usePackages();
  const { appointments } = useAppointments();
  
  // Calcular métricas reais
  const metrics = getMetrics();
  
  // Debug logs temporários
  console.log('🔍 DEBUG - Dados carregados:');
  console.log('📊 Clients:', clients.length, clients);
  console.log('📦 Packages:', packages.length, packages);
  console.log('📅 Appointments:', appointments.length, appointments);
  console.log('💰 Metrics:', metrics);
  
  // Clientes novos hoje
  const newClientsToday = clients.filter(client => {
    try {
      return client.createdAt && client.createdAt.trim() !== '' && isToday(parseISO(client.createdAt));
    } catch (error) {
      console.warn('Invalid date format for client:', client.id, client.createdAt);
      return false;
    }
  }).length;
  
  // Total de clientes atendidos hoje
  const clientsToday = appointments.filter(appointment => {
    try {
      return appointment.date && appointment.date.trim() !== '' && isToday(parseISO(appointment.date)) && 
        (appointment.status === 'concluido' || appointment.status === 'confirmado');
    } catch (error) {
      console.warn('Invalid date format for appointment:', appointment.id, appointment.date);
      return false;
    }
  }).length;
  
  // Pacotes vendidos este mês
  const packagesThisMonth = packages.filter(pkg => {
    try {
      return pkg.created_at && pkg.created_at.trim() !== '' && isThisMonth(parseISO(pkg.created_at));
    } catch (error) {
      console.warn('Invalid date format for package:', pkg.id, pkg.created_at);
      return false;
    }
  }).length;
  
  // Formatação de moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
=======
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522

  return (
    <>
      <Helmet>
        <title>Dashboard | Gestão de Clínica Estética</title>
        <meta name="description" content="Resumo do dia, próximos atendimentos e alertas da clínica estética." />
        <link rel="canonical" href="/dashboard" />
      </Helmet>

      {/* Header com Glass Effect */}
      <section className="mb-8">
        <GlassCard className="p-8">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
<<<<<<< HEAD
              <h1 className="text-3xl font-bold text-gradient-brand mb-2">Bem-vinda, equipe! 🌟</h1>
              <p className="text-lg text-muted-foreground">Aqui está um resumo rápido do seu dia - Dados Atualizados!</p>
=======
              <h1 className="text-3xl font-bold text-gradient-brand mb-2">Bem-vinda, equipe!</h1>
              <p className="text-lg text-muted-foreground">Aqui está um resumo rápido do seu dia</p>
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
            </div>
            <div className="flex flex-wrap gap-3">
              <NeonButton 
                variant="primary" 
                icon={Sparkles}
                onClick={() => navigate('/pacotes')}
              >
                Nova Venda de Pacote
              </NeonButton>
              <NeonButton 
                variant="secondary" 
                icon={CalendarClock}
                onClick={() => navigate('/agendamentos')}
              >
                Novo Agendamento
              </NeonButton>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* Grid de Métricas Principais */}
      <section className="mb-8">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
<<<<<<< HEAD
          <GlassCard className="hover-lift cursor-pointer transition-all duration-300 hover:scale-105" onClick={() => navigate('/financeiro')}>
=======
          <GlassCard className="hover-lift">
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-brand-gradient neon-glow">
                <TrendingUp className="h-6 w-6 text-white icon-glow" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Faturamento Hoje</p>
<<<<<<< HEAD
                <p className="text-2xl font-bold text-gradient-brand">{formatCurrency(metrics.todayIncome)}</p>
                <p className="text-xs text-green-600">Clique para ver detalhes</p>
=======
                <p className="text-2xl font-bold text-gradient-brand">R$ 2.450</p>
                <p className="text-xs text-green-600">+12% vs ontem</p>
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
              </div>
            </div>
          </GlassCard>

<<<<<<< HEAD
          <GlassCard className="hover-lift cursor-pointer transition-all duration-300 hover:scale-105" onClick={() => navigate('/clientes')}>
=======
          <GlassCard className="hover-lift">
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-neon-gradient neon-glow">
                <Users className="h-6 w-6 text-white icon-glow" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Clientes Hoje</p>
<<<<<<< HEAD
                <p className="text-2xl font-bold text-gradient-brand">{clientsToday}</p>
                <p className="text-xs text-blue-600">{newClientsToday} novos clientes</p>
=======
                <p className="text-2xl font-bold text-gradient-brand">24</p>
                <p className="text-xs text-blue-600">8 novos clientes</p>
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
              </div>
            </div>
          </GlassCard>

<<<<<<< HEAD
          <GlassCard className="hover-lift cursor-pointer transition-all duration-300 hover:scale-105" onClick={() => navigate('/pacotes')}>
=======
          <GlassCard className="hover-lift">
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-brand-gradient neon-glow">
                <Package className="h-6 w-6 text-white icon-glow" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pacotes Vendidos</p>
<<<<<<< HEAD
                <p className="text-2xl font-bold text-gradient-brand">{packagesThisMonth}</p>
                <p className="text-xs text-purple-600">Este mês</p>
=======
                <p className="text-2xl font-bold text-gradient-brand">12</p>
                <p className="text-xs text-purple-600">Meta: 15/mês</p>
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
              </div>
            </div>
          </GlassCard>

          <GlassCard className="hover-lift">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-neon-gradient neon-glow">
                <Star className="h-6 w-6 text-white icon-glow" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avaliação Média</p>
                <p className="text-2xl font-bold text-gradient-brand">4.9</p>
                <p className="text-xs text-yellow-600">142 avaliações</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Grid Principal */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Coluna Esquerda */}
        <div className="lg:col-span-2 space-y-8">
          {/* Próximos Atendimentos */}
          <GlassCard title="Próximos Atendimentos" className="hover-lift">
            <div className="space-y-4">
<<<<<<< HEAD
              {appointments
                .filter(appointment => 
                  (appointment.status === 'agendado' || appointment.status === 'confirmado') &&
                  new Date(appointment.date + 'T' + appointment.time) >= new Date()
                )
                .sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime())
                .slice(0, 4)
                .map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 rounded-lg bg-card/50 border border-border/30 hover:bg-card/70 transition-colors cursor-pointer" onClick={() => navigate('/agendamentos')}>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="font-bold text-gradient-brand">{appointment.time}</p>
                        <div className={`w-2 h-2 rounded-full mx-auto mt-1 ${
                          appointment.status === 'confirmado' ? 'bg-green-500' : 'bg-yellow-500'
                        }`} />
                      </div>
                      <div>
                        <p className="font-semibold">{appointment.serviceName}</p>
                        <p className="text-sm text-muted-foreground">{appointment.clientName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(appointment.price)}</p>
                      <p className="text-xs text-muted-foreground capitalize">{appointment.status}</p>
                    </div>
                  </div>
                ))}
              {appointments.filter(appointment => 
                (appointment.status === 'agendado' || appointment.status === 'confirmado') &&
                new Date(appointment.date + 'T' + appointment.time) >= new Date()
              ).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum atendimento agendado</p>
                </div>
              )}
=======
              {[
                { time: "14:00", service: "Limpeza de Pele", client: "Ana Silva", room: "Sala 2", status: "confirmado" },
                { time: "15:30", service: "Drenagem Linfática", client: "Beatriz Costa", room: "Sala 1", status: "confirmado" },
                { time: "16:00", service: "Botox", client: "Carlos Oliveira", room: "Sala 3", status: "pendente" },
                { time: "17:00", service: "Preenchimento", client: "Diana Santos", room: "Sala 2", status: "confirmado" }
              ].map((appointment, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-card/50 border border-border/30">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="font-bold text-gradient-brand">{appointment.time}</p>
                      <div className={`w-2 h-2 rounded-full mx-auto mt-1 ${
                        appointment.status === 'confirmado' ? 'bg-green-500' : 'bg-yellow-500'
                      }`} />
                    </div>
                    <div>
                      <p className="font-semibold">{appointment.service}</p>
                      <p className="text-sm text-muted-foreground">{appointment.client}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{appointment.room}</p>
                    <p className="text-xs text-muted-foreground capitalize">{appointment.status}</p>
                  </div>
                </div>
              ))}
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
            </div>
            <div className="mt-6">
              <NeonButton 
                variant="outline" 
                size="sm" 
                icon={ArrowRight}
                onClick={() => navigate('/agendamentos')}
                className="w-full"
              >
                Ver Todos os Agendamentos
              </NeonButton>
            </div>
          </GlassCard>

          {/* Metas do Mês */}
<<<<<<< HEAD
          <GlassCard title="Metas do Mês" className="hover-lift cursor-pointer" onClick={() => navigate('/financeiro')}>
=======
          <GlassCard title="Metas do Mês" className="hover-lift">
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Faturamento</span>
<<<<<<< HEAD
                  <span className="text-sm text-muted-foreground">{formatCurrency(metrics.monthIncome)} / {formatCurrency(25000)}</span>
                </div>
                <Progress value={Math.min((metrics.monthIncome / 25000) * 100, 100)} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">{Math.round((metrics.monthIncome / 25000) * 100)}% da meta mensal</p>
=======
                  <span className="text-sm text-muted-foreground">R$ 18.750 / R$ 25.000</span>
                </div>
                <Progress value={75} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">75% da meta mensal</p>
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Novos Clientes</span>
<<<<<<< HEAD
                  <span className="text-sm text-muted-foreground">{clients.filter(c => isThisMonth(parseISO(c.createdAt))).length} / 40</span>
                </div>
                <Progress value={Math.min((clients.filter(c => isThisMonth(parseISO(c.createdAt))).length / 40) * 100, 100)} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">{Math.round((clients.filter(c => isThisMonth(parseISO(c.createdAt))).length / 40) * 100)}% da meta mensal</p>
=======
                  <span className="text-sm text-muted-foreground">28 / 40</span>
                </div>
                <Progress value={70} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">70% da meta mensal</p>
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Pacotes Vendidos</span>
<<<<<<< HEAD
                  <span className="text-sm text-muted-foreground">{packagesThisMonth} / 15</span>
                </div>
                <Progress value={Math.min((packagesThisMonth / 15) * 100, 100)} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">{Math.round((packagesThisMonth / 15) * 100)}% da meta mensal</p>
=======
                  <span className="text-sm text-muted-foreground">12 / 15</span>
                </div>
                <Progress value={80} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">80% da meta mensal</p>
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Coluna Direita */}
        <div className="space-y-8">
          {/* Ações Rápidas */}
          <GlassCard title="Ações Rápidas" className="hover-lift">
            <div className="grid grid-cols-2 gap-3">
              <NeonButton 
                variant="outline" 
                size="sm" 
                icon={Users}
                onClick={() => navigate('/clientes')}
                className="flex-col h-auto py-4"
              >
                <span className="text-xs mt-1">Clientes</span>
              </NeonButton>
              <NeonButton 
                variant="outline" 
                size="sm" 
                icon={Heart}
                onClick={() => navigate('/servicos')}
                className="flex-col h-auto py-4"
              >
                <span className="text-xs mt-1">Serviços</span>
              </NeonButton>
              <NeonButton 
                variant="outline" 
                size="sm" 
                icon={Package}
                onClick={() => navigate('/estoque')}
                className="flex-col h-auto py-4"
              >
                <span className="text-xs mt-1">Estoque</span>
              </NeonButton>
              <NeonButton 
                variant="outline" 
                size="sm" 
                icon={DollarSign}
                onClick={() => navigate('/financeiro')}
                className="flex-col h-auto py-4"
              >
                <span className="text-xs mt-1">Financeiro</span>
              </NeonButton>
            </div>
          </GlassCard>

          {/* Alertas e Notificações */}
          <GlassCard title="Alertas" className="hover-lift">
            <div className="space-y-4">
              <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/10">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-destructive" />
                  <span className="font-medium text-destructive">Pacotes Vencendo</span>
                </div>
                <p className="text-sm">3 pacotes vencendo esta semana</p>
              </div>
              
              <div className="p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium text-yellow-600">Agenda</span>
                </div>
                <p className="text-sm">5 horários livres hoje</p>
              </div>
              
              <div className="p-4 rounded-lg border border-green-500/30 bg-green-500/10">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-600">Performance</span>
                </div>
                <p className="text-sm">Meta do dia já atingida!</p>
              </div>
            </div>
          </GlassCard>

          {/* Resumo Financeiro */}
          <GlassCard title="Resumo Financeiro" className="hover-lift">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Receita do Mês</span>
                <span className="font-bold text-green-600">R$ 18.750</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">A Receber</span>
                <span className="font-bold text-blue-600">R$ 3.200</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Despesas</span>
                <span className="font-bold text-red-600">R$ 4.500</span>
              </div>
              <hr className="border-border/30" />
              <div className="flex justify-between items-center">
                <span className="font-medium">Lucro Líquido</span>
                <span className="font-bold text-gradient-brand">R$ 14.250</span>
              </div>
            </div>
            <div className="mt-4">
              <NeonButton 
                variant="outline" 
                size="sm" 
                icon={TrendingUp}
                onClick={() => navigate('/financeiro')}
                className="w-full"
              >
                Ver Relatório Completo
              </NeonButton>
            </div>
          </GlassCard>
        </div>
      </div>
    </>
  );
}
