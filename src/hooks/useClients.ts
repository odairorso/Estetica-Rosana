import { useState, useEffect } from 'react';

export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  address?: {
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  avatar?: string | null;
  lastVisit: string;
  totalVisits: number;
  activePackages: number;
  nextAppointment?: string | null;
}

const MOCK_CLIENTS: Client[] = [
  {
    id: 1,
    name: "Ana Silva",
    email: "ana.silva@email.com",
    phone: "(11) 99999-9999",
    cpf: "123.456.789-00",
    address: {
      street: "Rua das Flores",
      number: "123",
      complement: "Apto 101",
      neighborhood: "Centro",
      city: "São Paulo",
      state: "SP",
      zipCode: "01001-000"
    },
    avatar: null,
    lastVisit: "2023-05-15",
    totalVisits: 5,
    activePackages: 2,
    nextAppointment: "2023-06-20T14:00:00"
  },
  {
    id: 2,
    name: "Carlos Oliveira",
    email: "carlos.oliveira@email.com",
    phone: "(11) 88888-8888",
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
    activePackages: 1,
    nextAppointment: null
  }
];

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const storedClients = localStorage.getItem('clients');
      if (storedClients) {
        setClients(JSON.parse(storedClients));
      } else {
        setClients(MOCK_CLIENTS);
        localStorage.setItem('clients', JSON.stringify(MOCK_CLIENTS));
      }
      setIsLoading(false);
    }, 500);
  }, []);

  const addClient = (clientData: Omit<Client, 'id'>) => {
    const newClient = {
      ...clientData,
      id: Date.now()
    };
    const updatedClients = [...clients, newClient];
    setClients(updatedClients);
    localStorage.setItem('clients', JSON.stringify(updatedClients));
    return newClient;
  };

  const updateClient = (id: number, clientData: Partial<Client>) => {
    const updatedClients = clients.map(client => 
      client.id === id ? { ...client, ...clientData } : client
    );
    setClients(updatedClients);
    localStorage.setItem('clients', JSON.stringify(updatedClients));
    return updatedClients.find(client => client.id === id);
  };

  const deleteClient = (id: number) => {
    const updatedClients = clients.filter(client => client.id !== id);
    setClients(updatedClients);
    localStorage.setItem('clients', JSON.stringify(updatedClients));
  };

  const getClient = (id: number) => {
    return clients.find(client => client.id === id);
  };

  return {
    clients,
    isLoading,
    addClient,
    updateClient,
    deleteClient,
    getClient
  };
}