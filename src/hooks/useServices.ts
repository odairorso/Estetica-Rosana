import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Sparkles, Heart, Droplet, Zap } from "lucide-react";

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

const fetchServices = async () => {
  const { data, error } = await supabase.from('services').select('*').order('name');
  if (error) throw new Error(error.message);
  return data;
};

const addService = async (serviceData: Omit<Service, 'id'>) => {
  const { data, error } = await supabase.from('services').insert([serviceData]).select();
  if (error) throw new Error(error.message);
  return data[0];
};

const updateService = async (serviceData: Partial<Service> & { id: string }) => {
  const { id, ...updateData } = serviceData;
  const { data, error } = await supabase.from('services').update(updateData).eq('id', id).select();
  if (error) throw new Error(error.message);
  return data[0];
};

const deleteService = async (id: string) => {
  const { error } = await supabase.from('services').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

export function useServices() {
  const queryClient = useQueryClient();

  const { data: services = [], isLoading } = useQuery<Service[]>({
    queryKey: ['services'],
    queryFn: fetchServices,
  });

  const addMutation = useMutation({
    mutationFn: addService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
  
  const getServiceIcon = (iconName: string) => {
    return iconMap[iconName as keyof typeof iconMap] || Sparkles;
  };

  return {
    services,
    isLoading,
    addService: addMutation.mutate,
    updateService: updateMutation.mutate,
    deleteService: deleteMutation.mutate,
    getServiceIcon,
  };
}