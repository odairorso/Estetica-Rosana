import { useState, useEffect, useCallback } from 'react';
import { SYSTEM_CONFIG } from '@/config/system';
import { supabase } from '@/integrations/supabase/client'; // Import supabase

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

// Dados de exemplo caso localStorage esteja vazio
const INITIAL_CLIENTS: Client[] = [
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
  },
  {
    id: 3,
    name: "Rosana Turci",
    email: "rosana@clinica.com",
    phone: "(11) 77777-7777",
    cpf: "111.222.333-44",
    city: "São Paulo",
    state: "SP",
    total_visits: 0,
    active_packages: 0,
    created_at: "2024-01-03T12:00:00Z"
  },
  {
    id: 4,
    name: "Maria Silva",
    email: "maria@email.com",
    phone: "(11) 66666-6666",
    cpf: "555.666.777-88",
    city: "São Paulo",
    state: "SP",
    total_visits: 8,
    active_packages: 2,
    created_at: "2024-01-04T14:00:00Z"
  }
];

export const seedInitialClients = async () => {
  console.log("🌱 Semeando clientes iniciais no Supabase...");
  const clientsToInsert = INITIAL_CLIENTS.map(client => ({
    name: client.name,
    email: client.email,
    phone: client.phone,
    cpf: client.cpf,
    total_visits: client.total_visits,
    active_packages: client.active_packages,
  }));

  const { data, error } = await supabase
    .from('clients')
    .insert(clientsToInsert)
    .select();

  if (error) {
    console.error('❌ Erro ao semear clientes:', error);
    return { success: false, error: error.message };
  }
  console.log('✅ Clientes iniciais semeados:', data.length);
  return { success: true, count: data.length };
};

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadClients = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const isOffline = localStorage.getItem('force-offline-mode') === 'true';

    if (isOffline) {
      console.log("👥 Carregando clientes (MODO OFFLINE)...");
      try {
        const stored = localStorage.getItem(SYSTEM_CONFIG.STORAGE_KEYS.CLIENTS);
        if (stored) {
          const data = JSON.parse(stored);
          setClients(data);
        } else {
          setClients(INITIAL_CLIENTS); // Use initial data if localStorage is empty
          saveToStorage(INITIAL_CLIENTS); // Save initial data to localStorage
        }
      } catch (err) {
        console.error('❌ Erro ao carregar clientes do localStorage:', err);
        setClients(INITIAL_CLIENTS);
        saveToStorage(INITIAL_CLIENTS);
      }
    } else {
      console.log("☁️ Carregando clientes (MODO ONLINE - SUPABASE)...");
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar clientes do Supabase:', error);
        setError('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.');
        setClients([]);
      } else {
        console.log('✅ Clientes carregados do Supabase:', data.length);
        setClients(data || []);
        saveToStorage(data || []); // Cache fresh data to localStorage
      }
    }
    
    setIsLoading(false);
  }, []);

  // Salvar no localStorage
  const saveToStorage = (data: Client[]) => {
    try {
      localStorage.setItem(SYSTEM_CONFIG.STORAGE_KEYS.CLIENTS, JSON.stringify(data));
      console.log("💾 Clientes salvos no localStorage:", data.length);
    } catch (err) {
      console.error('❌ Erro ao salvar clientes no localStorage:', err);
    }
  };

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const addClient = async (clientData: Omit<Client, 'id' | 'created_at'>) => {
    const isOffline = localStorage.getItem('force-offline-mode') === 'true';

    if (isOffline) {
      console.log("👥 ADICIONANDO NOVO CLIENTE (OFFLINE):", clientData.name);
      const newClient = {
        ...clientData,
        id: clients.length > 0 ? Math.max(...clients.map(c => c.id)) + 1 : 1,
        created_at: new Date().toISOString()
      };
      const updatedClients = [...clients, newClient];
      setClients(updatedClients);
      saveToStorage(updatedClients);
      console.log("✅ Cliente criado (Offline):", newClient);
      return newClient;
    } else {
      console.log("☁️ ADICIONANDO NOVO CLIENTE (ONLINE - SUPABASE):", clientData.name);
      const { data, error } = await supabase
        .from('clients')
        .insert(clientData) // Supabase will generate ID and created_at
        .select();

      if (error) {
        console.error('❌ Erro ao adicionar cliente no Supabase:', error);
        setError('Não foi possível adicionar o cliente.');
        return null;
      }
      const newClient = data?.[0];
      if (newClient) {
        setClients(prev => [...prev, newClient]);
        saveToStorage([...clients, newClient]); // Update local cache
        console.log("✅ Cliente criado (Online):", newClient);
      }
      return newClient;
    }
  };

  const updateClient = async (id: number, clientData: Partial<Client>) => {
    const isOffline = localStorage.getItem('force-offline-mode') === 'true';

    if (isOffline) {
      console.log("👥 ATUALIZANDO CLIENTE (OFFLINE):", id, clientData);
      const updatedClients = clients.map(client => 
        client.id === id ? { ...client, ...clientData } : client
      );
      setClients(updatedClients);
      saveToStorage(updatedClients);
      console.log("✅ Cliente atualizado (Offline):", id);
    } else {
      console.log("☁️ ATUALIZANDO CLIENTE (ONLINE - SUPABASE):", id, clientData);
      const { data, error } = await supabase
        .from('clients')
        .update(clientData)
        .eq('id', id)
        .select();

      if (error) {
        console.error('❌ Erro ao atualizar cliente no Supabase:', error);
        setError('Não foi possível atualizar o cliente.');
      } else {
        const updatedClient = data?.[0];
        if (updatedClient) {
          setClients(prev => prev.map(client => client.id === id ? updatedClient : client));
          saveToStorage(clients.map(client => client.id === id ? updatedClient : client)); // Update local cache
          console.log("✅ Cliente atualizado (Online):", id);
        }
      }
    }
  };

  const deleteClient = async (id: number) => {
    const isOffline = localStorage.getItem('force-offline-mode') === 'true';

    if (isOffline) {
      console.log("👥 REMOVENDO CLIENTE (OFFLINE):", id);
      const updatedClients = clients.filter(client => client.id !== id);
      setClients(updatedClients);
      saveToStorage(updatedClients);
      console.log("✅ Cliente removido (Offline):", id);
    } else {
      console.log("☁️ REMOVENDO CLIENTE (ONLINE - SUPABASE):", id);
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Erro ao remover cliente do Supabase:', error);
        setError('Não foi possível remover o cliente.');
      } else {
        const updatedClients = clients.filter(client => client.id !== id);
        setClients(updatedClients);
        saveToStorage(updatedClients); // Update local cache
        console.log("✅ Cliente removido (Online):", id);
      }
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