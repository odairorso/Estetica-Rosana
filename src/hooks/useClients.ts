import { useState, useEffect } from "react";

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

const STORAGE_KEY = "clinic-clients";

const initialClients: Client[] = [
  {
    id: 1,
    name: "Ana Silva",
    email: "ana@email.com",
    phone: "(11) 99999-9999",
    cpf: "123.456.789-00",
    address: {
      street: "Rua das Flores",
      number: "123",
      complement: "Apto 45",
      neighborhood: "Centro",
      city: "São Paulo",
      state: "SP",
      zipCode: "01234-567"
    },
    avatar: null,
    lastVisit: "15/09/2024",
    totalVisits: 12,
    activePackages: 2,
    nextAppointment: "20/09/2024 14:00",
    createdAt: "2024-01-15"
  },
  {
    id: 2,
    name: "Beatriz Santos", 
    email: "bia@email.com",
    phone: "(11) 88888-8888",
    cpf: "987.654.321-00",
    address: {
      street: "Av. Paulista",
      number: "456",
      neighborhood: "Bela Vista",
      city: "São Paulo",
      state: "SP",
      zipCode: "01310-100"
    },
    avatar: null,
    lastVisit: "10/09/2024",
    totalVisits: 8,
    activePackages: 1,
    nextAppointment: "22/09/2024 16:30",
    createdAt: "2024-02-10"
  },
  {
    id: 3,
    name: "Carla Oliveira",
    email: "carla@email.com", 
    phone: "(11) 77777-7777",
    cpf: "456.789.123-00",
    address: {
      street: "Rua Augusta",
      number: "789",
      neighborhood: "Consolação",
      city: "São Paulo",
      state: "SP",
      zipCode: "01305-100"
    },
    avatar: null,
    lastVisit: "08/09/2024",
    totalVisits: 15,
    activePackages: 0,
    nextAppointment: null,
    createdAt: "2023-12-20"
  }
];

export function useClients() {
  const [clients, setClients] = useState<Client[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : initialClients;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
  }, [clients]);

  const addClient = (clientData: Omit<Client, 'id' | 'createdAt' | 'totalVisits' | 'lastVisit'>) => {
    const newClient: Client = {
      ...clientData,
      id: Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
      totalVisits: 0,
      lastVisit: "-"
    };
    setClients(prev => [...prev, newClient]);
  };

  const updateClient = (id: number, clientData: Partial<Client>) => {
    setClients(prev => 
      prev.map(client => 
        client.id === id ? { ...client, ...clientData } : client
      )
    );
  };

  const deleteClient = (id: number) => {
    setClients(prev => prev.filter(client => client.id !== id));
  };

  const getClient = (id: number) => {
    return clients.find(client => client.id === id);
  };

  return {
    clients,
    addClient,
    updateClient,
    deleteClient,
    getClient
  };
}