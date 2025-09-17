import { useState } from "react";
import { Sparkles, Clock, DollarSign, Tag, Heart, Droplet, Zap } from "lucide-react";

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

const iconMap = {
  Sparkles,
  Heart,
  Droplet,
  Zap,
};

const initialServices: Service[] = [
  {
    id: 1,
    name: "Limpeza de Pele Profunda",
    category: "Facial",
    price: 120.00,
    duration: 60,
    description: "Limpeza completa com extração e hidratação",
    icon: "Sparkles",
    popular: true
  },
  {
    id: 2,
    name: "Drenagem Linfática",
    category: "Corporal",
    price: 80.00,
    duration: 45,
    description: "Massagem para redução de inchaço e retenção",
    icon: "Droplet",
    popular: false
  },
  {
    id: 3,
    name: "Hidratação Facial",
    category: "Facial",
    price: 90.00,
    duration: 40,
    description: "Tratamento hidratante com ácido hialurônico",
    icon: "Heart",
    popular: true
  },
  {
    id: 4,
    name: "Peeling Químico",
    category: "Facial",
    price: 150.00,
    duration: 30,
    description: "Renovação celular com ácidos específicos",
    icon: "Zap",
    popular: false
  },
  {
    id: 5,
    name: "Massagem Relaxante",
    category: "Corporal",
    price: 100.00,
    duration: 50,
    description: "Massagem terapêutica para alívio do estresse",
    icon: "Heart",
    popular: true
  },
  {
    id: 6,
    name: "Tratamento Anti-idade",
    category: "Facial",
    price: 200.00,
    duration: 75,
    description: "Protocolo completo contra sinais de envelhecimento",
    icon: "Sparkles",
    popular: false
  }
];

export function useServices() {
  const [services, setServices] = useState<Service[]>(initialServices);

  const addService = (newService: Omit<Service, 'id'>) => {
    const id = Math.max(...services.map(s => s.id), 0) + 1;
    setServices(prev => [...prev, { ...newService, id }]);
  };

  const updateService = (updatedService: Service) => {
    setServices(prev => prev.map(service => 
      service.id === updatedService.id ? updatedService : service
    ));
  };

  const deleteService = (id: number) => {
    setServices(prev => prev.filter(service => service.id !== id));
  };

  const getServiceIcon = (iconName: string) => {
    return iconMap[iconName as keyof typeof iconMap] || Sparkles;
  };

  return {
    services,
    addService,
    updateService,
    deleteService,
    getServiceIcon,
  };
}