import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";
import { useAppointments } from './useAppointments';

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

const SALES_STORAGE_KEY = 'clinic-sales-v2';

export function useSales() {
  const { toast } = useToast();
  const { createFromSale } = useAppointments();
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSales = useCallback(async () => {
    setIsLoading(true);
    
    if (!supabase) {
      // Modo offline - carrega do localStorage
      const stored = localStorage.getItem(SALES_STORAGE_KEY);
      if (stored) {
        setSales(JSON.parse(stored));
      }
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
      
      // Converter JSONB items de volta para array
      const formattedData = (data || []).map(sale => ({
        ...sale,
        items: sale.items || []
      }));
      
      setSales(formattedData as any);
      
      // Salvar cópia local para modo offline
      localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(formattedData));
    } catch (error) {
      console.error('❌ Erro ao carregar vendas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as vendas.",
        variant: "destructive",
      });
      
      // Fallback para dados locais
      const stored = localStorage.getItem(SALES_STORAGE_KEY);
      if (stored) {
        setSales(JSON.parse(stored));
      }
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const addSale = async (saleData: Omit<Sale, 'id' | 'created_at' | 'updated_at'>) => {
    if (!supabase) {
      // Modo offline
      const newSale = {
        ...saleData,
        id: Math.max(0, ...sales.map(s => s.id)) + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const updatedSales = [...sales, newSale];
      setSales(updatedSales);
      localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(updatedSales));
      
      // Criar agendamentos automaticamente
      for (const item of saleData.items) {
        if (item.type === 'service' || item.type === 'package') {
          await createFromSale({
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
        }
      }
      
      return newSale;
    }
    
    try {
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
        setSales(prev => [...prev, data]);
        
        // Criar agendamentos automaticamente para serviços e pacotes
        for (const item of saleData.items) {
          if (item.type === 'service' || item.type === 'package') {
            await createFromSale({
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
          }
        }
        
        toast({
          title: "✅ Venda registrada!",
          description: `Venda para ${saleData.clientName} registrada com sucesso.`,
        });
      }
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
      localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(sales.filter(sale => sale.id !== id)));
      return;
    }
    
    try {
      const { error } = await supabase.from('sales').delete().eq('id', id);
      if (error) throw error;
      
      setSales(prev => prev.filter(sale => sale.id !== id));
      toast({
        title: "✅ Venda removida",
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

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  return {
    sales,
    isLoading,
    addSale,
    deleteSale,
    refreshSales: loadSales,
  };
}