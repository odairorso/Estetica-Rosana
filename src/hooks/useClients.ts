import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  avatar: string | null;
  last_visit: string;
  total_visits: number;
  active_packages: number;
  next_appointment: string | null;
  created_at: string;
}

const fetchClients = async () => {
  const { data, error } = await supabase.from('clients').select('*').order('name');
  if (error) throw new Error(error.message);
  return data;
};

const addClient = async (clientData: Omit<Client, 'id' | 'created_at'>) => {
  const { data, error } = await supabase.from('clients').insert([clientData]).select();
  if (error) throw new Error(error.message);
  return data[0];
};

const updateClient = async (clientData: Partial<Client> & { id: string }) => {
  const { id, ...updateData } = clientData;
  const { data, error } = await supabase.from('clients').update(updateData).eq('id', id).select();
  if (error) throw new Error(error.message);
  return data[0];
};

const deleteClient = async (id: string) => {
  const { error } = await supabase.from('clients').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

export function useClients() {
  const queryClient = useQueryClient();

  const { data: clients = [], isLoading } = useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: fetchClients,
  });

  const addMutation = useMutation({
    mutationFn: addClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  return {
    clients,
    isLoading,
    addClient: addMutation.mutate,
    updateClient: updateMutation.mutate,
    deleteClient: deleteMutation.mutate,
    getClient: (id: string) => clients.find(c => c.id === id),
  };
}