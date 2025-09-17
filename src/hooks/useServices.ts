import { useState, useEffect } from 'react';
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
}

const SERVICES_STORAGE_KEY = 'clinic-services';

const iconMap = {
  Sparkles,
  Heart,
  Droplet,
  Zap,
};

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load services from localStorage on mount
  useEffect(() => {
    const loadServices = () => {
      try {
        const stored = localStorage.getItem(SERVICES_STORAGE_KEY);
        if (stored) {
          setServices(JSON.parse(stored));
        } else {
          // Initialize with sample data if empty
          const sampleServices: Service[] = [
            {
              id: 1,
              name: "Limpeza de Pele",
              category: "Facial",
              price: 120,
              duration: 60,
              description: "Tratamento completo para limpeza e revitalização da pele do rosto",
              icon: "Sparkles",
              popular: true
            },
            {
              id: 2,
              name: "Drenagem Linfática",
              category: "Corporal",
              price: 80,
              duration: 50,
              description: "Massagem que estimula o sistema linfático para redução de inchaços",
              icon: "Droplet",
              popular: false
            },
            {
              id: 3,
              name: "Botox",
              category: "Facial",
              price: 350,
              duration: 30,
              description: "Aplicação de toxina botulínica para redução de rugas e expressões",
              icon: "Zap",
              popular: true
            }
          ];
          setServices(sampleServices);
          localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(sampleServices));
        }
      } catch (error) {
        console.error('Error loading services:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadServices();
  }, []);

  // Save services to localStorage whenever they change
  useEffect(() => {
    if (services.length > 0) {
      localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(services));
    }
  }, [services]);

  const addService = (serviceData: Omit<Service, 'id'>) => {
    const newService: Service = {
      ...serviceData,
      id: Math.max(0, ...services.map(s => s.id)) + 1
    };
    setServices([...services, newService]);
    return newService;
  };

  const updateService = (serviceData: Service) => {
    setServices(services.map(service => 
      service.id === serviceData.id ? serviceData : service
    ));
  };

  const deleteService = (id: number) => {
    setServices(services.filter(service => service.id !== id));
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