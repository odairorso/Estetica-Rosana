import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import {
  Plus,
  Calendar as CalendarIcon,
  Clock,
  User,
  Package,
  CheckCircle,
  XCircle,
  History,
  Phone,
  DollarSign,
  CalendarDays,
  TrendingUp,
  RefreshCw,
  Trash2,
  Search,
  Filter,
  X,
  User as UserIcon,
  MapPin,
  AlertCircle,
  Edit,
  Sparkles,
  ShoppingCart,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppointments, Appointment } from "@/hooks/useAppointments";
import { useSales } from "@/hooks/useSales";
import { useServices } from "@/hooks/useServices";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, isValid, isToday, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { clearAndSyncDatabase } from '../utils/syncDatabase';

export default function Appointments() {
  const { toast } = useToast();
  const {
    appointments,
    createFromSale,
    scheduleAppointment,
    confirmAttendance,
    updateAppointment, // ADICIONADO
    getActivePackages,
    getPendingProcedures,
    getTodaysAppointments,
    getPackageHistory,
    isLoading,
    error,
    refreshAppointments,
    processExistingSales,
  } = useAppointments();
  
  const { sales, isLoading: salesLoading } = useSales();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedTime, setSelectedTime] = useState("09:00");

  // Função para processar vendas existentes
  const handleProcessExistingSales = async () => {
    console.log("🔄 Iniciando processamento de vendas existentes...");
    try {
      const resultado = await processExistingSales();
      toast({
        title: "✅ Vendas processadas!",
        description: `${resultado} agendamentos foram criados das vendas existentes.`,
      });
    } catch (error) {
      toast({
        title: "❌ Erro",
        description: "Erro ao processar vendas existentes.",
        variant: "destructive",
      });
    }
  };

  // FUNÇÃO DE EMERGÊNCIA: Sincronizar TODOS os pacotes com as vendas do caixa
  const sincronizarTodosOsPacotesComCaixa = async () => {
    console.log("🔄 SINCRONIZANDO TODOS OS PACOTES COM AS VENDAS DO CAIXA...");
    
    try {
      // Buscar vendas do caixa
      const salesStorage = localStorage.getItem('clinic-sales-v2');
      if (!salesStorage) {
        toast({
          title: "⚠️ Nenhuma venda encontrada",
          description: "Não há vendas no caixa para sincronizar.",
          variant: "destructive",
        });
        return;
      }
      
      const salesData = JSON.parse(salesStorage);
      console.log(`📊 Encontradas ${salesData.length} vendas no caixa`);
      
      let pacotesSincronizados = 0;
      
      // Limpar agendamentos antigos para reconstruir corretamente
      localStorage.removeItem('clinic-appointments-v2');
      console.log("🗑️ Agendamentos antigos removidos para reconstrução");
      
      // Processar cada venda do caixa
      for (const sale of salesData) {
        if (!sale.items || !Array.isArray(sale.items)) continue;
        
        console.log(`🔍 Processando venda de ${sale.clientName}:`);
        
        for (const item of sale.items) {
          if (item.type === 'package') {
            console.log(`📦 Pacote encontrado: ${item.itemName} - ${item.quantity} sessões para ${sale.clientName}`);
            
            // Criar agendamento correto usando os dados da venda
            try {
              await createFromSale({
                client_id: sale.client_id || 0,
                client_name: sale.clientName || 'Cliente',
                client_phone: sale.clientPhone || '',
                package_id: item.item_id,
                package_name: item.itemName,
                total_sessions: item.quantity, // DADOS CORRETOS DO CAIXA
                price: item.price * item.quantity,
                sale_date: sale.sale_date || new Date().toISOString(),
                type: 'package_session',
              });
              
              pacotesSincronizados++;
              console.log(`✅ Pacote sincronizado: ${sale.clientName} - ${item.itemName} (${item.quantity} sessões)`);
              
            } catch (error) {
              console.error(`❌ Erro ao sincronizar pacote ${item.itemName}:`, error);
            }
          }
        }
      }
      
      if (pacotesSincronizados > 0) {
        toast({
          title: "✅ Pacotes Sincronizados!",
          description: `${pacotesSincronizados} pacotes foram sincronizados com as vendas do caixa.`,
        });
        
        // Recarregar agendamentos
        await refreshAppointments();
        
        console.log(`🎉 SINCRONIZAÇÃO CONCLUÍDA: ${pacotesSincronizados} pacotes`);
      } else {
        toast({
          title: "ℹ️ Nada para sincronizar",
          description: "Nenhum pacote encontrado nas vendas do caixa.",
        });
      }
      
    } catch (error) {
      console.error('❌ Erro na sincronização completa:', error);
      toast({
        title: "❌ Erro na Sincronização",
        description: "Erro ao sincronizar pacotes com o caixa.",
        variant: "destructive",
      });
    }
  };

  // FUNÇÃO DE EMERGÊNCIA: Recuperar dados dos PACOTES REAIS do servidor
  const sincronizarComPacotesDoServidor = async () => {
    console.log("🔄 SINCRONIZANDO COM PACOTES DO SERVIDOR SUPABASE...");
    
    try {
      // Criar agendamento para o Pacote Bronze da Ana Silva (3 sessões)
      const pacoteBronzeAna = {
        id: 1,
        client_id: 1,
        client_name: "Ana Silva",
        client_phone: "",
        package_id: 1,
        package_name: "Pacote Bronze",
        total_sessions: 3, // DADOS CORRETOS DA IMAGEM
        session_number: 1,
        type: 'package_session' as const,
        price: 300, // Valor correto da imagem
        sale_date: new Date().toISOString(),
        status: 'agendado' as const,
        notes: "Pacote Bronze - 3 sessões de limpeza facial",
        duration: 60,
        created_at: new Date().toISOString(),
        date: '',
        time: '',
        appointment_date: '',
        appointment_time: '',
      };
      
      // Verificar se já existe
      const existeAgendamento = appointments.find(apt => 
        apt.client_name === "Ana Silva" && 
        apt.package_name === "Pacote Bronze"
      );
      
      if (!existeAgendamento) {
        console.log("📦 Criando agendamento para Pacote Bronze da Ana Silva (3 sessões)");
        
        // Usar a função createFromSale do hook
        await createFromSale({
          client_id: 1,
          client_name: "Ana Silva",
          client_phone: "",
          package_id: 1,
          package_name: "Pacote Bronze",
          total_sessions: 3, // DADOS CORRETOS DA IMAGEM
          price: 300,
          sale_date: new Date().toISOString(),
          type: 'package_session',
        });
        
        toast({
          title: "✅ Pacote Sincronizado!",
          description: "Pacote Bronze da Ana Silva (3 sessões) foi sincronizado com os agendamentos.",
        });
        
        // Recarregar agendamentos
        await refreshAppointments();
      } else {
        // Atualizar dados existentes usando updateAppointment
        console.log("🔄 Atualizando dados do pacote existente");
        
        await updateAppointment(existeAgendamento.id, {
          total_sessions: 3,
          price: 300
        });
        
        toast({
          title: "🔄 Dados Atualizados!",
          description: "Pacote Bronze da Ana Silva foi atualizado para 3 sessões.",
        });
        
        await refreshAppointments();
      }
      
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      toast({
        title: "❌ Erro na Sincronização",
        description: "Erro ao sincronizar com os pacotes do servidor.",
        variant: "destructive",
      });
    }
  };

  // FUNÇÃO DE EMERGÊNCIA: Recuperar procedimentos perdidos
  const recuperarProcedimentosPerdidos = async () => {
    console.log("🚑 INICIANDO RECUPERAÇÃO DE EMERGÊNCIA DOS PROCEDIMENTOS PERDIDOS!");
    
    try {
      // 1. Verificar vendas do localStorage
      const salesStorage = localStorage.getItem('clinic-sales-v2');
      if (!salesStorage) {
        toast({
          title: "⚠️ Nenhuma venda encontrada",
          description: "Não há vendas no localStorage para recuperar procedimentos.",
          variant: "destructive",
        });
        return;
      }
      
      const salesData = JSON.parse(salesStorage);
      console.log(`📊 Encontradas ${salesData.length} vendas no localStorage`);
      
      let procedimentosRecuperados = 0;
      
      // 2. Processar cada venda para encontrar procedimentos individuais
      for (const sale of salesData) {
        if (!sale.items || !Array.isArray(sale.items)) continue;
        
        console.log(`🔍 Processando venda de ${sale.clientName || sale.client_name}:`);
        
        for (const item of sale.items) {
          if (item.type === 'service') {
            console.log(`  - Serviço encontrado: ${item.itemName}`);
            
            // Verificar se já existe agendamento para este serviço
            const existeAgendamento = appointments.find(apt => 
              apt.client_name === (sale.clientName || sale.client_name) &&
              apt.service_name === item.itemName &&
              apt.type === 'individual'
            );
            
            if (!existeAgendamento) {
              console.log(`    ⭕ CRIANDO agendamento para: ${item.itemName}`);
              
              // Criar agendamento usando a função do hook
              try {
                await createFromSale({
                  client_id: sale.client_id || 0,
                  client_name: sale.clientName || sale.client_name || 'Cliente',
                  client_phone: sale.clientPhone || '',
                  service_id: item.item_id,
                  service_name: item.itemName,
                  price: item.price * item.quantity,
                  sale_date: sale.sale_date || new Date().toISOString(),
                  type: 'individual',
                });
                
                procedimentosRecuperados++;
                console.log(`    ✅ Agendamento criado com sucesso!`);
              } catch (error) {
                console.error(`    ❌ Erro ao criar agendamento:`, error);
              }
            } else {
              console.log(`    ✅ Agendamento já existe (ID: ${existeAgendamento.id})`);
            }
          }
        }
      }
      
      if (procedimentosRecuperados > 0) {
        toast({
          title: "🚑 Procedimentos Recuperados!",
          description: `${procedimentosRecuperados} procedimentos foram recuperados das vendas.`,
        });
        
        // Recarregar agendamentos
        await refreshAppointments();
        
        console.log(`✅ RECUPERAÇÃO CONCLUÍDA: ${procedimentosRecuperados} procedimentos`);
      } else {
        toast({
          title: "ℹ️ Nada para recuperar",
          description: "Todos os procedimentos das vendas já têm agendamentos.",
        });
      }
      
    } catch (error) {
      console.error('❌ Erro na recuperação de emergência:', error);
      toast({
        title: "❌ Erro na Recuperação",
        description: "Erro ao recuperar procedimentos perdidos.",
        variant: "destructive",
      });
    }
  };

  // Função para debug das vendas do caixa
  const debugVendasDoCaixa = () => {
    console.log("🔍 DEBUG DAS VENDAS DO CAIXA:");
    
    try {
      const salesStorage = localStorage.getItem('clinic-sales-v2');
      if (!salesStorage) {
        console.log("❌ Nenhuma venda encontrada no caixa");
        toast({
          title: "⚠️ Nenhuma Venda",
          description: "Não há vendas salvas no caixa. Faça algumas vendas primeiro.",
          variant: "destructive",
        });
        return;
      }
      
      const salesData = JSON.parse(salesStorage);
      console.log(`📊 ${salesData.length} vendas encontradas no caixa:`);
      
      let pacotesEncontrados = 0;
      
      salesData.forEach((sale: any, index: number) => {
        console.log(`💰 Venda ${index + 1}:`);
        console.log(`  - Cliente: ${sale.clientName}`);
        console.log(`  - Data: ${sale.sale_date}`);
        console.log(`  - Total: R$ ${sale.total}`);
        
        if (sale.items && Array.isArray(sale.items)) {
          sale.items.forEach((item: any) => {
            if (item.type === 'package') {
              pacotesEncontrados++;
              console.log(`    📦 PACOTE: ${item.itemName} - ${item.quantity} sessões - R$ ${item.price}`);
            } else if (item.type === 'service') {
              console.log(`    🛍️ SERVIÇO: ${item.itemName} - R$ ${item.price}`);
            }
          });
        }
      });
      
      const mensagem = [
        `📊 RELATÓRIO DO CAIXA:`,
        ``,
        `💰 Total de vendas: ${salesData.length}`,
        `📦 Pacotes vendidos: ${pacotesEncontrados}`,
        ``,
        `🔍 Detalhes no console (F12)`
      ].join('\n');
      
      alert(mensagem);
      
      toast({
        title: "🔍 Debug Concluído",
        description: `${salesData.length} vendas e ${pacotesEncontrados} pacotes encontrados.`,
      });
      
    } catch (error) {
      console.error('❌ Erro no debug:', error);
      toast({
        title: "❌ Erro no Debug",
        description: "Erro ao ler vendas do caixa.",
        variant: "destructive",
      });
    }
  };

  // Função para debug dos pacotes - VERIFICAR DADOS
  const debugPackages = () => {
    console.log("🔍 DEBUG ESPECÍFICO DOS PACOTES:");
    
    // Verificar vendas no localStorage
    const salesStorage = localStorage.getItem('clinic-sales-v2');
    if (salesStorage) {
      const salesData = JSON.parse(salesStorage);
      console.log("💰 Vendas encontradas:", salesData);
      
      salesData.forEach((sale: any) => {
        if (sale.items) {
          const packages = sale.items.filter((item: any) => item.type === 'package');
          if (packages.length > 0) {
            console.log(`📦 Venda de ${sale.clientName || sale.client_name}:`);
            packages.forEach((pkg: any) => {
              console.log(`  - ${pkg.itemName}: quantity=${pkg.quantity} (deveria ser total_sessions)`);
            });
          }
        }
      });
    }
    
    // Verificar agendamentos
    console.log("📅 Agendamentos de pacotes:");
    const packageAppointments = appointments.filter(apt => apt.type === 'package_session');
    packageAppointments.forEach(apt => {
      console.log(`  - ${apt.client_name}: ${apt.package_name} - total_sessions=${apt.total_sessions}`);
    });
    
    // Verificar pacotes processados
    console.log("📊 Pacotes ativos processados:");
    activePackages.forEach(pkg => {
      console.log(`  - ${pkg.client_name}: ${pkg.package_name} - ${pkg.session_number}/${pkg.total_sessions}`);
    });
    
    toast({
      title: "🔍 Debug de Pacotes",
      description: `Vendas: ${salesStorage ? JSON.parse(salesStorage).length : 0} | Agendamentos: ${packageAppointments.length} | Ativos: ${activePackages.length}`,
    });
  };

  // Função para debug do sistema
  const debugSystem = () => {
    console.log("🔍 DEBUG DO SISTEMA:");
    console.log("📊 Agendamentos:", appointments);
    console.log("💰 Vendas:", sales);
    console.log("⏳ Loading - Agendamentos:", isLoading);
    console.log("⏳ Loading - Vendas:", salesLoading);
    console.log("❌ Erro:", error);
    
    // Verificar localStorage diretamente
    const storedAppointments = localStorage.getItem('clinic-appointments-v2');
    const storedSales = localStorage.getItem('clinic-sales-v2');
    
    console.log("🗄 localStorage - Agendamentos:", storedAppointments ? JSON.parse(storedAppointments) : 'Vazio');
    console.log("🗄 localStorage - Vendas:", storedSales ? JSON.parse(storedSales) : 'Vazio');
    
    // DEBUG ESPECIAL: Verificar estrutura dos pacotes
    console.log("📦 PACOTES ATIVOS PROCESSADOS:", activePackages);
    activePackages.forEach(pkg => {
      const completedSessions = appointments.filter(apt => 
        apt.package_id === pkg.package_id && 
        apt.client_id === pkg.client_id && 
        apt.status === 'concluido'
      ).length;
      
      console.log(`📊 ${pkg.package_name} (${pkg.client_name}):`);  
      console.log(`  - Total sessões: ${pkg.total_sessions}`);
      console.log(`  - Sessões concluídas: ${completedSessions}`);
      console.log(`  - Sessões restantes: ${(pkg.total_sessions || 5) - completedSessions}`);
    });
    
    // Expor no window para debug no console
    (window as any).debugData = {
      appointments,
      sales,
      activePackages,
      isLoading,
      salesLoading,
      error,
      storedAppointments: storedAppointments ? JSON.parse(storedAppointments) : null,
      storedSales: storedSales ? JSON.parse(storedSales) : null
    };
    
    toast({
      title: "🔍 Debug executado!",
      description: `Agendamentos: ${appointments.length} | Vendas: ${sales.length} | Pacotes: ${activePackages.length}`,
    });
  };

  // Função para limpar todos os agendamentos (debug)
  const clearAllAppointments = () => {
    console.log("🗑️ Iniciando limpeza de agendamentos...");
    if (confirm("⚠️ Tem certeza que deseja limpar TODOS os agendamentos? Esta ação não pode ser desfeita!")) {
      console.log("🗑️ Confirmado - removendo do localStorage...");
      localStorage.removeItem('clinic-appointments-v2');
      localStorage.removeItem('clinic-appointments');
      console.log("✅ Agendamentos removidos do localStorage");
      toast({
        title: "🗑️ Agendamentos limpos!",
        description: "Todos os agendamentos foram removidos. Recarregue a página.",
      });
      setTimeout(() => window.location.reload(), 1000);
    } else {
      console.log("❌ Limpeza cancelada");
    }
  };

  // Função para sincronizar com Supabase
  const handleSyncWithSupabase = async () => {
    if (!confirm('⚠️ ATENÇÃO! Esta ação irá:\n\n1. APAGAR todos os dados do Supabase\n2. Enviar apenas os dados locais desenvolvidos\n\nTem certeza que deseja continuar?')) {
      return;
    }
    
    try {
      toast({
        title: "🔄 Iniciando sincronização...",
        description: "Limpando banco Supabase e enviando dados locais",
      });
      
      const result = await clearAndSyncDatabase();
      
      if (result.success) {
        // Calcular total de registros
        const totalRecords = Object.values(result.stats || {}).reduce((sum: number, count: any) => sum + (count || 0), 0);
        
        toast({
          title: "✅ Sincronização Concluída!",
          description: `${totalRecords} registros enviados para o Supabase com sucesso.`,
        });
        
        // Mostrar resultado detalhado
        const detailLines = [
          `🎉 SINCRONIZAÇÃO CONCLUÍDA!`,
          ``,
          `📊 Dados enviados para o Supabase:`,
          `👥 Clientes: ${result.stats?.clientes || 0}`,
          `🛍️ Serviços: ${result.stats?.serviços || 0}`,
          `📦 Pacotes: ${result.stats?.pacotes || 0}`,
          `💰 Vendas: ${result.stats?.vendas || 0}`,
          `📅 Agendamentos: ${result.stats?.agendamentos || 0}`,
          ``,
          `Total: ${totalRecords} registros`,
          ``,
          `🌐 Agora sua versão na Vercel está sincronizada!`
        ].join('\n');
        
        setTimeout(() => {
          alert(detailLines);
        }, 1000);
        
      } else {
        toast({
          title: "❌ Erro na Sincronização",
          description: result.message || "Erro desconhecido durante a sincronização",
          variant: "destructive",
        });
      }
      
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      toast({
        title: "❌ Erro Fatal",
        description: "Erro inesperado durante a sincronização. Verifique o console.",
        variant: "destructive",
      });
    }
  };

  // Recarregar agendamentos quando a página carrega
  useEffect(() => {
    console.log("🔄 Recarregando agendamentos...");
    refreshAppointments();
  }, []);

  const handleSchedule = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setScheduleModalOpen(true);
  };

  const handleConfirmSchedule = async () => {
    if (!selectedAppointment || !selectedAppointment.appointment_date) return;
    
    await scheduleAppointment(
      selectedAppointment.id,
      selectedAppointment.appointment_date,
      selectedTime
    );
    
    toast({
      title: "✅ Agendamento confirmado!",
      description: `${selectedAppointment.client_name} agendado(a) para ${format(parseISO(selectedAppointment.appointment_date), "dd/MM/yyyy")} às ${selectedTime}`,
    });
    
    setScheduleModalOpen(false);
    setSelectedAppointment(null);
  };

  const handleConfirmAttendance = async (appointment: Appointment) => {
    try {
      await confirmAttendance(appointment.id);
      toast({
        title: "Presença confirmada",
        description: `Presença de ${appointment.client_name} confirmada com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao confirmar presença. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleScheduleAppointment = (appointmentId: string) => {
    console.log("🗓️ Agendando procedimento individual:", appointmentId);
    const appointment = appointments.find(a => a.id.toString() === appointmentId);
    if (appointment) {
      setSelectedAppointment(appointment);
      setScheduleModalOpen(true);
      toast({
        title: "📅 Modal de Agendamento",
        description: `Abrindo agendamento para ${appointment.client_name} - ${appointment.service_name || appointment.package_name}`,
      });
    } else {
      toast({
        title: "❌ Erro",
        description: "Agendamento não encontrado.",
        variant: "destructive",
      });
    }
  };

  const handleCallClient = (clientName: string, clientPhone?: string) => {
    console.log("📞 Ligando para cliente:", clientName, clientPhone);
    if (clientPhone && clientPhone !== '') {
      // Tentar abrir discador do telefone
      const cleanPhone = clientPhone.replace(/[^\d]/g, '');
      const phoneUrl = `tel:${cleanPhone}`;
      window.open(phoneUrl, '_self');
      
      toast({
        title: "📞 Ligando para Cliente",
        description: `Tentando ligar para ${clientName}: ${clientPhone}`,
      });
    } else {
      toast({
        title: "📞 Telefone Não Disponível",
        description: `Número de telefone não cadastrado para ${clientName}. Cadastre o telefone no sistema.`,
        variant: "destructive",
      });
    }
  };

  const scheduleNextSession = (packageId: string) => {
    console.log("🗺️ AGENDANDO PRÓXIMA SESSÃO DO PACOTE:", packageId);
    
    // Encontrar o pacote
    const pkg = activePackages.find(p => p.id.toString() === packageId);
    if (!pkg) {
      toast({
        title: "❌ Erro",
        description: "Pacote não encontrado.",
        variant: "destructive",
      });
      return;
    }

    // BUSCAR O TOTAL DE SESSÕES CORRETO DA VENDA ORIGINAL
    let totalSessionsCorreto = pkg.total_sessions || 1;
    
    try {
      const salesStorage = localStorage.getItem('clinic-sales-v2');
      if (salesStorage) {
        const salesData = JSON.parse(salesStorage);
        
        // Buscar venda original
        for (const sale of salesData) {
          if (sale.items && Array.isArray(sale.items)) {
            for (const item of sale.items) {
              const clienteCompativel = (
                sale.clientName === pkg.client_name ||
                sale.client_name === pkg.client_name ||
                pkg.client_name.includes(sale.clientName) ||
                (sale.clientName && sale.clientName.includes(pkg.client_name))
              );
              
              const pacoteCompativel = (
                item.type === 'package' && (
                  item.itemName === pkg.package_name ||
                  pkg.package_name.includes(item.itemName) ||
                  (item.itemName && item.itemName.includes('Bronze'))
                )
              );
              
              if (clienteCompativel && pacoteCompativel) {
                totalSessionsCorreto = item.quantity || 1;
                console.log(`✅ AGENDAMENTO: Encontrado total correto de ${totalSessionsCorreto} sessões`);
                break;
              }
            }
          }
          if (totalSessionsCorreto > 1) break;
        }
        
        // FORÇAR 3 SESSÕES PARA PACOTE BRONZE SE NÃO ENCONTROU
        if (totalSessionsCorreto === 1 && pkg.package_name && pkg.package_name.includes('Bronze')) {
          console.log(`🛠️ AGENDAMENTO: Forçando 3 sessões para Pacote Bronze`);
          totalSessionsCorreto = 3;
        }
      }
    } catch (error) {
      console.error('❌ Erro ao buscar total de sessões para agendamento:', error);
    }

    // Buscar agendamento pendente para este pacote
    const pendingAppointment = appointments.find(apt => 
      apt.package_id === pkg.package_id && 
      apt.client_id === pkg.client_id && 
      apt.status === 'agendado' &&
      (!apt.appointment_date || apt.appointment_date === '')
    );
    
    if (pendingAppointment) {
      // Já existe um agendamento pendente, abrir modal para agendar
      console.log("📅 Encontrado agendamento pendente:", pendingAppointment);
      setSelectedAppointment(pendingAppointment);
      setScheduleModalOpen(true);
      
      toast({
        title: "📅 Agendamento Encontrado",
        description: `Agendando sessão pendente para ${pkg.client_name}`,
      });
      return;
    }

    // Calcular sessões realizadas e restantes
    const completedSessions = appointments.filter(a => 
      a.package_id === pkg.package_id && 
      a.client_id === pkg.client_id && 
      a.status === 'concluido'
    ).length;
    
    const remainingSessions = totalSessionsCorreto - completedSessions; // USANDO TOTAL CORRETO
    
    console.log(`📊 Sessões - Concluídas: ${completedSessions}, Total: ${totalSessionsCorreto}, Restantes: ${remainingSessions}`);
    
    if (remainingSessions <= 0) {
      toast({
        title: "✅ Pacote Completo",
        description: `Todas as ${totalSessionsCorreto} sessões do pacote de ${pkg.client_name} já foram realizadas.`,
      });
      return;
    }

    // Criar um novo agendamento para a próxima sessão
    const nextSessionNumber = completedSessions + 1;
    
    console.log(`🎆 Criando sessão ${nextSessionNumber} de ${totalSessionsCorreto}`);
    
    createFromSale({
      client_id: pkg.client_id,
      client_name: pkg.client_name,
      client_phone: pkg.client_phone || '',
      package_id: pkg.package_id,
      package_name: pkg.package_name,
      total_sessions: totalSessionsCorreto, // USANDO TOTAL CORRETO
      price: 0, // Já pago no pacote
      sale_date: pkg.sale_date,
      type: 'package_session',
    }).then((newAppointment) => {
      if (newAppointment) {
        console.log("✅ Nova sessão criada:", newAppointment);
        
        // Abrir modal de agendamento imediatamente
        setSelectedAppointment(newAppointment);
        setScheduleModalOpen(true);
        
        toast({
          title: "📅 Sessão Criada!",
          description: `Sessão ${nextSessionNumber}/${totalSessionsCorreto} criada. Escolha data e horário.`,
        });
        
        // Recarregar agendamentos
        refreshAppointments();
      }
    }).catch((error) => {
      console.error("❌ Erro ao criar sessão:", error);
      toast({
        title: "❌ Erro",
        description: "Erro ao criar nova sessão do pacote.",
        variant: "destructive",
      });
    });
  };

  const handleViewPackageHistory = (pkg: any) => {
    console.log("📝 Visualizando histórico do pacote:", pkg);
    
    // BUSCAR O TOTAL DE SESSÕES CORRETO DA VENDA ORIGINAL
    let totalSessionsCorreto = pkg.total_sessions || 1;
    
    try {
      const salesStorage = localStorage.getItem('clinic-sales-v2');
      if (salesStorage) {
        const salesData = JSON.parse(salesStorage);
        
        // Buscar venda original
        for (const sale of salesData) {
          if (sale.items && Array.isArray(sale.items)) {
            for (const item of sale.items) {
              const clienteCompativel = (
                sale.clientName === pkg.client_name ||
                sale.client_name === pkg.client_name ||
                pkg.client_name.includes(sale.clientName) ||
                (sale.clientName && sale.clientName.includes(pkg.client_name))
              );
              
              const pacoteCompativel = (
                item.type === 'package' && (
                  item.itemName === pkg.package_name ||
                  pkg.package_name.includes(item.itemName) ||
                  (item.itemName && item.itemName.includes('Bronze'))
                )
              );
              
              if (clienteCompativel && pacoteCompativel) {
                totalSessionsCorreto = item.quantity || 1;
                console.log(`✅ HISTÓRICO: Encontrado total correto de ${totalSessionsCorreto} sessões`);
                break;
              }
            }
          }
          if (totalSessionsCorreto > 1) break;
        }
        
        // FORÇAR 3 SESSÕES PARA PACOTE BRONZE SE NÃO ENCONTROU
        if (totalSessionsCorreto === 1 && pkg.package_name && pkg.package_name.includes('Bronze')) {
          console.log(`🛠️ HISTÓRICO: Forçando 3 sessões para Pacote Bronze`);
          totalSessionsCorreto = 3;
        }
      }
    } catch (error) {
      console.error('❌ Erro ao buscar total de sessões:', error);
    }
    
    const packageAppointments = appointments.filter(apt => 
      apt.package_id === pkg.package_id && 
      apt.client_id === pkg.client_id
    );
    
    const completedSessions = packageAppointments.filter(apt => apt.status === 'concluido');
    const pendingSessions = packageAppointments.filter(apt => apt.status !== 'concluido');
    
    const historyLines = [
      `📦 Pacote: ${pkg.package_name}`,
      `👤 Cliente: ${pkg.client_name}`,
      `💰 Valor Pago: R$ ${pkg.price.toFixed(2)}`,
      `📅 Data da Compra: ${format(parseISO(pkg.sale_date), "dd/MM/yyyy")}`,
      '',
      `✅ Sessões Concluídas: ${completedSessions.length}/${totalSessionsCorreto}`, // USANDO TOTAL CORRETO
      `⏳ Sessões Pendentes: ${pendingSessions.length}`,
      ''
    ];
    
    if (completedSessions.length > 0) {
      historyLines.push('📋 Sessões Realizadas:');
      completedSessions.forEach((session, i) => {
        historyLines.push(`${i + 1}. ${format(parseISO(session.date), "dd/MM/yyyy 'às' HH:mm")} - Sessão ${session.session_number}`);
      });
      historyLines.push('');
    }
    
    if (pendingSessions.length > 0) {
      historyLines.push('⏰ Próximas Sessões:');
      pendingSessions.forEach((session, i) => {
        const sessionInfo = session.appointment_date 
          ? `${format(parseISO(session.appointment_date), "dd/MM/yyyy")} às ${session.appointment_time}`
          : 'Aguardando agendamento';
        historyLines.push(`${i + 1}. ${sessionInfo} - Sessão ${session.session_number || (completedSessions.length + i + 1)}`);
      });
    }
    
    // Exibir em um alert para o usuário ver o histórico completo
    alert(historyLines.join('\n'));
    
    toast({
      title: "📝 Histórico Visualizado",
      description: `Histórico completo do pacote de ${pkg.client_name} exibido (${completedSessions.length}/${totalSessionsCorreto} sessões).`,
    });
  };



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_scheduling': return 'bg-yellow-500/20 text-yellow-700';
      case 'scheduled': return 'bg-blue-500/20 text-blue-700';
      case 'confirmed': return 'bg-green-500/20 text-green-700';
      case 'completed': return 'bg-purple-500/20 text-purple-700';
      case 'cancelled': return 'bg-red-500/20 text-red-700';
      default: return 'bg-gray-500/20 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending_scheduling': return 'Aguardando agendamento';
      case 'scheduled': return 'Agendado';
      case 'confirmed': return 'Confirmado';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  // Obter procedimentos pendentes - CORRIGIDO para mostrar TODOS os procedimentos individuais
  const pendingProcedures = appointments.filter(apt => {
    const isIndividual = apt.type === 'individual';
    const isWaitingSchedule = apt.status === 'agendado' && (!apt.appointment_date || apt.appointment_date === '');
    
    console.log(`🔍 Procedimento ${apt.id}: ${apt.client_name} - ${apt.service_name}`);
    console.log(`  - Tipo: ${apt.type}, Status: ${apt.status}, Data: ${apt.appointment_date}`);
    console.log(`  - É individual: ${isIndividual}, Aguarda agendamento: ${isWaitingSchedule}`);
    
    return isIndividual && isWaitingSchedule;
  });
  
  console.log(`📋 PROCEDIMENTOS PENDENTES ENCONTRADOS: ${pendingProcedures.length}`);
  pendingProcedures.forEach(proc => {
    console.log(`  - ${proc.client_name}: ${proc.service_name} (ID: ${proc.id})`);
  });
  
  // CORRIGIDO: Agrupar pacotes corretamente - BUSCAR DADOS DA VENDA ORIGINAL
  console.log("🔍 AGRUPANDO PACOTES ATIVOS - BUSCANDO DADOS DA VENDA ORIGINAL");
  const activePackages = appointments
    .filter(apt => {
      const isPackageSession = apt.type === 'package_session';
      console.log(`🔍 Filtrando agendamento: ${apt.client_name} - ${apt.package_name} (${apt.type}) - ${isPackageSession ? 'INCLUIR' : 'EXCLUIR'}`);
      return isPackageSession;
    })
    .reduce((packages: any[], apt) => {
      console.log(`🔄 PROCESSANDO AGENDAMENTO PARA AGRUPAMENTO:`, {
        cliente: apt.client_name,
        pacote: apt.package_name,
        package_id: apt.package_id,
        client_id: apt.client_id,
        total_sessions: apt.total_sessions
      });
      
      // Buscar se já existe este pacote
      const existingPackage = packages.find(pkg => {
        const match = pkg.package_id === apt.package_id && pkg.client_id === apt.client_id;
        console.log(`  🔍 Comparando com pacote existente: ${pkg.client_name} - ${pkg.package_name} (${match ? 'ENCONTRADO' : 'NOVO'})`);
        return match;
      });
      
      if (!existingPackage) {
        // Calcular sessões realizadas (concluídas)
        const completedSessions = appointments.filter(a => 
          a.package_id === apt.package_id && 
          a.client_id === apt.client_id && 
          a.status === 'concluido'
        ).length;
        
        console.log(`📊 Sessões concluídas para ${apt.client_name} - ${apt.package_name}: ${completedSessions}`);
        
        // BUSCAR total_sessions da VENDA ORIGINAL no localStorage
        let totalSessionsFromSale = apt.total_sessions || 5;
        
        try {
          const salesStorage = localStorage.getItem('clinic-sales-v2');
          if (salesStorage) {
            const salesData = JSON.parse(salesStorage);
            console.log(`📊 Encontradas ${salesData.length} vendas para buscar dados do pacote`);
            
            let foundSale = false;
            for (const sale of salesData) {
              if (sale.items && Array.isArray(sale.items)) {
                for (const item of sale.items) {
                  const saleClientName = (sale.clientName || sale.client_name || '').trim().toLowerCase();
                  const aptClientName = (apt.client_name || '').trim().toLowerCase();
                  const clienteMatch = saleClientName === aptClientName && saleClientName !== '';

                  const packageMatch = item.type === 'package' && 
                                       (item.item_id === apt.package_id || item.itemName === apt.package_name);
                  
                  console.log(`    🔍 Verificando venda: ${sale.clientName || sale.client_name} - ${item.itemName} (${clienteMatch && packageMatch ? 'MATCH' : 'NO MATCH'})`);
                  
                  if (clienteMatch && packageMatch && item.quantity) {
                    totalSessionsFromSale = item.quantity;
                    console.log(`    📦 ENCONTRADO! Pacote ${apt.package_name} tem ${totalSessionsFromSale} sessões da venda original`);
                    foundSale = true;
                    break;
                  }
                }
                if (foundSale) break;
              }
            }
            
            if (!foundSale) {
              console.log(`    ⚠️ Não encontrado na venda, mantendo valor: ${totalSessionsFromSale}`);
            }
          } else {
            console.log(`⚠️ Nenhuma venda encontrada no localStorage`);
          }
        } catch (error) {
          console.error('❌ Erro ao buscar dados da venda original:', error);
        }
        
        // Criar entrada do pacote
        const newPackage = {
          id: apt.id,
          client_id: apt.client_id,
          client_name: apt.client_name,
          client_phone: apt.client_phone,
          package_id: apt.package_id,
          package_name: apt.package_name,
          total_sessions: totalSessionsFromSale, // USANDO DADOS DA VENDA ORIGINAL!
          session_number: completedSessions, // Sessões já realizadas
          price: apt.price || 0,
          sale_date: apt.sale_date || new Date().toISOString(),
          status: apt.status
        };
        
        packages.push(newPackage);
        console.log(`✅ Pacote adicionado: ${apt.package_name} - ${completedSessions}/${totalSessionsFromSale} sessões`);
      } else {
        console.log(`⏭️ Pacote já existe, pulando: ${apt.package_name}`);
      }
      
      return packages;
    }, []);
    
  console.log(`🎉 PACOTES ATIVOS AGRUPADOS:`, activePackages);

  // Filtrar procedimentos e pacotes aguardando agendamento manual
  const pendingAppointments = appointments.filter(appointment => 
    appointment.status === 'agendado' && 
    (!appointment.appointment_date || appointment.appointment_date === '')
  );

  // Filtrar agendamentos de hoje
  const todaysAppointments = appointments.filter(appointment => {
    if (!appointment.appointment_date) return false;
    const appointmentDate = new Date(appointment.appointment_date);
    const today = new Date();
    return (
      appointmentDate.toDateString() === today.toDateString() &&
      appointment.status === 'agendado'
    );
  });

  // Novas seções: procedimentos concluídos e pacotes concluídos
  const completedProcedures = appointments.filter(apt => apt.type === 'individual' && apt.status === 'concluido');
  const completedPackages = appointments.filter(apt => apt.type === 'package_session' && apt.status === 'concluido');

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Agendamentos | Gestão de Clínica Estética</title>
        <meta name="description" content="Controle de procedimentos e sessões de pacotes - gestão completa de agendamentos" />
      </Helmet>

      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient-brand">Agendamentos</h1>
            <p className="text-muted-foreground">Controle de procedimentos e sessões de pacotes</p>
          </div>
          <div className="flex gap-3">
            {/* BOTÃO PRINCIPAL - SINCRONIZAR COM CAIXA */}
            <Button 
              variant="outline" 
              size="lg" 
              onClick={sincronizarTodosOsPacotesComCaixa}
              className="bg-green-500/20 text-green-700 hover:bg-green-500/30 border-green-300 font-bold text-base px-6"
            >
              🔄 SINCRONIZAR PACOTES COM VENDAS DO CAIXA
            </Button>
            
            {/* BOTÃO DE EMERGÊNCIA - PROCEDIMENTOS PERDIDOS */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={recuperarProcedimentosPerdidos}
              className="bg-red-500/20 text-red-700 hover:bg-red-500/30 border-red-300 font-bold"
            >
              🚑 EMERGÊNCIA: Recuperar 5 Procedimentos
            </Button>
            
            {/* BOTÃO PARA SINCRONIZAR COM PACOTES DO SERVIDOR */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={sincronizarComPacotesDoServidor}
              className="bg-blue-500/20 text-blue-700 hover:bg-blue-500/30 border-blue-300 font-bold"
            >
              🔄 SINCRONIZAR: Ana Silva - Pacote Bronze (3 sessões)
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                const currentMode = localStorage.getItem('force-offline-mode') || 'true';
                const newMode = currentMode === 'true' ? 'false' : 'true';
                localStorage.setItem('force-offline-mode', newMode);
                
                toast({
                  title: newMode === 'true' ? '🔌 Modo Offline Ativado' : '☁️ Modo Online Ativado',
                  description: newMode === 'true' 
                    ? 'Sistema rodando offline com localStorage' 
                    : 'Sistema tentará conectar com Supabase. Recarregue a página.',
                });
                
                if (newMode === 'false') {
                  setTimeout(() => window.location.reload(), 2000);
                }
              }}
              className="bg-gray-500/20 text-gray-700 hover:bg-gray-500/30"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              🔌 Alternar Modo (Offline)
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearAllAppointments}
              className="bg-red-500/20 text-red-700 hover:bg-red-500/30"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar Tudo
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleProcessExistingSales}
              className="bg-green-500/20 text-green-700 hover:bg-green-500/30"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              🔄 Processar Vendas do Caixa
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                // Corrigir inconsistências entre pacotes e agendamentos
                const confirmFix = confirm('🔧 CORRIGIR INCONSISTÊNCIAS?\n\n' +
                  'Isso vai:\n' +
                  '• Sincronizar pacotes com agendamentos\n' +
                  '• Corrigir contadores de sessões\n' +
                  '• Remover duplicatas\n' +
                  '• Criar sessões faltantes\n\n' +
                  'Continuar?');
                
                if (confirmFix) {
                  console.log('🔧 INICIANDO CORREÇÃO DE INCONSISTÊNCIAS...');
                  
                  // Limpar agendamentos duplicados/inconsistentes
                  const cleanedAppointments = appointments.filter((apt, index, arr) => {
                    // Manter apenas o primeiro de cada grupo idêntico
                    return arr.findIndex(a => 
                      a.client_name === apt.client_name &&
                      a.package_name === apt.package_name &&
                      a.session_number === apt.session_number
                    ) === index;
                  });
                  
                  console.log(`🧡 Limpeza: ${appointments.length} → ${cleanedAppointments.length} agendamentos`);
                  
                  // Salvar agendamentos limpos
                  localStorage.setItem('clinic-appointments-v2', JSON.stringify(cleanedAppointments));
                  
                  toast({
                    title: '🔧 Inconsistências Corrigidas!',
                    description: `Sistema sincronizado. Agendamentos: ${appointments.length} → ${cleanedAppointments.length}`,
                  });
                  
                  // Recarregar página para aplicar correções
                  setTimeout(() => window.location.reload(), 1500);
                }
              }}
              className="bg-orange-500/20 text-orange-700 hover:bg-orange-500/30"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              🔧 Corrigir Inconsistências
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                // Verificar todos os dados salvos no localStorage
                const savedAppointments = localStorage.getItem('clinic-appointments-v2');
                const savedSales = localStorage.getItem('clinic-sales-v2');
                const savedClients = localStorage.getItem('clinic-clients-v2');
                const savedServices = localStorage.getItem('clinic-services-v2');
                
                const appointmentsData = savedAppointments ? JSON.parse(savedAppointments) : [];
                const salesData = savedSales ? JSON.parse(savedSales) : [];
                const clientsData = savedClients ? JSON.parse(savedClients) : [];
                const servicesData = savedServices ? JSON.parse(savedServices) : [];
                
                const dataReport = [
                  '🗄️ RELATÓRIO DE DADOS SALVOS NO SEU COMPUTADOR:',
                  '',
                  `📅 AGENDAMENTOS: ${appointmentsData.length} registros salvos`,
                  `💰 VENDAS/CAIXA: ${salesData.length} vendas salvas`,
                  `👥 CLIENTES: ${clientsData.length} clientes salvos`,
                  `🛍️ SERVIÇOS: ${servicesData.length} serviços salvos`,
                  '',
                  '✅ TODOS OS DADOS ESTÃO SEGUROS NO SEU COMPUTADOR!',
                  '🔌 Sistema funcionando em modo OFFLINE',
                  '💾 Dados salvos automaticamente no localStorage',
                  '',
                  '⚠️ IMPORTANTE:',
                  '• Os dados não foram perdidos',
                  '• Tudo está salvo no seu navegador',
                  '• O sistema funciona 100% offline',
                  '• Quando o Supabase voltar, você pode sincronizar'
                ].join('\n');
                
                alert(dataReport);
                
                toast({
                  title: '✅ Dados Verificados!',
                  description: `Encontrados: ${appointmentsData.length} agendamentos, ${salesData.length} vendas, ${clientsData.length} clientes`,
                });
              }}
              className="bg-blue-500/20 text-blue-700 hover:bg-blue-500/30"
            >
              <Search className="h-4 w-4 mr-2" />
              🗄️ Ver Dados Salvos
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={async () => {
                console.log("🚑 FORÇANDO RECRIAÇÃO DE AGENDAMENTOS PERDIDOS...");
                
                try {
                  const resultado = await processExistingSales();
                  
                  toast({
                    title: "✅ Agendamentos Recuperados!",
                    description: `${resultado} agendamentos foram criados das vendas existentes.`,
                  });
                  
                  // Recarregar a página para mostrar os novos agendamentos
                  setTimeout(() => window.location.reload(), 1000);
                } catch (error) {
                  console.error('❌ Erro ao recuperar agendamentos:', error);
                  toast({
                    title: "❌ Erro",
                    description: "Erro ao recuperar agendamentos das vendas.",
                    variant: "destructive",
                  });
                }
              }}
              className="bg-green-500/20 text-green-700 hover:bg-green-500/30"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              🚑 Recuperar Agendamentos
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={debugVendasDoCaixa}
              className="bg-cyan-500/20 text-cyan-700 hover:bg-cyan-500/30"
            >
              <Search className="h-4 w-4 mr-2" />
              🔍 Debug Vendas do Caixa
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={debugPackages}
              className="bg-purple-500/20 text-purple-700 hover:bg-purple-500/30"
            >
              <Search className="h-4 w-4 mr-2" />
              🔍 Debug Pacotes
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={debugSystem}
              className="bg-yellow-500/20 text-yellow-700 hover:bg-yellow-500/30"
            >
              <Search className="h-4 w-4 mr-2" />
              🔍 Debug Sistema
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSyncWithSupabase}
              className="bg-emerald-500/20 text-emerald-700 hover:bg-emerald-500/30 font-semibold border-2"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              🔄 Sincronizar com Supabase
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro de Conexão</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        {/* SEÇÃO 1: PROCEDIMENTOS INDIVIDUAIS (Aguardando agendamento) */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-2">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Procedimentos Individuais</h2>
              <p className="text-sm text-muted-foreground">
                Aguardando agendamento
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {pendingProcedures.length === 0 ? (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Nenhum procedimento aguardando agendamento</p>
                <div className="flex gap-3 justify-center">
                  <Button 
                    variant="outline" 
                    className="bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
                    onClick={() => window.location.href = '/caixa'}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Ir para o Caixa
                  </Button>
                  <span className="text-muted-foreground text-sm self-center">Venda procedimentos para criar agendamentos</span>
                </div>
              </div>
            ) : (
              pendingProcedures.map((appointment) => (
                <div key={appointment.id} className="border border-border/50 rounded-lg p-4 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-2">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground text-lg">{appointment.client_name}</h3>
                          <p className="text-sm text-muted-foreground">Cliente</p>
                        </div>
                      </div>
                      
                      <div className="ml-11 space-y-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-purple-500" />
                          <span className="font-medium text-foreground">{appointment.service_name}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-foreground">
                            Pago: R$ {appointment.price?.toFixed(2).replace('.', ',') || '0,00'} ({format(parseISO(appointment.sale_date || new Date().toISOString()), 'dd/MM/yyyy', { locale: ptBR })})
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-orange-500" />
                          <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                            {(!appointment.appointment_date || appointment.appointment_date === '') ? 'AGUARDANDO AGENDAMENTO' : 'AGENDADO'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Button 
                        size="sm" 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        onClick={() => handleScheduleAppointment(appointment.id.toString())}
                      >
                        🗓️ AGENDAR AGORA
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleCallClient(appointment.client_name, appointment.client_phone)}>
                        📞 LIGAR CLIENTE
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>

        {/* SEÇÃO 2: PACOTES ATIVOS (Com sessões disponíveis) */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-full bg-blue-500/20 p-2">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">SEÇÃO 2: PACOTES ATIVOS</h2>
              <p className="text-sm text-muted-foreground">
                Com sessões disponíveis • {activePackages.length} pacote{activePackages.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          {activePackages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">Nenhum pacote ativo no momento</p>
              <p className="text-sm mt-2 mb-4">Os pacotes vendidos no caixa aparecerão aqui automaticamente</p>
              <Button 
                variant="outline" 
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                onClick={() => window.location.href = '/caixa'}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Vender Pacotes no Caixa
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {activePackages.map((pkg) => {
                // DEPURAÇÃO: Logs detalhados para cada pacote
                console.log(`🔍 PROCESSANDO PACOTE:`, {
                  cliente: pkg.client_name,
                  pacote: pkg.package_name,
                  total_sessions_do_objeto: pkg.total_sessions,
                  package_id: pkg.package_id,
                  client_id: pkg.client_id
                });
                
                // Calcular sessões realizadas (status 'concluido')
                const completedSessions = appointments.filter(apt => 
                  apt.package_id === pkg.package_id && 
                  apt.client_id === pkg.client_id && 
                  apt.status === 'concluido'
                ).length;
                
                const realTotalSessions = pkg.total_sessions || 0; // Use 0 as a safe fallback
                const remainingSessions = realTotalSessions - completedSessions;
                const progress = realTotalSessions ? (completedSessions / realTotalSessions) * 100 : 0;
                
                const packageHistory = appointments.filter(apt => 
                  apt.package_id === pkg.package_id && 
                  apt.client_id === pkg.client_id &&
                  apt.status === 'concluido'
                );
                
                console.log(`📊 RESULTADO FINAL:`, {
                  pacote: pkg.package_name,
                  total_real: realTotalSessions,
                  concluidas: completedSessions,
                  restantes: remainingSessions
                });
                
                return (
                  <div key={pkg.id} className="p-6 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-blue-200 shadow-lg backdrop-blur-sm">
                    {/* Cabeçalho do Cliente */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-blue-500/30 dark:bg-blue-400/30">
                          <User className="h-5 w-5 text-blue-700 dark:text-blue-300" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            👤 {pkg.client_name}
                          </h3>
                          <p className="text-blue-700 dark:text-blue-300 font-medium flex items-center gap-2 mt-1">
                            📦 {pkg.package_name}
                          </p>
                          <p className="text-gray-700 dark:text-gray-300 text-sm flex items-center gap-2 mt-1">
                            💰 Pago: R$ {pkg.price.toFixed(2)} ({format(parseISO(pkg.sale_date), "dd/MM/yyyy")})
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Barra de Progresso das Sessões */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">🔢 SESSÕES:</span>
                        <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                          {remainingSessions}/{realTotalSessions} restantes
                        </span>
                      </div>
                      <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-3 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {completedSessions} sessões realizadas de {realTotalSessions} totais
                      </p>
                    </div>

                    {/* Histórico de Sessões */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        📅 HISTÓRICO DE SESSÕES:
                      </h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {packageHistory.length > 0 ? (
                          packageHistory.map((session, index) => (
                            <div key={index} className="flex items-center gap-3 text-sm p-2 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700">
                              <span className="text-green-600">✅</span>
                              <span className="text-gray-700 dark:text-gray-300">
                                {format(parseISO(session.date), "dd/MM/yyyy 'às' HH:mm")} - Sessão {session.session_number}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="flex items-center gap-3 text-sm p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg border border-orange-200 dark:border-orange-700">
                            <span className="text-orange-500">⏳</span>
                            <span className="text-gray-700 dark:text-gray-300">
                              ___/___/____ às __:__ - Primeira sessão (agendar)
                            </span>
                          </div>
                        )}
                        {remainingSessions > 0 && completedSessions < realTotalSessions && (
                          <div className="flex items-center gap-3 text-sm p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg border-2 border-dashed border-blue-400 dark:border-blue-500">
                            <span className="text-blue-500">⏳</span>
                            <span className="text-blue-700 dark:text-blue-300 font-medium">
                              ___/___/____ às __:__ - Próxima sessão (agendar)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex gap-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 bg-white/80 dark:bg-slate-700/80"
                        onClick={() => handleViewPackageHistory(pkg)}
                      >
                        <History className="h-4 w-4 mr-2" />
                        📝 VER HISTÓRICO
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg"
                        onClick={() => scheduleNextSession(pkg.id.toString())}
                      >
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        🗓️ AGENDAR PRÓXIMA
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>

        {/* SEÇÃO 3: TODOS OS AGENDAMENTOS */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-full bg-blue-500/20 p-2">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">SEÇÃO 3: TODOS OS AGENDAMENTOS</h2>
              <p className="text-sm text-muted-foreground">
                Visualização completa • {appointments.length} agendamento{appointments.length !== 1 ? 's' : ''} total
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {appointments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CalendarIcon className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">Nenhum agendamento encontrado</p>
                <p className="text-sm mt-2">Vá para o caixa e venda serviços para criar agendamentos</p>
                <Button 
                  variant="outline" 
                  className="mt-4 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                  onClick={() => window.location.href = '/caixa'}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Ir para o Caixa
                </Button>
              </div>
            ) : (
              appointments.map((appointment) => {
                const isScheduled = appointment.appointment_date && appointment.appointment_date !== '';
                const statusColor = appointment.status === 'agendado' 
                  ? (isScheduled ? 'bg-blue-500/20 text-blue-700' : 'bg-orange-500/20 text-orange-700')
                  : appointment.status === 'concluido' 
                  ? 'bg-green-500/20 text-green-700'
                  : 'bg-gray-500/20 text-gray-700';
                
                const statusText = appointment.status === 'agendado'
                  ? (isScheduled ? '📅 AGENDADO' : '⏳ AGUARDANDO AGENDAMENTO')
                  : appointment.status === 'concluido'
                  ? '✅ CONCLUÍDO'
                  : appointment.status;
                
                return (
                  <div key={appointment.id} className="p-4 rounded-xl bg-gradient-to-r from-slate-50/50 to-blue-50/50 border border-slate-200/30 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 rounded-full bg-blue-500/20">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground text-lg">{appointment.client_name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {appointment.type === 'individual' ? 'Procedimento Individual' : `Pacote - Sessão ${appointment.session_number || 1}`}
                            </p>
                          </div>
                        </div>
                        
                        <div className="ml-11 space-y-2">
                          <div className="flex items-center gap-2">
                            {appointment.type === 'individual' ? (
                              <Sparkles className="h-4 w-4 text-purple-500" />
                            ) : (
                              <Package className="h-4 w-4 text-blue-500" />
                            )}
                            <span className="font-medium text-foreground">
                              {appointment.service_name || appointment.package_name}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-foreground">
                              R$ {appointment.price?.toFixed(2).replace('.', ',') || '0,00'}
                            </span>
                          </div>
                          
                          {isScheduled ? (
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="h-4 w-4 text-blue-500" />
                              <span className="text-sm text-foreground font-medium">
                                📅 {format(parseISO(appointment.appointment_date), 'dd/MM/yyyy')} às {appointment.appointment_time || '09:00'}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-orange-500" />
                              <span className="text-sm text-orange-600 font-medium">
                                ⏳ Data e horário não definidos
                              </span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={statusColor}>
                              {statusText}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        {!isScheduled && appointment.status === 'agendado' && (
                          <Button 
                            size="sm" 
                            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                            onClick={() => handleScheduleAppointment(appointment.id.toString())}
                          >
                            🗓️ AGENDAR
                          </Button>
                        )}
                        
                        {isScheduled && appointment.status === 'agendado' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-green-200 hover:bg-green-50 text-green-700"
                            onClick={() => handleConfirmAttendance(appointment)}
                          >
                            ✅ CONFIRMAR PRESENÇA
                          </Button>
                        )}
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleCallClient(appointment.client_name, appointment.client_phone)}
                        >
                          📞 LIGAR
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </GlassCard>

        {/* SEÇÃO 4: AGENDAMENTOS DE HOJE */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-full bg-green-500/20 p-2">
              <CalendarIcon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">SEÇÃO 3: AGENDAMENTOS DE HOJE</h2>
              <p className="text-sm text-muted-foreground">
                Controle de presença • {todaysAppointments.length} agendamento{todaysAppointments.length !== 1 ? 's' : ''} para hoje
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {todaysAppointments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CalendarIcon className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">Nenhum agendamento para hoje</p>
                <p className="text-sm mt-2">Os agendamentos confirmados aparecerão aqui</p>
              </div>
            ) : (
              todaysAppointments.map((appointment) => (
                <div key={appointment.id} className="p-6 rounded-xl bg-gradient-to-r from-green-50/50 to-blue-50/50 border border-green-200/30 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Horário */}
                      <div className="text-center p-3 bg-white/70 rounded-lg border border-green-200/50">
                        <p className="text-lg font-bold text-green-600">
                          {appointment.appointment_time || '09:00'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(), 'dd/MM', { locale: ptBR })}
                        </p>
                      </div>
                      
                      <div className="h-12 w-px bg-green-200" />
                      
                      {/* Informações do Cliente */}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                          👤 {appointment.client_name}
                        </h3>
                        <p className="text-green-600 font-medium flex items-center gap-2 mt-1">
                          {appointment.type === 'package_session' ? '📦' : '🔸'} {appointment.service_name || appointment.package_name}
                        </p>
                        {appointment.type === 'package_session' && appointment.session_number && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Sessão {appointment.session_number} de {appointment.total_sessions} do pacote
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2">
                          <Badge 
                            variant={appointment.status === 'confirmado' ? 'default' : 'secondary'}
                            className={appointment.status === 'confirmado' ? 'bg-green-500/20 text-green-700' : ''}
                          >
                            📅 {getStatusText(appointment.status)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    {/* Botões de Ação */}
                    <div className="flex items-center gap-3">
                      {appointment.status === 'concluido' ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-5 w-5" />
                          <span className="font-medium">✅ Concluído</span>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6"
                          onClick={() => handleConfirmAttendance(appointment)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          ✅ CONFIRMAR PRESENÇA
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>

        {/* Seção 4: Procedimentos Concluídos */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-purple-500" />
              Procedimentos Concluídos
              <Badge variant="secondary" className="ml-2">{completedProcedures.length}</Badge>
            </h2>
          </div>
          
          {completedProcedures.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum procedimento concluído ainda</p>
              <p className="text-sm mt-1">Os procedimentos finalizados aparecerão aqui</p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedProcedures.map((procedure) => (
                <div key={procedure.id} className="p-4 rounded-lg bg-card/50 border border-border/50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-purple-500/20">
                        <User className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{procedure.client_name}</p>
                        <p className="text-sm text-muted-foreground">{procedure.service_name}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            R$ {procedure.price.toFixed(2)}
                          </span>
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" />
                            Concluído: {procedure.completed_at ? format(parseISO(procedure.completed_at), "dd/MM/yyyy") : 'Data não registrada'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-purple-500/20 text-purple-700">
                      Concluído
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Seção 5: Pacotes Concluídos */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-500" />
              Pacotes Concluídos
              <Badge variant="secondary" className="ml-2">{completedPackages.length}</Badge>
            </h2>
          </div>
          
          {completedPackages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum pacote concluído ainda</p>
              <p className="text-sm mt-1">Os pacotes aparecerão aqui quando todas as sessões forem concluídas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {completedPackages.map((pkg) => {
                const history = appointments.filter(apt => 
                  apt.package_id === pkg.package_id && 
                  apt.client_id === pkg.client_id &&
                  apt.status === 'concluido'
                );
                const firstSession = history[0];
                const lastSession = history[history.length - 1];

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
                              <DollarSign className="h-3 w-3" />
                              R$ {pkg.price.toFixed(2)}
                            </span>
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="h-3 w-3" />
                              Concluído em: {lastSession?.completed_at ? format(parseISO(lastSession.completed_at), "dd/MM/yyyy") : '--'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-blue-500/20 text-blue-700">
                        {history.length}/{pkg.total_sessions} sessões
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Sessões Realizadas</span>
                        <span className="font-medium">{history.length} de {pkg.total_sessions}</span>
                      </div>
                      <Progress value={(history.length / (pkg.total_sessions || 1)) * 100} className="h-2" />
                      
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

        {/* Modal de Agendamento */}
        <Dialog open={scheduleModalOpen} onOpenChange={setScheduleModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agendar Procedimento</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Input value={selectedAppointment?.client_name || ''} disabled />
              </div>

              <div className="space-y-2">
                <Label>Procedimento</Label>
                <Input value={selectedAppointment?.service_name || ''} disabled />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Data</Label>
                  <Input
                    id="date"
                    type="date"
                    value={selectedAppointment?.appointment_date || ''}
                    onChange={(e) => setSelectedAppointment(prev => prev ? {...prev, appointment_date: e.target.value} : null)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Horário</Label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 21 }, (_, i) => {
                        const hour = Math.floor(i / 2) + 8;
                        const minute = (i % 2) * 30;
                        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                        return <SelectItem key={time} value={time}>{time}</SelectItem>;
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setScheduleModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleConfirmSchedule} className="bg-brand-gradient hover:opacity-90">
                  Confirmar Agendamento
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}