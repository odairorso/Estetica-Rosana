import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

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
  lastVisit: string;
  totalVisits: number;
  activePackages: number;
  nextAppointment: string | null;
  createdAt: string;
}

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load clients from Supabase on mount
  useEffect(() => {
    const loadClients = async () => {
      if (!supabase) {
        console.warn('Supabase not available, using fallback data');
        // Fallback data if Supabase is not available
        const fallbackClients: Client[] = [
          {
            id: "1",
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
            id: "2",
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
        setClients(fallbackClients);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading clients:', error);
          return;
        }

        // Transform Supabase data to match our interface
        const transformedClients: Client[] = data.map(client => ({
          id: client.id,
          name: client.name || '',
          email: client.email || '',
          phone: client.phone || '',
          cpf: client.cpf || '',
          address: client.address || {
            street: '',
            number: '',
            neighborhood: '',
            city: '',
            state: '',
            zipCode: ''
          },
          avatar: client.avatar,
          lastVisit: client.last_visit || '',
          totalVisits: client.total_visits || 0,
          activePackages: client.active_packages || 0,
          nextAppointment: client.next_appointment,
          createdAt: client.created_at?.split('T')[0] || ''
        }));

        setClients(transformedClients);
      } catch (error) {
        console.error('Error loading clients:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadClients();
  }, []);

  const addClient = async (clientData: Omit<Client, 'id' | 'createdAt'>) => {
    if (!supabase) {
      console.warn('Supabase not available');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([{
          name: clientData.name,
          email: clientData.email,
          phone: clientData.phone,
          cpf: clientData.cpf,
          address: clientData.address,
          avatar: clientData.avatar,
          last_visit: clientData.lastVisit || null,
          total_visits: clientData.totalVisits,
          active_packages: clientData.activePackages,
          next_appointment: clientData.nextAppointment || null
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding client:', error);
        return null;
      }

      const newClient: Client = {
        id: data.id,
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        cpf: data.cpf || '',
        address: data.address || clientData.address,
        avatar: data.avatar,
        lastVisit: data.last_visit || '',
        totalVisits: data.total_visits || 0,
        activePackages: data.active_packages || 0,
        nextAppointment: data.next_appointment,
        createdAt: data.created_at?.split('T')[0] || ''
      };

      setClients([newClient, ...clients]);
      return newClient;
    } catch (error) {
      console.error('Error adding client:', error);
      return null;
    }
  };

  const updateClient = async (id: string, clientData: Partial<Client>) => {
    if (!supabase) {
      console.warn('Supabase not available');
      return;
    }

    try {
      const updateData: any = {};
      if (clientData.name !== undefined) updateData.name = clientData.name;
      if (clientData.email !== undefined) updateData.email = clientData.email;
      if (clientData.phone !== undefined) updateData.phone = clientData.phone;
      if (clientData.cpf !== undefined) updateData.cpf = clientData.cpf;
      if (clientData.address !== undefined) updateData.address = clientData.address;
      if (clientData.avatar !== undefined) updateData.avatar = clientData.avatar;
      if (clientData.lastVisit !== undefined) updateData.last_visit = clientData.lastVisit;
      if (clientData.totalVisits !== undefined) updateData.total_visits = clientData.totalVisits;
      if (clientData.activePackages !== undefined) updateData.active_packages = clientData.activePackages;
      if (clientData.nextAppointment !== undefined) updateData.next_appointment = clientData.nextAppointment;

      const { error } = await supabase
        .from('clients')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating client:', error);
        return;
      }

      setClients(clients.map(client => 
        client.id === id ? { ...client, ...clientData } : client
      ));
    } catch (error) {
      console.error('Error updating client:', error);
    }
  };

  const deleteClient = async (id: string) => {
    if (!supabase) {
      console.warn('Supabase not available');
      return;
    }

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting client:', error);
        return;
      }

      setClients(clients.filter(client => client.id !== id));
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  const getClient = (id: string) => {
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