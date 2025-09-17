import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface SessionHistoryEntry {
  id: string;
  date: string;
  notes?: string;
}

export interface Package {
  id: string;
  name: string;
  description: string;
  client_id: string;
  client_name: string;
  total_sessions: number;
  used_sessions: number;
  price: number;
  valid_until: string;
  last_used: string | null;
  status: "active" | "expiring" | "completed" | "expired";
  created_at: string;
  session_history: SessionHistoryEntry[];
}

const fetchPackages = async () => {
  const { data, error } = await supabase.from('packages').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};

const addPackage = async (packageData: Omit<Package, 'id' | 'created_at' | 'used_sessions' | 'status' | 'session_history'>) => {
  const newPackage = {
    ...packageData,
    used_sessions: 0,
    status: 'active',
    session_history: [],
  };
  const { data, error } = await supabase.from('packages').insert([newPackage]).select();
  if (error) throw new Error(error.message);
  return data[0];
};

const updatePackage = async (packageData: Partial<Package> & { id: string }) => {
  const { id, ...updateData } = packageData;
  const { data, error } = await supabase.from('packages').update(updateData).eq('id', id).select();
  if (error) throw new Error(error.message);
  return data[0];
};

const deletePackage = async (id: string) => {
  const { error } = await supabase.from('packages').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

export function usePackages() {
  const queryClient = useQueryClient();

  const { data: packages = [], isLoading } = useQuery<Package[]>({
    queryKey: ['packages'],
    queryFn: fetchPackages,
  });

  const addMutation = useMutation({
    mutationFn: addPackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updatePackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    },
  });

  const useSession = (pkg: Package, notes?: string) => {
    if (!pkg || pkg.used_sessions >= pkg.total_sessions) return;

    const newSessionEntry: SessionHistoryEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      notes: notes || `Sessão ${pkg.used_sessions + 1}`,
    };

    const used_sessions = pkg.used_sessions + 1;
    const remaining_sessions = pkg.total_sessions - used_sessions;
    let status = pkg.status;
    if (remaining_sessions <= 0) {
      status = 'completed';
    }

    updateMutation.mutate({
      id: pkg.id,
      used_sessions,
      status,
      last_used: newSessionEntry.date,
      session_history: [...(pkg.session_history || []), newSessionEntry],
    });
  };

  return {
    packages,
    isLoading,
    addPackage: addMutation.mutate,
    updatePackage: updateMutation.mutate,
    deletePackage: deleteMutation.mutate,
    getPackage: (id: string) => packages.find(p => p.id === id),
    useSession,
  };
}