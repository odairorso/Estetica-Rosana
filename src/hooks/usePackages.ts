import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Package } from '@/hooks/usePackages';

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

/* Mock data used when Supabase is unavailable */
const MOCK_PACKAGES: Package[] = [
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
    session_history: [
      { id: "1", date: "2025-09-10", notes: "Primeira sessão concluída" }
    ],
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
  {
    id: 3,
    name: "Pacote Ouro",
    description: "10 sessões de preenchimento + cuidados",
    client_id: 3,
    clientName: "Carlos Oliveira",
    total_sessions: 10,
    used_sessions: 3,
    price: 5000.0,
    valid_until: "2026-01-15",
    last_used: "2025-09-05",
    status: "active",
    created_at: "2025-03-20T09:45:00Z",
    session_history: [
      { id: "1", date: "2025-08-20", notes: "Sess 1" },
      { id: "2", date: "2025-08-27", notes: "Sessão 2" },
      { id: "3", date: "2025-09-05", notes: "Sessão 3" }
    ],
    remaining_sessions: 7,
  },
];

export function usePackages() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPackages = useCallback(async () => {
    if (!supabase) {
      // Offline mode – use mock data
      setPackages(MOCK_PACKAGES);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('packages')
        .select(`
          *,
          clients (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = (data || []).map(p => ({
        ...p,
        clientName: (p as any).clients?.name || '',
        remaining_sessions: p.total_sessions - p.used_sessions,
        session_history: (p as any).session_history || [],
      }));

      setPackages(formattedData as any);
    } catch (error) {
      console.error('Erro ao carregar pacotes:', error);
      // Fallback to mock data on error
      setPackages(MOCK_PACKAGES);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  const addPackage = async (packageData: any) => {
    if (!supabase) {
      const newId = Math.max(0, ...packages.map(p => p.id)) + 1;
      const newPackage: Package = {
        id: new        ...packageData,
        clientName: (clients.find(c => c.id === packageData.client_id) || { name: '' }).name,
        remaining_sessions: packageData.total_sessions,
        used_sessions: 0,
        status: 'active',
        created_at: new Date().toISOString(),
        session_history: [],
      };
      setPackages([...packages, newPackage]);
      return newPackage;
    }

    const { client_id, ...rest } = packageData;
    const {, error } = await supabase.from('packages').insert([rest]).select().single();
    if (error) {
      console.error('Erro ao adicionar pacote:', error);
      return null;
    }
    await loadPackages();
    return data;
  };

  const updatePackage = async (id: number, packageData: Partial<Package>) => {
    if (!supabase) {
      setPackages(packages.map(p => (p.id === id ? { ...p, ...packageData } : p)));
      return;
    }
    const { error } = await supabase.from('packages').update(packageData).eq('id', id);
    if (error) console.error('Erro ao atualizar pacote:', error);
    else await loadPackages();
  };

  const deletePackage = async (id: number) => {
    if (!supabase) {
      setPackages(packages.filter(p => p.id !== id));
      return;
    }
    const { error } = await supabase.from('packages').delete().eq('id', id);
    if (error) console.error('Erro ao excluir pacote:', error);
    else await loadPackages();
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