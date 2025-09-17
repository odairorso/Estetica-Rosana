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

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadClients = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('clients').select('*').order('name', { ascending: true });
      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const addClient = async (clientData: Omit<Client, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase.from('clients').insert([clientData]).select();
      if (error) throw error;
      if (data) {
        setClients(prev => [...prev, data[0]]);
      }
      return data ? data[0] : null;
    } catch (error) {
      console.error('Error adding client:', error);
      return null;
    }
  };

  const updateClient = async (id: number, clientData: Partial<Client>) => {
    try {
      const { data, error } = await supabase.from('clients').update(clientData).eq('id', id).select();
      if (error) throw error;
      if (data) {
        setClients(prev => prev.map(client => (client.id === id ? data[0] : client)));
      }
    } catch (error) {
      console.error('Error updating client:', error);
    }
  };

  const deleteClient = async (id: number) => {
    try {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) throw error;
      setClients(prev => prev.filter(client => client.id !== id));
    } catch (error) {
      console.error('Error deleting client:', error);
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
    refreshClients: loadClients,
  };
}