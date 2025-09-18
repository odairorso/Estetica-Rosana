import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { SYSTEM_CONFIG } from '@/config/system';

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
  const [error, setError] = useState<string | null>(null);

  const loadClients = useCallback(async () => {
    console.log("👥 Carregando clientes do Supabase...");
    setIsLoading(true);
    setError(null);
    
    try {
      if (!supabase) {
        throw new Error('Supabase não está disponível');
      }
      
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      console.log("✅ Clientes carregados do Supabase:", data?.length || 0);
      setClients(data || []);
    } catch (err) {
      console.error('❌ Erro ao carregar clientes:', err);
      setError('Erro ao carregar clientes do servidor');
      
      // Fallback para localStorage
      const stored = localStorage.getItem(SYSTEM_CONFIG.STORAGE_KEYS.CLIENTS);
      if (stored) {
        const data = JSON.parse(stored);
        setClients(data);
      }
    }
    
    setIsLoading(false);
  }, []);

  const addClient = async (clientData: Omit<Client, 'id' | 'created_at'>) => {
    console.log("👥 ADICIONANDO NOVO CLIENTE:", clientData.name);
    
    try {
      if (!supabase) {
        throw new Error('Supabase não está disponível');
      }
      
      const { data, error } = await supabase
        .from('clients')
        .insert([clientData])
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        const updatedClients = [...clients, data];
        setClients(updatedClients);
        console.log("✅ Cliente criado no Supabase:", data);
        return data;
      }
    } catch (err) {
      console.error('❌ Erro ao criar cliente no Supabase:', err);
      
      // Fallback offline
      const newClient = {
        ...clientData,
        id: clients.length > 0 ? Math.max(...clients.map(c => c.id)) + 1 : 1,
        created_at: new Date().toISOString()
      };
      
      const updatedClients = [...clients, newClient];
      setClients(updatedClients);
      localStorage.setItem(SYSTEM_CONFIG.STORAGE_KEYS.CLIENTS, JSON.stringify(updatedClients));
      return newClient;
    }
    
    return null;
  };

  const updateClient = async (id: number, clientData: Partial<Client>) => {
    console.log("👥 ATUALIZANDO CLIENTE:", id, clientData);
    
    try {
      if (!supabase) {
        throw new Error('Supabase não está disponível');
      }
      
      const { data, error } = await supabase
        .from('clients')
        .update(clientData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        const updatedClients = clients.map(client => 
          client.id === id ? data : client
        );
        setClients(updatedClients);
        console.log("✅ Cliente atualizado no Supabase:", id);
      }
    } catch (err) {
      console.error('❌ Erro ao atualizar cliente no Supabase:', err);
      
      // Fallback offline
      const updatedClients = clients.map(client => 
        client.id === id ? { ...client, ...clientData } : client
      );
      setClients(updatedClients);
      localStorage.setItem(SYSTEM_CONFIG.STORAGE_KEYS.CLIENTS, JSON.stringify(updatedClients));
    }
  };

  const deleteClient = async (id: number) => {
    console.log("👥 REMOVENDO CLIENTE:", id);
    
    try {
      if (!supabase) {
        throw new Error('Supabase não está disponível');
      }
      
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      const updatedClients = clients.filter(client => client.id !== id);
      setClients(updatedClients);
      console.log("✅ Cliente removido do Supabase:", id);
    } catch (err) {
      console.error('❌ Erro ao remover cliente no Supabase:', err);
      
      // Fallback offline
      const updatedClients = clients.filter(client => client.id !== id);
      setClients(updatedClients);
      localStorage.setItem(SYSTEM_CONFIG.STORAGE_KEYS.CLIENTS, JSON.stringify(updatedClients));
    }
  };

  const getClient = (id: number) => {
    return clients.find(c => c.id === id);
  };

  useEffect(() => {
    loadClients();
  }, [loadClients]);

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
