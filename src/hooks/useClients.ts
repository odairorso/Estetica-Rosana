import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from './use-toast';

export interface Client {
  id: number;
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
  lastVisit: string | null;
  totalVisits: number;
  activePackages: number;
  nextAppointment: string | null;
  createdAt: string;
}

// Função para transformar dados planos do Supabase para o formato aninhado do app
const fromSupabase = (data: any): Client => ({
  id: data.id,
  name: data.name,
  email: data.email,
  phone: data.phone,
  cpf: data.cpf,
  address: {
    street: data.street || '',
    number: data.number || '',
    complement: data.complement || '',
    neighborhood: data.neighborhood || '',
    city: data.city || '',
    state: data.state || '',
    zipCode: data.zip_code || '',
  },
  avatar: data.avatar,
  lastVisit: data.last_visit,
  totalVisits: data.total_visits || 0,
  activePackages: data.active_packages || 0,
  nextAppointment: data.next_appointment,
  createdAt: data.created_at,
});

// Função para transformar dados do app para o formato plano do Supabase
const toSupabase = (client: Partial<Client>) => {
  const { address, ...rest } = client;
  const flatData: Record<string, any> = { ...rest };

  if (address) {
    flatData.street = address.street;
    flatData.number = address.number;
    flatData.complement = address.complement;
    flatData.neighborhood = address.neighborhood;
    flatData.city = address.city;
    flatData.state = address.state;
    flatData.zip_code = address.zipCode;
  }
  
  // Remove o objeto address para não ser enviado
  delete flatData.address;
  // Remove campos que o banco de dados gerencia
  delete flatData.id;
  delete flatData.createdAt;

  return flatData;
};


export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchClients = useCallback(async () => {
    if (!supabase) {
      console.warn("Supabase client not available. Running in offline mode.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const { data, error } = await supabase.from('clients').select('*').order('name', { ascending: true });

    if (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Erro ao buscar clientes",
        description: "Não foi possível carregar os dados dos clientes.",
        variant: "destructive",
      });
    } else {
      setClients(data.map(fromSupabase));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const addClient = async (clientData: Omit<Client, 'id' | 'createdAt' | 'lastVisit' | 'totalVisits'>) => {
    if (!supabase) return null;

    const supabaseData = toSupabase(clientData);
    
    const { data, error } = await supabase.from('clients').insert(supabaseData).select().single();

    if (error) {
      console.error('Error adding client:', error);
      toast({
        title: "Erro ao adicionar cliente",
        description: "Não foi possível salvar o novo cliente.",
        variant: "destructive",
      });
      return null;
    }

    const newClient = fromSupabase(data);
    setClients(prev => [...prev, newClient].sort((a, b) => a.name.localeCompare(b.name)));
    return newClient;
  };

  const updateClient = async (id: number, clientData: Partial<Client>) => {
    if (!supabase) return;

    const supabaseData = toSupabase(clientData);

    const { data, error } = await supabase.from('clients').update(supabaseData).eq('id', id).select().single();

    if (error) {
      console.error('Error updating client:', error);
      toast({
        title: "Erro ao atualizar cliente",
        description: "As alterações não puderam ser salvas.",
        variant: "destructive",
      });
    } else {
      const updatedClient = fromSupabase(data);
      setClients(prev => prev.map(c => (c.id === id ? updatedClient : c)));
    }
  };

  const deleteClient = async (id: number) => {
    if (!supabase) return;

    const { error } = await supabase.from('clients').delete().eq('id', id);

    if (error) {
      console.error('Error deleting client:', error);
      toast({
        title: "Erro ao excluir cliente",
        description: "O cliente não pôde ser removido.",
        variant: "destructive",
      });
    } else {
      setClients(prev => prev.filter(c => c.id !== id));
    }
  };

  const getClient = (id: number) => {
    return clients.find(c => c.id === id);
  };

  return {
    clients,
    isLoading,
    addClient,
    updateClient,
    deleteClient,
    getClient,
    refetch: fetchClients,
  };
}