import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

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

export function usePackages() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPackages = useCallback(async () => {
    if (!supabase) {
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

      const formattedData = data.map(p => ({
        ...p,
        clientName: p.clients.name,
        remaining_sessions: p.total_sessions - p.used_sessions,
        session_history: p.session_history || [],
      }));
      
      setPackages(formattedData as any);
    } catch (error) {
      console.error('Erro ao carregar pacotes:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  const addPackage = async (packageData: any) => {
    if (!supabase) return null;
    const { clientName, ...rest } = packageData;
    const { data, error } = await supabase.from('packages').insert([rest]).select().single();
    if (error) {
      console.error('Erro ao adicionar pacote:', error);
      return null;
    }
    await loadPackages();
    return data;
  };

  const updatePackage = async (id: number, packageData: Partial<Package>) => {
    if (!supabase) return;
    const { error } = await supabase.from('packages').update(packageData).eq('id', id);
    if (error) console.error('Erro ao atualizar pacote:', error);
    else await loadPackages();
  };

  const deletePackage = async (id: number) => {
    if (!supabase) return;
    const { error } = await supabase.from('packages').delete().eq('id', id);
    if (error) console.error('Erro ao excluir pacote:', error);
    else await loadPackages();
  };

  const useSession = async (id: number, notes?: string) => {
    // Esta lógica precisará de uma função no Supabase para ser transacional
    // Por enquanto, faremos no lado do cliente
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