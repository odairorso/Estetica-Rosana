import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAppointments } from './useAppointments';
import { SYSTEM_CONFIG } from '@/config/system';
import { supabase } from '@/integrations/supabase/client'; // Import supabase

export interface SaleItem {
  id: number;
  type: 'service' | 'package' | 'product';
  item_id: number;
  itemName: string;
  price: number;
  quantity: number;
}

export interface Sale {
  id: number;
  client_id: number;
  clientName: string;
  clientPhone?: string;
  items: SaleItem[];
  total: number;
  sale_date: string;
  payment_method: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export function useSales() {
  console.log("💰 useSales hook inicializado - MODO OFFLINE COMPLETO");
  const { toast } = useToast();
  const { createFromSale } = useAppointments();
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSales = useCallback(async () => {
    setIsLoading(true);
    const isOffline = localStorage.getItem('force-offline-mode') === 'true';

    if (isOffline) {
      console.log("📋 Carregando vendas (MODO OFFLINE)...");
      try {
        const stored = localStorage.getItem(SYSTEM_CONFIG.STORAGE_KEYS.SALES);
        if (stored) {
          const data = JSON.parse(stored);
          setSales(data);
        } else {
          setSales([]);
        }
      } catch (err) {
        console.error('❌ Erro ao carregar vendas do localStorage:', err);
        setSales([]);
      }
    } else {
      console.log("☁️ Carregando vendas (MODO ONLINE - SUPABASE)...");
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar vendas do Supabase:', error);
        setSales([]);
      } else {
        console.log('✅ Vendas carregadas do Supabase:', data.length);
        setSales(data || []);
        saveToStorage(data || []);
      }
    }
    
    setIsLoading(false);
  }, []);

  // Salvar no localStorage
  const saveToStorage = (data: Sale[]) => {
    try {
      localStorage.setItem(SYSTEM_CONFIG.STORAGE_KEYS.SALES, JSON.stringify(data));
      console.log("💾 Vendas salvas no localStorage:", data.length);
    } catch (err) {
      console.error('❌ Erro ao salvar vendas no localStorage:', err);
    }
  };

  const addSale = async (saleData: Omit<Sale, 'id' | 'created_at' | 'updated_at'>) => {
    const isOffline = localStorage.getItem('force-offline-mode') === 'true';

    if (isOffline) {
      console.log("🛍️ ADICIONANDO NOVA VENDA (OFFLINE):", {
        cliente: saleData.clientName,
        total: saleData.total,
        itens: saleData.items.length
      });
      
      const newSale: Sale = {
        ...saleData,
        id: Math.max(0, ...sales.map(s => s.id)) + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const updatedSales = [...sales, newSale];
      setSales(updatedSales);
      saveToStorage(updatedSales);
      
      console.log("✅ Venda salva offline:", newSale);
      
      let agendamentosCriados = 0;
      const servicosEPacotes = saleData.items.filter(item => item.type === 'service' || item.type === 'package');
      
      for (const item of saleData.items) {
        if (item.type === 'service' || item.type === 'package') {
          try {
            const result = await createFromSale({
              client_id: saleData.client_id,
              client_name: saleData.clientName,
              client_phone: saleData.clientPhone || '',
              service_id: item.type === 'service' ? item.item_id : undefined,
              service_name: item.type === 'service' ? item.itemName : undefined,
              package_id: item.type === 'package' ? item.item_id : undefined,
              package_name: item.type === 'package' ? item.itemName : undefined,
              total_sessions: item.type === 'package' ? item.quantity : undefined,
              price: item.price * item.quantity,
              sale_date: saleData.sale_date,
              type: item.type === 'service' ? 'individual' as const : 'package_session' as const,
            });
            if (result) agendamentosCriados++;
          } catch (appointmentError) {
            console.error(`❌ Erro ao criar agendamento para ${item.itemName}:`, appointmentError);
          }
        }
      }
      
      toast({
        title: "✅ Venda registrada (Offline)!",
        description: `Venda para ${saleData.clientName} registrada localmente.`,
      });
      
      return newSale;
    } else {
      // ONLINE LOGIC
      console.log("☁️ ADICIONANDO NOVA VENDA (ONLINE - SUPABASE):", saleData);

      const saleToInsert = {
        client_id: saleData.client_id,
        items: saleData.items,
        total: saleData.total,
        sale_date: saleData.sale_date,
        payment_method: saleData.payment_method,
        notes: saleData.notes,
      };

      const { data, error } = await supabase
        .from('sales')
        .insert(saleToInsert)
        .select();

      if (error) {
        console.error('❌ Erro ao salvar venda no Supabase:', error);
        toast({ title: "Erro no Servidor", description: "Não foi possível registrar a venda.", variant: "destructive" });
        return null;
      }

      const newSale = data?.[0];
      if (!newSale) {
        toast({ title: "Erro Inesperado", description: "A venda foi criada mas não retornou dados.", variant: "destructive" });
        return null;
      }

      console.log('✅ Venda salva no Supabase:', newSale);
      setSales(prev => [newSale, ...prev]);

      let agendamentosCriados = 0;
      for (const item of newSale.items) {
        if (item.type === 'service' || item.type === 'package') {
          try {
            const result = await createFromSale({
              client_id: newSale.client_id,
              client_name: saleData.clientName, // Pass clientName from original saleData
              client_phone: saleData.clientPhone || '',
              service_id: item.type === 'service' ? item.item_id : undefined,
              service_name: item.type === 'service' ? item.itemName : undefined,
              package_id: item.type === 'package' ? item.item_id : undefined,
              package_name: item.type === 'package' ? item.itemName : undefined,
              total_sessions: item.type === 'package' ? item.quantity : undefined,
              price: item.price * item.quantity,
              sale_date: newSale.sale_date,
              type: item.type === 'service' ? 'individual' as const : 'package_session' as const,
            });
            if (result) agendamentosCriados++;
          } catch (appointmentError) {
            console.error(`❌ Erro ao criar agendamento online para ${item.itemName}:`, appointmentError);
          }
        }
      }

      toast({
        title: "✅ Venda registrada no Servidor!",
        description: `Venda para ${saleData.clientName} registrada com sucesso.`,
      });
      
      return newSale;
    }
  };

  const deleteSale = async (id: number) => {
    console.log(`🗑️ Removendo venda ${id} (offline)`);
    const updatedSales = sales.filter(sale => sale.id !== id);
    setSales(updatedSales);
    saveToStorage(updatedSales);
    
    toast({
      title: "✅ Venda removida",
      description: "A venda foi excluída com sucesso.",
    });
  };

  const forceCreateAppointments = async () => {
    console.log("🚑 FORÇANDO criação de agendamentos...");
    let criados = 0;

    for (const sale of sales) {
      for (const item of sale.items) {
        if (item.type === 'service' || item.type === 'package') {
          try {
            const result = await createFromSale({
              client_id: sale.client_id,
              client_name: sale.clientName,
              client_phone: sale.clientPhone || '',
              service_id: item.type === 'service' ? item.item_id : undefined,
              service_name: item.type === 'service' ? item.itemName : undefined,
              package_id: item.type === 'package' ? item.item_id : undefined,
              package_name: item.type === 'package' ? item.itemName : undefined,
              total_sessions: item.type === 'package' ? item.quantity : undefined,
              price: item.price * item.quantity,
              sale_date: sale.sale_date,
              type: item.type === 'service' ? 'individual' : 'package_session',
            });
            
            if (result) {
              criados++;
            }
          } catch (error) {
            console.error(`❌ Erro ao forçar criação de agendamento para ${item.itemName}:`, error);
          }
        }
      }
    }

    if (criados > 0) {
      toast({
        title: "✅ Agendamentos criados!",
        description: `${criados} novos agendamentos foram criados das vendas existentes.`,
      });
    } else {
      toast({
        title: "ℹ️ Nada para criar",
        description: "Todos os itens do caixa já têm agendamentos.",
      });
    }
    
    return criados;
  };

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  return {
    sales,
    isLoading,
    addSale,
    deleteSale,
    forceCreateAppointments,
    refreshSales: loadSales,
  };
}