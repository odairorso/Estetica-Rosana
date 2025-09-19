import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Sparkles, Heart, Droplet, Zap } from "lucide-react";

export interface Service {
  id: number;
  name: string;
  category: string;
  price: number;
  duration: number;
  description: string;
  icon: string;
  popular: boolean;
  active: boolean;
  created_at?: string;
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

  const loadServices = useCallback(async () => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('services').select('*').order('name');
      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const addService = async (serviceData: Omit<Service, 'id'>) => {
    if (!supabase) return null;
    const { data, error } = await (supabase.from('services') as any).insert(serviceData).select().single();
    if (error) {
      console.error('Erro ao adicionar serviço:', error);
      return null;
    }
    await loadServices();
    return data;
  };

  const updateService = async (serviceData: Service) => {
    if (!supabase) return;
    const { error } = await (supabase.from('services') as any).update(serviceData).eq('id', serviceData.id);
    if (error) console.error('Erro ao atualizar serviço:', error);
    else await loadServices();
  };

  const deleteService = async (id: number) => {
    if (!supabase) return;
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) console.error('Erro ao excluir serviço:', error);
    else await loadServices();
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
    getServiceIcon,
  };
}