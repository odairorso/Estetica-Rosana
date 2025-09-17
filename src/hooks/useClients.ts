import { useState, useEffect } from 'react';

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
  lastVisit: string;
  totalVisits: number;
  activePackages: number;
  nextAppointment: string | null;
  createdAt: string;
}

const CLIENTS_STORAGE_KEY = 'clinic-clients';

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load clients from localStorage on mount
  useEffect(() => {
    const loadClients = () => {
      try {
        const stored = localStorage.getItem(CLIENTS_STORAGE_KEY);
        if (stored) {
          setClients(JSON.parse(stored));
        } else {
          // Initialize with sample data if empty
          const sampleClients: Client[] = [
            {
              id: 1,
              name: "Ana Silva",
              email: "ana.silva@email.com",
              phone: "(11) 98765-4321",
              cpf: "123.456.789-00",
              address: {
                street: "Rua das Flores",
                number: "123",
                complement: "Apto 101",
                neighborhood: "Centro",
                city: "São Paulo",
                state: "SP",
                zipCode: "01234-567"
              },
              avatar: null,
              lastVisit: "2023-05-15",
              totalVisits: 5,
              activePackages: 1,
              nextAppointment: "2023-06-10T14:00:00",
              createdAt: "2023-01-15"
            },
            {
              id: 2,
              name: "Carlos Oliveira",
              email: "carlos.oliveira@email.com",
              phone: "(11) 99876-5432",
              cpf: "987.654.321-00",
              address: {
                street: "Av. Paulista",
                number: "1000",
                neighborhood: "Bela Vista",
                city: "São Paulo",
                state: "SP",
                zipCode: "01310-100"
              },
              avatar: null,
              lastVisit: "2023-05-20",
              totalVisits: 3,
              activePackages: 0,
              nextAppointment: null,
              createdAt: "2023-02-10"
            }
          ];
          setClients(sampleClients);
          localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(sampleClients));
        }
      } catch (error) {
        console.error('Error loading clients:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadClients();
  }, []);

  // Save clients to localStorage whenever they change
  useEffect(() => {
    if (clients.length > 0) {
      localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients));
    }
  }, [clients]);

  const addClient = (clientData: Omit<Client, 'id' | 'createdAt'>) => {
    const newClient: Client = {
      ...clientData,
      id: Math.max(0, ...clients.map(c => c.id)) + 1,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setClients([...clients, newClient]);
    return newClient;
  };

  const updateClient = (id: number, clientData: Partial<Client>) => {
    setClients(clients.map(client => 
      client.id === id ? { ...client, ...clientData } : client
    ));
  };

  const deleteClient = (id: number) => {
    setClients(clients.filter(client => client.id !== id));
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
  };
}