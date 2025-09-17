import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  avatar?: string | null;
  last_visit?: string;
  total_visits: number;
  active_packages: number;
  next_appointment?: string | null;
  created_at: string;
}

// Dados mock para fallback
const MOCK_CLIENTS: Client[] = [
  {
    id: 1,
    name: "Ana Silva",
    email: "ana.silva@email.com",
    phone: "(11) 99999-9999",
    cpf: "123.456.789-00",
    city: "São Paulo",
    state: "SP",
    total_visits: 5,
    active_packages: 1,
    created_at: "2024-01-01T10:00:00Z"
  },
  {
    id: 2,
    name: "Beatriz Costa",
    email: "beatriz.costa@email.com",
    phone: "(11) 98888-8888",
    cpf: "987.654.321-00",
    city: "São Paulo",
    state: "SP",
    total_visits: 3,
    active_packages: 0,
    created_at: "2024-01-02T11:00:00Z"
  }
];

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadClients = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    if (!supabase) {
      console.warn("⚠️ Supabase não disponível, usando dados mock");
      setClients(MOCK_CLIENTS);
      setError('Conexão offline - usando dados locais');
      setIsLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) {
        console.error('❌ Erro ao carregar clientes:', error);
        setError('Erro ao carregar dados do servidor');
        setClients(MOCK_CLIENTS); // Fallback
      } else {
        setClients(data || []);
      }
    } catch (error) {
      console.error('❌ Erro crítico:', error);
      setError('Erro de conexão - usando dados locais');
      setClients(MOCK_CLIENTS); // Fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const addClient = async (clientData: Omit<Client, 'id' | 'created_at'>) => {
    if (!supabase) {
      const newClient = {
        ...clientData,
        id: Math.max(...clients.map(c => c.id)) + 1,
        created_at: new Date().toISOString()
      };
      setClients(prev => [...prev, newClient]);
      return newClient;
    }
    
    try {
      const { data, error } = await supabase.from('clients').insert([clientData]).select().single();
      if (error) {
        console.error('❌ Erro ao adicionar cliente:', error);
        return null;
      }
      if (data) {
        setClients(prev => [...prev, data]);
      }
      return data;
    } catch (error) {
      console.error('❌ Erro crítico:', error);
      return null;
    }
  };

  const updateClient = async (id: number, clientData: Partial<Client>) => {
    if (!supabase) {
      setClients(prev => prev.map(client => 
        client.id === id ? { ...client, ...clientData } : client
      ));
      return;
    }
    
    try {
      const { data, error } = await supabase.from('clients').update(clientData).eq('id', id).select().single();
      if (error) {
        console.error('❌ Erro ao atualizar cliente:', error);
        return;
      }
      if (data) {
        setClients(prev => prev.map(client => (client.id === id ? data : client)));
      }
    } catch (error) {
      console.error('❌ Erro crítico:', error);
    }
  };

  const deleteClient = async (id: number) => {
    if (!supabase) {
      setClients(prev => prev.filter(client => client.id !== id));
      return;
    }
    
    try {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) {
        console.error('❌ Erro ao excluir cliente:', error);
        return;
      }
      setClients(prev => prev.filter(client => client.id !== id));
    } catch (error) {
      console.error('❌ Erro crítico:', error);
    }
  };

  const getClient = (id: number) => {
    return clients.find(c => c.id === id);
  };

  return {
    clients,
    isLoading,
    error,
    addClient,
    updateClient,
    deleteClient,
    getClient,
    refreshClients: loadClients,
  };
}