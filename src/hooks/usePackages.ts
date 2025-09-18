import { useState, useEffect, useCallback } from 'react';
import { SYSTEM_CONFIG } from '@/config/system';

export interface SessionHistoryEntry {
  id: string;
  date: string;
  notes?: string;
}

export interface Package {
  id: number;
  name: string;
  description: string;
  client_id: number;
  clientName?: string; // Opcional, pode ser preenchido com um join
  total_sessions: number;
  used_sessions: number;
  price: number;
  valid_until: string;
  last_used: string | null;
  status: "active" | "expiring" | "completed" | "expired";
  created_at: string;
  session_history: SessionHistoryEntry[];
  remaining_sessions: number;
}

/* Dados iniciais para quando localStorage estiver vazio */
const INITIAL_PACKAGES: Package[] = [
  {
    id: 1,
    name: "Pacote Bronze",
    description: "3 sessões de limpeza facial",
    client_id: 1,
    clientName: "Ana Silva",
    total_sessions: 3,
    used_sessions: 1,
    price: 300.0,
    valid_until: "2025-12-31",
    last_used: "2025-09-10",
    status: "active",
    created_at: "2025-01-01T10:00Z",
    session_history: [{ id: "1", date: "2025-09-10", notes: "Primeira sessão concluída" }],
    remaining_sessions: 2,
  },
  {
    id: 2,
    name: "Pacote Prata",
    description: "5 sessões de botox",
    client_id: 2,
    clientName: "Beatriz Costa",
    total_sessions: 5,
    used_sessions: 0,
    price: 1500.0,
    valid_until: "2025-11-30",
    last_used: null,
    status: "active",
    created_at: "2025-02-15T12:30:00Z",
    session_history: [],
    remaining_sessions: 5,
  },
];

export function usePackages() {
  console.log("📦 usePackages hook inicializado - MODO OFFLINE COMPLETO");
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPackages = useCallback(async () => {
    console.log("📦 Carregando pacotes (MODO OFFLINE COMPLETO)...");
    setIsLoading(true);
    
    try {
      const stored = localStorage.getItem(SYSTEM_CONFIG.STORAGE_KEYS.PACKAGES);
      if (stored) {
        const data = JSON.parse(stored);
        console.log("📦 Pacotes carregados do localStorage:", data.length);
        setPackages(data);
      } else {
        console.log('🎉 Primeiro acesso pacotes - inicializando com dados iniciais');
        setPackages(INITIAL_PACKAGES);
        localStorage.setItem(SYSTEM_CONFIG.STORAGE_KEYS.PACKAGES, JSON.stringify(INITIAL_PACKAGES));
      }
    } catch (err) {
      console.error('❌ Erro ao carregar pacotes:', err);
      setPackages(INITIAL_PACKAGES);
      localStorage.setItem(SYSTEM_CONFIG.STORAGE_KEYS.PACKAGES, JSON.stringify(INITIAL_PACKAGES));
    }
    
    setIsLoading(false);
  }, []);

  // Salvar no localStorage
  const saveToStorage = (data: Package[]) => {
    try {
      localStorage.setItem(SYSTEM_CONFIG.STORAGE_KEYS.PACKAGES, JSON.stringify(data));
      console.log("💾 Pacotes salvos no localStorage:", data.length);
    } catch (err) {
      console.error('❌ Erro ao salvar pacotes no localStorage:', err);
    }
  };

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  const addPackage = async (packageData: any) => {
    console.log("📦 ADICIONANDO NOVO PACOTE (OFFLINE):", packageData);
    
    const newId = packages.length > 0 ? Math.max(...packages.map(p => p.id)) + 1 : 1;
    const newPackage: Package = {
      id: newId,
      ...packageData,
      clientName: '',
      remaining_sessions: packageData.total_sessions,
      used_sessions: 0,
      status: 'active',
      created_at: new Date().toISOString(),
      session_history: [],
    };
    
    const updatedPackages = [...packages, newPackage];
    setPackages(updatedPackages);
    saveToStorage(updatedPackages);
    
    console.log("✅ Pacote criado:", newPackage);
    return newPackage;
  };

  const updatePackage = async (id: number, packageData: Partial<Package>) => {
    console.log("📦 ATUALIZANDO PACOTE (OFFLINE):", id, packageData);
    
    const updatedPackages = packages.map(p => 
      p.id === id ? { ...p, ...packageData } : p
    );
    
    setPackages(updatedPackages);
    saveToStorage(updatedPackages);
    
    console.log("✅ Pacote atualizado:", id);
  };

  const deletePackage = async (id: number) => {
    console.log("📦 REMOVENDO PACOTE (OFFLINE):", id);
    
    const updatedPackages = packages.filter(p => p.id !== id);
    setPackages(updatedPackages);
    saveToStorage(updatedPackages);
    
    console.log("✅ Pacote removido:", id);
  };

  const useSession = async (id: number, notes?: string) => {
    const pkg = packages.find(p => p.id === id);
    if (!pkg || pkg.used_sessions >= pkg.total_sessions) return;

    const used_sessions = pkg.used_sessions + 1;
    const status = used_sessions >= pkg.total_sessions ? 'completed' : pkg.status;

    await updatePackage(id, {
      used_sessions,
      status,
      last_used: new Date().toISOString(),
    });
  };

  return {
    packages,
    isLoading,
    addPackage,
    updatePackage,
    deletePackage,
    useSession,
  };
}