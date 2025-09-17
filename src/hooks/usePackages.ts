import { useState, useEffect } from "react";

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
  createdAt: string;
  sessionHistory: SessionHistoryEntry[];
}

export interface SessionHistoryEntry {
  id: string;
  date: string;
  notes?: string;
}

const STORAGE_KEY = "clinic-packages";

const initialPackages: Package[] = [
  {
    id: 1,
    name: "Pacote Limpeza de Pele Premium",
    description: "Tratamento completo de limpeza facial com extração e hidratação",
    clientId: 1,
    clientName: "Ana Silva",
    totalSessions: 10,
    usedSessions: 3,
    remainingSessions: 7,
    price: 800.00,
    validUntil: "2024-12-15",
    lastUsed: "2024-09-10",
    status: "active",
    createdAt: "2024-08-01",
    sessionHistory: [
      { id: "1", date: "2024-08-15", notes: "Primeira sessão - limpeza profunda" },
      { id: "2", date: "2024-08-25", notes: "Segunda sessão - extração e hidratação" },
      { id: "3", date: "2024-09-10", notes: "Terceira sessão - tonificação" }
    ]
  },
  {
    id: 2,
    name: "Drenagem Linfática - Combo",
    description: "Sessões de drenagem linfática para redução de inchaço",
    clientId: 2,
    clientName: "Beatriz Santos",
    totalSessions: 8,
    usedSessions: 5,
    remainingSessions: 3,
    price: 600.00,
    validUntil: "2024-11-20",
    lastUsed: "2024-09-12",
    status: "active",
    createdAt: "2024-07-20",
    sessionHistory: [
      { id: "4", date: "2024-07-25", notes: "Primeira sessão - avaliação" },
      { id: "5", date: "2024-08-02", notes: "Segunda sessão - drenagem completa" },
      { id: "6", date: "2024-08-12", notes: "Terceira sessão - foco nas pernas" },
      { id: "7", date: "2024-08-28", notes: "Quarta sessão - melhora significativa" },
      { id: "8", date: "2024-09-12", notes: "Quinta sessão - manutenção" }
    ]
  },
  {
    id: 3,
    name: "Tratamento Facial Completo",
    description: "Tratamento facial com peeling, hidratação e rejuvenescimento",
    clientId: 3,
    clientName: "Carla Oliveira",
    totalSessions: 6,
    usedSessions: 6,
    remainingSessions: 0,
    price: 900.00,
    validUntil: "2024-08-30",
    lastUsed: "2024-08-28",
    status: "completed",
    createdAt: "2024-06-01",
    sessionHistory: [
      { id: "9", date: "2024-06-10", notes: "Primeira sessão - avaliação e limpeza" },
      { id: "10", date: "2024-06-20", notes: "Segunda sessão - peeling suave" },
      { id: "11", date: "2024-07-05", notes: "Terceira sessão - hidratação profunda" },
      { id: "12", date: "2024-07-18", notes: "Quarta sessão - microagulhamento" },
      { id: "13", date: "2024-08-02", notes: "Quinta sessão - LED therapy" },
      { id: "14", date: "2024-08-28", notes: "Sexta sessão - finalização do tratamento" }
    ]
  }
];

export function usePackages() {
  const [packages, setPackages] = useState<Package[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsedPackages = JSON.parse(stored);
      // Migração para adicionar sessionHistory em pacotes existentes
      const migratedPackages = parsedPackages.map((pkg: any) => ({
        ...pkg,
        sessionHistory: pkg.sessionHistory || []
      }));
      
      // Se não tem sessionHistory nos dados salvos, força resetar para dados iniciais
      const hasSessionHistory = parsedPackages.some((pkg: any) => pkg.sessionHistory && pkg.sessionHistory.length > 0);
      if (!hasSessionHistory) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialPackages));
        return initialPackages;
      }
      
      return migratedPackages;
    }
    return initialPackages;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(packages));
  }, [packages]);

  const addPackage = (packageData: Omit<Package, 'id' | 'createdAt' | 'usedSessions' | 'remainingSessions' | 'lastUsed' | 'status' | 'sessionHistory'>) => {
    const newPackage: Package = {
      ...packageData,
      id: Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
      usedSessions: 0,
      remainingSessions: packageData.totalSessions,
      lastUsed: null,
      status: "active",
      sessionHistory: []
    };
    setPackages(prev => [...prev, newPackage]);
  };

  const updatePackage = (id: number, packageData: Partial<Package>) => {
    setPackages(prev => 
      prev.map(pkg => {
        if (pkg.id === id) {
          const updated = { ...pkg, ...packageData };
          // Recalcular sessões restantes
          if (packageData.totalSessions !== undefined || packageData.usedSessions !== undefined) {
            updated.remainingSessions = updated.totalSessions - updated.usedSessions;
          }
          // Atualizar status baseado nas sessões
          if (updated.remainingSessions <= 0) {
            updated.status = "completed";
          } else if (new Date(updated.validUntil) < new Date()) {
            updated.status = "expired";
          } else if (new Date(updated.validUntil) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) {
            updated.status = "expiring";
          } else {
            updated.status = "active";
          }
          return updated;
        }
        return pkg;
      })
    );
  };

  const deletePackage = (id: number) => {
    setPackages(prev => prev.filter(pkg => pkg.id !== id));
  };

  const getPackage = (id: number) => {
    return packages.find(pkg => pkg.id === id);
  };

  const useSession = (id: number, notes?: string) => {
    const pkg = packages.find(p => p.id === id);
    if (!pkg) return;

    const newSessionEntry: SessionHistoryEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      notes: notes || `Sessão ${pkg.usedSessions + 1}`
    };

    updatePackage(id, {
      usedSessions: pkg.usedSessions + 1,
      lastUsed: newSessionEntry.date,
      sessionHistory: [...(pkg.sessionHistory || []), newSessionEntry]
    });
  };

  return {
    packages,
    addPackage,
    updatePackage,
    deletePackage,
    getPackage,
    useSession
  };
}