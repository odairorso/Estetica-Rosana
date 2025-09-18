import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
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
  clientName?: string;
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
  console.log("📦 usePackages hook inicializado - CONECTADO AO SUPABASE");
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPackages = useCallback(async () => {
    console.log("📦 Carregando pacotes do Supabase...");
    setIsLoading(true);
    
    try {
      if (!supabase) {
        throw new Error('Supabase não está disponível');
      }
      
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      console.log("✅ Pacotes carregados do Supabase:", data?.length || 0);
      setPackages(data || []);
    } catch (err) {
      console.error('❌ Erro ao carregar pacotes:', err);
      
      // Fallback para localStorage
      const stored = localStorage.getItem(SYSTEM_CONFIG.STORAGE_KEYS.PACKAGES);
      if (stored) {
        const data = JSON.parse(stored);
        setPackages(data);
      }
    }
    
    setIsLoading(false);
  }, []);

  const addPackage = async (packageData: any) => {
    console.log("📦 ADICIONANDO NOVO PACOTE:", packageData);
    
    try {
      if (!supabase) {
        throw new Error('Supabase não está disponível');
      }
      
      const { data, error } = await supabase
        .from('packages')
        .insert([packageData])
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        const updatedPackages = [...packages, data];
        setPackages(updatedPackages);
        console.log("✅ Pacote criado no Supabase:", data);
        return data;
      }
    } catch (err) {
      console.error('❌ Erro ao criar pacote no Supabase:', err);
      
      // Fallback offline
      const newPackage: Package = {
        ...packageData,
        id: packages.length > 0 ? Math.max(...packages.map(p => p.id)) + 1 : 1,
        clientName: '',
        remaining_sessions: packageData.total_sessions,
        used_sessions: 0,
        status: 'active',
        created_at: new Date().toISOString(),
        session_history: [],
      };
      
      const updatedPackages = [...packages, newPackage];
      setPackages(updatedPackages);
      localStorage.setItem(SYSTEM_CONFIG.STORAGE_KEYS.PACKAGES, JSON.stringify(updatedPackages));
      return newPackage;
    }
    
    return null;
  };

  const updatePackage = async (id: number, packageData: Partial<Package>) => {
    console.log("📦 ATUALIZANDO PACOTE:", id, packageData);
    
    try {
      if (!supabase) {
        throw new Error('Supabase não está disponível');
      }
      
      const { data, error } = await supabase
        .from('packages')
        .update(packageData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        const updatedPackages = packages.map(p => 
          p.id === id ? data : p
        );
        setPackages(updatedPackages);
        console.log("✅ Pacote atualizado no Supabase:", id);
      }
    } catch (err) {
      console.error('❌ Erro ao atualizar pacote no Supabase:', err);
      
      // Fallback offline
      const updatedPackages = packages.map(p => 
        p.id === id ? { ...p, ...packageData } : p
      );
      setPackages(updatedPackages);
      localStorage.setItem(SYSTEM_CONFIG.STORAGE_KEYS.PACKAGES, JSON.stringify(updatedPackages));
    }
  };

  const deletePackage = async (id: number) => {
    console.log("📦 REMOVENDO PACOTE:", id);
    
    try {
      if (!supabase) {
        throw new Error('Supabase não está disponível');
      }
      
      const { error } = await supabase
        .from('packages')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      const updatedPackages = packages.filter(p => p.id !== id);
      setPackages(updatedPackages);
      console.log("✅ Pacote removido do Supabase:", id);
    } catch (err) {
      console.error('❌ Erro ao remover pacote no Supabase:', err);
      
      // Fallback offline
      const updatedPackages = packages.filter(p => p.id !== id);
      setPackages(updatedPackages);
      localStorage.setItem(SYSTEM_CONFIG.STORAGE_KEYS.PACKAGES, JSON.stringify(updatedPackages));
    }
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

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  return {
    packages,
    isLoading,
    addPackage,
    updatePackage,
    deletePackage,
    useSession,
  };
}
