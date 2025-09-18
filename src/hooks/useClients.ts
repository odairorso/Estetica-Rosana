import { useState, useEffect, useCallback } from 'react';
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

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadClients = useCallback(async () => {
    console.log("👥 Carregando clientes (MODO OFFLINE COMPLETO)...");
    setIsLoading(true);
    setError(null);
    
    try {
      const stored = localStorage.getItem(SYSTEM_CONFIG.STORAGE_KEYS.CLIENTS);
      if (stored) {
        const data = JSON.parse(stored);
        console.log("👥 Clientes carregados do localStorage:", data.length);
        setClients(data);
      } else {
        console.log('🎉 Primeiro acesso clientes - inicializando com dados iniciais');
        setClients(INITIAL_CLIENTS);
        // Salvar dados iniciais
        localStorage.setItem(SYSTEM_CONFIG.STORAGE_KEYS.CLIENTS, JSON.stringify(INITIAL_CLIENTS));
      }
    } catch (err) {
      console.error('❌ Erro ao carregar clientes:', err);
      setClients(INITIAL_CLIENTS);
      localStorage.setItem(SYSTEM_CONFIG.STORAGE_KEYS.CLIENTS, JSON.stringify(INITIAL_CLIENTS));
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
    console.log("👥 ADICIONANDO NOVO CLIENTE (OFFLINE):", clientData.name);
    
    const newClient = {
      ...clientData,
      id: clients.length > 0 ? Math.max(...clients.map(c => c.id)) + 1 : 1,
      created_at: new Date().toISOString()
    };
    
    const updatedClients = [...clients, newClient];
    setClients(updatedClients);
    saveToStorage(updatedClients);
    
    console.log("✅ Cliente criado:", newClient);
    return newClient;
  };

  const updateClient = async (id: number, clientData: Partial<Client>) => {
    console.log("👥 ATUALIZANDO CLIENTE (OFFLINE):", id, clientData);
    
    const updatedClients = clients.map(client => 
      client.id === id ? { ...client, ...clientData } : client
    );
    
    setClients(updatedClients);
    saveToStorage(updatedClients);
    
    console.log("✅ Cliente atualizado:", id);
  };

  const deleteClient = async (id: number) => {
    console.log("👥 REMOVENDO CLIENTE (OFFLINE):", id);
    
    const updatedClients = clients.filter(client => client.id !== id);
    setClients(updatedClients);
    saveToStorage(updatedClients);
    
    console.log("✅ Cliente removido:", id);
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