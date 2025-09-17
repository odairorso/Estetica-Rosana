import { useState, useEffect } from 'react';
import { Sparkles, Heart, Droplet, Zap } from "lucide-react";
import { supabase } from '../lib/supabase';

export interface Service {
  id: string;
  name: string;
  category: string;
  price: number;
  duration: number;
  description: string;
  icon: string;
  popular: boolean;
}

const iconMap = {
  Sparkles,
  Heart,
  Droplet,
  Zap,
};

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load services from Supabase on mount
  useEffect(() => {
    const loadServices = async () => {
      if (!supabase) {
        console.warn('Supabase not available, using fallback data');
        // Fallback data if Supabase is not available
        const fallbackServices: Service[] = [
          {
            id: "1",
            name: "Limpeza de Pele",
            category: "Facial",
            price: 120,
            duration: 60,
            description: "Tratamento completo para limpeza e revitalização da pele do rosto",
            icon: "Sparkles",
            popular: true
          },
          {
            id: "2",
            name: "Drenagem Linfática",
            category: "Corporal",
            price: 80,
            duration: 50,
            description: "Massagem que estimula o sistema linfático para redução de inchaços",
            icon: "Droplet",
            popular: false
          },
          {
            id: "3",
            name: "Botox",
            category: "Facial",
            price: 350,
            duration: 30,
            description: "Aplicação de toxina botulínica para redução de rugas e expressões",
            icon: "Zap",
            popular: true
          }
        ];
        setServices(fallbackServices);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .order('name', { ascending: true });

        if (error) {
          console.error('Error loading services:', error);
          return;
        }

        // Transform Supabase data to match our interface
        const transformedServices: Service[] = data.map(service => ({
          id: service.id,
          name: service.name || '',
          category: service.category || '',
          price: service.price || 0,
          duration: service.duration || 0,
          description: service.description || '',
          icon: service.icon || 'Sparkles',
          popular: service.popular || false
        }));

        setServices(transformedServices);
      } catch (error) {
        console.error('Error loading services:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadServices();
  }, []);

  const addService = async (serviceData: Omit<Service, 'id'>) => {
    if (!supabase) {
      console.warn('Supabase not available');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('services')
        .insert([{
          name: serviceData.name,
          category: serviceData.category,
          price: serviceData.price,
          duration: serviceData.duration,
          description: serviceData.description,
          icon: serviceData.icon,
          popular: serviceData.popular
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding service:', error);
        return null;
      }

      const newService: Service = {
        id: data.id,
        name: data.name || '',
        category: data.category || '',
        price: data.price || 0,
        duration: data.duration || 0,
        description: data.description || '',
        icon: data.icon || 'Sparkles',
        popular: data.popular || false
      };

      setServices([...services, newService]);
      return newService;
    } catch (error) {
      console.error('Error adding service:', error);
      return null;
    }
  };

  const updateService = async (id: string, serviceData: Partial<Service>) => {
    if (!supabase) {
      console.warn('Supabase not available');
      return;
    }

    try {
      const { error } = await supabase
        .from('services')
        .update({
          name: serviceData.name,
          category: serviceData.category,
          price: serviceData.price,
          duration: serviceData.duration,
          description: serviceData.description,
          icon: serviceData.icon,
          popular: serviceData.popular
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating service:', error);
        return;
      }

      setServices(services.map(service => 
        service.id === id ? { ...service, ...serviceData } : service
      ));
    } catch (error) {
      console.error('Error updating service:', error);
    }
  };

  const deleteService = async (id: string) => {
    if (!supabase) {
      console.warn('Supabase not available');
      return;
    }

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting service:', error);
        return;
      }

      setServices(services.filter(service => service.id !== id));
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  const getService = (id: string) => {
    return services.find(s => s.id === id);
  };

  const getServiceIcon = (iconName: string) => {
    return iconMap[iconName as keyof typeof iconMap] || Sparkles;
  };

  return {
    services,
    isLoading,
    addService,
    updateService,
    deleteService,
    getService,
    getServiceIcon,
  };
}