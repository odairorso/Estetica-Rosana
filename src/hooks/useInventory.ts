import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface Product {
  id: string;
  name: string;
  quantity: number;
  min_stock: number;
  category: string;
  supplier?: string;
  cost_price: number;
  last_updated: string;
}

const fetchInventory = async () => {
  const { data, error } = await supabase.from('inventory').select('*').order('name');
  if (error) throw new Error(error.message);
  return data;
};

const addProduct = async (productData: Omit<Product, 'id' | 'last_updated'>) => {
  const newProduct = { ...productData, last_updated: new Date().toISOString() };
  const { data, error } = await supabase.from('inventory').insert([newProduct]).select();
  if (error) throw new Error(error.message);
  return data[0];
};

const updateProduct = async (productData: Partial<Product> & { id: string }) => {
  const { id, ...updateData } = productData;
  const updatedProduct = { ...updateData, last_updated: new Date().toISOString() };
  const { data, error } = await supabase.from('inventory').update(updatedProduct).eq('id', id).select();
  if (error) throw new Error(error.message);
  return data[0];
};

const deleteProduct = async (id: string) => {
  const { error } = await supabase.from('inventory').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

export function useInventory() {
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['inventory'],
    queryFn: fetchInventory,
  });

  const addMutation = useMutation({
    mutationFn: addProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });

  const getStockStatus = (product: Product) => {
    if (product.quantity <= 0) return "empty";
    if (product.quantity <= product.min_stock / 2) return "critical";
    if (product.quantity <= product.min_stock) return "low";
    return "ok";
  };

  return {
    products,
    isLoading,
    addProduct: addMutation.mutate,
    updateProduct: updateMutation.mutate,
    deleteProduct: deleteMutation.mutate,
    getStockStatus,
  };
}