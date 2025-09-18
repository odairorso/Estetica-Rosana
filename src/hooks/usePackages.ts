import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getCurrentDateString, dateToString } from '@/lib/utils';

export interface SessionHistoryEntry {
  id: string;
  date: string;
  notes?: string;
}

export interface Package {
  id: string;
  name: string;
  description: string;
  client_id: number; // Mudado para corresponder ao schema real
  clientName?: string; // Opcional, será preenchido via lookup ou localStorage
  total_sessions: number; // Mudado para corresponder ao schema real
  used_sessions: number; // Mudado para corresponder ao schema real
  remaining_sessions: number; // Adicionado conforme schema real
  price: number;
  valid_until: string; // Mudado para corresponder ao schema real
  last_used: string | null; // Mudado para corresponder ao schema real
  status: "active" | "expiring" | "completed" | "expired";
  created_at: string; // Mudado para corresponder ao schema real
  updated_at: string; // Adicionado conforme schema real
  sessionHistory: SessionHistoryEntry[]; // Será gerenciado via localStorage
}

export function usePackages() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Funções para gerenciar histórico de sessões via localStorage
  const getSessionHistory = (packageId: string): SessionHistoryEntry[] => {
    try {
      const stored = localStorage.getItem(`sessionHistory_${packageId}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Erro ao carregar histórico de sessões:', error);
      return [];
    }
  };

  const saveSessionHistory = (packageId: string, history: SessionHistoryEntry[]) => {
    try {
      localStorage.setItem(`sessionHistory_${packageId}`, JSON.stringify(history));
    } catch (error) {
      console.error('Erro ao salvar histórico de sessões:', error);
    }
  };

  const getClientName = (clientId: number): string => {
    try {
      const stored = localStorage.getItem(`clientName_${clientId}`);
      return stored || `Cliente ${clientId}`;
    } catch (error) {
      console.error('Erro ao carregar nome do cliente:', error);
      return `Cliente ${clientId}`;
    }
  };

  const saveClientName = (clientId: number, name: string) => {
    try {
      localStorage.setItem(`clientName_${clientId}`, name);
    } catch (error) {
      console.error('Erro ao salvar nome do cliente:', error);
    }
  };

  // Função para verificar se a tabela existe e está acessível
  const checkDatabaseSchema = async () => {
    if (!supabase) {
      console.log('🔍 Supabase não disponível, usando dados de fallback');
      return false;
    }

    try {
      // Tentar fazer uma consulta simples para verificar se a tabela existe
      const { data, error } = await supabase
        .from('packages')
        .select('id, name, status')
        .limit(1);

      if (error) {
        console.error('❌ Erro ao verificar schema da tabela packages:', error);
        return false;
      }

      console.log('✅ Tabela packages verificada com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro ao conectar com o banco:', error);
      return false;
    }
  };

  // Load packages from Supabase on mount
  useEffect(() => {
    const loadPackages = async () => {
      // Primeiro verificar se o schema está correto
      const schemaOk = await checkDatabaseSchema();
      
      if (!supabase || !schemaOk) {
        console.warn('Supabase not available or schema issues, using fallback data');
        // Fallback data if Supabase is not available
        const fallbackPackages: Package[] = [
          {
            id: "1",
            name: "Pacote Limpeza de Pele Premium",
            description: "10 sessões de limpeza de pele com hidratação profunda",
            client_id: 1,
            clientName: "Ana Silva",
            total_sessions: 10,
            used_sessions: 8,
            remaining_sessions: 2,
            price: 900,
            valid_until: "2024-12-31",
            last_used: "2024-01-10",
            status: "active",
            created_at: "2023-03-01T00:00:00.000Z",
            updated_at: "2024-01-10T00:00:00.000Z",
            sessionHistory: [
              { id: "1", date: "2023-03-15", notes: "Primeira sessão - pele muito oleosa" },
              { id: "2", date: "2023-04-15", notes: "Melhora significativa" },
              { id: "3", date: "2023-05-15", notes: "Pele mais equilibrada" },
              { id: "4", date: "2023-06-10", notes: "Quarta sessão - manutenção" },
              { id: "5", date: "2023-07-05", notes: "Quinta sessão - tratamento intensivo" },
              { id: "6", date: "2023-08-15", notes: "Sexta sessão - ótima evolução" },
              { id: "7", date: "2023-12-20", notes: "Sétima sessão - pele renovada" },
              { id: "8", date: "2024-01-10", notes: "Oitava sessão - resultado excepcional" }
            ]
          },
          {
            id: "2",
            name: "Pacote Drenagem Linfática",
            description: "8 sessões de drenagem linfática para redução de medidas",
            client_id: 2,
            clientName: "Carlos Oliveira",
            total_sessions: 8,
            used_sessions: 5,
            remaining_sessions: 3,
            price: 600,
            valid_until: "2023-11-30",
            last_used: "2023-05-20",
            status: "active",
            created_at: "2023-02-15T00:00:00.000Z",
            updated_at: "2023-05-20T00:00:00.000Z",
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

        console.log('Dados brutos do Supabase:', data);

        // Transform Supabase data to match our interface
        const transformedPackages: Package[] = data.map(pkg => {
          const totalSessions = pkg.total_sessions || 0;
          const usedSessions = pkg.used_sessions || 0;
          const remainingSessions = pkg.remaining_sessions || Math.max(0, totalSessions - usedSessions);
          
          console.log(`Processando pacote ${pkg.id}:`, {
            total_sessions: totalSessions,
            used_sessions: usedSessions,
            remaining_sessions: remainingSessions,
            client_id: pkg.client_id
          });

          // Carregar histórico de sessões do localStorage
          const sessionHistory = getSessionHistory(pkg.id.toString());
          
          // Carregar nome do cliente do localStorage
          const clientName = getClientName(pkg.client_id);

          console.log(`SessionHistory carregado para pacote ${pkg.id}:`, sessionHistory);

          return {
            id: pkg.id.toString(),
            name: pkg.name || '',
            description: pkg.description || '',
            client_id: pkg.client_id || 0,
            clientName,
            total_sessions: totalSessions,
            used_sessions: usedSessions,
            remaining_sessions: remainingSessions,
            price: pkg.price || 0,
            valid_until: pkg.valid_until || '',
            last_used: pkg.last_used || null,
            status: pkg.status || 'active',
            created_at: pkg.created_at || '',
            updated_at: pkg.updated_at || '',
            sessionHistory
          };
        });

        console.log('Pacotes transformados:', transformedPackages);

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
          client_id: packageData.client_id,
          total_sessions: packageData.total_sessions,
          used_sessions: packageData.used_sessions || 0,
          remaining_sessions: packageData.total_sessions - (packageData.used_sessions || 0),
          price: packageData.price,
          valid_until: packageData.valid_until,
          last_used: packageData.last_used,
          status: packageData.status
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding package:', error);
        return null;
      }

      const totalSessions = data.total_sessions || 0;
      const usedSessions = data.used_sessions || 0;
      const remainingSessions = data.remaining_sessions || Math.max(0, totalSessions - usedSessions);
      
      // Salvar nome do cliente no localStorage
      if (packageData.clientName) {
        saveClientName(data.client_id, packageData.clientName);
      }
      
      // Inicializar histórico de sessões vazio no localStorage
      saveSessionHistory(data.id.toString(), []);
      
      const newPackage: Package = {
        id: data.id.toString(),
        name: data.name || '',
        description: data.description || '',
        client_id: data.client_id || 0,
        clientName: packageData.clientName || getClientName(data.client_id),
        total_sessions: totalSessions,
        used_sessions: usedSessions,
        remaining_sessions: remainingSessions,
        price: data.price || 0,
        valid_until: data.valid_until || '',
        last_used: data.last_used || null,
        status: data.status || 'active',
        created_at: data.created_at || '',
        updated_at: data.updated_at || '',
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
      console.log('🔍 Tentando atualizar pacote:', { id, packageData });
      
      const updateData: any = {};
      if (packageData.name !== undefined) updateData.name = packageData.name;
      if (packageData.description !== undefined) updateData.description = packageData.description;
      if (packageData.client_id !== undefined) updateData.client_id = packageData.client_id;
      if (packageData.total_sessions !== undefined) updateData.total_sessions = packageData.total_sessions;
      if (packageData.used_sessions !== undefined) updateData.used_sessions = packageData.used_sessions;
      if (packageData.price !== undefined) updateData.price = packageData.price;
      if (packageData.valid_until !== undefined) updateData.valid_until = packageData.valid_until;
      if (packageData.last_used !== undefined) updateData.last_used = packageData.last_used;
      if (packageData.status !== undefined) updateData.status = packageData.status;
      
      // Calcular remaining_sessions se total_sessions ou used_sessions foram atualizados
      if (packageData.total_sessions !== undefined || packageData.used_sessions !== undefined) {
        const currentPkg = packages.find(p => p.id === id);
        const totalSessions = packageData.total_sessions ?? currentPkg?.total_sessions ?? 0;
        const usedSessions = packageData.used_sessions ?? currentPkg?.used_sessions ?? 0;
        updateData.remaining_sessions = Math.max(0, totalSessions - usedSessions);
      }

      console.log('📝 Dados para atualizar no Supabase:', updateData);

      const { error } = await supabase
        .from('packages')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('❌ Erro ao atualizar pacote no Supabase:', error);
        console.error('📋 Detalhes do erro:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        return;
      }

      console.log('✅ Pacote atualizado com sucesso no Supabase');

      // Atualizar localStorage se necessário
      if (packageData.clientName !== undefined && packageData.client_id !== undefined) {
        saveClientName(packageData.client_id, packageData.clientName);
      }
      
      if (packageData.sessionHistory !== undefined) {
        saveSessionHistory(id, packageData.sessionHistory);
      }

      setPackages(packages.map(pkg => {
        if (pkg.id === id) {
          const updatedPkg = { ...pkg, ...packageData };
          // Recalcular remaining_sessions se total_sessions ou used_sessions foram atualizados
          if (packageData.total_sessions !== undefined || packageData.used_sessions !== undefined) {
            updatedPkg.remaining_sessions = Math.max(0, updatedPkg.total_sessions - updatedPkg.used_sessions);
          }
          return updatedPkg;
        }
        return pkg;
      }));
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
    if (!pkg || pkg.used_sessions >= pkg.total_sessions) {
      return false;
    }

    const newSessionEntry: SessionHistoryEntry = {
      id: Date.now().toString(),
      date: getCurrentDateString(),
      notes: notes || ''
    };

    const updatedSessionHistory = [...pkg.sessionHistory, newSessionEntry];
    const newUsedSessions = pkg.used_sessions + 1;
    const newStatus = newUsedSessions >= pkg.total_sessions ? 'completed' : pkg.status;

    await updatePackage(packageId, {
      used_sessions: newUsedSessions,
      last_used: newSessionEntry.date,
      status: newStatus,
      sessionHistory: updatedSessionHistory
    });

    return true;
  };

  const getPackage = (id: string) => {
    return packages.find(p => p.id === id);
  };

  const getPackagesByClient = (clientId: number) => {
    return packages.filter(p => p.client_id === clientId);
  };

  const getActivePackages = () => {
    return packages.filter(p => p.status === 'active');
  };

  const getExpiringPackages = (days: number = 30) => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    const futureDateStr = dateToString(futureDate);
    
    return packages.filter(p => 
      p.status === 'active' && 
      p.valid_until <= futureDateStr
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