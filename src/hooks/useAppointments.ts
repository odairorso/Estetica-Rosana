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

    const isOffline = localStorage.getItem('force-offline-mode') === 'true';

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
  }) => {
    const isOffline = localStorage.getItem('force-offline-mode') === 'true';

    if (isOffline) {
      console.log("🆕 Criando agendamento a partir de venda (OFFLINE):", saleData);
      // Lógica offline existente...
      if (saleData.type === 'package_session') {
        const existingSessions = appointments.filter(apt => apt.client_id === saleData.client_id && apt.package_id === saleData.package_id);
        const nextSessionNumber = existingSessions.length + 1;
        if (nextSessionNumber > (saleData.total_sessions || 0)) return null;
        const newId = Math.max(0, ...appointments.map(a => a.id)) + 1;
        const newSession: Appointment = {
          id: newId,
          client_id: saleData.client_id,
          client_name: saleData.client_name,
          client_phone: saleData.client_phone || '',
          package_id: saleData.package_id,
          package_name: saleData.package_name,
          total_sessions: saleData.total_sessions || 0,
          session_number: nextSessionNumber,
          type: 'package_session',
          price: 0,
          sale_date: saleData.sale_date,
          status: 'agendado',
          notes: `Sessão ${nextSessionNumber} de ${saleData.total_sessions || 0}`,
          duration: 60,
          created_at: new Date().toISOString(),
          date: '', time: '', appointment_date: '', appointment_time: ''
        };
        const updatedAppointments = [...appointments, newSession];
        setAppointments(updatedAppointments);
        saveToStorage(updatedAppointments);
        return newSession;
      } else {
        const existing = appointments.find(apt => apt.client_name === saleData.client_name && apt.service_name === saleData.service_name);
        if (existing) return existing;
        const newId = Math.max(0, ...appointments.map(a => a.id)) + 1;
        const newAppointment: Appointment = {
          id: newId,
          client_id: saleData.client_id,
          client_name: saleData.client_name,
          client_phone: saleData.client_phone || '',
          service_id: saleData.service_id,
          service_name: saleData.service_name,
          type: saleData.type,
          price: saleData.price,
          sale_date: saleData.sale_date,
          status: 'agendado',
          notes: `Aguardando agendamento - ${saleData.service_name}`,
          duration: 60,
          created_at: new Date().toISOString(),
          date: '', time: '', appointment_date: '', appointment_time: ''
        };
        const updatedAppointments = [...appointments, newAppointment];
        setAppointments(updatedAppointments);
        saveToStorage(updatedAppointments);
        return newAppointment;
      }
    } else {
      // LÓGICA ONLINE
      console.log("☁️ Criando agendamento a partir de venda (ONLINE - SUPABASE):", saleData);

      const appointmentToInsert = {
        client_id: saleData.client_id,
        client_name: saleData.client_name,
        client_phone: saleData.client_phone,
        service_id: saleData.service_id,
        service_name: saleData.service_name,
        package_id: saleData.package_id,
        package_name: saleData.package_name,
        total_sessions: saleData.total_sessions,
        price: saleData.price,
        sale_date: saleData.sale_date,
        type: saleData.type,
        status: 'agendado',
        notes: `Aguardando agendamento - ${saleData.service_name || saleData.package_name}`,
        duration: 60,
        date: '', 
        time: '',
      };

      // Para pacotes, precisamos calcular o session_number
      if (saleData.type === 'package_session' && saleData.total_sessions) {
        const appointmentsToInsert = [];
        for (let i = 1; i <= saleData.total_sessions; i++) {
          appointmentsToInsert.push({
            client_id: saleData.client_id,
            client_name: saleData.client_name,
            client_phone: saleData.client_phone,
            package_id: saleData.package_id,
            package_name: saleData.package_name,
            total_sessions: saleData.total_sessions,
            session_number: i,
            price: 0,
            sale_date: saleData.sale_date,
            type: 'package_session',
            status: 'agendado',
            notes: `Sessão ${i} de ${saleData.total_sessions}`,
            duration: 60,
            date: '', 
            time: '',
          });
        }

        const { data, error } = await supabase
          .from('appointments')
          .insert(appointmentsToInsert)
          .select();

        if (error) {
          console.error('❌ Erro ao criar sessões do pacote no Supabase:', error);
          toast({ title: "Erro no Servidor", description: `Não foi possível criar as sessões do pacote: ${error.message}`, variant: "destructive" });
          return null;
        }

        if (data) {
          console.log('✅ Sessões do pacote criadas no Supabase:', data);
          setAppointments(prev => [...data, ...prev]);
          saveToStorage([...data, ...appointments]);
        }
        return data;
      } else {
        const { data, error } = await supabase
          .from('appointments')
          .insert(appointmentToInsert)
          .select();

        if (error) {
          console.error('❌ Erro ao criar agendamento no Supabase:', error);
          toast({ title: "Erro no Servidor", description: `Não foi possível criar o agendamento: ${error.message}`, variant: "destructive" });
          return null;
        }

        const createdAppointment = data?.[0];
        if (createdAppointment) {
          console.log('✅ Agendamento criado no Supabase:', createdAppointment);
          setAppointments(prev => [createdAppointment, ...prev]);
          saveToStorage([createdAppointment, ...appointments]);
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