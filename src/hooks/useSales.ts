import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";
<<<<<<< HEAD
=======
import { useAppointments } from './useAppointments';
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522

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
  items: SaleItem[];
  total: number;
  sale_date: string;
  payment_method: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

<<<<<<< HEAD
export function useSales() {
  const { toast } = useToast();
=======
const SALES_STORAGE_KEY = 'clinic-sales-v2';

export function useSales() {
  const { toast } = useToast();
  const { createFromSale } = useAppointments();
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSales = useCallback(async () => {
    setIsLoading(true);
    
    if (!supabase) {
<<<<<<< HEAD
      console.warn("⚠️ Supabase não disponível, usando dados locais");
=======
      // Modo offline - carrega do localStorage
      const stored = localStorage.getItem(SALES_STORAGE_KEY);
      if (stored) {
        setSales(JSON.parse(stored));
      }
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
      setIsLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('sale_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      
<<<<<<< HEAD
      // Convert JSONB items back to array
=======
      // Converter JSONB items de volta para array
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
      const formattedData = (data || []).map(sale => ({
        ...sale,
        items: sale.items || []
      }));
      
      setSales(formattedData as any);
<<<<<<< HEAD
=======
      
      // Salvar cópia local para modo offline
      localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(formattedData));
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
    } catch (error) {
      console.error('❌ Erro ao carregar vendas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as vendas.",
        variant: "destructive",
      });
<<<<<<< HEAD
=======
      
      // Fallback para dados locais
      const stored = localStorage.getItem(SALES_STORAGE_KEY);
      if (stored) {
        setSales(JSON.parse(stored));
      }
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

<<<<<<< HEAD
  useEffect(() => {
    loadSales();
  }, [loadSales]);

  const addSale = async (saleData: Omit<Sale, 'id' | 'created_at' | 'updated_at'>) => {
    if (!supabase) {
=======
  const addSale = async (saleData: Omit<Sale, 'id' | 'created_at' | 'updated_at'>) => {
    console.log("🛒 ADICIONANDO NOVA VENDA:", {
      cliente: saleData.clientName,
      total: saleData.total,
      itens: saleData.items.length,
      itens_detalhados: saleData.items.map(item => ({
        tipo: item.type,
        nome: item.itemName,
        preco: item.price,
        quantidade: item.quantity
      }))
    });
    
    if (!supabase) {
      // Modo offline
      console.log("⚠️ Modo offline - criando venda local");
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
      const newSale = {
        ...saleData,
        id: Math.max(0, ...sales.map(s => s.id)) + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
<<<<<<< HEAD
      setSales(prev => [...prev, newSale]);
=======
      
      const updatedSales = [...sales, newSale];
      setSales(updatedSales);
      localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(updatedSales));
      
      // Criar agendamentos automaticamente
      console.log("🔄 Criando agendamentos automaticamente para os itens...");
      for (const item of saleData.items) {
        if (item.type === 'service' || item.type === 'package') {
          console.log(`📦 Criando agendamento para: ${item.itemName} (${item.type})`);
          const result = await createFromSale({
            client_id: saleData.client_id,
            client_name: saleData.clientName,
            client_phone: '', // Pode ser buscado depois
            service_id: item.type === 'service' ? item.item_id : undefined,
            service_name: item.itemName,
            package_id: item.type === 'package' ? item.item_id : undefined,
            package_name: item.itemName,
            total_sessions: item.type === 'package' ? item.quantity : undefined,
            price: item.price * item.quantity,
            sale_date: saleData.sale_date,
            type: item.type === 'service' ? 'individual' : 'package_session',
          });
          
          if (result) {
            console.log(`✅ Agendamento criado com sucesso: ${item.itemName}`);
          } else {
            console.log(`❌ Erro ao criar agendamento: ${item.itemName}`);
          }
        } else {
          console.log(`⏭️ Produto ${item.itemName} não gera agendamento`);
        }
      }
      
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
      return newSale;
    }
    
    try {
<<<<<<< HEAD
=======
      console.log("🔄 Criando venda no Supabase...");
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
      const { data, error } = await supabase
        .from('sales')
        .insert([{
          client_id: saleData.client_id,
          client_name: saleData.clientName,
          items: saleData.items,
          total: saleData.total,
          sale_date: saleData.sale_date,
          payment_method: saleData.payment_method,
          notes: saleData.notes
        }])
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
<<<<<<< HEAD
        setSales(prev => [...prev, data]);
        toast({
          title: "Venda registrada!",
          description: "A venda foi salva com sucesso.",
        });
      }
=======
        console.log("✅ Venda criada no Supabase:", data);
        setSales(prev => [...prev, data]);
        
        // Criar agendamentos automaticamente para serviços e pacotes
        console.log("🔄 Criando agendamentos automaticamente para os itens...");
        for (const item of saleData.items) {
          if (item.type === 'service' || item.type === 'package') {
            console.log(`📦 Criando agendamento para: ${item.itemName} (${item.type})`);
            const result = await createFromSale({
              client_id: saleData.client_id,
              client_name: saleData.clientName,
              client_phone: '', // Pode ser buscado depois
              service_id: item.type === 'service' ? item.item_id : undefined,
              service_name: item.itemName,
              package_id: item.type === 'package' ? item.item_id : undefined,
              package_name: item.itemName,
              total_sessions: item.type === 'package' ? item.quantity : undefined,
              price: item.price * item.quantity,
              sale_date: saleData.sale_date,
              type: item.type === 'service' ? 'individual' : 'package_session',
            });
            
            if (result) {
              console.log(`✅ Agendamento criado com sucesso: ${item.itemName}`);
            } else {
              console.log(`❌ Erro ao criar agendamento: ${item.itemName}`);
            }
          } else {
            console.log(`⏭️ Produto ${item.itemName} não gera agendamento`);
          }
        }
      }
      
      toast({
        title: "✅ Venda registrada!",
        description: `Venda para ${saleData.clientName} registrada com sucesso.`,
      });
      
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
      return data;
    } catch (error) {
      console.error('❌ Erro ao adicionar venda:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a venda.",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteSale = async (id: number) => {
    if (!supabase) {
      setSales(prev => prev.filter(sale => sale.id !== id));
<<<<<<< HEAD
=======
      localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(sales.filter(sale => sale.id !== id)));
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
      return;
    }
    
    try {
      const { error } = await supabase.from('sales').delete().eq('id', id);
      if (error) throw error;
      
      setSales(prev => prev.filter(sale => sale.id !== id));
      toast({
<<<<<<< HEAD
        title: "Venda removida",
=======
        title: "✅ Venda removida",
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
        description: "A venda foi excluída com sucesso.",
      });
    } catch (error) {
      console.error('❌ Erro ao excluir venda:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a venda.",
        variant: "destructive",
      });
    }
  };

<<<<<<< HEAD
=======
  // Função para verificar se já existem agendamentos para uma venda específica
  const checkExistingAppointments = (saleId: number, items: SaleItem[]) => {
    console.log(`🔍 Verificando agendamentos existentes para venda ${saleId}`);
    console.log(`📦 Itens da venda:`, items.map(item => ({
      tipo: item.type,
      nome: item.itemName,
      id: item.item_id
    })));
    
    // Esta função precisa ser implementada no useAppointments
    // Por enquanto, vamos retornar false para sempre criar novos agendamentos
    return false;
  };

  // Função para forçar criação de agendamentos (debug)
  const forceCreateAppointments = async () => {
    console.log("🚨 FORÇANDO criação de agendamentos...");
    console.log("💰 Vendas para processar:", sales.length);
    let criados = 0;

    for (const sale of sales) {
      console.log(`🔄 Processando venda: ${sale.clientName} (${sale.items.length} itens)`);
      
      for (const item of sale.items) {
        console.log(`📦 Item: ${item.itemName} (${item.type}) - R$${item.price}`);
        
        // Sempre criar agendamento quando forçado
        if (item.type === 'service' || item.type === 'package') {
          console.log(`🆕 Criando agendamento forçado: ${sale.clientName} - ${item.itemName}`);
          const result = await createFromSale({
            client_id: sale.client_id,
            client_name: sale.clientName,
            client_phone: '',
            service_id: item.type === 'service' ? item.item_id : undefined,
            service_name: item.itemName,
            package_id: item.type === 'package' ? item.item_id : undefined,
            package_name: item.itemName,
            total_sessions: item.type === 'package' ? item.quantity : undefined,
            price: item.price * item.quantity,
            sale_date: sale.sale_date,
            type: item.type === 'service' ? 'individual' : 'package_session',
          });
          
          if (result) {
            console.log(`✅ Agendamento criado com sucesso!`);
            criados++;
          } else {
            console.log(`❌ Erro ao criar agendamento`);
          }
        } else {
          console.log(`⏭️ Produto ${item.itemName} não gera agendamento`);
        }
      }
    }

    if (criados > 0) {
      toast({
        title: "✅ Agendamentos criados!",
        description: `${criados} novos agendamentos foram criados dos caixas existentes.`,
      });
    } else {
      toast({
        title: "ℹ️ Nada para criar",
        description: "Todos os itens do caixa já têm agendamentos.",
      });
    }
  };

  useEffect(() => {
    loadSales();
  }, [loadSales]);

>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
  return {
    sales,
    isLoading,
    addSale,
    deleteSale,
<<<<<<< HEAD
    refreshSales: loadSales,
  };
}
=======
    forceCreateAppointments,
    refreshSales: loadSales,
  };
}
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
