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
  price: number;
  validUntil: string;
  lastUsed: string | null;
  status: "active" | "expiring" | "completed" | "expired";
  createdAt: string;
  sessionHistory: SessionHistoryEntry[];
}

const PACKAGES_STORAGE_KEY = 'clinic-packages';

export function usePackages() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load packages from localStorage on mount
  useEffect(() => {
    const loadPackages = () => {
      try {
        const stored = localStorage.getItem(PACKAGES_STORAGE_KEY);
        if (stored) {
          setPackages(JSON.parse(stored));
        } else {
          // Initialize with sample data if empty
          const samplePackages: Package[] = [
            {
              id: 1,
              name: "Pacote Limpeza de Pele Premium",
              description: "10 sessões de limpeza de pele com hidratação profunda",
              clientId: 1,
              clientName: "Ana Silva",
              totalSessions: 10,
              usedSessions: 3,
              price: 900,
              validUntil: "2023-12-31",
              lastUsed: "2023-05-20",
              status: "active",
              createdAt: "2023-01-15",
              sessionHistory: [
                { id: "1", date: "2023-03-15", notes: "Primeira sessão" },
                { id: "2", date: "2023-04-15", notes: "Segunda sessão" },
                { id: "3", date: "2023-05-20", notes: "Terceira sessão" }
              ]
            },
            {
              id: 2,
              name: "Pacote Botox Express",
              description: "5 aplicações de botox para região da testa",
              clientId: 2,
              clientName: "Carlos Oliveira",
              totalSessions: 5,
              usedSessions: 5,
              price: 1500,
              validUntil: "2023-08-31",
              lastUsed: "2023-05-15",
              status: "completed",
              createdAt: "2023-02-01",
              sessionHistory: [
                { id: "1", date: "2023-02-15", notes: "Aplicação inicial" },
                { id: "2", date: "2023-03-01", notes: "Reforço" },
                { id: "3", date: "2023-03-20", notes: "Manutenção" },
                { id: "4", date: "2023-04-10", notes: "Ajuste" },
                { id: "5", date: "2023-05-15", notes: "Finalização" }
              ]
            }
          ];
          setPackages(samplePackages);
          localStorage.setItem(PACKAGES_STORAGE_KEY, JSON.stringify(samplePackages));
        }
      } catch (error) {
        console.error('Error loading packages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPackages();
  }, []);

  // Save packages to localStorage whenever they change
  useEffect(() => {
    if (packages.length > 0) {
      localStorage.setItem(PACKAGES_STORAGE_KEY, JSON.stringify(packages));
    }
  }, [packages]);

  const addPackage = (packageData: Omit<Package, 'id' | 'createdAt' | 'usedSessions' | 'status' | 'sessionHistory'>) => {
    const newPackage: Package = {
      ...packageData,
      id: Math.max(0, ...packages.map(p => p.id)) + 1,
      usedSessions: 0,
      status: 'active',
      sessionHistory: [],
      createdAt: new Date().toISOString().split('T')[0]
    };
    setPackages([...packages, newPackage]);
    return newPackage;
  };

  const updatePackage = (id: number, packageData: Partial<Package>) => {
    setPackages(packages.map(pkg => 
      pkg.id === id ? { ...pkg, ...packageData } : pkg
    ));
  };

  const deletePackage = (id: number) => {
    setPackages(packages.filter(pkg => pkg.id !== id));
  };

  const getPackage = (id: number) => {
    return packages.find(p => p.id === id);
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

    updatePackage(id, {
      usedSessions,
      status,
      lastUsed: newSessionEntry.date,
      sessionHistory: [...(pkg.sessionHistory || []), newSessionEntry],
    });
  };

  return {
    packages,
    isLoading,
    addPackage,
    updatePackage,
    deletePackage,
    getPackage,
    useSession,
  };
}