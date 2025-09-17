import { useState, useEffect } from 'react';

export interface SessionHistoryEntry {
  id: string;
  date: string;
  notes?: string;
}

export interface Package {
  id: number;
  name: string;
  description: string;
  clientId: number;
  clientName: string;
  totalSessions: number;
  usedSessions: number;
  remainingSessions: number;
  price: number;
  validUntil: string;
  lastUsed: string | null;
  status: "active" | "expiring" | "completed" | "expired";
  sessionHistory: SessionHistoryEntry[];
}

const MOCK_PACKAGES: Package[] = [
  {
    id: 1,
    name: "Pacote Limpeza de Pele Premium",
    description: "10 sessões de limpeza de pele com produtos especiais",
    clientId: 1,
    clientName: "Ana Silva",
    totalSessions: 10,
    usedSessions: 3,
    remainingSessions: 7,
    price: 850.00,
    validUntil: "2023-12-31",
    lastUsed: "2023-05-15",
    status: "active",
    sessionHistory: [
      { id: "1", date: "2023-03-01", notes: "Sessão 1" },
      { id: "2", date: "2023-04-01", notes: "Sessão 2" },
      { id: "3", date: "2023-05-15", notes: "Sessão 3" }
    ]
  },
  {
    id: 2,
    name: "Pacote Botox Express",
    description: "5 sessões de aplicação de botox",
    clientId: 2,
    clientName: "Carlos Oliveira",
    totalSessions: 5,
    usedSessions: 5,
    remainingSessions: 0,
    price: 1200.00,
    validUntil: "2023-08-31",
    lastUsed: "2023-05-20",
    status: "completed",
    sessionHistory: [
      { id: "1", date: "2023-01-15", notes: "Sessão 1" },
      { id: "2", date: "2023-02-15", notes: "Sessão 2" },
      { id: "3", date: "2023-03-15", notes: "Sessão 3" },
      { id: "4", date: "2023-04-15", notes: "Sessão 4" },
      { id: "5", date: "2023-05-20", notes: "Sessão 5" }
    ]
  }
];

export function usePackages() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const storedPackages = localStorage.getItem('packages');
      if (storedPackages) {
        setPackages(JSON.parse(storedPackages));
      } else {
        setPackages(MOCK_PACKAGES);
        localStorage.setItem('packages', JSON.stringify(MOCK_PACKAGES));
      }
      setIsLoading(false);
    }, 500);
  }, []);

  const addPackage = (packageData: Omit<Package, 'id' | 'usedSessions' | 'remainingSessions' | 'status' | 'sessionHistory'>) => {
    const newPackage = {
      ...packageData,
      id: Date.now(),
      usedSessions: 0,
      remainingSessions: packageData.totalSessions,
      status: 'active' as const,
      sessionHistory: []
    };
    const updatedPackages = [...packages, newPackage];
    setPackages(updatedPackages);
    localStorage.setItem('packages', JSON.stringify(updatedPackages));
    return newPackage;
  };

  const updatePackage = (id: number, packageData: Partial<Package>) => {
    const updatedPackages = packages.map(pkg => 
      pkg.id === id ? { ...pkg, ...packageData } : pkg
    );
    setPackages(updatedPackages);
    localStorage.setItem('packages', JSON.stringify(updatedPackages));
    return updatedPackages.find(pkg => pkg.id === id);
  };

  const deletePackage = (id: number) => {
    const updatedPackages = packages.filter(pkg => pkg.id !== id);
    setPackages(updatedPackages);
    localStorage.setItem('packages', JSON.stringify(updatedPackages));
  };

  const getPackage = (id: number) => {
    return packages.find(pkg => pkg.id === id);
  };

  const useSession = (id: number, notes?: string) => {
    const pkg = packages.find(p => p.id === id);
    if (!pkg || pkg.usedSessions >= pkg.totalSessions) return;

    const newSessionEntry: SessionHistoryEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      notes: notes || `Sessão ${pkg.usedSessions + 1}`,
    };

    const usedSessions = pkg.usedSessions + 1;
    const remainingSessions = pkg.totalSessions - usedSessions;
    let status: Package['status'] = pkg.status;
    
    if (remainingSessions <= 0) {
      status = 'completed';
    } else if (remainingSessions <= 2) {
      status = 'expiring';
    }

    const updatedPackage = {
      ...pkg,
      usedSessions,
      remainingSessions,
      status,
      lastUsed: newSessionEntry.date,
      sessionHistory: [...pkg.sessionHistory, newSessionEntry]
    };

    const updatedPackages = packages.map(p => 
      p.id === id ? updatedPackage : p
    );
    
    setPackages(updatedPackages);
    localStorage.setItem('packages', JSON.stringify(updatedPackages));
  };

  return {
    packages,
    isLoading,
    addPackage,
    updatePackage,
    deletePackage,
    getPackage,
   <dyad-write path="src/hooks/useServices.ts" description="Updating services hook to work with mock data">
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

const MOCK_SERVICES: Service[] = [
  {
    id: 1,
    name: "Limpeza de Pele",
    category: "Facial",
    price: 120.00,
    duration: 60,
    description: "Procedimento completo de limpeza de pele com extração de cravos e espinhas",
    icon: "Sparkles",
    popular: true
  },
  {
    id: 2,
    name: "Massagem Relaxante",
    category: "Corporal",
    price: 150.00,
    duration: 60,
    description: "Massagem corporal relaxante com óleos essenciais",
    icon: "Heart",
    popular: false
  },
  {
    id: 3,
    name: "Drenagem Linfática",
    category: "Corporal",
    price: 180.00,
    duration: 60,
    description: "Massagem especializada para redução de inchaços e melhora da circulação",
    icon: "Droplet",
    popular: true
  },
  {
    id: 4,
    name: "Aplicação de Botox",
    category: "Facial",
    price: 800.00,
    duration: 30,
    description: "Aplicação de botox para redução de rugas e expressões faciais",
    icon: "Zap",
    popular: false
  }
];

const iconMap = {
  Sparkles,
  Heart,
  Droplet,
  Zap,
};

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const storedServices = localStorage.getItem('services');
      if (storedServices) {
        setServices(JSON.parse(storedServices));
      } else {
        setServices(MOCK_SERVICES);
        localStorage.setItem('services', JSON.stringify(MOCK_SERVICES));
      }
      setIsLoading(false);
    }, 500);
  }, []);

  const addService = (serviceData: Omit<Service, 'id'>) => {
    const newService = {
      ...serviceData,
      id: Date.now()
    };
    const updatedServices = [...services, newService];
    setServices(updatedServices);
    localStorage.setItem('services', JSON.stringify(updatedServices));
    return newService;
  };

  const updateService = (serviceData: Service) => {
    const updatedServices = services.map(service => 
      service.id === serviceData.id ? serviceData : service
    );
    setServices(updatedServices);
    localStorage.setItem('services', JSON.stringify(updatedServices));
    return serviceData;
  };

  const deleteService = (id: number) => {
    const updatedServices = services.filter(service => service.id !== id);
    setServices(updatedServices);
    localStorage.setItem('services', JSON.stringify(updatedServices));
  };

  const getService = (id: number) => {
    return services.find(service => service.id === id);
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
    getServiceIcon
  };
}