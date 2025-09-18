import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAppointments } from './useAppointments';
import { SYSTEM_CONFIG } from '@/config/system';

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
    console.log("📋 Carregando vendas (MODO OFFLINE COMPLETO)...");
    setIsLoading(true);
    
    try {
      const stored = localStorage.getItem(SYSTEM_CONFIG.STORAGE_KEYS.SALES);
      if (stored) {
        const data = JSON.parse(stored);
        console.log("💰 Vendas carregadas do localStorage:", data.length);
        setSales(data);
      } else {
        console.log('🎉 Primeiro acesso vendas - inicializando com dados vazios');
        setSales([]);
      }
    } catch (err) {
      console.error('❌ Erro ao carregar vendas:', err);
      setSales([]);
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
    console.log("🛍️ ADICIONANDO NOVA VENDA (OFFLINE):", {
      cliente: saleData.clientName,
      total: saleData.total,
      itens: saleData.items.length
    });
    
    // Criar nova venda offline
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
    
    // Criar agendamentos automaticamente
    let agendamentosCriados = 0;
    const servicosEPacotes = saleData.items.filter(item => item.type === 'service' || item.type === 'package');
    
    for (const item of saleData.items) {
      if (item.type === 'service' || item.type === 'package') {
        try {
          console.log(`🆕 Criando agendamento para: ${item.itemName}`);
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
          
          if (result) {
            agendamentosCriados++;
            console.log(`✅ Agendamento criado para: ${item.itemName}`);
          }
        } catch (appointmentError) {
          console.error(`❌ Erro ao criar agendamento para ${item.itemName}:`, appointmentError);
        }
      }
    }
    
    const mensagemAgendamentos = servicosEPacotes.length > 0 
      ? ` ${agendamentosCriados}/${servicosEPacotes.length} agendamentos criados automaticamente.`
      : '';
    
    toast({
      title: "✅ Venda registrada!",
      description: `Venda para ${saleData.clientName} registrada com sucesso.${mensagemAgendamentos}`,
    });
    
    return newSale;
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