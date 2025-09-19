import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Este hook agora é ONLINE-FIRST. Ele busca dados do Supabase.

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

export const seedInitialPackages = async () => {
  console.log("🌱 Semeando pacotes iniciais no Supabase (NÃO HÁ DADOS INICIAIS DE TEMPLATES).");
  // No initial package templates found in source code.
  return { success: true, count: 0 };
};

export function usePackages() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPackages = useCallback(async () => {
    setIsLoading(true);
    console.log("☁️ Carregando pacotes (MODO ONLINE - SUPABASE)...");
    
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar pacotes do Supabase:', error);
      setPackages([]);
    } else {
      console.log('✅ Pacotes carregados do Supabase:', data.length);
      setPackages(data || []);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  // As funções add, update, delete precisam ser implementadas para interagir com o Supabase
  const addPackage = async (packageData: any) => {
    console.log("📦 ADICIONANDO NOVO PACOTE (ONLINE):", packageData);
    const { data, error } = await supabase.from('packages').insert(packageData).select();
    if (error) {
      console.error("Error adding package:", error);
      return null;
    }
    await loadPackages(); // Recarrega a lista
    return data?.[0];
  };

  const updatePackage = async (id: number, packageData: Partial<Package>) => {
    console.log("📦 ATUALIZANDO PACOTE (ONLINE):", id, packageData);
    const { error } = await supabase.from('packages').update(packageData).eq('id', id);
    if (error) console.error("Error updating package:", error);
    else await loadPackages();
  };

  const deletePackage = async (id: number) => {
    console.log("📦 REMOVENDO PACOTE (ONLINE):", id);
    const { error } = await supabase.from('packages').delete().eq('id', id);
    if (error) console.error("Error deleting package:", error);
    else await loadPackages();
  };

  return {
    packages,
    isLoading,
    addPackage,
    updatePackage,
    deletePackage,
    refreshPackages: loadPackages,
  };
}