import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface SessionHistoryEntry {
  id: string;
  date: string;
  notes?: string;
}

export interface Package {
  id: string;
  name: string;
  description: string;
  clientId: string;
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

export function usePackages() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load packages from Supabase on mount
  useEffect(() => {
    const loadPackages = async () => {
      if (!supabase) {
        console.warn('Supabase not available, using fallback data');
        // Fallback data if Supabase is not available
        const fallbackPackages: Package[] = [
          {
            id: "1",
            name: "Pacote Limpeza de Pele Premium",
            description: "10 sessões de limpeza de pele com hidratação profunda",
            clientId: "1",
            clientName: "Ana Silva",
            totalSessions: 10,
            usedSessions: 3,
            price: 900,
            validUntil: "2023-12-31",
            lastUsed: "2023-05-15",
            status: "active",
            createdAt: "2023-03-01",
            sessionHistory: [
              { id: "1", date: "2023-03-15", notes: "Primeira sessão - pele muito oleosa" },
              { id: "2", date: "2023-04-15", notes: "Melhora significativa" },
              { id: "3", date: "2023-05-15", notes: "Pele mais equilibrada" }
            ]
          },
          {
            id: "2",
            name: "Pacote Drenagem Linfática",
            description: "8 sessões de drenagem linfática para redução de medidas",
            clientId: "2",
            clientName: "Carlos Oliveira",
            totalSessions: 8,
            usedSessions: 5,
            price: 600,
            validUntil: "2023-11-30",
            lastUsed: "2023-05-20",
            status: "active",
            createdAt: "2023-02-15",
            sessionHistory: [
              { id: "4", date: "2023-02-20", notes: "Primeira sessão" },
              { id: "5", date: "2023-03-05", notes: "Cliente relatou melhora" },
              { id: "6", date: "2023-03-20", notes: "Redução de 2cm na cintura" },
              { id: "7", date: "2023-04-05", notes: "Continuidade do tratamento" },
              { id: "8", date: "2023-05-20", notes: "Excelente evolução" }
            ]
          }
        ];
        setPackages(fallbackPackages);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('packages')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading packages:', error);
          return;
        }

        // Transform Supabase data to match our interface
        const transformedPackages: Package[] = data.map(pkg => ({
          id: pkg.id,
          name: pkg.name || '',
          description: pkg.description || '',
          clientId: pkg.client_id || '',
          clientName: pkg.client_name || '',
          totalSessions: pkg.total_sessions || 0,
          usedSessions: pkg.used_sessions || 0,
          price: pkg.price || 0,
          validUntil: pkg.valid_until || '',
          lastUsed: pkg.last_used || null,
          status: pkg.status || 'active',
          createdAt: pkg.created_at?.split('T')[0] || '',
          sessionHistory: pkg.session_history ? JSON.parse(pkg.session_history) : []
        }));

        setPackages(transformedPackages);
      } catch (error) {
        console.error('Error loading packages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPackages();
  }, []);

  const addPackage = async (packageData: Omit<Package, 'id' | 'createdAt' | 'sessionHistory'>) => {
    if (!supabase) {
      console.warn('Supabase not available');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('packages')
        .insert([{
          name: packageData.name,
          description: packageData.description,
          client_id: packageData.clientId,
          client_name: packageData.clientName,
          total_sessions: packageData.totalSessions,
          used_sessions: packageData.usedSessions,
          price: packageData.price,
          valid_until: packageData.validUntil,
          last_used: packageData.lastUsed,
          status: packageData.status,
          session_history: JSON.stringify([])
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding package:', error);
        return null;
      }

      const newPackage: Package = {
        id: data.id,
        name: data.name || '',
        description: data.description || '',
        clientId: data.client_id || '',
        clientName: data.client_name || '',
        totalSessions: data.total_sessions || 0,
        usedSessions: data.used_sessions || 0,
        price: data.price || 0,
        validUntil: data.valid_until || '',
        lastUsed: data.last_used || null,
        status: data.status || 'active',
        createdAt: data.created_at?.split('T')[0] || '',
        sessionHistory: []
      };

      setPackages([newPackage, ...packages]);
      return newPackage;
    } catch (error) {
      console.error('Error adding package:', error);
      return null;
    }
  };

  const updatePackage = async (id: string, packageData: Partial<Package>) => {
    if (!supabase) {
      console.warn('Supabase not available');
      return;
    }

    try {
      const updateData: any = {};
      if (packageData.name !== undefined) updateData.name = packageData.name;
      if (packageData.description !== undefined) updateData.description = packageData.description;
      if (packageData.clientId !== undefined) updateData.client_id = packageData.clientId;
      if (packageData.clientName !== undefined) updateData.client_name = packageData.clientName;
      if (packageData.totalSessions !== undefined) updateData.total_sessions = packageData.totalSessions;
      if (packageData.usedSessions !== undefined) updateData.used_sessions = packageData.usedSessions;
      if (packageData.price !== undefined) updateData.price = packageData.price;
      if (packageData.validUntil !== undefined) updateData.valid_until = packageData.validUntil;
      if (packageData.lastUsed !== undefined) updateData.last_used = packageData.lastUsed;
      if (packageData.status !== undefined) updateData.status = packageData.status;
      if (packageData.sessionHistory !== undefined) updateData.session_history = JSON.stringify(packageData.sessionHistory);

      const { error } = await supabase
        .from('packages')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating package:', error);
        return;
      }

      setPackages(packages.map(pkg => 
        pkg.id === id ? { ...pkg, ...packageData } : pkg
      ));
    } catch (error) {
      console.error('Error updating package:', error);
    }
  };

  const deletePackage = async (id: string) => {
    if (!supabase) {
      console.warn('Supabase not available');
      return;
    }

    try {
      const { error } = await supabase
        .from('packages')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting package:', error);
        return;
      }

      setPackages(packages.filter(pkg => pkg.id !== id));
    } catch (error) {
      console.error('Error deleting package:', error);
    }
  };

  const useSession = async (packageId: string, notes?: string) => {
    const pkg = packages.find(p => p.id === packageId);
    if (!pkg || pkg.usedSessions >= pkg.totalSessions) {
      return false;
    }

    const newSessionEntry: SessionHistoryEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      notes: notes || ''
    };

    const updatedSessionHistory = [...pkg.sessionHistory, newSessionEntry];
    const newUsedSessions = pkg.usedSessions + 1;
    const newStatus = newUsedSessions >= pkg.totalSessions ? 'completed' : pkg.status;

    await updatePackage(packageId, {
      usedSessions: newUsedSessions,
      lastUsed: newSessionEntry.date,
      status: newStatus,
      sessionHistory: updatedSessionHistory
    });

    return true;
  };

  const getPackage = (id: string) => {
    return packages.find(p => p.id === id);
  };

  const getPackagesByClient = (clientId: string) => {
    return packages.filter(p => p.clientId === clientId);
  };

  const getActivePackages = () => {
    return packages.filter(p => p.status === 'active');
  };

  const getExpiringPackages = (days: number = 30) => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    const futureDateStr = futureDate.toISOString().split('T')[0];
    
    return packages.filter(p => 
      p.status === 'active' && 
      p.validUntil <= futureDateStr
    );
  };

  return {
    packages,
    isLoading,
    addPackage,
    updatePackage,
    deletePackage,
    useSession,
    getPackage,
    getPackagesByClient,
    getActivePackages,
    getExpiringPackages,
  };
}