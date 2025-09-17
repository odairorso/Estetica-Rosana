import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";

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

export function useSales() {
  const { toast } = useToast();
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSales = useCallback(async () => {
    setIsLoading(true);
    
    if (!supabase) {
      console.warn("⚠️ Supabase não disponível, usando dados locais");
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
      
      // Convert JSONB items back to array
      const formattedData = (data || []).map(sale => ({
        ...sale,
        items: sale.items || []
      }));
      
      setSales(formattedData as any);
    } catch (error) {
      console.error('❌ Erro ao carregar vendas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as vendas.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  const addSale = async (saleData: Omit<Sale, 'id' | 'created_at' | 'updated_at'>) => {
    if (!supabase) {
      const newSale = {
        ...saleData,
        id: Math.max(0, ...sales.map(s => s.id)) + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setSales(prev => [...prev, newSale]);
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
        toast({
          title: "Venda registrada!",
          description: "A venda foi salva com sucesso.",
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
      return;
    }
    
    try {
      const { error } = await supabase.from('sales').delete().eq('id', id);
      if (error) throw error;
      
      setSales(prev => prev.filter(sale => sale.id !== id));
      toast({
        title: "Venda removida",
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

  return {
    sales,
    isLoading,
    addSale,
    deleteSale,
    refreshSales: loadSales,
  };
}