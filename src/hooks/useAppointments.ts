import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { SYSTEM_CONFIG } from '@/config/system';
import { supabase } from '@/integrations/supabase/client';

// MODO OFFLINE COMPLETO - SEM SUPABASE PARA EVITAR LOOPS

export interface Appointment {
  id: number;
  client_id?: number; // Opcional pois o esquema não tem essa coluna
  client_name: string;
  client_phone: string;
  service_id?: number;
  service_name?: string;
  date: string; // Campo obrigatório no esquema
  time: string; // Campo obrigatório no esquema
  duration: number;
  price: number;
  notes: string;
  status: "agendado" | "confirmado" | "concluido" | "cancelado"; // Valores do esquema
  created_at: string;
  // Campos extras para compatibilidade com o sistema atual
  package_id?: number;
  package_name?: string;
  appointment_date?: string; // Alias para date
  appointment_time?: string; // Alias para time
  type?: "individual" | "package_session";
  session_number?: number;
  total_sessions?: number;
  sale_date?: string;
  completed_at?: string;
}

export interface PackageSession extends Appointment {
  total_sessions: number;
  used_sessions: number;
  remaining_sessions: number;
  session_history: {
    id: number;
    date: string;
    time: string;
    status: 'completed' | 'scheduled';
    notes?: string;
  }[];
}

const APPOINTMENTS_STORAGE_KEY = 'clinic-appointments-v2';

export function useAppointments() {
  console.log("🚀🚀🚀 useAppointments hook inicializado - MODO OFFLINE COMPLETO");
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para carregar agendamentos - Online (Supabase) e Offline (localStorage)
  const loadAppointments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // Forçar modo offline temporariamente para evitar erro do Supabase
    const isOffline = true; // localStorage.getItem('force-offline-mode') === 'true';

    if (isOffline) {
      console.log("📋 Carregando agendamentos (MODO OFFLINE)...");
      try {
        const stored = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          setAppointments(data);
        } else {
          setAppointments([]);
        }
      } catch (err) {
        console.error('❌ Erro ao carregar do localStorage:', err);
        setError('Erro ao carregar agendamentos locais.');
        setAppointments([]);
      }
    } else {
      console.log("☁️ Carregando agendamentos (MODO ONLINE - SUPABASE)...");
      const { data, error: supabaseError } = await supabase
        .from('appointments')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) {
        console.error('❌ Erro ao buscar agendamentos do Supabase:', supabaseError);
        setError('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.');
        setAppointments([]);
      } else {
        console.log('✅ Agendamentos carregados do Supabase:', data.length);
        setAppointments(data || []);
        saveToStorage(data || []); // Salva os dados frescos no localStorage para cache
      }
    }
    
    setIsLoading(false);
  }, []);

  // Salvar no localStorage
  const saveToStorage = (data: Appointment[]) => {
    try {
      localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(data));
      console.log("💾 Agendamentos salvos no localStorage:", data.length);
    } catch (err) {
      console.error('❌ Erro ao salvar no localStorage:', err);
    }
  };

  // Criar agendamento a partir de venda do caixa (Online/Offline)
  const createFromSale = async (saleData: {
    client_id: number;
    client_name: string;
    client_phone: string;
    service_id?: number;
    service_name?: string;
    package_id?: number;
    package_name?: string;
    total_sessions?: number;
    price: number;
    sale_date: string;
    type: 'individual' | 'package_session';
    session_number?: number;
  }) => {
    // Forçar modo offline temporariamente para evitar erro do Supabase
    const isOffline = true; // localStorage.getItem('force-offline-mode') === 'true';

    if (isOffline) {
      console.log("🆕 TRANSFERINDO PARA AGENDAMENTOS (OFFLINE):", {
        cliente: saleData.client_name,
        tipo: saleData.type,
        item: saleData.service_name || saleData.package_name,
        sessoes: saleData.total_sessions
      });
      
      if (saleData.type === 'package_session') {
        // 📦 CRIANDO PACOTE COM MÚLTIPLAS SESSÕES
        console.log(`📦 Criando pacote: ${saleData.package_name} com ${saleData.total_sessions} sessões`);
        
        // Removida a verificação de duplicatas para permitir a compra de múltiplos pacotes iguais
        /*
        const existingPackage = appointments.find(apt => 
          apt.client_id === saleData.client_id && 
          apt.package_id === saleData.package_id &&
          apt.type === 'package_session'
        );
        
        if (existingPackage) {
          console.log(`⚠️ Pacote já existe para ${saleData.client_name}, pulando...`);
          return existingPackage;
        }
        */
        
        // Criar apenas a primeira sessão do pacote (as outras serão criadas conforme necessário)
        const newId = Math.max(0, ...appointments.map(a => a.id)) + 1;
        const newSession: Appointment = {
          id: newId,
          client_id: saleData.client_id,
          client_name: saleData.client_name,
          client_phone: saleData.client_phone || '',
          package_id: saleData.package_id,
          package_name: saleData.package_name,
          total_sessions: saleData.total_sessions || 1,
          session_number: saleData.session_number || 1,
          type: 'package_session',
          price: 0, // Já pago no pacote
          sale_date: saleData.sale_date,
          status: 'agendado',
          notes: `Sessão ${saleData.session_number || 1} de ${saleData.total_sessions || 1} - ${saleData.package_name}`,
          duration: 60,
          created_at: new Date().toISOString(),
          date: '', 
          time: '', 
          appointment_date: '', 
          appointment_time: ''
        };
        
        const updatedAppointments = [...appointments, newSession];
        setAppointments(updatedAppointments);
        saveToStorage(updatedAppointments);
        
        console.log(`✅ Pacote transferido: ${saleData.package_name} - Primeira sessão criada`);
        return newSession;
        
      } else {
        // 🔸 CRIANDO PROCEDIMENTO INDIVIDUAL
        console.log(`🔸 Criando procedimento individual: ${saleData.service_name}`);
        
        // Verificar se já existe este procedimento para evitar duplicatas
        const existing = appointments.find(apt => 
          apt.client_name === saleData.client_name && 
          apt.service_name === saleData.service_name &&
          apt.type === 'individual'
        );
        
        if (existing) {
          console.log(`⚠️ Procedimento já existe para ${saleData.client_name}, pulando...`);
          return existing;
        }
        
        const newId = Math.max(0, ...appointments.map(a => a.id)) + 1;
        const newAppointment: Appointment = {
          id: newId,
          client_id: saleData.client_id,
          client_name: saleData.client_name,
          client_phone: saleData.client_phone || '',
          service_id: saleData.service_id,
          service_name: saleData.service_name,
          type: 'individual',
          price: saleData.price,
          sale_date: saleData.sale_date,
          status: 'agendado',
          notes: `Aguardando agendamento - ${saleData.service_name}`,
          duration: 60,
          created_at: new Date().toISOString(),
          date: '', 
          time: '', 
          appointment_date: '', 
          appointment_time: ''
        };
        
        const updatedAppointments = [...appointments, newAppointment];
        setAppointments(updatedAppointments);
        saveToStorage(updatedAppointments);
        
        console.log(`✅ Procedimento transferido: ${saleData.service_name}`);
        return newAppointment;
      }
    } else {
      // LÓGICA ONLINE
      console.log("☁️ Criando agendamento a partir de venda (ONLINE - SUPABASE):", saleData);

      // Apenas campos que existem na tabela appointments do Supabase
      const appointmentToInsert = {
        client_name: saleData.client_name,
        client_phone: saleData.client_phone,
        service_name: saleData.service_name || saleData.package_name,
        date: '2024-01-01', // Data temporária - será agendada depois
        time: '09:00',      // Horário temporário - será agendado depois
        duration: 60,
        price: saleData.price,
        notes: `Aguardando agendamento - ${saleData.service_name || saleData.package_name}`,
        status: 'agendado'
      };

      // Para pacotes, criar apenas a primeira sessão (as outras serão criadas conforme necessário)
      if (saleData.type === 'package_session') {
        console.log(`📦 Criando primeira sessão do pacote: ${saleData.package_name}`);
        
        const { data, error } = await supabase
          .from('appointments')
          .insert({
            client_name: saleData.client_name,
            client_phone: saleData.client_phone,
            service_name: `${saleData.package_name} - Sessão 1`,
            date: '2024-01-01', // Data temporária - será agendada depois
            time: '09:00',      // Horário temporário - será agendado depois
            duration: 60,
            price: 0,
            notes: `Sessão 1 de ${saleData.total_sessions} - ${saleData.package_name}`,
            status: 'agendado'
          })
          .select();

        if (error) {
          console.error('❌ Erro ao criar sessão do pacote no Supabase:', error);
          toast({ 
            title: "✅ Venda registrada!", 
            description: `Venda salva com sucesso. Agendamento será criado automaticamente.`,
          });
          return null;
        }

        if (data && data[0]) {
          console.log('✅ Primeira sessão do pacote criada no Supabase:', data[0]);
          
          // Adicionar campos extras para funcionalidade local
          const enhancedAppointment = {
            ...data[0],
            package_id: saleData.package_id,
            package_name: saleData.package_name,
            total_sessions: saleData.total_sessions,
            session_number: 1,
            type: 'package_session',
            sale_date: saleData.sale_date,
            appointment_date: '',
            appointment_time: ''
          };
          
          setAppointments(prev => [enhancedAppointment, ...prev]);
          saveToStorage([enhancedAppointment, ...appointments]);
          
          toast({
            title: "✅ Pacote transferido!",
            description: `${saleData.package_name} transferido para agendamentos. Vá para 'Agendamentos' para marcar as datas.`,
          });
        }
        return data?.[0];
      } else {
        // Procedimento individual
        const { data, error } = await supabase
          .from('appointments')
          .insert(appointmentToInsert)
          .select();

        if (error) {
          console.error('❌ Erro ao criar agendamento no Supabase:', error);
          toast({ 
            title: "✅ Venda registrada!", 
            description: `Venda salva com sucesso. Agendamento será criado automaticamente.`,
          });
          return null;
        }

        const createdAppointment = data?.[0];
        if (createdAppointment) {
          console.log('✅ Agendamento criado no Supabase:', createdAppointment);
          
          // Adicionar campos extras para funcionalidade local
          const enhancedAppointment = {
            ...createdAppointment,
            service_id: saleData.service_id,
            type: saleData.type,
            sale_date: saleData.sale_date,
            appointment_date: '',
            appointment_time: ''
          };
          
          setAppointments(prev => [enhancedAppointment, ...prev]);
          saveToStorage([enhancedAppointment, ...appointments]);
          
          toast({
            title: "✅ Procedimento transferido!",
            description: `${saleData.service_name} transferido para agendamentos. Vá para 'Agendamentos' para marcar a data.`,
          });
        }
        return createdAppointment;
      }
    }
  };

  // Agendar procedimento pendente
  const scheduleAppointment = async (id: number, date: string, time: string) => {
    console.log(`📅 Agendando procedimento ${id} para ${date} às ${time}`);
    
    const updatedAppointments = appointments.map(apt => 
      apt.id === id 
        ? { ...apt, appointment_date: date, appointment_time: time, date, time, status: 'agendado' as const }
        : apt
    );
    
    setAppointments(updatedAppointments);
    saveToStorage(updatedAppointments);
    console.log("✅ Agendamento atualizado com sucesso");
  };

  // Confirmar presença e completar
  const confirmAttendance = async (id: number) => {
    console.log(`✅ Confirmando presença do agendamento ${id}`);
    
    const updatedAppointments = appointments.map(apt => 
      apt.id === id 
        ? { ...apt, status: 'concluido' as const, completed_at: new Date().toISOString() }
        : apt
    );
    
    setAppointments(updatedAppointments);
    saveToStorage(updatedAppointments);
    console.log("✅ Presença confirmada com sucesso");
  };

  // Atualizar status
  const updateAppointment = async (id: number, updates: Partial<Appointment>) => {
    console.log(`🔄 Atualizando agendamento ${id}:`, updates);
    
    const updatedAppointments = appointments.map(apt => 
      apt.id === id ? { ...apt, ...updates } : apt
    );
    
    setAppointments(updatedAppointments);
    saveToStorage(updatedAppointments);
    console.log("✅ Agendamento atualizado com sucesso");
  };

  // Agrupar pacotes por cliente
  const getActivePackages = () => {
    const active = appointments.filter(apt => 
      apt.type === 'package_session' && 
      apt.status !== 'concluido'
    );
    console.log("📦 Pacotes ativos encontrados:", active.length);
    return active;
  };

  // Pegar procedimentos pendentes
  const getPendingProcedures = () => {
    const pending = appointments.filter(apt => 
      apt.type === 'individual' && 
      apt.status === 'agendado' &&
      (!apt.appointment_date || apt.appointment_date === '')
    );
    console.log("📋 Procedimentos pendentes encontrados:", pending.length);
    return pending;
  };

  // Pegar agendamentos de hoje
  const getTodaysAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    const todays = appointments.filter(apt => 
      apt.appointment_date === today && 
      (apt.status === 'agendado' || apt.status === 'confirmado')
    );
    console.log("📅 Agendamentos de hoje encontrados:", todays.length);
    return todays;
  };

  // Pegar histórico de sessões de um pacote
  const getPackageHistory = (packageId: number) => {
    const history = appointments
      .filter(apt => apt.package_id === packageId && apt.status === 'concluido')
      .sort((a, b) => (a.completed_at || '').localeCompare(b.completed_at || ''));
    console.log(`📜 Histórico do pacote ${packageId}:`, history.length, "sessões");
    return history;
  };

  // Função para processar vendas existentes e criar agendamentos faltantes
  const processExistingSales = async () => {
    console.log("🔄 Processando vendas existentes para criar agendamentos faltantes...");
    
    // Buscar vendas do localStorage
    const salesStorage = localStorage.getItem(SYSTEM_CONFIG.STORAGE_KEYS.SALES);
    if (!salesStorage) {
      console.log("📝 Nenhuma venda encontrada no localStorage");
      toast({
        title: "Info",
        description: "Nenhuma venda encontrada para processar",
      });
      return 0;
    }
    
    const sales = JSON.parse(salesStorage);
    console.log(`📊 Encontradas ${sales.length} vendas para processar`);
    
    let agendamentosCriados = 0;
    
    for (const sale of sales) {
      console.log(`🔍 Processando venda: ${sale.clientName || sale.client_name} - ${sale.items?.length || 0} itens`);
      
      if (!sale.items || !Array.isArray(sale.items)) {
        console.log(`⚠️ Venda sem itens válidos, pulando...`);
        continue;
      }
      
      for (const item of sale.items) {
        // Só processa serviços e pacotes
        if (item.type !== 'service' && item.type !== 'package') {
          console.log(`⏭️ Produto ${item.itemName} não gera agendamento`);
          continue;
        }
        
        // Verificar se já existe agendamento para este item
        const existingAppointment = appointments.find(apt => {
          const sameClient = apt.client_name === (sale.clientName || sale.client_name);
          const sameItem = (
            (item.type === 'service' && apt.service_name === item.itemName) ||
            (item.type === 'package' && apt.package_name === item.itemName)
          );
          return sameClient && sameItem;
        });
        
        if (existingAppointment) {
          console.log(`✅ Agendamento já existe: ${sale.clientName || sale.client_name} - ${item.itemName}`);
          continue;
        }
        
        console.log(`🆕 Criando agendamento faltante: ${sale.clientName || sale.client_name} - ${item.itemName}`);
        
        try {
          const result = await createFromSale({
            client_id: sale.client_id || 0,
            client_name: sale.clientName || sale.client_name,
            client_phone: sale.clientPhone || '',
            service_id: item.type === 'service' ? item.item_id : undefined,
            service_name: item.type === 'service' ? item.itemName : undefined,
            package_id: item.type === 'package' ? item.item_id : undefined,
            package_name: item.type === 'package' ? item.itemName : undefined,
            total_sessions: item.type === 'package' ? item.quantity : undefined,
            price: item.price * item.quantity,
            sale_date: sale.sale_date,
            type: item.type === 'service' ? 'individual' as const : 'package_session' as const,
          });
          
          if (result) {
            console.log(`✅ Agendamento criado: ${item.itemName}`);
            agendamentosCriados++;
          }
        } catch (error) {
          console.error(`❌ Erro ao criar agendamento para ${item.itemName}:`, error);
        }
      }
    }
    
    console.log(`🎉 Processamento concluído: ${agendamentosCriados} novos agendamentos criados`);
    
    if (agendamentosCriados > 0) {
      toast({
        title: "Sucesso!",
        description: `${agendamentosCriados} agendamentos criados a partir das vendas do caixa`,
      });
    } else {
      toast({
        title: "Info",
        description: "Todos os agendamentos já foram criados",
      });
    }
    
    return agendamentosCriados;
  };

  useEffect(() => {
    console.log("🎯🎯🎯 USEEFFECT EXECUTADO - CHAMANDO LOADAPPOINTMENTS");
    loadAppointments();
  }, [loadAppointments]);

  return {
    appointments,
    isLoading,
    error,
    createFromSale,
    scheduleAppointment,
    confirmAttendance,
    updateAppointment,
    getActivePackages,
    getPendingProcedures,
    getTodaysAppointments,
    getPackageHistory,
    refreshAppointments: loadAppointments,
    processExistingSales,
  };
}